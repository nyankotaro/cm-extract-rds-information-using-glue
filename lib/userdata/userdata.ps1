<powershell>
Invoke-WebRequest -Uri "https://aka.ms/ssmsfullsetup" -OutFile "C:\Users\Administrator\Downloads\SSMS-Setup-ENU.exe"
Start-Process -FilePath "C:\Users\Administrator\Downloads\SSMS-Setup-ENU.exe" -ArgumentList "/install /quiet /passive /norestart" -Verb runas -Wait
</powershell>