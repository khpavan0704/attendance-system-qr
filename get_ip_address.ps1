# PowerShell script to get IP address for mobile access

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Finding Your IP Address for Mobile Access" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get all IPv4 addresses (excluding loopback)
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.IPAddress -notlike "169.254.*"
} | Select-Object IPAddress, InterfaceAlias

if ($ipAddresses) {
    Write-Host "Your IP addresses:" -ForegroundColor Green
    Write-Host ""
    foreach ($ip in $ipAddresses) {
        Write-Host "  $($ip.IPAddress) - $($ip.InterfaceAlias)" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Use this IP address to access from mobile:" -ForegroundColor Green
    Write-Host "  http://YOUR_IP_ADDRESS:3000" -ForegroundColor White
    Write-Host ""
    $firstIp = $ipAddresses[0].IPAddress
    Write-Host "Example: http://$firstIp:3000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "QR Code Access Page: http://$firstIp:3000/access.html" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "No IP addresses found. Make sure you're connected to a network." -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"

