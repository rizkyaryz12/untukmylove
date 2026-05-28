$dir = 'c:\lastforme\audio'
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$tracks = @(
    @{
        name = 'piano.mp3'
        url  = 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Gymnopedie%20No%201.mp3'
    },
    @{
        name = 'rain.ogg'
        url  = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Rain_heavy_loud.ogg'
    },
    @{
        name = 'rain2.ogg'
        url  = 'https://upload.wikimedia.org/wikipedia/commons/4/41/Rain_on_a_Tin_Roof.ogg'
    },
    @{
        name = 'heartbeat.ogg'
        url  = 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Heartbeat.ogg'
    }
)

foreach ($track in $tracks) {
    $dest = Join-Path $dir $track.name
    Write-Host "Downloading $($track.name) ..."
    try {
        Invoke-WebRequest -Uri $track.url -OutFile $dest -UseBasicParsing -TimeoutSec 40
        $size = (Get-Item $dest).Length
        Write-Host "  OK ($size bytes)"
    } catch {
        Write-Host "  FAILED: $($_.Exception.Message)"
    }
}

Write-Host ''
Write-Host 'Audio download complete. Files in c:\lastforme\audio\'
Get-ChildItem $dir | Format-Table Name, Length
