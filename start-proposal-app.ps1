$backendProcess = Start-Process -FilePath "uvicorn" -ArgumentList "main:app --reload --port 8000" -WorkingDirectory ".\proposal_app\backend" -PassThru -NoNewWindow
Write-Host "Backend started with PID: $($backendProcess.Id)"

$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory ".\proposal_app\frontend" -PassThru -NoNewWindow
Write-Host "Frontend started with PID: $($frontendProcess.Id)"

Write-Host "Proposal App is running!"
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:5173"
Read-Host "Press Enter to exit..."
Stop-Process -Id $backendProcess.Id
Stop-Process -Id $frontendProcess.Id
