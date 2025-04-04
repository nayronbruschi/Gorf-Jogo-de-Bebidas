# Configuração de Domínios Autorizados no Firebase Authentication

Este documento explica como configurar corretamente o Firebase Authentication para funcionar com múltiplos domínios, incluindo o seu domínio personalizado (gorf.com.br) e os domínios padrão do Firebase Hosting.

## Problema Comum

Um problema comum ao usar o Firebase Authentication com um domínio personalizado é o erro `auth/unauthorized-domain` que ocorre quando o domínio da aplicação não está autorizado no console do Firebase.

## Solução: Configurar Múltiplos Domínios

### 1. No Console do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto: "gorf-jogo-de-bebidas"
3. Vá para **Authentication** > **Settings** > **Authorized domains**
4. Adicione todos os seguintes domínios:
   - gorf.com.br
   - www.gorf.com.br
   - gorf-jogo-de-bebidas.firebaseapp.com
   - gorf-jogo-de-bebidas.web.app
   - localhost (para desenvolvimento local)
   - [domínios de desenvolvimento como Replit]

### 2. No Código da Aplicação

No arquivo `client/src/lib/firebase.ts`, utilizamos uma abordagem adaptativa para determinar qual domínio de autenticação usar:

```typescript
// Detectar ambiente de produção
const isProduction = window.location.host === 'gorf.com.br' || 
                     window.location.host === 'www.gorf.com.br' ||
                     window.location.host === 'gorf-jogo-de-bebidas.web.app' ||
                     window.location.host === 'gorf-jogo-de-bebidas.firebaseapp.com';

// Usar domínio personalizado em produção, domínio padrão do Firebase em desenvolvimento
const firebaseConfig = {
  apiKey: "AIzaSyDRZ0akGNllg2YFaJM832PWSXvbNfcFbcE",
  authDomain: isProduction ? "gorf.com.br" : "gorf-jogo-de-bebidas.firebaseapp.com",
  projectId: "gorf-jogo-de-bebidas",
  // ... outras configurações
};
```

Esta abordagem permite:
- Usar o domínio personalizado (gorf.com.br) em produção para melhor experiência do usuário
- Usar o domínio padrão do Firebase em ambientes de desenvolvimento para facilitar o teste

## Tratamento de Erros

No componente de autenticação (`client/src/pages/auth.tsx`), implementamos tratamento para o erro `auth/unauthorized-domain`:

```typescript
case 'auth/unauthorized-domain':
  return 'Este domínio não está autorizado para login. Por favor, contate o administrador.';
```

## Testes e Verificação

Para verificar se a configuração está correta:

1. Tente fazer login no ambiente de desenvolvimento (Replit)
2. Tente fazer login no site de produção (gorf.com.br)
3. Tente fazer login nos domínios do Firebase Hosting (*.web.app, *.firebaseapp.com)

Todos esses domínios devem funcionar corretamente se estiverem configurados na lista de domínios autorizados no console do Firebase.