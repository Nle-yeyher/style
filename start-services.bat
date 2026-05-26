@echo off
echo Arrancando microservicios...

start "Orders Service :8001" cmd /k "cd services\orders-service && py -3.12 -m pip install -r requirements.txt -q && py -3.12 -m uvicorn app.main:app --port 8001 --reload"
timeout /t 3 /nobreak >nul

start "Products Service :8002" cmd /k "cd services\products-service && py -3.12 -m pip install -r requirements.txt -q && py -3.12 -m uvicorn app.main:app --port 8002 --reload"
timeout /t 3 /nobreak >nul

start "Users Service :8003" cmd /k "cd services\users-service && py -3.12 -m pip install -r requirements.txt -q && py -3.12 -m uvicorn app.main:app --port 8003 --reload"
timeout /t 3 /nobreak >nul

start "Payments Service :8004" cmd /k "cd services\payments-service && py -3.12 -m pip install -r requirements.txt -q && py -3.12 -m uvicorn app.main:app --port 8004 --reload"

echo.
echo Microservicios corriendo:
echo   Orders   -^> http://localhost:8001/docs
echo   Products -^> http://localhost:8002/docs
echo   Users    -^> http://localhost:8003/docs
echo   Payments -^> http://localhost:8004/docs
echo.
pause