# Guia para Solucionar Problemas com Autenticação Google

Este guia específico explica passo a passo como resolver problemas com a autenticação Google no Gorf, incluindo a configuração necessária no Google Cloud Console.

## Problema: Autenticação com Google não funciona

Se você está enfrentando problemas com a autenticação Google, como:
- O popup abre, mas depois fecha sem completar o login
- Erros de domínio não autorizado 
- Erro "redirect_uri_mismatch"

Siga este guia completo para resolver o problema.

## 1. Configuração no Google Cloud Console (ESSENCIAL)

A causa mais comum de problemas na autenticação Google é a falta de configuração no Google Cloud Console:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto "gorf-jogo-de-bebidas" (mesmo projeto do Firebase)
3. No menu lateral, navegue até **APIs & Services > Credentials**
4. Procure por **OAuth 2.0 Client IDs** e localize o cliente criado para seu app web Firebase
5. Clique para editar esse cliente OAuth
6. Em **Authorized redirect URIs**, adicione TODOS os seguintes URIs:
   - `https://gorf.com.br/__/auth/handler`
   - `https://www.gorf.com.br/__/auth/handler`
   - `https://gorf-jogo-de-bebidas.firebaseapp.com/__/auth/handler`
   - `https://gorf-jogo-de-bebidas.web.app/__/auth/handler`
   - URIs adicionais para ambientes de desenvolvimento:
     - `https://[SEU-USUARIO-REPLIT].repl.co/__/auth/handler`
     - `https://[SEU-APP-NAME].replit.app/__/auth/handler`
     - `http://localhost:5173/__/auth/handler` (para desenvolvimento local)
     - Qualquer outro ambiente onde o app possa rodar

7. Clique em **Save** para salvar as alterações

> **NOTA IMPORTANTE**: A configuração no Google Cloud Console é DIFERENTE da configuração no Firebase Console. Ambas são necessárias!

## 2. Verificação no Firebase Console

Além do Google Cloud Console, verifique também se o Firebase está configurado corretamente:

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione o projeto "gorf-jogo-de-bebidas"
3. Navegue até **Authentication > Sign-in method**
4. Verifique se o provedor **Google** está habilitado
5. Clique na engrenagem (configurações) ao lado do Google e verifique:
   - Se o projeto web está corretamente configurado
   - Se a chave do projeto está válida
6. Navegue para **Authentication > Settings > Authorized domains**
7. Verifique se todos os domínios onde o app roda estão listados:
   - `gorf.com.br`
   - `www.gorf.com.br`
   - `gorf-jogo-de-bebidas.firebaseapp.com`
   - `gorf-jogo-de-bebidas.web.app`
   - Seus domínios de desenvolvimento (como `[seu-app].replit.app`)

## 3. Diagnóstico com o Console do Navegador

Para identificar exatamente qual é o problema:

1. Abra o app no navegador
2. Abra o console do navegador (F12 > Console)
3. Tente fazer login com Google
4. Observe os logs de erro no console

### Códigos de erro comuns e suas soluções:

- **auth/unauthorized-domain**:
  - **Solução**: Adicione o domínio no Firebase Console (Authentication > Settings > Authorized domains)

- **auth/redirect-uri-mismatch**:
  - **Solução**: Adicione o URI de redirecionamento no Google Cloud Console (APIs & Services > Credentials > OAuth 2.0 Client IDs)

- **auth/popup-blocked**:
  - **Solução**: Permita popups para o site nas configurações do navegador

- **auth/network-request-failed**:
  - **Solução**: Verifique a conexão com a internet ou possíveis bloqueios de firewall

## 4. Verificação de Implementação

Verfique se o código da aplicação está correto. Em `client/src/lib/firebase.ts`:

```typescript
// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDRZ0akGNllg2YFaJM832PWSXvbNfcFbcE",
  authDomain: isDevelopment ? "gorf-jogo-de-bebidas.firebaseapp.com" : "gorf.com.br",
  projectId: "gorf-jogo-de-bebidas",
  // ... outras configurações
};

// Configuração do Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Não é necessário definir redirect_uri aqui
});
```

E em `client/src/pages/auth.tsx`, para o login com Google:

```typescript
try {
  const result = await signInWithPopup(auth, googleProvider);
  // ... código após login bem-sucedido
} catch (error) {
  // ... tratamento de erro
}
```

## 5. Limpeza de Cache e Estado do Navegador

Se as configurações parecem corretas, mas os problemas persistem:

1. Limpe o cache do navegador
2. Experimente em uma janela anônima/privada
3. Tente em outro navegador
4. Deslogue de todas as contas Google e tente novamente

## 6. Confirmação de Resolução

Você saberá que o problema está resolvido quando:

1. O popup de autenticação do Google abrir normalmente
2. Você conseguir selecionar uma conta Google
3. Após selecionar a conta, o popup fechar e você ser autenticado no app
4. No console do navegador, não aparecerem mais erros relacionados à autenticação

## Resumo de Verificação

Use este checklist para garantir que tudo está configurado corretamente:

- [ ] Provedor Google habilitado no Firebase Console
- [ ] Todos os domínios adicionados no Firebase Console
- [ ] Todos os URIs de redirecionamento adicionados no Google Cloud Console
- [ ] Código da aplicação usando a configuração correta do Firebase
- [ ] Navegador permitindo popups para o site
- [ ] Cache do navegador limpo