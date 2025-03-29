# Gorf - Guia para Publicação Mobile

Bem-vindo ao guia completo para publicação do aplicativo Gorf nas lojas de aplicativos iOS (App Store) e Android (Google Play Store). Este documento fornece instruções para preparar, configurar e enviar seu aplicativo para ambas as plataformas.

## Visão Geral

Este projeto utiliza o [Capacitor](https://capacitorjs.com/) para transformar o aplicativo web Gorf em aplicativos nativos para iOS e Android. O aplicativo foi configurado para acessar a versão hospedada em https://gorf-jogo-de-bebidas.replit.app/.

## Pré-requisitos

- **Para iOS:**
  - Um Mac com macOS (obrigatório para desenvolvimento iOS)
  - Xcode 12 ou superior
  - Uma conta Apple ID (uma conta de desenvolvedor Apple para publicação na App Store)

- **Para Android:**
  - Android Studio
  - JDK 11 ou superior
  - Uma conta de desenvolvedor Google Play (para publicação)

## Configuração do Projeto

### Para ambas as plataformas:

1. Certifique-se de que o Node.js e npm estão instalados
2. Clone este repositório
3. Instale as dependências:

```bash
npm install
```

### Preparação dos ícones do aplicativo

O projeto inclui um script para gerar todos os ícones necessários a partir de uma única imagem:

```bash
# Instalar dependência ImageMagick (se necessário)
# No macOS: brew install imagemagick
# No Ubuntu/Debian: sudo apt-get install imagemagick

# Executar o script que gera ícones para iOS e Android
node prepare_icons.js
```

## Guias Detalhados por Plataforma

### iOS (App Store)

Para configurar e publicar seu aplicativo na App Store:

1. Execute os seguintes comandos para atualizar e abrir o projeto iOS:

```bash
npx cap sync ios
npx cap open ios
```

2. Siga as instruções detalhadas no arquivo [GUIA_VISUAL_XCODE.md](./GUIA_VISUAL_XCODE.md), que inclui:
   - Configuração do bundle identifier
   - Adição da sua conta de desenvolvedor Apple
   - Configuração de ícones e recursos
   - Criação de um arquivo para distribuição

3. Use o arquivo [app_store_metadata.md](./app_store_metadata.md) como modelo para preencher as informações necessárias na App Store Connect.

### Android (Google Play Store)

Para configurar e publicar seu aplicativo na Google Play Store:

1. Execute os seguintes comandos para atualizar e abrir o projeto Android:

```bash
npx cap sync android
npx cap open android
```

2. Siga as instruções detalhadas no arquivo [GUIA_RAPIDO_ANDROID.md](./GUIA_RAPIDO_ANDROID.md), que inclui:
   - Configuração do nome do pacote (package name)
   - Configuração da versão do aplicativo
   - Geração de uma APK ou App Bundle assinado

3. Use o arquivo [play_store_metadata.md](./play_store_metadata.md) como modelo para preencher as informações necessárias no Google Play Console.

## Política de Privacidade

Uma política de privacidade é obrigatória para ambas as lojas. Este projeto inclui um modelo em [politica_privacidade.html](./politica_privacidade.html) que você pode personalizar e hospedar na web.

## Recursos Adicionais

- **Capacitor:** [Documentação oficial](https://capacitorjs.com/docs)
- **Apple Developer:** [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Google Play:** [Developer Policy Center](https://play.google.com/about/developer-content-policy/)

## Solução de Problemas Comuns

### iOS

- **Erro de certificado:** Verifique se sua conta de desenvolvedor está ativa e se o certificado está configurado corretamente no Xcode.
- **Rejeição por conteúdo alcoólico:** Certifique-se de definir a classificação etária correta (17+) e incluir na descrição que o aplicativo contém referências a álcool.

### Android

- **Erro de assinatura:** Verifique se você está usando a chave de assinatura correta ao gerar o APK/AAB.
- **Erro de permissões:** Certifique-se de que o arquivo AndroidManifest.xml contém apenas as permissões necessárias para o funcionamento do aplicativo.

## Próximos Passos Sugeridos

1. Teste o aplicativo em vários dispositivos antes de enviar para as lojas
2. Prepare capturas de tela de alta qualidade para a ficha do aplicativo
3. Considere implementar atualizações regulares para manter o aplicativo relevante

## Suporte

Se encontrar problemas com este guia ou com o processo de publicação, entre em contato com [seu-email@exemplo.com].