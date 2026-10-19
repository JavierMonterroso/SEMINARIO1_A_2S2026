# Verifica el .env y los servicios de AWS configurados, sin imprimir secretos.
# Uso (desde Proyecto_1):  powershell -ExecutionPolicy Bypass -File Deploy\verificar-configuracion.ps1

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeEnvPath = Join-Path $projectRoot 'Backend-Node\.env'
$pythonEnvPath = Join-Path $projectRoot 'Backend-Python\.env'
$placeholder = 'PEGAR_AQUI'
$script:failures = 0

function Write-Result($isOk, $name, $detail) {
    if ($isOk) {
        Write-Host "[OK]    $name" -ForegroundColor Green
    } else {
        Write-Host "[FALLA] $name -> $detail" -ForegroundColor Red
        $script:failures++
    }
}

function Write-Pending($name, $detail) {
    Write-Host "[PEND]  $name -> $detail" -ForegroundColor Yellow
}

function Read-EnvFile($path) {
    $values = @{}
    foreach ($line in Get-Content $path) {
        if ($line -match '^\s*([A-Z_]+)\s*=\s*(.*?)\s*$') { $values[$Matches[1]] = $Matches[2] }
    }
    return $values
}

function Invoke-Http($method, $url, $headers, $body, $contentType = 'application/json') {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Method $method -Uri $url -Headers $headers -Body $body -ContentType $contentType
        return @{ Status = [int]$response.StatusCode; Body = $response.Content }
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        return @{ Status = $status; Body = "$($_.ErrorDetails.Message)" }
    }
}

Write-Host "`n=== 1. Archivos .env ===" -ForegroundColor Cyan
Write-Result (Test-Path $nodeEnvPath) 'Existe Backend-Node/.env' 'Falta el archivo'
Write-Result (Test-Path $pythonEnvPath) 'Existe Backend-Python/.env' 'Falta el archivo'
if (-not (Test-Path $nodeEnvPath)) { exit 1 }
$sameContent = (Test-Path $pythonEnvPath) -and ((Get-FileHash $nodeEnvPath).Hash -eq (Get-FileHash $pythonEnvPath).Hash)
Write-Result $sameContent 'Los dos .env son identicos' 'Copia Backend-Node/.env sobre Backend-Python/.env'
$env = Read-EnvFile $nodeEnvPath

Write-Host "`n=== 2. Variables ===" -ForegroundColor Cyan
$davedVariables = 'AWS_REGION', 'JWT_SECRET', 'COGNITO_USER_POOL_ID', 'COGNITO_CLIENT_ID',
    'IMAGE_UPLOAD_URL', 'IMAGE_UPLOAD_API_KEY', 'IMAGES_BUCKET', 'IMAGES_BASE_URL'
foreach ($name in $davedVariables) {
    $value = $env[$name]
    $isFilled = $value -and -not $value.StartsWith($placeholder)
    Write-Result $isFilled $name 'Vacia o con el texto PEGAR_AQUI'
}
foreach ($name in 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'LEX_BOT_ID', 'LEX_BOT_ALIAS_ID') {
    if (-not $env[$name]) { Write-Pending $name 'La aporta Hernan (comentada por ahora)' }
}
Write-Result ($env['JWT_SECRET'].Length -ge 32) 'JWT_SECRET tiene 32 caracteres o mas' "Tiene $($env['JWT_SECRET'].Length)"
$expectedBaseUrl = "https://$($env['IMAGES_BUCKET']).s3.$($env['AWS_REGION']).amazonaws.com"
Write-Result ($env['IMAGES_BASE_URL'] -eq $expectedBaseUrl) 'IMAGES_BASE_URL coincide con IMAGES_BUCKET' "Se esperaba $expectedBaseUrl"
Write-Result ($env['COGNITO_USER_POOL_ID'].StartsWith("$($env['AWS_REGION'])_")) 'COGNITO_USER_POOL_ID es de la region' 'Debe empezar con la region'

Write-Host "`n=== 3. Cognito (app client) ===" -ForegroundColor Cyan
# InitiateAuth es una API publica: con un usuario inexistente debe responder "credenciales incorrectas".
$cognitoBody = @{
    AuthFlow = 'USER_PASSWORD_AUTH'
    ClientId = $env['COGNITO_CLIENT_ID']
    AuthParameters = @{ USERNAME = 'verificacion@semisocial.test'; PASSWORD = 'Verificacion-123!' }
} | ConvertTo-Json
$cognito = Invoke-Http 'POST' "https://cognito-idp.$($env['AWS_REGION']).amazonaws.com/" `
    @{ 'X-Amz-Target' = 'AWSCognitoIdentityProviderService.InitiateAuth' } $cognitoBody 'application/x-amz-json-1.1'
$cognitoDiagnosis = switch -Regex ($cognito.Body) {
    'NotAuthorizedException|UserNotFoundException' { 'OK' }
    'SECRET_HASH|secret hash' { 'El cliente tiene secreto: usa el ID de semi-social-spa' }
    'not enabled' { 'Falta habilitar ALLOW_USER_PASSWORD_AUTH en el cliente' }
    'ResourceNotFoundException' { 'COGNITO_CLIENT_ID no existe en esa region' }
    default { "Respuesta inesperada ($($cognito.Status)): $($cognito.Body)" }
}
Write-Result ($cognitoDiagnosis -eq 'OK') 'Cliente sin secreto y con USER_PASSWORD_AUTH' $cognitoDiagnosis

Write-Host "`n=== 4. API Gateway + Lambda ===" -ForegroundColor Cyan
$uploadUrl = $env['IMAGE_UPLOAD_URL']
$keyHeader = @{ 'x-api-key' = $env['IMAGE_UPLOAD_API_KEY'] }
$withoutKey = Invoke-Http 'POST' $uploadUrl @{} '{}'
Write-Result ($withoutKey.Status -eq 403) 'Sin API key responde 403' "Respondio $($withoutKey.Status): el endpoint no exige la clave"
# Una carpeta invalida comprueba la clave y el codigo de la Lambda sin escribir en S3.
$withKey = Invoke-Http 'POST' $uploadUrl $keyHeader '{"folder":"Verificacion","contentType":"image/png","data":"aGVsbG8="}'
Write-Result ($withKey.Status -eq 400 -and $withKey.Body -match 'Carpeta no permitida') 'Con API key llega a la Lambda del proyecto' "Respondio $($withKey.Status): $($withKey.Body)"

Write-Host "`n=== 5. Bucket de imagenes ===" -ForegroundColor Cyan
$bucket = Invoke-Http 'GET' "https://$($env['IMAGES_BUCKET']).s3.amazonaws.com/" @{} $null
# S3 responde 404 (NoSuchBucket) si nadie tiene ese nombre; 403 o 200 si el bucket existe.
if ($bucket.Status -eq 404) {
    Write-Pending $env['IMAGES_BUCKET'] 'Todavia no existe (lo crea Hernan); se omite la prueba de carga'
} else {
    Write-Result $true "El bucket $($env['IMAGES_BUCKET']) existe" ''
    $pixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    $upload = Invoke-Http 'POST' $uploadUrl $keyHeader "{`"folder`":`"Fotos_Perfil`",`"contentType`":`"image/png`",`"data`":`"$pixel`"}"
    Write-Result ($upload.Status -eq 201) 'Carga de imagen de prueba a Fotos_Perfil' "Respondio $($upload.Status): $($upload.Body). Revisa CloudWatch de upload-image"
    if ($upload.Status -eq 201) {
        $imageKey = ($upload.Body | ConvertFrom-Json).key
        $image = Invoke-Http 'GET' "$($env['IMAGES_BASE_URL'])/$imageKey" @{} $null
        Write-Result ($image.Status -eq 200) "La imagen es publica ($imageKey)" "Respondio $($image.Status): falta la politica de lectura publica del bucket"
    }
}

Write-Host ''
if ($script:failures -eq 0) {
    Write-Host 'Todo lo verificable esta correcto.' -ForegroundColor Green
} else {
    Write-Host "$script:failures verificacion(es) fallaron." -ForegroundColor Red
}
