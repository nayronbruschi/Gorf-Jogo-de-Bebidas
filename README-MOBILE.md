# Gorf - Aplicativo Mobile

## Visão Geral

Este projeto contém a configuração necessária para transformar o aplicativo web Gorf em um aplicativo nativo para dispositivos iOS e Android usando o framework Capacitor.

## Estrutura do Projeto

- **`/dist`**: Contém os arquivos web que serão empacotados no aplicativo nativo
- **`/ios`**: Projeto Xcode para iOS
- **`/android`**: Projeto Android Studio para Android
- **`capacitor.config.ts`**: Configuração principal do Capacitor

## Como Funciona

O aplicativo mobile do Gorf funciona como um "wrapper" que carrega o aplicativo web Gorf hospedado em https://gorf-jogo-de-bebidas.replit.app/. Esta abordagem traz várias vantagens:

1. **Manutenção Simplificada**: Atualizações no aplicativo web são refletidas automaticamente no aplicativo móvel
2. **Experiência Nativa**: Os usuários podem instalar o aplicativo em seus dispositivos e acessá-lo facilmente
3. **Melhor Distribuição**: Disponibilidade nas lojas de aplicativos (App Store e Google Play)

## Guias Disponíveis

Para facilitar o desenvolvimento e distribuição do aplicativo, foram criados os seguintes guias:

1. **`INSTRUCOES_GORF_APP.md`**: Instruções detalhadas para compilação e distribuição
2. **`GUIA_VISUAL_XCODE.md`**: Guia visual para configuração no Xcode (iOS)
3. **`GUIA_RAPIDO_ANDROID.md`**: Guia rápido para configuração no Android Studio

## Pré-requisitos

- Node.js e npm instalados
- Xcode instalado (para iOS)
- Android Studio instalado (para Android)
- Capacitor CLI: `npm install -g @capacitor/cli`

## Comandos Básicos

### Preparar Projeto

```bash
# Atualizar os arquivos web para as plataformas nativas
npx cap copy

# Sincronizar configurações com as plataformas nativas
npx cap sync
```

### Abrir Projetos Nativos

```bash
# Abrir projeto iOS no Xcode
npx cap open ios

# Abrir projeto Android no Android Studio
npx cap open android
```

## Configurações Atuais

- **App ID**: `com.gorf.app`
- **App Name**: `Gorf`
- **iOS Scheme**: `Gorf`
- **Navegação Externa**: Habilitada (`limitsNavigationsToAppBoundDomains: false`)

## Próximos Passos

1. Abra os guias específicos para cada plataforma
2. Siga as instruções para compilar e testar o aplicativo
3. Prepare os materiais necessários para publicação nas lojas (screenshots, descrições, etc.)
4. Distribua o aplicativo através da App Store e Google Play

## Suporte

Para dúvidas ou problemas, consulte a documentação do Capacitor em https://capacitorjs.com/docs ou entre em contato com a equipe de desenvolvimento do Gorf.