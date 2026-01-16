@echo off
cd "d:\00-MEGA\00  - SENA 2025\1002-SGTURNOS-React-API"

echo "Rama actual:"
git branch

echo "Verificando estado:"
git status

echo "Push a todas las ramas:"
git push --all

echo "Verificando remotes:"
git remote -v

echo "Logs de deploy-render:"
git log deploy-render --oneline -5

echo "Logs de develop:"
git log develop --oneline -5

echo "Completado!"
pause
