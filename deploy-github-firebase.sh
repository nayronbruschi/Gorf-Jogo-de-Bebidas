#!/bin/bash

# Script para atualizar o GitHub e fazer deploy automático para o Firebase
# Criado para resolver problemas de sincronização do Gorf App

# Cores para mensagens
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sem Cor

# Verificar se o token do GitHub está disponível
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}ERRO: Token do GitHub não encontrado.${NC}"
    echo -e "Por favor, adicione seu token no ambiente: GITHUB_TOKEN"
    exit 1
fi

# Verificar se o token do Firebase está disponível
if [ -z "$FIREBASE_TOKEN" ]; then
    echo -e "${RED}ERRO: Token do Firebase não encontrado.${NC}"
    echo -e "Por favor, adicione seu token no ambiente: FIREBASE_TOKEN"
    exit 1
fi

# Configurar as credenciais do git
git config --global user.email "deployment@gorf.com.br"
git config --global user.name "Gorf Deployment"

# Adicionar todas as alterações
echo -e "${GREEN}Adicionando alterações ao Git...${NC}"
git add -A

# Criar commit com timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
echo -e "${GREEN}Criando commit com timestamp: $TIMESTAMP...${NC}"
git commit -m "Atualização automática: $TIMESTAMP" -m "Deploy automático do ambiente de desenvolvimento Replit para o GitHub e Firebase."

# Configurar o remote correto usando o token
GITHUB_REPO="github.com/nayronbruschi/Gorf-Jogo-de-Bebidas.git"
git remote set-url origin "https://$GITHUB_TOKEN@$GITHUB_REPO"

# Enviar para o GitHub
echo -e "${GREEN}Enviando alterações para o GitHub...${NC}"
git push -u origin main

# Verificar se o push foi bem-sucedido
if [ $? -ne 0 ]; then
    echo -e "${RED}ERRO: Falha ao enviar alterações para o GitHub.${NC}"
    echo -e "Detalhes de diagnóstico:"
    echo -e "Remote URL: $(git remote get-url origin)"
    echo -e "Branch atual: $(git branch --show-current)"
    exit 1
fi

echo -e "${GREEN}Alterações enviadas com sucesso para o GitHub!${NC}"
echo -e "${YELLOW}O workflow do GitHub Actions deve iniciar automaticamente o deploy para o Firebase.${NC}"
echo -e "Para acompanhar o progresso, visite: https://github.com/nayronbruschi/Gorf-Jogo-de-Bebidas/actions"
echo ""
echo -e "${YELLOW}Alternativamente, você pode fazer o deploy diretamente para o Firebase:${NC}"
echo -e "Execute: ./deploy-with-token.sh"

# Perguntar se o usuário quer fazer o deploy diretamente
read -p "Deseja fazer o deploy direto para o Firebase agora? (s/n): " DEPLOY_NOW

if [[ "$DEPLOY_NOW" =~ ^[Ss]$ ]]; then
    # Fazer o build do projeto
    echo -e "${GREEN}Iniciando build do projeto...${NC}"
    npm run build || {
        echo -e "${RED}ERRO: Falha ao fazer o build do projeto.${NC}"
        exit 1
    }
    
    # Verificar se o diretório dist existe
    if [ ! -d "dist" ]; then
        echo -e "${RED}ERRO: O diretório 'dist' não foi criado. O build falhou.${NC}"
        exit 1
    fi
    
    # Verifique a versão do Node.js
    NODE_VERSION=$(node -v | cut -d 'v' -f2)
    NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f1)
    
    echo -e "${YELLOW}Verificando versão do Node.js: $NODE_VERSION${NC}"
    
    # Escolha a versão correta do Firebase CLI com base na versão do Node.js
    if [ $NODE_MAJOR_VERSION -lt 20 ]; then
        echo -e "${YELLOW}Node.js versão $NODE_VERSION detectado. Firebase CLI v14+ requer Node.js 20+.${NC}"
        echo -e "${YELLOW}Instalando versão compatível do Firebase CLI...${NC}"
        npm install firebase-tools@11.30.0 # Última versão que suporta Node.js 18
        FIREBASE_CMD="npx firebase@11.30.0"
    else
        echo -e "${GREEN}Node.js versão $NODE_VERSION é compatível com a versão mais recente do Firebase CLI.${NC}"
        FIREBASE_CMD="npx firebase"
    fi
    
    # Deploy para o Firebase
    echo -e "${GREEN}Iniciando deploy para o Firebase Hosting usando o token...${NC}"
    $FIREBASE_CMD deploy --only=hosting --token "$FIREBASE_TOKEN" || {
        echo -e "${RED}ERRO: Falha ao fazer deploy para o Firebase${NC}" >&2
        exit 1
    }
    
    echo -e "${GREEN}Deploy concluído com sucesso!${NC}"
    echo -e "Seu site está disponível em:"
    echo -e "- ${YELLOW}https://gorf-jogo-de-bebidas.firebaseapp.com${NC}"
    echo -e "- ${YELLOW}https://gorf-jogo-de-bebidas.web.app${NC}"
    echo -e "- ${YELLOW}https://gorf.com.br${NC}"
fi