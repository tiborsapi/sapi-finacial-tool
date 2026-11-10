param(
    [ValidateSet("up", "backend", "frontend", "down", "logs", "build")]
    [string]$Action = "up"
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$composeFile = Join-Path $repoRoot "compose.yaml"

switch ($Action) {
    "up"       { $composeArgs = @("up", "--build") }
    "backend"  { $composeArgs = @("up", "--build", "backend") }
    "frontend" { $composeArgs = @("up", "--build", "frontend") }
    "down"     { $composeArgs = @("down") }
    "logs"     { $composeArgs = @("logs", "--follow") }
    "build"    { $composeArgs = @("build") }
}

& docker compose --file $composeFile @composeArgs
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
