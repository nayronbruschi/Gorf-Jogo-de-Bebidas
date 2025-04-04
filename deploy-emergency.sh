#!/bin/bash

# Script para deploy de emergência do Firebase a partir do Replit
# Este script usa um token CI do Firebase para autenticação

# Cores para mensagens
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sem Cor

# Verificar se o token foi fornecido
if [ -z "$1" ]; then
    echo -e "${RED}ERRO: Token do Firebase CI não fornecido${NC}"
    echo -e "Uso: ./deploy-emergency.sh SEU_TOKEN_FIREBASE"
    exit 1
fi

FIREBASE_TOKEN="$1"

# Função para exibir mensagens de erro e sair
error_exit() {
    echo -e "${RED}ERRO: $1${NC}" >&2
    exit 1
}

echo -e "${GREEN}Iniciando build do projeto...${NC}"
npm run build || error_exit "Falha ao fazer o build do projeto. Verifique os erros acima."

# Verificar se o diretório de build foi criado
if [ ! -d "dist" ]; then
    error_exit "O diretório 'dist' não foi criado. O build falhou."
fi

echo -e "${GREEN}Iniciando deploy para o Firebase Hosting...${NC}"
echo -e "${YELLOW}Usando token CI para autenticação...${NC}"

npx firebase deploy --only=hosting --token "$FIREBASE_TOKEN" --project=gorf-jogo-de-bebidas || error_exit "Falha ao fazer deploy para o Firebase"

echo -e "${GREEN}Deploy concluído com sucesso!${NC}"
echo -e "Seu site está disponível em:"
echo -e "- ${YELLOW}https://gorf-jogo-de-bebidas.firebaseapp.com${NC}"
echo -e "- ${YELLOW}https://gorf-jogo-de-bebidas.web.app${NC}"
echo -e "- ${YELLOW}https://gorf.com.br${NC}"