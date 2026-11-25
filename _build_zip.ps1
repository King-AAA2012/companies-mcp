# Build each MCP package as its OWN zip into packages/ for selling.
#
# Each of the 9 MCPs (gst-mcp, irctc-mcp, ...) becomes its own zip file
# named "<pkg>-<ver>.zip" and dropped into packages/.
#
# Run this after every change. To version bump, change $ver below.
$ErrorActionPreference = 'Stop'
$root  = 'C:\Users\Aditya Shah\Desktop\Code\india-mcp'
$ver     = '0.1.0'
$dest = Join-Path $root 'packages'
if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force | Out-Null }

# Patterns to skip inside each package (untrusted / generated / not for sale).
$skipNames = @('node_modules', 'node', 'git', '_check.js',
               '_ifsc.json', '_ifsc-list.json', '_probe.mjs', '_probe2.mjs',
               '_probe3.mjs', '_probe4.mjs', '_build_zip.ps1', '_build_zip.zip',
               'dist', '.DS_Store', '*.log')

Add-Type -AssemblyName System.IO.Compression.FileSystem

$packages = Get-ChildItem -Path $root -Directory -Filter '*-mcp' | Sort-Object Name
$zips = @()
foreach ($pkg in $packages) {
    $pkgName = $pkg.Name
    $zip = Join-Path $dest ("{0}-{1}.zip" -f $pkgName, $ver)
    if (Test-Path $zip) { Remove-Item $zip -Force }

    $zf = [System.IO.Compression.ZipFile]::Open($zip, 'Create')
    $count = 0
    foreach ($f in (Get-ChildItem -Path $pkg.FullName -Recurse -File)) {
        $rel = $f.FullName.Substring($pkg.FullName.Length + 1)   # e.g. "server.js"
        $parts = $rel.Split('\')
        $skip = $false
        foreach ($p in $parts) {
            if ($skipNames -contains $p) { $skip = $true; break }
        }
        if ($skip) { continue }

        $name = $rel.Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zf, $f.FullName, $name) | Out-Null
        $count++
    }
    $zf.Dispose()

    if ($count -eq 0) {
        throw "No entries added to $zip for $pkgName - aborting (likely the compression type failed to load)."
    }
    $sizeKB = [math]::Round((Get-Item $zip).Length / 1KB, 1)
    if ($sizeKB -lt 1) { throw "Zip $zip for $pkgName is empty ($sizeKB KB) - aborting." }

    $zips += $zip
    Write-Host ("{0,-16} {1,-7} {2} KB" -f $pkgName, $count, $sizeKB)
}

Write-Host ("`nBuilt {0} zip(s) into {1}" -f $zips.Count, $dest)
