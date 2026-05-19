@echo off
echo Uploading frames to Cloudflare R2...
for %%w in (world-01 world-02 world-03 world-04 world-05) do (
    echo Uploading %%w...
    for %%f in (D:\portfolio\assets\frames-webp\%%w\*.webp) do (
        npx wrangler r2 object put portfolio-frames/%%w/%%~nxf --file="%%f" --content-type="image/webp" --remote
    )
    echo Done: %%w
)
echo All uploads complete!
