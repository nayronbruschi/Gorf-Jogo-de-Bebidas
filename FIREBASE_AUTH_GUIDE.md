# Guia de Autenticação Firebase para o Gorf App

Este guia explica como configurar e utilizar a autenticação Firebase no aplicativo Gorf, com foco específico na integração com domínio personalizado.

## Configuração Inicial

### 1. Configurar Métodos de Autenticação

No Firebase Console:
1. Acesse **Authentication** > **Sign-in method**
2. Habilite os seguintes métodos:
   - Email/Senha
   - Google
   - Anônimo (opcional)

### 2. Configurar Domínios Autorizados

Para permitir autenticação a partir do domínio personalizado:
1. Acesse **Authentication** > **Settings** > **Authorized domains**
2. Adicione os domínios:
   - gorf.com.br
   - www.gorf.com.br
   - [domínio do ambiente de desenvolvimento, se aplicável]

## Configuração no Frontend

O arquivo `client/src/lib/firebase.ts` contém a inicialização do Firebase e configuração da autenticação:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Configuração do Firebase obtida das variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'gorf-jogo-de-bebidas.firebaseapp.com', // ou gorf.com.br para produção
  projectId: 'gorf-jogo-de-bebidas',
  storageBucket: 'gorf-jogo-de-bebidas.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ... rest of the authentication functions
```

## Hook de Autenticação

O arquivo `client/src/hooks/use-auth.ts` contém o hook personalizado que gerencia o estado de autenticação:

```typescript
import { useState, useEffect, createContext, useContext } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOutUser = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## Rotas Protegidas

As rotas protegidas são implementadas no arquivo `client/src/App.tsx`:

```typescript
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <Component /> : null;
}
```

## Configurando Variáveis de Ambiente

Crie um arquivo `.env.local` (para desenvolvimento) com as seguintes variáveis:

```
VITE_FIREBASE_API_KEY=seu-api-key
VITE_FIREBASE_AUTH_DOMAIN=gorf-jogo-de-bebidas.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gorf-jogo-de-bebidas
VITE_FIREBASE_STORAGE_BUCKET=gorf-jogo-de-bebidas.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-messaging-sender-id
VITE_FIREBASE_APP_ID=seu-app-id
VITE_FIREBASE_MEASUREMENT_ID=seu-measurement-id
```

Para produção, configure estas variáveis no ambiente de hospedagem.

## Personalização da UI de Autenticação

Para personalizar a interface de autenticação:

1. Modifique os componentes em `client/src/pages/login.tsx` e `client/src/pages/signup.tsx`
2. Estilize conforme o design do Gorf App (cores roxo, verde, branco e cinza)
3. Implemente validação de formulários com feedback visual

## Lidando com Erros de Autenticação

Implemente tratamento de erros para os seguintes casos:

1. Email já em uso
2. Credenciais inválidas
3. Usuário não encontrado
4. Senha fraca
5. Falha na conexão com o Firebase

## Persistência e Segurança

Para configurar a persistência da sessão:

```typescript
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

// No arquivo de inicialização do Firebase
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Erro ao configurar persistência:', error);
  });
```

## Testes de Autenticação

Para testar a autenticação:

1. Use contas de teste específicas para desenvolvimento
2. Simule os diferentes fluxos de autenticação
3. Verifique a persistência em diferentes navegadores e dispositivos
4. Teste a recuperação de senha

## Resolução de Problemas Comuns

### Erro: "domain-not-authorized"
- Verifique se o domínio está adicionado na lista de domínios autorizados no Firebase Console
- Certifique-se de que o domínio está configurado corretamente nos registros DNS

### Erro: "wrong-password" ou "user-not-found"
- Implemente mensagens de erro amigáveis para estes casos
- Ofereça opção de recuperação de senha

### Erro: "popup-closed-by-user"
- Isto ocorre quando o usuário fecha a janela de autenticação do Google
- Trate este caso graciosamente, oferecendo opção para tentar novamente