# Guia de Integração do Firebase com o Gorf App

Este guia contém informações detalhadas sobre a integração do Firebase com o aplicativo Gorf, incluindo autenticação, hospedagem e configurações avançadas.

## Serviços Firebase Configurados

O Gorf App utiliza os seguintes serviços do Firebase:

1. **Authentication**: Para autenticação de usuários
2. **Hosting**: Para hospedagem do frontend
3. **Firestore** (opcional): Para armazenamento de dados em tempo real
4. **Storage** (opcional): Para armazenamento de arquivos e imagens

## Configuração do Domínio Personalizado

O Gorf App está configurado para utilizar o domínio personalizado `gorf.com.br`. Esta configuração afeta tanto o Hosting quanto o Authentication.

### Conexão do Domínio ao Firebase Hosting

Para conectar o domínio personalizado ao Firebase Hosting:

1. No Firebase Console, navegue até **Hosting**
2. Clique em **Add custom domain**
3. Insira o seu domínio: `gorf.com.br`
4. Siga o processo de verificação de propriedade do domínio

### DNS e Verificação de Domínio

Para que o domínio personalizado funcione corretamente:

1. Configure os registros DNS conforme instruções do Firebase:
   - Registro A: Aponte para os IPs do Firebase Hosting (normalmente fornecidos durante o processo)
   - Registro AAAA: Para suporte IPv6 (opcional)
   - Registro TXT: Para verificação de propriedade do domínio

### Configuração SSL/TLS

O Firebase Hosting fornece automaticamente certificados SSL gratuitos para domínios conectados:

1. No Firebase Console, depois de adicionar o domínio, aguarde que o status do certificado SSL mude para "Ativo"
2. Você não precisa gerenciar renovações - o Firebase cuida disso automaticamente

### Redirecionamento www para Domínio Principal

Para configurar o redirecionamento de www.gorf.com.br para gorf.com.br:

1. No Firebase Console, ao adicionar seu domínio personalizado, escolha a opção de adicionar também o subdomínio www
2. Configure o redirecionamento no arquivo `firebase.json`:

```json
{
  "hosting": {
    // ...outras configurações
    "redirects": [
      {
        "source": "https://www.gorf.com.br/*",
        "destination": "https://gorf.com.br/:1",
        "type": 301
      }
    ]
  }
}
```

### Configuração do Authentication com Domínio Personalizado

Para que a autenticação funcione corretamente com o domínio personalizado:

1. No Firebase Console, vá para Authentication > Settings
2. Na seção "Authorized domains", adicione:
   - gorf.com.br
   - www.gorf.com.br
   - gorf-jogo-de-bebidas.firebaseapp.com (importante para development)
   - gorf-jogo-de-bebidas.web.app (importante para development)

### Personalização da Aparência da Autenticação

Para personalizar a aparência da tela de autenticação do Firebase:

1. No Firebase Console, vá para Authentication > Templates > Appearance
2. Configure os seguintes elementos:
   - **App name**: GORF
   - **Logo URL**: Faça upload do logotipo do GORF (128x128px recomendado)
   - **Color scheme**: #7E22CE (roxo principal do GORF)
   - **Footer**: Personalize o rodapé com links para sua política de privacidade

Isso garante que quando os usuários acessarem a página de login, verão o branding do GORF em vez da interface padrão do Firebase.

## Configuração da Autenticação

O Gorf App está configurado para usar os seguintes métodos de autenticação:

- Email/Senha
- Google (Sign in with Google)
- Anônimo (para acesso rápido sem cadastro)

Para modificar ou adicionar métodos de autenticação:

1. No Firebase Console, vá para Authentication > Sign-in method
2. Habilite ou desabilite os métodos desejados

## Configuração de Cache e Performance

O Firebase Hosting está configurado com as seguintes regras de cache para otimização:

- Arquivos estáticos (imagens, CSS, JS): Cache longo (1 ano)
- HTML e arquivos dinâmicos: Cache curto ou nenhum cache

Essas configurações estão definidas no arquivo `firebase.json`.

## Configuração do Cliente Firebase

Existem duas abordagens para configurar o Firebase no cliente:

### 1. Configuração Direta no Código

No arquivo `client/src/lib/firebase.ts`, configuramos diretamente as credenciais do Firebase:

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

IMPORTANTE: Nós configuramos o `authDomain` para sempre apontar para `gorf.com.br`, independentemente do ambiente. Isso garante que a interface de autenticação sempre mostre o domínio personalizado, o que proporciona uma experiência de marca consistente.

### 2. Usando Variáveis de Ambiente (Alternativa)

Alternativamente, você pode usar variáveis de ambiente no arquivo `.env`:

```
VITE_FIREBASE_API_KEY=AIzaSyDRZ0akGNllg2YFaJM832PWSXvbNfcFbcE
VITE_FIREBASE_AUTH_DOMAIN=gorf.com.br
VITE_FIREBASE_PROJECT_ID=gorf-jogo-de-bebidas
VITE_FIREBASE_STORAGE_BUCKET=gorf-jogo-de-bebidas.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=666516951655
VITE_FIREBASE_APP_ID=1:666516951655:web:ecade148dce7e08852fac2
```

E então usar essas variáveis no código:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

No entanto, a abordagem direta é mais simples e recomendada para este projeto.

## Segurança e Regras

Para configurar regras de segurança para o Firestore e Storage:

1. Acesse o Firebase Console
2. Vá para a seção de Firestore ou Storage
3. Clique na aba "Rules"
4. Configure as regras de acesso de acordo com a lógica de negócios do Gorf App

## Monitoramento e Analytics

O Firebase Analytics está configurado para coletar dados sobre o uso do aplicativo. Os principais eventos rastreados são:

- Login/Signup
- Início de jogos
- Conclusão de jogos
- Interações específicas com funcionalidades principais

Para visualizar os dados de analytics, acesse o Firebase Console > Analytics.

## Migração de Hospedagem

Se precisar migrar a hospedagem entre ambientes do Firebase ou para um provedor diferente:

1. Exporte os dados de autenticação do Firebase
2. Configure a nova hospedagem
3. Atualize os registros DNS para apontar para a nova hospedagem
4. Importe os dados de autenticação se necessário