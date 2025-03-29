# Instruções para o Gorf App

Este documento fornece instruções detalhadas sobre como trabalhar com o Gorf App, incluindo como atualizar o código, publicar novas versões e solucionar problemas comuns.

## Estrutura do Projeto

O Gorf foi construído como um aplicativo web e adaptado para plataformas móveis usando Capacitor. A estrutura básica é:

- **Aplicativo Web:** Hospedado em https://gorf-jogo-de-bebidas.replit.app/
- **Aplicativo iOS:** Wrapper nativo que carrega o aplicativo web hospedado
- **Aplicativo Android:** Wrapper nativo que carrega o aplicativo web hospedado

## Fluxo de Trabalho para Atualizações

Quando precisar atualizar o aplicativo, siga este fluxo de trabalho:

1. **Atualize o aplicativo web**: Faça todas as alterações necessárias na versão da web e teste-as
2. **Atualize os aplicativos móveis**: Sincronize as alterações com as plataformas nativas:

```bash
# Atualize a versão do aplicativo em capacitor.config.ts (se necessário)
# Sincronize as alterações
npx cap sync
```

3. **Teste em dispositivos reais ou emuladores**:

```bash
# Para iOS
npx cap open ios
# Para Android
npx cap open android
```

4. **Envie as atualizações para as lojas**

## Gestão de Versões

Quando lançar uma nova versão, atualize os seguintes arquivos:

1. **capacitor.config.ts**: Atualize a propriedade `version`
2. **Xcode**: Atualize `Version` e `Build` nas configurações do projeto iOS
3. **Android Studio**: Atualize `versionCode` e `versionName` no arquivo `build.gradle`

## Componentes Principais

### 1. Redirecionamento Web

O aplicativo móvel redireciona para a versão web hospedada. Isso é configurado em:

- **iOS**: Arquivo `index.html` na pasta `ios/App/App/public`
- **Android**: Arquivo `index.html` na pasta `android/app/src/main/assets/public`

Se precisar alterar a URL de destino, edite esses arquivos.

### 2. Permissões de Rede

Para garantir que o aplicativo possa acessar a internet:

- **iOS**: Configurado em `Info.plist`
- **Android**: Configurado em `AndroidManifest.xml`

## Hospedagem e Domínio

O aplicativo web está hospedado em:
- **URL**: https://gorf-jogo-de-bebidas.replit.app/

Se este domínio mudar:
1. Atualize os arquivos `index.html` em ambas as plataformas
2. Construa novas versões dos aplicativos
3. Envie as atualizações para as lojas

## Recursos

### Ícones do Aplicativo

Os ícones são criados automaticamente usando o script `prepare_icons.js`. Se você quiser atualizar o ícone do aplicativo:

1. Substitua o arquivo `attached_assets/LOGOGORF.png` por sua nova imagem (mantenha o mesmo nome)
2. Execute o script para gerar novos ícones:

```bash
node prepare_icons.js
```

3. Sincronize com as plataformas nativas:

```bash
npx cap sync
```

### Splash Screen (Tela Inicial)

Para personalizar a tela inicial:

1. Crie imagens para diferentes tamanhos de tela (consulte a documentação do Capacitor)
2. Substitua os arquivos de splash screen nas respectivas pastas de plataforma

## Solução de Problemas

### Problemas de Conexão

Se o aplicativo não carregar a versão web:

1. Verifique se a URL no arquivo `index.html` está correta
2. Verifique se o site está acessível publicamente
3. Confirme que as permissões de rede estão configuradas corretamente

### Problemas de Build iOS

Se encontrar problemas ao construir o projeto iOS:

1. Verifique se o Xcode está atualizado
2. Limpe o projeto (Product > Clean Build Folder)
3. Verifique os certificados e perfis de provisionamento

### Problemas de Build Android

Se encontrar problemas ao construir o projeto Android:

1. Verifique se o Android Studio está atualizado
2. Execute "Sync Project with Gradle Files"
3. Verifique a configuração do JDK

## Processo de Atualização nas Lojas

### App Store (iOS)

1. Abra o projeto no Xcode
2. Atualize a versão e o número de build
3. Archive o projeto (Product > Archive)
4. Submeta através do Xcode Organizer

### Google Play (Android)

1. Abra o projeto no Android Studio
2. Atualize versionCode e versionName
3. Gere um APK ou App Bundle assinado
4. Faça login no Google Play Console e envie a nova versão

## Recursos Adicionais

- [Documentação do Capacitor](https://capacitorjs.com/docs)
- [README-MOBILE.md](./README-MOBILE.md) - Guia para publicação nas lojas
- [GUIA_VISUAL_XCODE.md](./GUIA_VISUAL_XCODE.md) - Guia visual do Xcode
- [GUIA_RAPIDO_ANDROID.md](./GUIA_RAPIDO_ANDROID.md) - Guia rápido para Android