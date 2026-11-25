# Generate a skill.md for each MCP package.
# Reads the package's package.json + README.md and emits a structured skill.md.
$ErrorActionPreference = 'Stop'
$root = 'C:\Users\Aditya Shah\Desktop\Code\india-mcp'

$ver = '0.1.0'

$packages = Get-ChildItem -Path $root -Directory -Filter '*-mcp' | Sort-Object Name
foreach ($pkg in $packages) {
    $name = $pkg.Name
    $pkgJson = Join-Path $pkg.FullName 'package.json'
    $desc = $name
    if (Test-Path $pkgJson) {
        $j = Get-Content -LiteralPath $pkgJson -Encoding UTF8 | Out-String
        if ($j -match '"description"\s*:\s*"([^"]*)"') { $desc = $Matches[1] }
    }

    $readmePath = Join-Path $pkg.FullName 'README.md'
    $readmeText = ''
    if (Test-Path $readmePath) {
        $readmeText = (Get-Content -LiteralPath $readmePath -Encoding UTF8 | Out-String).Trim()
    }

    # Extract the first heading (package title) from the README.
    $title = $name
    foreach ($line in $readmeText -split "`r?`n") {
        if ($line -match '^#\s+(.+)') { $title = $Matches[1].Trim(); break }
    }

    # Find the "Needs API key?" table and the live-lookup tools / key name.
    $tools = @()
    $keyName = $null
    $lines = $readmeText -split "`r?`n"
    $inTable = $false
    foreach ($line in $lines) {
        if ($line -match '^\s*\|\s*Tool\s*\|') { $inTable = $true; continue }
        if ($inTable -and $line -match '^\s*\|[^|]+\|[^|]+\|[^|]+\|\s*$') {
            # Skip separator rows (all dashes).
            $cols = ($line -replace '^\|','' -replace '\|\s*$','').Split('|') | ForEach-Object { $_.Trim() }
            $col0 = $cols[0]
            if ($col0 -notmatch '^-{2,}' -and $col0 -notmatch '^\s*$') {
                $tools += , $cols
                if ($cols[1] -match 'key' -and $cols[2] -match '^\x60([^\x60]+)\x60$') { $keyName = $Matches[1] }
            }
        }
        elseif ($inTable -and $line -notmatch '^\s*\|') { $inTable = $false }
    }

    $toolsBlock = ''
    if ($tools.Count -gt 0) {
        $rows = $tools | ForEach-Object {
            $nm = [string]($_[0]).Trim()
            $nm = $nm -replace '^\x60|\x60$'  # strip one leading/trailing backtick
            $ds = [string]($_[1]).Trim()
            $ky = [string]($_[2]).Trim()
            '  | ' + [char]0x60 + $nm + [char]0x60 + ' | ' + $ds + ' | ' + $ky + ' |'
        }
        $nl = [System.Environment]::NewLine
        $toolsBlock = $nl + '## Tools' + $nl + $nl + ($rows -join $nl) + $nl
    }

    if ($keyName) {
        $auth = 'An optional API key (' + $keyName + ') unlocks the live-lookup tools.'
    } elseif ($tools.Count -gt 0) {
        $auth = 'No API key is required — the package works fully offline.'
    } else {
        $auth = 'No API key is required.'
    }

    $lines = @()
    $lines += '---'
    $lines += ('name: ' + $name)
    $lines += ('version: ' + $ver)
    $lines += ('description: ' + $desc)
    $lines += 'author: King-AAA2012'
    $lines += 'license: MIT'
    $lines += '---'
    $lines += ''
    $lines += ('# ' + $title + ' — Skill')
    $lines += ''
    $lines += 'A single MCP (Model Context Protocol) server for Indian data. It lets Claude'
    $lines += 'Desktop, Claude Code, Cline, or any other MCP client call tools backed by real'
    $lines += 'Indian data.'
    $lines += ''
    $lines += $toolsBlock
    $lines += '## Requirements'
    $lines += '- **Node.js 18+'
    $lines += $auth
    $lines += ''
    $lines += '## How to Install / Run'
    $lines += ''
    $lines += '```bash'
    $lines += 'npm install'
    $lines += 'node server.js      # boots the MCP server over stdio'
    $lines += '```'
    $lines += ''
    $lines += '### Register with an MCP client'
    $lines += ''
    $lines += 'Add a server entry to your MCP client config JSON:'
    $lines += ''
    $lines += '```json'
    $lines += '{'
    $lines += '  "mcpServers": {'
    $lines += ('    "' + $name + '": {')
    $lines += '      "command": "node",'
    $lines += ('      "args": ["C:/Users/Aditya Shah/Desktop/Code/' + $name + '/server.js"]')
    $lines += '    }'
    $lines += '  }'
    $lines += '}'
    $lines += '```'
    $lines += ''
    $lines += '## How to Verify (Tests)'
    $lines += ''
    $lines += '```bash'
    $lines += 'npm test'
    $lines += '```'
    $lines += ''
    $lines += '## Selling / Redistributing'
    $lines += ''
    $lines += 'This skill is provided under MIT, so it may be sold or redistributed. Ship it'
    $lines += ('as its own zip (' + $name + '-' + $ver + '.zip) in the packages/ folder alongside the other')
    $lines += 'india-mcp packages.'
    $lines += ''

    $out = Join-Path $pkg.FullName 'skill.md'
    Set-Content -LiteralPath $out -Value ($lines -join "`n") -Encoding UTF8
    Write-Host ('Wrote ' + $out)
}
