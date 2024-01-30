@echo off

wasm-pack build --target web

xcopy %~dp0\pkg %~dp0\public\pkg /E /H /C /R /Q /Y

