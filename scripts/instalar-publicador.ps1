# Instala (ou remove) a tarefa que publica o site automaticamente a cada 2 minutos.
#
#   powershell -ExecutionPolicy Bypass -File scripts\instalar-publicador.ps1            # instala
#   powershell -ExecutionPolicy Bypass -File scripts\instalar-publicador.ps1 -Remover   # remove
#
# A tarefa roda escondida (sem janela) enquanto você estiver logado no Windows.
param([switch]$Remover)

$nome = 'LuCia Site - publicar LC Manager'
$raiz = Split-Path -Parent $PSScriptRoot

if ($Remover) {
  schtasks /Delete /TN $nome /F | Out-Null
  Write-Host "Tarefa removida."
  return
}

$node = (Get-Command node -ErrorAction Stop).Source
$script = Join-Path $raiz 'scripts\publicar-automatico.mjs'
$vbs = Join-Path $raiz 'scripts\publicador-oculto.vbs'

# O .vbs abre o Node sem mostrar janela de terminal
@"
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "$raiz"
sh.Run """$node"" ""$script""", 0, False
"@ | Set-Content -Path $vbs -Encoding ASCII

schtasks /Create /TN $nome /TR "wscript.exe `"$vbs`"" /SC MINUTE /MO 2 /F | Out-Null
Write-Host "Pronto: o site será atualizado a cada 2 minutos quando o LC Manager estiver aberto."
Write-Host "Log: scripts\publicador.log"
