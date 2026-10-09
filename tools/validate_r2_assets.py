#!/usr/bin/env python3
"""
validate_r2_assets.py
---------------------
Checks all expected portfolio assets on Cloudflare R2 via S3-compatible API.
Reports each object's key, size, and status. Flags missing or zero-byte files.

Usage:
    python validate_r2_assets.py \
        --account-id  <CF_ACCOUNT_ID>  \
        --access-key  <R2_ACCESS_KEY_ID> \
        --secret-key  <R2_SECRET_ACCESS_KEY> \
        --bucket      portfolio-frames

    # Or via environment variables:
    export CF_ACCOUNT_ID=...
    export R2_ACCESS_KEY_ID=...
    export R2_SECRET_ACCESS_KEY=...
    python validate_r2_assets.py

Requirements: Python 3.8+, boto3  (pip install boto3)
"""

import os
import sys
import argparse
from pathlib import Path

try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
except ImportError:
    print('ERROR: boto3 not installed. Run: pip install boto3', file=sys.stderr)
    sys.exit(1)


# ── Expected assets ────────────────────────────────────────────────────────────

# World frames: spot-check first + last + a middle frame per world.
# Full scans would be thousands of requests; targeted checks catch the key issues.
WORLD_SPOT_FRAMES = {
    'world-01': [1, 55, 111],
    'world-02': [1, 2, 3, 82, 165],       # frame_0001 Luminara diagnosis included
    'world-03': [1, 60, 109, 111, 123],   # 110 is a known gap
    'world-04': [1, 37, 39, 178],         # 38 is a known gap
    'world-05': [1, 90, 92, 186, 372],    # 91, 143, 191 are known gaps
}

GALLERY_RENDERS = [f'gallery/renders/{str(i).zfill(2)}.webp' for i in range(1, 14)]

ADS_VIDEOS = [
    'web-ready/car-commercial.mp4',
    'web-ready/shoe-commercial.mp4',
    'web-ready/energy-drink.mp4',
    'web-ready/perfume-ad.mp4',
    'web-ready/phone-ad.mp4',
    'web-ready/watch-ad.mp4',
    'web-ready/skincare.mp4',
    'web-ready/fashion.mp4',
    'web-ready/food-ad.mp4',
]

MISC_ASSETS = [
    'showreel/character-reel.mp4',
    'models/JON Idel.glb',
    'models/JON wave.glb',
    'models/JON stand.glb',
]

WORLD_PREVIEWS = [f'world-previews/world-0{i}-preview.mp4' for i in range(1, 6)]
WORLD_POSTERS  = [f'world-previews/world-0{i}-poster.webp'  for i in range(1, 6)]


def build_expected_keys() -> list[tuple[str, bool]]:
    """Returns list of (key, is_required). Optional keys show warnings, not failures."""
    keys = []

    for world, frames in WORLD_SPOT_FRAMES.items():
        for n in frames:
            keys.append((f'{world}/frame_{str(n).zfill(4)}.webp', True))

    for k in GALLERY_RENDERS:
        keys.append((k, True))

    for k in ADS_VIDEOS:
        keys.append((k, False))  # filenames may differ on R2

    for k in MISC_ASSETS:
        keys.append((k, True))

    for k in WORLD_PREVIEWS:
        keys.append((k, False))  # optional — only exist after encoding

    for k in WORLD_POSTERS:
        keys.append((k, False))

    return keys


# ── Validation ─────────────────────────────────────────────────────────────────

def check_object(s3, bucket: str, key: str) -> dict:
    try:
        head = s3.head_object(Bucket=bucket, Key=key)
        size = head['ContentLength']
        return {
            'key': key,
            'exists': True,
            'size': size,
            'size_kb': round(size / 1024, 1),
            'zero_byte': size == 0,
            'content_type': head.get('ContentType', ''),
        }
    except ClientError as e:
        code = e.response['Error']['Code']
        return {'key': key, 'exists': False, 'http_status': code}


def fmt_size(kb: float) -> str:
    if kb >= 1024:
        return f'{kb/1024:.1f} MB'
    return f'{kb:.0f} KB'


def run_validation(s3, bucket: str, keys: list[tuple[str, bool]]) -> int:
    failures = 0
    ok_count = 0
    warn_count = 0

    groups: dict[str, list] = {}
    for key, required in keys:
        prefix = key.split('/')[0]
        groups.setdefault(prefix, []).append((key, required))

    for prefix, items in groups.items():
        print(f'\n── {prefix}/ {"─"*(52-len(prefix))}')
        for key, required in items:
            result = check_object(s3, bucket, key)
            if result['exists'] and not result['zero_byte']:
                print(f'  ✓  {key:<55s}  {fmt_size(result["size_kb"])}')
                ok_count += 1
            elif result['exists'] and result['zero_byte']:
                marker = 'FAIL' if required else 'WARN'
                print(f'  ✗  {key:<55s}  ZERO BYTE  [{marker}]')
                failures += 1 if required else 0
                warn_count += 0 if required else 1
            else:
                http = result.get('http_status', '?')
                marker = 'FAIL' if required else 'WARN'
                print(f'  ✗  {key:<55s}  HTTP {http}   [{marker}]')
                if required:
                    failures += 1
                else:
                    warn_count += 1

    print(f'\n── Summary {"─"*51}')
    print(f'  OK:       {ok_count}')
    print(f'  Warnings: {warn_count}  (optional assets — ads filenames may differ)')
    print(f'  Failures: {failures}  (required assets missing or zero-byte)')
    return failures


# ── Listing helpers ─────────────────────────────────────────────────────────────

def list_prefix(s3, bucket: str, prefix: str):
    """Print all objects under a prefix — useful for discovering actual filenames."""
    paginator = s3.get_paginator('list_objects_v2')
    count = 0
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get('Contents', []):
            size_kb = round(obj['Size'] / 1024, 1)
            print(f'  {obj["Key"]:<60s}  {fmt_size(size_kb)}')
            count += 1
    if count == 0:
        print(f'  (no objects found under {prefix!r})')
    return count


# ── CLI ─────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Validate R2 portfolio assets')
    parser.add_argument('--account-id',  default=os.environ.get('CF_ACCOUNT_ID'),
                        help='Cloudflare account ID')
    parser.add_argument('--access-key',  default=os.environ.get('R2_ACCESS_KEY_ID'),
                        help='R2 access key ID')
    parser.add_argument('--secret-key',  default=os.environ.get('R2_SECRET_ACCESS_KEY'),
                        help='R2 secret access key')
    parser.add_argument('--bucket',      default='portfolio-frames',
                        help='R2 bucket name (default: portfolio-frames)')
    parser.add_argument('--list-prefix', metavar='PREFIX',
                        help='List all objects under PREFIX instead of running checks')
    args = parser.parse_args()

    missing = [f for f, v in [('--account-id', args.account_id),
                                ('--access-key', args.access_key),
                                ('--secret-key', args.secret_key)] if not v]
    if missing:
        print(f'ERROR: missing credentials: {", ".join(missing)}', file=sys.stderr)
        print('Set via args or env vars: CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY',
              file=sys.stderr)
        sys.exit(1)

    endpoint = f'https://{args.account_id}.r2.cloudflarestorage.com'
    s3 = boto3.client(
        's3',
        endpoint_url=endpoint,
        aws_access_key_id=args.access_key,
        aws_secret_access_key=args.secret_key,
        region_name='auto',
    )

    print(f'Bucket:   {args.bucket}')
    print(f'Endpoint: {endpoint}')

    if args.list_prefix:
        print(f'\nListing: {args.list_prefix}')
        list_prefix(s3, args.bucket, args.list_prefix)
        return

    # Luminara-specific diagnosis
    print('\n── Luminara frame_0001 diagnosis ──────────────────────────────────')
    for frame in ['frame_0001.webp', 'frame_0002.webp', 'frame_0003.webp']:
        r = check_object(s3, args.bucket, f'world-02/{frame}')
        if r['exists']:
            tag = 'ZERO BYTE' if r['zero_byte'] else fmt_size(r['size_kb'])
            print(f'  world-02/{frame}  →  {tag}')
        else:
            print(f'  world-02/{frame}  →  HTTP {r.get("http_status")} (not found)')

    keys = build_expected_keys()
    failures = run_validation(s3, args.bucket, keys)
    sys.exit(0 if failures == 0 else 1)


if __name__ == '__main__':
    main()
