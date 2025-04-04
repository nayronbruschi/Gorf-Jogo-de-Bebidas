# Guia de Configuração do Firebase Authentication para GORF

Este guia explica como configurar o Firebase Authentication para sempre mostrar o domínio personalizado do GORF (gorf.com.br) e seu logo no popup de autenticação.

## 1. Configuração no Console do Firebase

### 1.1 Adicionar Domínios Autorizados

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione o projeto "gorf-jogo-de-bebidas"
3. No menu lateral, clique em **Authentication**
4. Clique na aba **Settings**
5. Role até a seção **Authorized domains**
6. Adicione os seguintes domínios (se ainda não estiverem presentes):
   - `gorf.com.br`
   - `www.gorf.com.br`
   - `gorf-jogo-de-bebidas.firebaseapp.com`
   - `gorf-jogo-de-bebidas.web.app`
   - Domínios de desenvolvimento (como seu ambiente Replit)

### 1.2 Configurar Providers e Aparência

1. Na página de **Authentication**, clique na aba **Sign-in method**
2. Certifique-se de que o provedor **Google** esteja ativado
3. Clique na aba **Templates**
4. Na seção **Appearance**, configure:
   - **App name**: GORF
   - **Logo URL**: URL do seu logo (upload de uma imagem de 128x128 pixels)
   - **Brand color**: #7E22CE (roxo do GORF)
   - **Footer**: Marque a opção para mostrar links padrão ou personalize-os

## 2. Configuração no Código

### 2.1 Configuração do Firebase (Em client/src/lib/firebase.ts)

Já configuramos a aplicação para usar sempre o domínio `gorf.com.br` no authDomain:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyDRZ0akGNllg2YFaJM832PWSXvbNfcFbcE",
  authDomain: "gorf.com.br", // Sempre usar o domínio personalizado
  projectId: "gorf-jogo-de-bebidas",
  storageBucket: "gorf-jogo-de-bebidas.appspot.com",
  messagingSenderId: "666516951655",
  appId: "1:666516951655:web:ecade148dce7e08852fac2"
};
```

### 2.2 Configuração do GoogleProvider

Configuramos o GoogleProvider para uma melhor experiência:

```typescript
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: 'user@gmail.com'
});
```

## 3. Verificar Links na Página de Autenticação

A página de autenticação deve agora mostrar o logo e nome do GORF, com o domínio gorf.com.br na URL e no popup de autenticação.

## 4. Verificação e Diagnóstico

Se encontrar problemas, verifique:

1. **Regras do Firebase Hosting**: Certifique-se de que as redireções no arquivo `firebase.json` estão corretas para que todos os caminhos sejam servidos pelo seu aplicativo Single Page.

2. **Domínio personalizado**: Verifique se o domínio personalizado está corretamente configurado no Firebase Hosting e se os registros DNS estão apontando para o Firebase.

3. **Cache do navegador**: Limpe o cache do navegador ou use modo anônimo para testar.

4. **Erros no console**: Verifique erros no console do navegador relacionados ao Firebase Authentication.

## 5. Configuração de Projeto Firebase

### 5.1 Para o Domínio Personalizado

1. No console do Firebase, vá para **Hosting**
2. Clique em **Add custom domain**
3. Siga as instruções para adicionar e verificar seu domínio (gorf.com.br)
4. Configure os registros DNS conforme solicitado pelo Firebase

### 5.2 Verificação de Identidade Firebase Auth

1. No console do Firebase, vá para **Authentication > Settings**
2. Na seção **Security**, certifique-se de que o projeto esteja configurado com as configurações adequadas de verificação

## 6. Logo e Identidade Visual

Para que o logo do GORF apareça na tela de autenticação:

1. Prepare uma imagem quadrada do logo com pelo menos 128x128 pixels
2. Faça upload dela em uma URL pública (pode ser no próprio Firebase Storage)
3. No console do Firebase, vá para **Authentication > Templates > Appearance**
4. Adicione a URL do logo e selecione a cor de destaque #7E22CE

## Certificação de Domínio

Para usar domínios personalizados com Firebase Auth, você precisa comprovar a propriedade do domínio:

1. No Google Search Console, adicione e verifique a propriedade do domínio gorf.com.br
2. Use o mesmo conta Google para gerenciar o projeto Firebase e o domínio
3. Isso oferece maior credibilidade e segurança para os usuários durante o processo de login

## Considerações Adicionais

- **Redirecionamentos pós-login**: Configure URLs de redirecionamento seguras em Authentication > Settings
- **Cookies**: Firebase Auth usa cookies para sessão, certifique-se de que seu domínio está configurado corretamente
- **HTTPS**: Certifique-se de que seu domínio está servindo o conteúdo através de HTTPS