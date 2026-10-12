@echo off
REM ── Extract poster frames from commercial CGI films ──────────────────────────
REM Run this script from the folder containing your ads MP4 files.
REM Output: poster-01.jpg through poster-09.jpg
REM After running, upload the posters to R2 at: gallery/ads/posters/
REM
REM Requirements: ffmpeg.exe must be in PATH or in the same folder as this script.

set IN_DIR=%~dp0
set OUT_DIR=%~dp0posters

if not exist "%OUT_DIR%" mkdir "%OUT_DIR%"

echo Extracting poster frames...

ffmpeg -ss 0.5 -i "%IN_DIR%car-commercial.mp4"   -frames:v 1 -q:v 2 "%OUT_DIR%\poster-01.jpg"
ffmpeg -ss 0.5 -i "%IN_DIR%car-commercial-2.mp4" -frames:v 1 -q:v 2 "%OUT_DIR%\poster-02.jpg"
ffmpeg -ss 0.5 -i "%IN_DIR%chocolate.mp4"         -frames:v 1 -q:v 2 "%OUT_DIR%\poster-03.jpg"
ffmpeg -ss 0.5 -i "%IN_DIR%earbuds.mp4"           -frames:v 1 -q:v 2 "%OUT_DIR%\poster-04.jpg"
ffmpeg -ss 0.5 -i "%IN_DIR%facewash.mp4"          -frames:v 1 -q:v 2 "%OUT_DIR%\poster-05.jpg"
ffmpeg -ss 0.5 -i "%IN_DIR%pepsi.mp4"             -frames:v 1 -q:v 2 "%OUT_DIR%\poster-06.jpg"
ffmpeg -ss 0.5 -i "%IN_DIR%serum.mp4"             -frames:v 1 -q:v 2 "%OUT_DIR%\poster-07.jpg"
ffmpeg -ss 0.5 -i "%IN_DIR%shoe.mp4"              -frames:v 1 -q:v 2 "%OUT_DIR%\poster-08.jpg"
ffmpeg -ss 0.5 -i "%IN_DIR%smart-watch.mp4"       -frames:v 1 -q:v 2 "%OUT_DIR%\poster-09.jpg"

echo.
echo Done. Posters written to: %OUT_DIR%
echo.
echo Next: upload the posters to R2 at gallery/ads/posters/
echo   poster-01.jpg through poster-09.jpg
echo.
pause
