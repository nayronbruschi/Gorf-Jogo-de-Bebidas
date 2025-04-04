#!/bin/bash

# Script para fazer o build e deploy para o Firebase Hosting
# Criado para o Gorf App

# Cores para mensagens
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sem Cor

# Função para exibir mensagens de erro e sair
error_exit() {
    echo -e "${RED}ERRO: $1${NC}" >&2
    exit 1
}

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    error_exit "Node.js não encontrado. Por favor, instale o Node.js antes de continuar."
fi

# Verificar se o NPM está instalado
if ! command -v npm &> /dev/null; then
    error_exit "NPM não encontrado. Por favor, instale o NPM antes de continuar."
fi

# Verificar se o Firebase CLI está disponível
if ! command -v npx firebase &> /dev/null; then
    echo -e "${YELLOW}AVISO: Firebase CLI não encontrado. Tentando instalar temporariamente...${NC}"
    npm install -g firebase-tools || error_exit "Falha ao instalar Firebase CLI"
fi

# Fazer o build do projeto
echo -e "${GREEN}Iniciando build do projeto...${NC}"
npm run build || error_exit "Falha ao fazer o build do projeto. Verifique os erros acima."

# Verificar se o diretório de build foi criado
if [ ! -d "dist" ]; then
    error_exit "O diretório 'dist' não foi criado. O build falhou."
fi

# Fazer o deploy para o Firebase
echo -e "${GREEN}Iniciando deploy para o Firebase Hosting...${NC}"
npx firebase deploy --only=hosting --project=gorf-jogo-de-bebidas || error_exit "Falha ao fazer deploy para o Firebase"

echo -e "${GREEN}Deploy concluído com sucesso!${NC}"
echo -e "Seu site está disponível em:"
echo -e "- ${YELLOW}https://gorf-jogo-de-bebidas.firebaseapp.com${NC}"
echo -e "- ${YELLOW}https://gorf-jogo-de-bebidas.web.app${NC}"
echo -e "- ${YELLOW}https://gorf.com.br${NC}"
echo ""
echo -e "Para verificar o status do seu site, visite:"
echo -e "${YELLOW}https://console.firebase.google.com/project/gorf-jogo-de-bebidas/hosting/sites${NC}"