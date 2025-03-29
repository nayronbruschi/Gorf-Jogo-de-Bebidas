# Instruções para Compilação e Distribuição do App Gorf

## Visão Geral
Este documento contém instruções detalhadas sobre como compilar e distribuir o aplicativo Gorf para plataformas iOS e Android. O app Gorf utiliza o framework Capacitor para empacotar um aplicativo web em um aplicativo nativo.

## Pré-requisitos
- Xcode instalado (para iOS)
- Android Studio instalado (para Android)
- Node.js e npm instalados
- Conta de desenvolvedor Apple (para distribuição iOS)
- Conta de desenvolvedor Google Play (para distribuição Android)

## Estrutura do Projeto
O projeto consiste em:
- Aplicação web React/Vite que redireciona para o site online Gorf
- Configuração Capacitor para iOS e Android
- Recursos de interface personalizados

## 1. Compilação para iOS

### 1.1 Abrir o projeto no Xcode
```bash
# No diretório raiz do projeto
npx cap open ios
```

Isso abrirá o projeto iOS no Xcode.

### 1.2 Configurações do Projeto no Xcode
1. Clique no projeto "App" no navegador de projetos.
2. Na guia "Signing & Capabilities", selecione sua equipe de desenvolvimento.
3. Personalize o Bundle ID se necessário (atualmente configurado como `com.gorf.app`).
4. Certifique-se de que o alvo é "App" e não "App Clip" ao fazer alterações.

### 1.3 Compilação e Teste
1. Selecione um dispositivo ou simulador para testar.
2. Clique no botão de reprodução para compilar e executar o aplicativo.
3. Verifique se o redirecionamento para o site Gorf funciona corretamente.

### 1.4 Preparação para Distribuição
1. No Xcode, vá para Product > Archive.
2. Siga as instruções para validar e distribuir o aplicativo.
3. Escolha "App Store Connect" para distribuir na App Store.
4. Siga os prompts para concluir o upload.

### 1.5 Configuração na App Store Connect
1. Faça login na [App Store Connect](https://appstoreconnect.apple.com/).
2. Crie uma nova entrada de aplicativo ou selecione a existente.
3. Preencha todas as informações necessárias (descrição, screenshots, etc).
4. Submeta o aplicativo para revisão.

## 2. Compilação para Android

### 2.1 Abrir o projeto no Android Studio
```bash
# No diretório raiz do projeto
npx cap open android
```

Isso abrirá o projeto Android no Android Studio.

### 2.2 Configurações do Projeto no Android Studio
1. Abra o arquivo `build.gradle` do módulo do aplicativo.
2. Verifique se as versões mínima, alvo e de compilação do SDK estão definidas corretamente.
3. Verifique se o nome do pacote (applicationId) corresponde a `com.gorf.app`.

### 2.3 Compilação e Teste
1. Selecione um dispositivo ou emulador para testar.
2. Clique no botão de reprodução para compilar e executar o aplicativo.
3. Verifique se o redirecionamento para o site Gorf funciona corretamente.

### 2.4 Geração do APK/Bundle para Distribuição
1. No Android Studio, vá para Build > Generate Signed Bundle/APK.
2. Escolha APK ou Android App Bundle (recomendado para a Play Store).
3. Crie ou use uma chave de assinatura existente.
4. Selecione o tipo de versão (geralmente "release").
5. Aguarde a compilação ser concluída.

### 2.5 Distribuição na Google Play Store
1. Faça login no [Google Play Console](https://play.google.com/console/).
2. Crie um novo aplicativo ou selecione o existente.
3. Preencha todas as informações necessárias (descrição, screenshots, etc).
4. Faça upload do APK ou Bundle gerado.
5. Submeta o aplicativo para revisão.

## 3. Atualizações do Aplicativo

### 3.1 Atualização do Conteúdo Web
1. Modifique o arquivo `dist/index.html` conforme necessário.
2. Execute `npx cap copy` para copiar as alterações para as plataformas nativas.
3. Execute `npx cap sync` para sincronizar as configurações.

### 3.2 Atualização da Configuração do Capacitor
1. Modifique o arquivo `capacitor.config.ts` conforme necessário.
2. Execute `npx cap copy` para copiar as alterações.
3. Execute `npx cap sync` para sincronizar as configurações.

### 3.3 Distribuição de Atualizações
Siga as mesmas etapas descritas nas seções 1.4-1.5 (iOS) e 2.4-2.5 (Android) para distribuir versões atualizadas.

## 4. Solução de Problemas Comuns

### 4.1 Problemas de Compilação
- **Erro de Assinatura no Xcode**: Verifique se a equipe de desenvolvimento está selecionada corretamente.
- **Erro de Versão no Android**: Certifique-se de que a versionCode foi incrementada para cada nova versão.

### 4.2 Problemas de Redirecionamento
- Verifique se as permissões de internet estão configuradas em ambas as plataformas.
- Certifique-se de que `limitsNavigationsToAppBoundDomains` está definido como `false` para iOS.
- Verifique se `android:usesCleartextTraffic="true"` está definido no arquivo AndroidManifest.xml.

### 4.3 Outros Problemas
- Para problemas específicos, consulte a [documentação do Capacitor](https://capacitorjs.com/docs).
- Para problemas com a distribuição na App Store, consulte as [diretrizes da App Store](https://developer.apple.com/app-store/review/guidelines/).
- Para problemas com a distribuição na Play Store, consulte as [políticas do desenvolvedor do Google Play](https://play.google.com/about/developer-content-policy/).

## 5. Recursos Adicionais
- [Documentação do Capacitor](https://capacitorjs.com/docs)
- [Guia de submissão na App Store](https://developer.apple.com/app-store/submissions/)
- [Guia de publicação na Google Play](https://developer.android.com/studio/publish)