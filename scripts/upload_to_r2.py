#!/usr/bin/env python3
"""
Upload art masters and atlas tile pyramids to Cloudflare R2 via S3-compatible API.
Uses boto3 for S3 uploads with thread pool concurrency (16 workers).
"""

import os
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import boto3
from botocore.exceptions import ClientError

# Read .env.r2.local
def read_env(env_path):
    env = {}
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            key, _, value = line.partition('=')
            env[key.strip()] = value.strip()
    return env

def build_file_list(repo_root):
    """Build list of (local_path, object_key) tuples."""
    files = []

    # Art masters: public/art/*.jpg -> art/<filename>
    art_dir = repo_root / "public" / "art"
    if art_dir.exists():
        for jpg_file in sorted(art_dir.glob("*.jpg")):
            files.append((jpg_file, f"art/{jpg_file.name}"))

    # Pronunciation audio: public/audio/<slug>-{slow,fast}.mp3 -> audio/<slug>-{slow,fast}.mp3
    audio_dir = repo_root / "public" / "audio"
    if audio_dir.exists():
        for mp3_file in sorted(audio_dir.glob("*.mp3")):
            files.append((mp3_file, f"audio/{mp3_file.name}"))

    # Atlas tiles: plates/<slug>/tiles/{z}/{row}/{col}.jpg -> atlas/<slug>/{z}/{row}/{col}.jpg
    plates_dir = repo_root / "plates"
    for slug_dir in sorted(plates_dir.iterdir()):
        if not slug_dir.is_dir():
            continue
        slug = slug_dir.name
        tiles_dir = slug_dir / "tiles"
        if tiles_dir.exists():
            for z_dir in sorted(tiles_dir.iterdir()):
                if not z_dir.is_dir():
                    continue
                z = z_dir.name
                for row_dir in sorted(z_dir.iterdir()):
                    if not row_dir.is_dir():
                        continue
                    row = row_dir.name
                    for col_file in sorted(row_dir.glob("*.jpg")):
                        col = col_file.stem
                        object_key = f"atlas/{slug}/{z}/{row}/{col}.jpg"
                        files.append((col_file, object_key))

    return files

def upload_file(file_tuple, s3_client, bucket_name, max_retries=3):
    """Upload a single file to S3/R2. boto3 handles retries internally."""
    local_path, object_key = file_tuple
    content_type = 'audio/mpeg' if local_path.suffix == '.mp3' else 'image/jpeg'

    for attempt in range(1, max_retries + 1):
        try:
            s3_client.upload_file(
                str(local_path),
                bucket_name,
                object_key,
                ExtraArgs={'ContentType': content_type}
            )
            return (local_path, object_key, True, None)
        except ClientError as e:
            error = f"ClientError: {e.response.get('Error', {}).get('Code', 'Unknown')}"
            if attempt == max_retries:
                return (local_path, object_key, False, error)
        except Exception as e:
            error = str(e)
            if attempt == max_retries:
                return (local_path, object_key, False, error)

    return (local_path, object_key, False, "Max retries exceeded")

def main():
    # Setup
    repo_root = Path(__file__).parent.parent
    env_path = repo_root / ".env.r2.local"

    if not env_path.exists():
        print(f"Error: {env_path} not found")
        sys.exit(1)

    env = read_env(env_path)
    access_key_id = env.get("R2_ACCESS_KEY_ID")
    secret_access_key = env.get("R2_SECRET_ACCESS_KEY")
    s3_endpoint = env.get("R2_S3_ENDPOINT")

    if not all([access_key_id, secret_access_key, s3_endpoint]):
        print("Error: Missing R2 credentials (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_S3_ENDPOINT)")
        sys.exit(1)

    bucket_name = "odyssey-assets"
    region = "auto"

    # Create S3 client
    print("Initializing S3/R2 client...")
    s3_client = boto3.client(
        's3',
        endpoint_url=s3_endpoint,
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
        region_name=region
    )

    # Build file list
    print("Building file list...")
    files = build_file_list(repo_root)
    total = len(files)
    print(f"Found {total} files to upload")

    # Group by category for tracking
    art_count = sum(1 for _, key in files if key.startswith("art/"))
    audio_count = sum(1 for _, key in files if key.startswith("audio/"))
    print(f"  - {art_count} art masters")
    print(f"  - {audio_count} pronunciation clips")
    print(f"  - {total - art_count - audio_count} atlas tiles")

    # Upload with thread pool
    print(f"\nUploading with 16 concurrent workers (S3 endpoint)...")
    succeeded = 0
    failed = 0
    failed_list = []

    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = [
            executor.submit(upload_file, f, s3_client, bucket_name)
            for f in files
        ]

        for i, future in enumerate(as_completed(futures), 1):
            local_path, object_key, success, error = future.result()

            if success:
                succeeded += 1
            else:
                failed += 1
                failed_list.append((str(local_path), object_key, error))

            # Print progress every 200 files
            if i % 200 == 0 or i == total:
                print(f"  {i} / {total} uploaded ({succeeded} ok, {failed} failed)")

    # Summary
    print(f"\n=== SUMMARY ===")
    print(f"Total attempted: {total}")
    print(f"Total succeeded: {succeeded}")
    print(f"Total failed: {failed}")

    if failed_list:
        print(f"\nFailed uploads (first 20):")
        for local_path, object_key, error in failed_list[:20]:
            print(f"  {object_key}: {error}")
        if len(failed_list) > 20:
            print(f"  ... and {len(failed_list) - 20} more failures")

    # Break down by category
    print(f"\nBreakdown:")
    print(f"  Art masters: {art_count}")
    print(f"  Pronunciation clips: {audio_count}")
    for slug in ["aegyptus", "africae", "graecia", "natoliae", "palestinae", "rubri"]:
        slug_count = sum(1 for _, key in files if key.startswith(f"atlas/{slug}/"))
        print(f"  {slug}: {slug_count} tiles")

    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()
