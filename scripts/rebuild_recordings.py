#!/usr/bin/env python3
"""Rebuild pronunciation clips from Audacity .aup3 projects — assumption-free.

The Plan.md "Recording-repair script" plan, built after two real shipping bugs
(2026-08-10): (1) the sampleblocks extraction assumed 48kHz but the rate varies
per recording session with the input device — a wrong label plays chipmunked;
(2) it assumed mono, but the user's stereo DJI Mic Mini produces TWO duplicate
channel block-chains per project, and concatenating them plays the word twice.

Per file, this script trusts only evidence:
- true rate: scanned from the project doc blob (`project` table, dict+doc) as
  IEEE-754 doubles — the value appearing ≥2× is project+track rate; a single
  candidate is accepted; zero or conflicting candidates abort that file.
- channels: the concatenated PCM's two halves are correlated. Near-1.0 means a
  stereo pair stored back-to-back → keep channel 1 (first half; the DJI's ch2
  is a bit-duplicate, verified, so nothing is lost). Low correlation → mono.
- loudness: two-pass ffmpeg loudnorm to the set's target (−20.3 LUFS, matched
  to the ElevenLabs clips); high-crest clips that undershoot on the true-peak
  ceiling get a residual gain + limiter pass (same treatment as alpheus).

Output: public/audio/<slug>.mp3 (mono 44.1kHz 128kbps, like the rest of the
set). Upload separately (scripts/upload_to_r2.py walks public/audio, or a
targeted boto3 put). Requires ffmpeg on PATH; stdlib otherwise.

Usage:
  python3 scripts/rebuild_recordings.py <dir-with-aup3s> [--slugs a,b,c] [--dry-run]
"""

import argparse
import json
import math
import re
import sqlite3
import struct
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio"
TARGET_I = -20.3
RATE_CANDIDATES = (22050, 32000, 44100, 48000, 96000)
STEREO_CORR_THRESHOLD = 0.65


def doc_rate(db: sqlite3.Connection) -> int:
    row = db.execute("select dict, doc from project").fetchone()
    blob = (row[0] or b"") + (row[1] or b"")
    counts = {r: blob.count(struct.pack("<d", float(r))) for r in RATE_CANDIDATES}
    counts = {r: c for r, c in counts.items() if c}
    strong = [r for r, c in counts.items() if c >= 2]
    if len(strong) == 1:
        return strong[0]
    if len(counts) == 1:
        return next(iter(counts))
    raise ValueError(f"ambiguous rate evidence {counts} — decode the doc properly")


def extract_pcm(db: sqlite3.Connection) -> bytes:
    blobs = [r[0] for r in db.execute("select samples from sampleblocks order by blockid")]
    return b"".join(blobs)


def half_correlation(x: list) -> float:
    step = max(1, len(x) // 16000)
    a, b = x[: len(x) // 2 : step], x[len(x) // 2 :: step]
    n = min(len(a), len(b))
    a, b = a[:n], b[:n]
    ma, mb = sum(a) / n, sum(b) / n
    num = sum((p - ma) * (q - mb) for p, q in zip(a, b))
    da = math.sqrt(sum((p - ma) ** 2 for p in a))
    db_ = math.sqrt(sum((q - mb) ** 2 for q in b))
    return num / (da * db_) if da and db_ else 0.0


def write_wav_f32(path: Path, pcm: bytes, rate: int) -> None:
    hdr = b"RIFF" + struct.pack("<I", 36 + len(pcm)) + b"WAVEfmt "
    hdr += struct.pack("<IHHIIHH", 16, 3, 1, rate, rate * 4, 4, 32)  # IEEE float mono
    hdr += b"data" + struct.pack("<I", len(pcm))
    path.write_bytes(hdr + pcm)


def measure_lufs(path: Path) -> float:
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(path), "-af", "ebur128", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    m = [x for x in out.splitlines() if re.search(r"\bI:", x)]
    return float(re.search(r"I:\s*(-?[\d.]+)", m[-1]).group(1))


def encode(wav: Path, mp3: Path, extra_filter: str = "") -> None:
    probe = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(wav), "-af",
         f"loudnorm=I={TARGET_I}:TP=-2:LRA=7:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    meas = json.loads(probe[probe.rindex("{"):probe.rindex("}") + 1])
    ln = (f"loudnorm=I={TARGET_I}:TP=-2:LRA=7:linear=true"
          f":measured_I={meas['input_i']}:measured_TP={meas['input_tp']}"
          f":measured_LRA={meas['input_lra']}:measured_thresh={meas['input_thresh']}"
          f":offset={meas['target_offset']}")
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav),
         "-af", ln + extra_filter, "-ar", "44100", "-ac", "1", "-b:a", "128k", str(mp3)],
        check=True,
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("recordings_dir", type=Path)
    ap.add_argument("--slugs", help="comma-separated subset (default: every .aup3 found)")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    only = set(args.slugs.split(",")) if args.slugs else None
    files = sorted(args.recordings_dir.glob("*.aup3"), key=lambda p: p.stem.lower())
    scratch = args.recordings_dir / "_rebuild_tmp"
    scratch.mkdir(exist_ok=True)

    for f in files:
        slug = f.stem.lower()
        if only and slug not in only:
            continue
        db = sqlite3.connect(str(f))
        rate = doc_rate(db)
        pcm = extract_pcm(db)
        x = struct.unpack(f"<{len(pcm) // 4}f", pcm)
        c = half_correlation(list(x))
        stereo = c > STEREO_CORR_THRESHOLD
        if stereo:
            pcm = pcm[: (len(pcm) // 8) * 4]  # channel 1 = first half, 4-byte aligned
        dur = (len(pcm) // 4) / rate
        print(f"{slug:<22} rate={rate} halfcorr={c:+.3f} "
              f"{'STEREO→ch1' if stereo else 'mono'} dur={dur:.2f}s")
        if args.dry_run:
            continue
        wav = scratch / f"{slug}.wav"
        write_wav_f32(wav, pcm, rate)
        mp3 = OUT_DIR / f"{slug}.mp3"
        encode(wav, mp3)
        lufs = measure_lufs(mp3)
        if lufs < TARGET_I - 0.7:  # true-peak-limited undershoot (high-crest clips)
            gain = TARGET_I - lufs
            encode(wav, mp3,
                   f",volume={gain:.1f}dB,alimiter=limit=0.794:level=false:attack=2:release=20")
            lufs = measure_lufs(mp3)
            print(f"{'':<22} undershoot → +{gain:.1f}dB+limiter, now {lufs:.1f} LUFS")
        else:
            print(f"{'':<22} {lufs:.1f} LUFS")
        if abs(lufs - TARGET_I) > 1.2:
            sys.exit(f"{slug}: {lufs} LUFS still out of range — inspect manually")


if __name__ == "__main__":
    main()
