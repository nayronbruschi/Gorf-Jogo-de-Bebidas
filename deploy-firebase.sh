#!/bin/bash

# Script para fazer o build do projeto - não usa Firebase Hosting pois está hospedado no Replit

# Fazer o build do projeto
echo "Iniciando build do projeto..."
npm run build

echo "Build concluído! O site está hospedado no Replit."
echo "A configuração do Firebase Auth para domínio personalizado gorf.com.br deve ser feita no console do Firebase."