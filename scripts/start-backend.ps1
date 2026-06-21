docker start movnly-db 2>$null
if (-not (docker ps -q -f name=movnly-db)) {
  docker run -d --name movnly-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=movnly -p 5433:5432 postgres:15
  Start-Sleep 4
}
cd $PSScriptRoot\..\backend
npm run start:dev
