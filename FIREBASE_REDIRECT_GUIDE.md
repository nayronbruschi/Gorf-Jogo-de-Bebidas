# Guia para Resolver o Erro `redirect_uri_mismatch` no Firebase Authentication

## O Problema

Quando você tenta fazer login usando o Google Authentication (ou qualquer outro provedor OAuth) e encontra o erro:

```
Acesso bloqueado: a solicitação desse app é inválida
Erro 400: redirect_uri_mismatch
```

Isso significa que o Firebase está tentando redirecionar para um URI que não está registrado como autorizado no Console do Google Cloud.

## Causas Comuns

1. **Domínio não autorizado**: O domínio que está solicitando a autenticação não foi adicionado à lista de domínios autorizados no Firebase.

2. **Origens OAuth não configuradas**: Os URIs de redirecionamento não foram configurados no projeto do Google Cloud vinculado ao Firebase.

3. **Ambientes múltiplos**: Ao desenvolver em diferentes ambientes (local, Replit, produção) sem configurar todos eles.

## Como Resolver

### 1. Adicionar Domínios Autorizados no Firebase Authentication

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto do GORF
3. No menu lateral, clique em **Authentication**
4. Clique na aba **Settings**
5. Role até a seção **Authorized domains**
6. Adicione todos os domínios onde seu app será executado:
   - gorf.com.br
   - www.gorf.com.br
   - gorf-jogo-de-bebidas.firebaseapp.com
   - gorf-jogo-de-bebidas.web.app
   - e1cb14e0-5b70-4cf3-9a38-2100d63f18ac-00-4esb2nzbujnh.kirk.replit.dev (seu domínio no Replit)
   - localhost

### 2. Configurar URIs de Redirecionamento no Google Cloud Console

1. Acesse o [Console do Google Cloud](https://console.cloud.google.com/)
2. Selecione o projeto associado ao seu Firebase
3. No menu lateral, navegue até **APIs & Services** > **Credentials**
4. Encontre a seção **OAuth 2.0 Client IDs** e clique no cliente ID usado pelo seu projeto Firebase
5. Na seção **Authorized redirect URIs**, adicione:

   ```
   https://gorf.com.br/__/auth/handler
   https://www.gorf.com.br/__/auth/handler
   https://gorf-jogo-de-bebidas.firebaseapp.com/__/auth/handler
   https://gorf-jogo-de-bebidas.web.app/__/auth/handler
   https://e1cb14e0-5b70-4cf3-9a38-2100d63f18ac-00-4esb2nzbujnh.kirk.replit.dev/__/auth/handler
   http://localhost:5000/__/auth/handler
   ```

6. Clique em **SAVE**

### 3. Para Ambiente de Desenvolvimento no Replit

É especialmente importante adicionar o domínio Replit, que é dinâmico:

1. Obtenha o domínio completo do seu Replit (como mostrado nos logs de autenticação)
2. Adicione-o como domínio autorizado no Firebase Auth
3. Adicione o URI de redirecionamento completo no Console do Google Cloud

### 4. Lidando com Múltiplos Ambientes no Código

Atualizamos o código para melhor detecção de erros e feedback ao usuário. Quando houver um erro de redirect_uri_mismatch, o código agora exibirá:

- O domínio atual que está tentando autenticar
- Mensagens claras sobre como resolver o problema
- Logs detalhados no console para diagnóstico

## Diagnosticando Problemas

Se você continuar encontrando problemas:

1. Abra as Ferramentas de Desenvolvedor do seu navegador (F12)
2. Vá para a aba Console
3. Tente fazer login e observe os logs detalhados
4. Procure especificamente por:
   - O domínio atual
   - O tipo exato de erro
   - A mensagem de erro completa

## Alterações de Código Implementadas

1. Adicionamos tratamento para o erro específico `auth/redirect-uri-mismatch`
2. Implementamos logs de diagnóstico detalhados
3. Adicionamos feedback visual para o usuário com mensagens claras
4. Configuramos o Firebase para usar:
   - `gorf-jogo-de-bebidas.firebaseapp.com` como authDomain em ambientes de desenvolvimento
   - `gorf.com.br` como authDomain em ambiente de produção
5. Adicionamos persistência local de autenticação para evitar problemas de popups que fecham inesperadamente

### Detecção Automática de Ambiente 

Implementamos uma lógica que detecta automaticamente se estamos em um ambiente de desenvolvimento:

```typescript
// Determinar qual domínio de autenticação usar com base no ambiente
const currentHost = window.location.host;
const isDevelopment = 
  currentHost.includes('localhost') || 
  currentHost.includes('replit') ||
  currentHost.includes('repl.co');

// A melhor prática para resolver o problema do redirect_uri_mismatch
// é usar o domínio atual para o authDomain em ambientes de desenvolvimento,
// mas usar o domínio personalizado em produção
const firebaseConfig = {
  apiKey: "...",
  authDomain: isDevelopment 
    ? "gorf-jogo-de-bebidas.firebaseapp.com"  // Domínio padrão do Firebase para desenvolvimento
    : "gorf.com.br",                           // Domínio personalizado para produção
  // ...outras configurações
};
```

### Persistência de Autenticação

Para resolver o problema do popup que fecha imediatamente, configuramos a persistência local:

```typescript
// Configurar persistência local para melhorar a experiência do usuário
// e evitar problemas com popups que fecham inesperadamente
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase Auth: Persistência local configurada com sucesso");
  })
  .catch((error) => {
    console.error("Firebase Auth: Erro ao configurar persistência:", error);
  });
```

## Considerações Importantes

- **Tempo de Propagação**: Alterações nas configurações de OAuth podem levar até 5-10 minutos para se propagarem
- **Cache do Navegador**: Tente limpar o cache ou usar uma janela anônima se as alterações não surtirem efeito imediatamente
- **Configuração Consistente**: Certifique-se de que o authDomain no seu código Firebase corresponda a um dos domínios autorizados