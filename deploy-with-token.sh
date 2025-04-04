#!/bin/bash

# Script para fazer o deploy para o Firebase Hosting usando token
# Versão adaptada para Replit

# Cores para mensagens
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sem Cor

# Verificar se o token do Firebase está disponível
if [ -z "$FIREBASE_TOKEN" ]; then
    echo -e "${RED}ERRO: Token do Firebase não encontrado. Defina a variável de ambiente FIREBASE_TOKEN.${NC}" >&2
    exit 1
fi

# Fazer o deploy para o Firebase
echo -e "${GREEN}Iniciando deploy para o Firebase Hosting usando o token...${NC}"
npx firebase deploy --only=hosting --token "$FIREBASE_TOKEN" || {
    echo -e "${RED}ERRO: Falha ao fazer deploy para o Firebase${NC}" >&2
    exit 1
}

echo -e "${GREEN}Deploy concluído com sucesso!${NC}"
echo -e "Seu site está disponível em:"
echo -e "- ${YELLOW}https://gorf-jogo-de-bebidas.firebaseapp.com${NC}"
echo -e "- ${YELLOW}https://gorf-jogo-de-bebidas.web.app${NC}"
echo -e "- ${YELLOW}https://gorf.com.br${NC}"