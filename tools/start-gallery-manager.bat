@echo off
setlocal
cd /d "%~dp0"
set "PY="
where py >nul 2>&1 && set "PY=py"
if not defined PY (where python >nul 2>&1 && set "PY=python")
if not defined PY (
  echo.
  echo Python が見つかりません。
  echo https://www.python.org/downloads/windows/ から Python 3 をインストールしてください。
  echo インストール時に "Add python.exe to PATH" を有効にしてください。
  echo.
  pause
  exit /b 1
)
%PY% -c "import PIL" >nul 2>&1
if errorlevel 1 (
  echo Pillow を初回インストールしています...
  %PY% -m pip install --user pillow
  if errorlevel 1 (
    echo Pillow のインストールに失敗しました。
    pause
    exit /b 1
  )
)
%PY% gallery-manager.py
if errorlevel 1 pause
endlocal
