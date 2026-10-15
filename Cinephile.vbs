Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

projectPath = "C:\Users\DELL\OneDrive\Desktop\Cinephile"
batPath = projectPath & "\start-cinephile.bat"

If Not FSO.FileExists(batPath) Then
    MsgBox "Missing file: " & batPath, 16, "Cinephile"
    WScript.Quit
End If

' Start services in the background without a visible terminal
WshShell.CurrentDirectory = projectPath
WshShell.Run """" & batPath & """", 0, False

' Wait up to 3 minutes for the frontend
For i = 1 To 90
    command = "powershell.exe -NoProfile -Command ""try { $r = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 2 -UseBasicParsing; if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 400) { exit 0 } else { exit 1 } } catch { exit 1 }"""
    result = WshShell.Run(command, 0, True)

    If result = 0 Then
        WshShell.Run "http://localhost:5173", 1, False
        WScript.Quit
    End If

    WScript.Sleep 2000
Next

MsgBox "Cinephile did not start. Check that ports 5173, 8080, and 8000 are available.", 48, "Cinephile"