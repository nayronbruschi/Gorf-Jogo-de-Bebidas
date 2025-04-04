# Instruções para Deploy Automático com GitHub Actions e Firebase

Este documento contém instruções detalhadas para configurar o deploy automático do Gorf App usando GitHub Actions e Firebase Hosting.

## Pré-requisitos

1. Conta no GitHub com acesso ao repositório do projeto
2. Projeto Firebase configurado
3. Firebase CLI instalado globalmente (opcional, para testes locais)

## Configuração do Segredo FIREBASE_SERVICE_ACCOUNT

Para que o GitHub Actions possa fazer deploy no Firebase, você precisará configurar um segredo no seu repositório:

1. No Firebase Console, vá para **Configurações do Projeto** > **Contas de serviço**
2. Clique em **Gerar nova chave privada**
3. Salve o arquivo JSON gerado
4. No GitHub, vá para o repositório > **Settings** > **Secrets and variables** > **Actions**
5. Clique em **New repository secret**
6. Adicione um segredo com o nome `FIREBASE_SERVICE_ACCOUNT`
7. Cole todo o conteúdo do arquivo JSON como valor do segredo
8. Clique em **Add secret**

## Como funciona o deploy automático

Um workflow do GitHub Actions foi configurado para executar automaticamente quando houver um push na branch `main`:

1. O workflow clona o repositório
2. Configura o ambiente Node.js
3. Instala as dependências com `npm ci`
4. Faz o build do projeto com `npm run build`
5. Faz o deploy para o Firebase Hosting

O arquivo de workflow está localizado em `.github/workflows/firebase-deploy.yml`.

## Testando deploy localmente

Se quiser testar o deploy localmente antes de fazer push:

```bash
# Faça login no Firebase (uma única vez)
npx firebase login

# Execute o script de deploy
./deploy-firebase.sh
```

## Domínios configurados

Após o deploy, o site estará disponível nos seguintes domínios:

- https://gorf-jogo-de-bebidas.firebaseapp.com
- https://gorf-jogo-de-bebidas.web.app
- https://gorf.com.br (domínio personalizado)

## Resolução de problemas

Se o deploy automático falhar, verifique:

1. O log de execução no GitHub Actions (guia Actions do repositório)
2. Se o segredo FIREBASE_SERVICE_ACCOUNT está configurado corretamente
3. Se a conta de serviço tem permissões de deploy no projeto Firebase