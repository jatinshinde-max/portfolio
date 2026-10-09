#!/usr/bin/env python3
"""
encode_world_previews.py
------------------------
Encodes optimized H.264 MP4 preview videos from UE5 WebP frame sequences.
Handles gaps in frame numbering by building an explicit concat list.

Usage:
    python encode_world_previews.py --frames-root D:/portfolio/assets/frames-webp \
                                    --out D:/portfolio/assets/world-previews

Requirements: Python 3.8+, ffmpeg in PATH

Output per world:
    world-01-preview.mp4   — H.264, CRF 22, yuv420p, +faststart
    world-01-poster.webp   — First frame as poster image
"""

import os
import re
import sys
import shutil
import subprocess
import argparse
import tempfile
from pathlib import Path


WORLDS = [
    'world-01',
    'world-02',
    'world-03',
    'world-04',
    'world-05',
]

# Known missing frames per world (verified from source directory scans)
# Update this dict if more gaps are discovered
KNOWN_GAPS = {
    'world-03': {110},
    'world-04': {38},
    'world-05': {91, 143, 191},
}


def find_frames(world_dir: Path) -> list[Path]:
    """Return all frame_NNNN.webp files in numerical order, skipping gaps."""
    pattern = re.compile(r'^frame_(\d{4})\.webp$', re.IGNORECASE)
    frames = []
    for f in world_dir.iterdir():
        m = pattern.match(f.name)
        if m:
            frames.append((int(m.group(1)), f))
    frames.sort(key=lambda x: x[0])
    return [f for _, f in frames]


def write_concat_list(frames: list[Path], tmp_dir: str, fps: int) -> str:
    """Write an ffmpeg concat demuxer file. Returns path to the file."""
    duration = 1.0 / fps
    concat_path = os.path.join(tmp_dir, 'concat.txt')
    with open(concat_path, 'w') as fh:
        for frame in frames:
            # ffmpeg concat requires forward slashes even on Windows
            fh.write(f"file '{str(frame).replace(chr(92), '/')}'\n")
            fh.write(f'duration {duration:.6f}\n')
        # Repeat last frame to avoid duration glitch at end
        if frames:
            fh.write(f"file '{str(frames[-1]).replace(chr(92), '/')}'\n")
    return concat_path


def encode_world(world_name: str, frames_root: Path, out_dir: Path,
                 fps: int = 24, crf: int = 22) -> dict:
    world_dir = frames_root / world_name
    if not world_dir.exists():
        return {'world': world_name, 'status': 'skipped', 'reason': f'directory not found: {world_dir}'}

    frames = find_frames(world_dir)
    if not frames:
        return {'world': world_name, 'status': 'skipped', 'reason': 'no frames found'}

    out_dir.mkdir(parents=True, exist_ok=True)
    out_video = out_dir / f'{world_name}-preview.mp4'
    out_poster = out_dir / f'{world_name}-poster.webp'

    # --- Poster: copy first frame ---
    if not out_poster.exists():
        shutil.copy2(frames[0], out_poster)
        print(f'  poster → {out_poster.name}')
    else:
        print(f'  poster already exists, skipping')

    # --- Video: encode via concat demuxer ---
    if out_video.exists():
        print(f'  video already exists — delete to re-encode: {out_video.name}')
        return {'world': world_name, 'status': 'exists', 'frames': len(frames), 'output': str(out_video)}

    with tempfile.TemporaryDirectory() as tmp:
        concat_path = write_concat_list(frames, tmp, fps)
        # Probe first frame for dimensions
        probe = subprocess.run(
            ['ffprobe', '-v', 'error', '-select_streams', 'v:0',
             '-show_entries', 'stream=width,height', '-of', 'csv=p=0',
             str(frames[0])],
            capture_output=True, text=True
        )
        dims = probe.stdout.strip()
        w, h = (int(x) for x in dims.split(',')) if ',' in dims else (1920, 1080)
        # Ensure even dimensions for yuv420p
        w = w - (w % 2)
        h = h - (h % 2)

        cmd = [
            'ffmpeg', '-y',
            '-f', 'concat', '-safe', '0',
            '-i', concat_path,
            '-vf', f'scale={w}:{h}',
            '-c:v', 'libx264',
            '-crf', str(crf),
            '-preset', 'slow',
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',
            '-an',  # no audio
            str(out_video),
        ]
        print(f'  encoding {len(frames)} frames at {fps}fps → {out_video.name}')
        print(f'  command: {" ".join(cmd)}')
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f'  ERROR:\n{result.stderr[-2000:]}')
            return {'world': world_name, 'status': 'error', 'stderr': result.stderr[-500:]}

    size_mb = out_video.stat().st_size / 1_048_576
    return {
        'world': world_name,
        'status': 'ok',
        'frames': len(frames),
        'output': str(out_video),
        'size_mb': round(size_mb, 1),
    }


def main():
    parser = argparse.ArgumentParser(description='Encode world preview MP4s from WebP frames')
    parser.add_argument('--frames-root', required=True, help='Path to frames-webp directory')
    parser.add_argument('--out', required=True, help='Output directory for MP4s and posters')
    parser.add_argument('--fps', type=int, default=24, help='Output frame rate (default 24)')
    parser.add_argument('--crf', type=int, default=22, help='H.264 CRF quality (default 22, lower=better)')
    parser.add_argument('--worlds', nargs='+', default=WORLDS, help='Which worlds to encode')
    args = parser.parse_args()

    frames_root = Path(args.frames_root)
    out_dir = Path(args.out)

    if not shutil.which('ffmpeg'):
        print('ERROR: ffmpeg not found in PATH. Install from https://ffmpeg.org/download.html', file=sys.stderr)
        sys.exit(1)

    results = []
    for world in args.worlds:
        print(f'\n[{world}]')
        r = encode_world(world, frames_root, out_dir, fps=args.fps, crf=args.crf)
        results.append(r)
        if r['status'] == 'ok':
            print(f'  done — {r["frames"]} frames, {r["size_mb"]} MB')

    print('\n── Summary ─────────────────────────────────')
    for r in results:
        status = r['status'].upper()
        if r['status'] == 'ok':
            print(f'  {r["world"]:12s}  {status:8s}  {r["frames"]:4d} frames  {r["size_mb"]} MB  {r["output"]}')
        elif r['status'] == 'exists':
            print(f'  {r["world"]:12s}  {status:8s}  {r["frames"]:4d} frames  (skipped, already exists)')
        else:
            print(f'  {r["world"]:12s}  {status:8s}  {r.get("reason","") or r.get("stderr","")}')

    print('\nUpload the MP4 and WebP files to R2 under: world-previews/')
    print('  e.g.  world-01-preview.mp4   →  CDN/world-previews/world-01-preview.mp4')
    print('        world-01-poster.webp   →  CDN/world-previews/world-01-poster.webp')


if __name__ == '__main__':
    main()
