# OCR (Windows.Media.Ocr, pt-BR) de todos os PNGs de um diretório.
# Saída: um .txt por página com linhas "x<TAB>y<TAB>texto".
param(
    [string]$InDir,
    [string]$OutDir
)
$null = [Windows.Media.Ocr.OcrEngine,Windows.Foundation,ContentType=WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder,Windows.Foundation,ContentType=WindowsRuntime]
$null = [Windows.Storage.StorageFile,Windows.Foundation,ContentType=WindowsRuntime]
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$getAwaiterBaseMethod = [WindowsRuntimeSystemExtensions].GetMember('GetAwaiter') |
    Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } |
    Select-Object -First 1
function Await($AsyncTask, $ResultType) {
    $getAwaiterBaseMethod.MakeGenericMethod($ResultType).Invoke($null, @($AsyncTask)).GetResult()
}
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) { Write-Output "SEM ENGINE"; exit 1 }
Write-Output ("engine: " + $engine.RecognizerLanguage.LanguageTag)
New-Item -ItemType Directory -Force $OutDir | Out-Null
$pngs = Get-ChildItem -Path $InDir -Filter *.png | Sort-Object Name
$n = 0
foreach ($png in $pngs) {
    $dest = Join-Path $OutDir ($png.BaseName + ".txt")
    if (Test-Path $dest) { continue }
    $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($png.FullName)) ([Windows.Storage.StorageFile])
    $stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
    $sb = New-Object System.Text.StringBuilder
    foreach ($line in $result.Lines) {
        $x = [int]$line.Words[0].BoundingRect.X
        $y = [int]$line.Words[0].BoundingRect.Y
        $null = $sb.AppendLine("$x`t$y`t" + $line.Text)
    }
    [System.IO.File]::WriteAllText($dest, $sb.ToString(), (New-Object System.Text.UTF8Encoding $false))
    $stream.Dispose()
    $n++
    if ($n % 20 -eq 0) { Write-Output "...$n páginas" }
}
Write-Output "OCR concluído: $n novas páginas em $OutDir"
