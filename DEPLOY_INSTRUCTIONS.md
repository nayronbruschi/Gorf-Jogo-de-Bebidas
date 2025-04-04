# Instruções para Deploy do GORF

Este documento contém instruções detalhadas para fazer o deploy da aplicação GORF em diferentes ambientes.

## Opções de Deploy

Existem três formas de fazer o deploy do GORF:

1. **Deploy a partir do Replit** (recomendado para testes e emergências)
2. **Deploy manual a partir do seu computador**
3. **Deploy automático via GitHub Actions**

## 1. Deploy a partir do Replit

### 1.1 Deploy usando o token configurado

Se o token do Firebase já estiver configurado nas variáveis de ambiente do Replit:

```bash
# Tornar o script executável (apenas na primeira vez)
chmod +x deploy-with-token.sh

# Executar o script de deploy
./deploy-with-token.sh
```

### 1.2 Deploy de emergência com token fornecido

Se precisar fazer um deploy de emergência com um token específico:

```bash
# Tornar o script executável (apenas na primeira vez)
chmod +x deploy-emergency.sh

# Executar o script de deploy com o token
./deploy-emergency.sh SEU_TOKEN_FIREBASE
```

## 2. Deploy Manual do seu Computador

Para fazer o deploy a partir do seu próprio computador:

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/gorf-app.git
   cd gorf-app
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Faça login no Firebase:
   ```bash
   npx firebase login
   ```

4. Execute o build e deploy:
   ```bash
   npm run build
   npx firebase deploy --only hosting
   ```

## 3. Deploy Automático via GitHub Actions

O projeto está configurado para fazer deploy automático quando você faz push para a branch `main`.

### 3.1 Configuração do Token do Firebase

Para que o GitHub Actions possa fazer deploy no Firebase, você precisará configurar um token no seu repositório:

1. Gere um token do Firebase CI:
   ```bash
   npx firebase login:ci
   ```
   Isso irá abrir uma janela do navegador para autenticação.

2. Copie o token gerado.

3. No GitHub, vá para o repositório > **Settings** > **Secrets and variables** > **Actions**

4. Clique em **New repository secret**

5. Adicione um segredo com o nome `FIREBASE_TOKEN`

6. Cole o token gerado como valor do segredo

7. Clique em **Add secret**

### 3.2 Processo de Deploy Automático

Um workflow do GitHub Actions foi configurado para executar automaticamente quando houver um push na branch `main`:

1. O workflow clona o repositório
2. Configura o ambiente Node.js v20 (compatível com Firebase CLI mais recente)
3. Instala as dependências com `npm ci`
4. Faz o build do projeto com `npm run build`
5. Verifica a versão do Node.js e escolhe a versão apropriada do Firebase CLI
6. Faz o deploy para o Firebase Hosting usando o token

O arquivo de workflow está localizado em `.github/workflows/firebase-deploy.yml`.

### 3.3 Execução Manual do Workflow

Você também pode iniciar o workflow de deploy manualmente:

1. Acesse o repositório no GitHub
2. Vá para a aba "Actions"
3. Selecione o workflow "Deploy to Firebase Hosting"
4. Clique em "Run workflow" e selecione a branch principal (main)

## Domínios Configurados

Após o deploy, o site estará disponível nos seguintes domínios:

- https://gorf-jogo-de-bebidas.firebaseapp.com
- https://gorf-jogo-de-bebidas.web.app
- https://gorf.com.br (domínio personalizado)

## Verificações Pós-Deploy

Após o deploy, verifique:

1. **Funcionalidade de autenticação**:
   - Teste o login com Google
   - Teste o login com e-mail/senha
   - Verifique se o domínio correto aparece no popup de autenticação (gorf.com.br)

2. **Funcionalidade dos jogos**:
   - Verifique se todos os jogos estão funcionando corretamente
   - Teste especialmente o jogo "Qual Meu Nome" que foi recentemente implementado

3. **Integração com Firebase**:
   - Verifique se os dados dos usuários estão sendo salvos corretamente no Firestore
   - Verifique se as estatísticas de jogo estão sendo atualizadas

## Resolução de Problemas

### Problemas de Deploy

1. **Erro de Autenticação**:
   - Verifique se o token do Firebase é válido (consulte `FIREBASE_TOKEN_GUIDE.md`)
   - Gere um novo token se necessário usando `npx firebase login:ci`

2. **Erro de Versão do Node.js**:
   - Os scripts de deploy estão configurados para detectar a versão do Node.js e usar a versão adequada do Firebase CLI
   - No GitHub Actions, a versão do Node.js é configurada para v20

3. **Erro no Build**:
   - Verifique os logs de build para identificar erros específicos
   - Certifique-se de que todas as dependências estão instaladas corretamente

### Problemas de Autenticação

1. **Domínios não autorizados**:
   - Verifique se todos os domínios estão adicionados na lista de domínios autorizados no Firebase Console
   - Consulte `FIREBASE_AUTH_DOMAINS.md` para a lista completa de domínios necessários

2. **Erro de redirecionamento**:
   - Verifique as configurações de redirecionamento de OAuth no Google Cloud Console
   - Consulte `FIREBASE_AUTH_GUIDE.md` para instruções detalhadas