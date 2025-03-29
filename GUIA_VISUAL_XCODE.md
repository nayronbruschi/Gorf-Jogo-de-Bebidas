# Guia Visual para Configuração do Xcode

Este guia contém instruções passo a passo com imagens para configurar seu projeto no Xcode para envio à App Store.

## 1. Abrir o Projeto no Xcode

Após executar `npx cap sync ios` no terminal, você pode abrir o projeto Xcode de duas maneiras:

- Usando o terminal: `npx cap open ios`
- Navegando manualmente até a pasta `ios/App/App.xcworkspace` e abrindo esse arquivo

![Abrir o Projeto](attached_assets/image_1743220869300.png)

## 2. Configuração do Bundle Identifier

O Bundle Identifier é como a Apple identifica seu aplicativo. Ele deve ser único no ecossistema da Apple.

1. No Xcode, clique no projeto "App" na barra lateral esquerda
2. Selecione "App" em TARGETS
3. Na aba "General", encontre "Bundle Identifier"
4. Altere para algo único, por exemplo: `com.seunome.gorf`

![Bundle Identifier](attached_assets/image_1743221166662.png)

## 3. Configuração da Conta de Desenvolvedor

1. Ainda na aba "Signing & Capabilities", clique em "Team"
2. Selecione sua Apple ID ou adicione uma nova conta

Se você ainda não tem uma conta de desenvolvedor Apple:
- Você pode usar sua Apple ID pessoal para testes
- Para publicar na App Store, precisará se inscrever no [Apple Developer Program](https://developer.apple.com/programs/) (taxa anual de $99)

## 4. Configuração de Ícones

1. Selecione "Assets.xcassets" na barra lateral
2. Você verá "AppIcon" - aqui é onde os ícones devem ser adicionados
3. Arraste os ícones gerados da pasta `ios-assets/AppIcon` para os espaços correspondentes

![Configuração de Ícones](attached_assets/image_1743224319049.png)

## 5. Configuração de Capabilities

1. Na aba "Signing & Capabilities", clique em "+ Capability"
2. Adicione "App Groups" se seu aplicativo precisar compartilhar dados com extensões
3. Adicione "Push Notifications" se você quiser enviar notificações push

## 6. Configuração de URL Schemes (opcional)

Se você quiser permitir que seu aplicativo seja aberto por outros aplicativos:

1. Vá para a aba "Info"
2. Expanda "URL Types"
3. Clique no botão "+"
4. Adicione um identificador e um URL Scheme (por exemplo: "gorf")

## 7. Definir Versão e Build

1. Na aba "General", encontre "Version" e "Build"
2. Defina a versão como "1.0.0" (ou a versão atual do seu aplicativo)
3. Defina o build como "1" (e incremente a cada envio para a App Store)

## 8. Teste seu Aplicativo

Antes de enviar para a App Store:

1. Selecione um dispositivo iOS no menu suspenso superior
2. Clique no botão "Play" (triângulo) para executar o aplicativo no dispositivo ou simulador
3. Teste todas as funcionalidades do seu aplicativo

## 9. Arquivamento e Envio

Quando estiver pronto para enviar:

1. Selecione "Generic iOS Device" no menu suspenso superior
2. Vá para "Product" > "Archive"
3. Quando o arquivo estiver pronto, clique em "Distribute App"
4. Siga as instruções do assistente de envio

## Solução de Problemas Comuns

### Erro "No code signing identities found"

1. Vá para Xcode > Preferences > Accounts
2. Selecione sua Apple ID
3. Clique em "Manage Certificates"
4. Clique no "+" e adicione um novo certificado de desenvolvedor

### Erro "App Transport Security has blocked a cleartext HTTP"

Você precisa configurar exceções de segurança no Info.plist:

1. Abra Info.plist
2. Adicione a chave `NSAppTransportSecurity` como um Dictionary
3. Dentro dele, adicione `NSAllowsArbitraryLoads` como Boolean e defina como YES

## Recursos Adicionais

- [Documentação oficial da Apple para envio de apps](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases)
- [Guia do Capacitor para iOS](https://capacitorjs.com/docs/ios)