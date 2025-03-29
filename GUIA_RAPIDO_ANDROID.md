# Guia Rápido para Configuração Android e Publicação na Play Store

Este guia irá ajudá-lo a configurar seu projeto Android e prepará-lo para envio à Google Play Store.

## 1. Preparação do Ambiente Android

Certifique-se de ter os seguintes pré-requisitos instalados:

- [Android Studio](https://developer.android.com/studio)
- [JDK 11](https://adoptopenjdk.net/) ou superior
- Node.js e NPM (que você já deve ter)

## 2. Sincronização e Abertura do Projeto Android

```bash
# Atualiza seus arquivos web e sincroniza com o projeto Android
npx cap sync android

# Abre o projeto no Android Studio
npx cap open android
```

## 3. Configuração do Pacote (Package Name)

O nome do pacote é o identificador único do seu aplicativo na Google Play Store.

1. No Android Studio, expanda a estrutura do projeto no painel esquerdo
2. Localize o arquivo `build.gradle` dentro do módulo `app`
3. Procure a linha `applicationId "com.exemplo.app"`
4. Altere para um identificador único, por exemplo: `com.seunome.gorf`
5. Clique em "Sync Now" quando solicitado

## 4. Configuração da Versão

No mesmo arquivo `build.gradle`:

1. Encontre as propriedades `versionCode` e `versionName`
2. Defina `versionCode` como `1` (número inteiro que deve ser incrementado a cada atualização)
3. Defina `versionName` como `"1.0"` (versão visível para os usuários)

## 5. Configuração dos Ícones do Aplicativo

Os ícones do Android são organizados em diferentes densidades de tela:

1. No painel esquerdo, navegue até `app/src/main/res`
2. Encontre as pastas `mipmap-*dpi` que contêm os ícones do aplicativo
3. Os scripts automatizados já devem ter colocado os ícones nos locais corretos

## 6. Configurações do Manifesto

Abra o arquivo `AndroidManifest.xml` em `app/src/main`:

1. Verifique se as permissões necessárias estão presentes (por exemplo, `INTERNET`)
2. Verifique se `android:label` está configurado com o nome correto do aplicativo
3. Certifique-se de que o atributo `android:theme` esteja referenciando o tema correto

## 7. Criação de uma APK de Teste

Para testar seu aplicativo:

1. No menu do Android Studio, vá para `Build > Build Bundle(s) / APK(s) > Build APK(s)`
2. Aguarde a compilação ser concluída
3. Clique em "locate" no popup para encontrar o arquivo APK
4. Instale este arquivo em um dispositivo Android para testes

## 8. Preparação para a Play Store

Para criar uma versão de lançamento:

1. No menu, vá para `Build > Generate Signed Bundle / APK`
2. Selecione "Android App Bundle" ou "APK" (recomendado App Bundle)
3. Configure uma chave de assinatura:
   - Se você não tiver uma, clique em "Create new"
   - Preencha os campos necessários e guarde sua senha em local seguro
4. Selecione a variante de build "release"
5. Clique em "Finish" e aguarde a criação do arquivo

## 9. Recursos Necessários para Submissão

Antes de enviar para a Play Store, prepare:

1. Um ícone de alta resolução (512x512px)
2. Um gráfico de recurso (Feature Graphic - 1024x500px)
3. Pelo menos 2 screenshots de cada tipo de dispositivo
4. Uma descrição detalhada do aplicativo
5. Uma lista de recursos-chave
6. Política de privacidade (URL)

## 10. Conta de Desenvolvedor e Submissão

1. Crie uma conta de desenvolvedor da Google Play ($25 taxa única)
   - [Google Play Console](https://play.google.com/console/about/)
2. Após o login, clique em "Create app"
3. Siga o processo de submissão:
   - Preencha todas as informações da ficha do aplicativo
   - Faça upload do AAB/APK gerado
   - Adicione gráficos e capturas de tela
   - Configure preço e disponibilidade
   - Preencha o questionário de classificação de conteúdo
   - Faça a revisão e publique

## Dicas para Aprovação Rápida

1. Teste minuciosamente antes de enviar
2. Forneça todos os recursos gráficos com alta qualidade
3. Escreva descrições claras e precisas
4. Tenha uma política de privacidade válida
5. Cumpra todas as diretrizes do Google para desenvolvedores

## Recursos Adicionais

- [Guia de publicação da Google Play](https://developer.android.com/studio/publish)
- [Diretrizes para desenvolvedores do Google Play](https://play.google.com/about/developer-content-policy/)
- [Documentação do Capacitor para Android](https://capacitorjs.com/docs/android)