# Guia para Configuração do Token do Firebase no GitHub

## Problema

Você está recebendo erros de autenticação no workflow do GitHub Actions chamado `build_and_deploy`, o que está impedindo que o deploy automático para o Firebase Hosting seja concluído com sucesso. O erro específico indica: `The process '/opt/hostedtoolcache/node/18.20.7/x64/bin/npx' failed with exit code 1`.

## Solução

O problema provavelmente está relacionado à falta ou expiração do token do Firebase usado pelo GitHub Actions. Você precisa gerar um novo token do Firebase e adicioná-lo como um segredo no seu repositório do GitHub.

### Passo 1: Gerar um Novo Token do Firebase

Existem duas maneiras de fazer isso:

#### Opção 1: Usando o Replit (recomendado)

1. No Replit, abra um terminal
2. Execute o seguinte comando:
   ```bash
   npx firebase login:ci
   ```
3. Você será redirecionado para uma página da web para fazer login na sua conta do Google
4. Após fazer login, autorize o Firebase CLI
5. Copie o token que aparece no terminal

#### Opção 2: No seu computador local

1. Instale o Firebase CLI globalmente (se ainda não tiver):
   ```bash
   npm install -g firebase-tools
   ```
2. Execute o comando para fazer login e gerar o token:
   ```bash
   firebase login:ci
   ```
3. Siga as instruções na janela do navegador que será aberta
4. Copie o token gerado

### Passo 2: Adicionar o Token como Segredo no GitHub

1. Vá para o repositório do seu projeto no GitHub
2. Clique em "Settings" (Configurações)
3. No menu lateral, clique em "Secrets and variables" > "Actions"
4. Clique em "New repository secret"
5. No campo "Name", digite exatamente: `FIREBASE_TOKEN`
6. No campo "Value", cole o token que você copiou na etapa anterior
7. Clique em "Add secret"

### Passo 3: Executar novamente o workflow

1. Vá para a aba "Actions" no seu repositório
2. Localize o workflow "Deploy to Firebase Hosting"
3. Clique em "Run workflow" e selecione a branch principal (normalmente "main")

## Verificação

Após configurar o token e executar o workflow novamente, verifique se o deploy foi bem-sucedido acessando a aba "Actions" e olhando o resultado da execução mais recente.

## Observações Importantes

- O token do Firebase tem uma validade longa, mas eventualmente expira. Se você enfrentar problemas semelhantes no futuro, repita este processo para gerar um novo token.
- Nunca compartilhe seu token Firebase, ele dá acesso completo aos seus projetos Firebase.
- Certifique-se de que a conta do Google usada para gerar o token tem permissões de administrador no projeto Firebase.