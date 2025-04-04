#!/bin/bash

# Script para fazer o build e deploy para o Firebase Hosting

# Fazer o build do projeto
echo "Iniciando build do projeto..."
npm run build

# Fazer o deploy para o Firebase
echo "Iniciando deploy para o Firebase Hosting..."
npx firebase deploy --only=hosting --project=gorf-jogo-de-bebidas

echo "Deploy concluído! Seu site está disponível em:"
echo "https://gorf-jogo-de-bebidas.firebaseapp.com"
echo "https://gorf-jogo-de-bebidas.web.app"
echo "https://gorf.com.br"