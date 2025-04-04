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

### DNS e Verificação de Domínio

Para que o domínio personalizado funcione corretamente:

1. Adicione o domínio ao Firebase Hosting (Console do Firebase > Hosting > Adicionar domínio personalizado)
2. Configure os registros DNS conforme instruções do Firebase:
   - Registro A apontando para o IP do Firebase Hosting
   - Registro TXT para verificação de domínio

### Configuração do Authentication com Domínio Personalizado

Para que a autenticação funcione corretamente com o domínio personalizado:

1. No Firebase Console, vá para Authentication > Settings
2. Na seção "Authorized domains", adicione:
   - gorf.com.br
   - www.gorf.com.br

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

## Variáveis de Ambiente e Configuração do Cliente Firebase

As configurações do Firebase para o cliente (firebaseConfig) devem ser adicionadas como variáveis de ambiente no arquivo `.env`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Estas variáveis são usadas no arquivo `client/src/lib/firebase.ts` para inicializar o Firebase no frontend.

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