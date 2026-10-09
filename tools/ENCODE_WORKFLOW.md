# World Preview Encoding Workflow (Windows)

Run this once on your Windows machine where the source frames live.
Output: five H.264 MP4 files + five WebP poster images → upload to R2.

---

## Prerequisites

1. **FFmpeg** — download from https://ffmpeg.org/download.html → add to PATH.
   Verify: `ffmpeg -version`

2. **Python 3.8+** — already installed if you have UE5.
   Verify: `python --version`

---

## Step 1 — Run the encoder

Open PowerShell in `D:\portfolio\` and run:

```powershell
python tools\encode_world_previews.py `
  --frames-root D:\portfolio\assets\frames-webp `
  --out D:\portfolio\assets\world-previews `
  --fps 24 `
  --crf 22
```

**What it does per world:**
- Scans the frame directory, builds an ordered list (skips missing frames automatically)
- Writes a concat list file to a temp directory
- Encodes H.264 MP4: CRF 22, yuv420p, +faststart, no audio
- Copies the first frame as `world-NN-poster.webp`
- Skips worlds that already have output — delete the file to re-encode

Expected output in `D:\portfolio\assets\world-previews\`:
```
world-01-preview.mp4    world-01-poster.webp
world-02-preview.mp4    world-02-poster.webp
world-03-preview.mp4    world-03-poster.webp
world-04-preview.mp4    world-04-poster.webp
world-05-preview.mp4    world-05-poster.webp
```

Expected sizes: 2–8 MB per MP4 depending on world length (CRF 22, 24fps).

---

## Step 2 — Validate R2 assets

You need: Cloudflare account ID, R2 access key ID, R2 secret key.
Find these in Cloudflare dashboard → R2 → Manage R2 API tokens.

```powershell
python tools\validate_r2_assets.py `
  --account-id  YOUR_CF_ACCOUNT_ID `
  --access-key  YOUR_R2_ACCESS_KEY_ID `
  --secret-key  YOUR_R2_SECRET_KEY `
  --bucket      portfolio-frames
```

This will also diagnose the Luminara thumbnail by showing the exact byte sizes of
`world-02/frame_0001.webp`, `frame_0002.webp`, and `frame_0003.webp`.

To list actual filenames in a prefix (useful if ads video names differ):
```powershell
python tools\validate_r2_assets.py ... --list-prefix web-ready/
```

---

## Step 3 — Upload to R2

Using Wrangler:
```powershell
cd D:\portfolio\assets\world-previews

wrangler r2 object put portfolio-frames/world-previews/world-01-preview.mp4 --file world-01-preview.mp4
wrangler r2 object put portfolio-frames/world-previews/world-02-preview.mp4 --file world-02-preview.mp4
wrangler r2 object put portfolio-frames/world-previews/world-03-preview.mp4 --file world-03-preview.mp4
wrangler r2 object put portfolio-frames/world-previews/world-04-preview.mp4 --file world-04-preview.mp4
wrangler r2 object put portfolio-frames/world-previews/world-05-preview.mp4 --file world-05-preview.mp4
```

Or use the Cloudflare dashboard: R2 → portfolio-frames → Upload → drag the 5 MP4 files
into the `world-previews/` prefix.

---

## Step 4 — Verify live playback

After upload, open the preview site and check each world plays back smoothly.
The site detects MP4 availability automatically via a HEAD request on first visit —
no code change required. If the MP4 is not uploaded, it falls back to the
30-frame canvas player automatically.

CDN paths the site expects:
```
https://pub-88341f47988743aba3154d2af5c6327e.r2.dev/world-previews/world-01-preview.mp4
...
https://pub-88341f47988743aba3154d2af5c6327e.r2.dev/world-previews/world-05-preview.mp4
```

---

## Known frame gaps (handled automatically by the encoder)

| World | Missing frames |
|-------|---------------|
| world-03 | 110 |
| world-04 | 38 |
| world-05 | 91, 143, 191 |

worlds 01 and 02 have no gaps.
