#!/bin/sh
set -e

echo "🔄 Rodando migrações do banco de dados (Prisma)..."
npx prisma migrate deploy

echo "🌱 Rodando seeder para garantir usuários base..."
npx prisma db seed || echo "Seeder falhou ou já foi executado. Continuando..."

echo "🚀 Iniciando a API NestJS..."
exec node dist/main.js
