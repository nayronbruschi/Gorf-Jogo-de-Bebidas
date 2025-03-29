# Guia Rápido: Configuração do App Gorf no Android Studio

Este guia apresenta os passos básicos para configurar e compilar o aplicativo Gorf para Android usando o Android Studio.

## 1. Abrir o Projeto no Android Studio

```bash
npx cap open android
```

Este comando abrirá o projeto Android no Android Studio automaticamente.

## 2. Estrutura do Projeto Android

Os arquivos principais do projeto Android estão organizados da seguinte forma:

- `android/app/src/main/` - Diretório principal do código-fonte
  - `java/com/gorf/app/` - Código Java/Kotlin do aplicativo
  - `res/` - Recursos (layouts, strings, ícones, etc.)
  - `AndroidManifest.xml` - Manifesto do aplicativo
  - `assets/` - Recursos web e configurações do Capacitor

## 3. Verificar Configurações do Manifesto

O arquivo `AndroidManifest.xml` já contém a configuração necessária para o funcionamento do aplicativo, incluindo:

- Permissão de internet: `<uses-permission android:name="android.permission.INTERNET" />`
- Configuração para tráfego HTTP: `android:usesCleartextTraffic="true"`

## 4. Personalizações Realizadas

- **Ícone do Aplicativo**: O ícone personalizado do Gorf foi adicionado aos diretórios de recursos `mipmap-*`.
- **Nome do Aplicativo**: Definido como "Gorf" no arquivo `strings.xml`.
- **ID do Pacote**: Configurado como `com.gorf.app` em vários arquivos.

## 5. Compilação e Teste

1. **Sincronizar Gradle**:
   - Clique em "Sync Project with Gradle Files" na barra de ferramentas

2. **Executar o Aplicativo**:
   - Selecione um dispositivo no seletor de destino na parte superior
   - Clique no botão "Run" (ícone de play) para compilar e executar

3. **Verificar Funcionalidade**:
   - O aplicativo deve abrir e redirecionar automaticamente para o site do Gorf
   - Teste a navegação e funcionalidades principais

## 6. Gerando APK para Distribuição

1. **Menu Build > Generate Signed Bundle/APK**
2. **Escolha "APK"**
3. **Crie ou use uma keystore existente**
4. **Selecione a variante "release"**
5. **Clique em "Finish"**

O APK gerado estará disponível no diretório `android/app/build/outputs/apk/release/`.

## 7. Solução de Problemas Comuns

- **Erro de Gradle**: Execute "Sync Project with Gradle Files"
- **Erro de SDK**: Verifique se todas as ferramentas do SDK Android estão instaladas
- **Problemas de Redirecionamento**: Verifique as configurações de internet no AndroidManifest.xml

## 8. Próximos Passos

Após a compilação bem-sucedida, siga as instruções detalhadas no arquivo `INSTRUCOES_GORF_APP.md` para distribuir seu aplicativo na Google Play Store.