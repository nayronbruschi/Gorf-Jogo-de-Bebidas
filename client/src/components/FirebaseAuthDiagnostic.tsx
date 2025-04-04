import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

// Componente para diagnóstico de problemas de autenticação Firebase
export const FirebaseAuthDiagnostic: React.FC = () => {
  const [diagnosticInfo, setDiagnosticInfo] = useState<{
    initialized: boolean;
    authAvailable: boolean;
    currentUser: string | null;
    error: string | null;
    domain: string;
    firebaseConfig: any;
    timestamp: string;
  }>({
    initialized: false,
    authAvailable: false,
    currentUser: null,
    error: null,
    domain: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    firebaseConfig: {},
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    try {
      // Verificar se o Firebase foi inicializado corretamente
      const initialized = !!app;
      
      // Verificar se o Auth está disponível
      const auth = getAuth(app);
      const authAvailable = !!auth;
      
      // Obter a configuração do Firebase
      const firebaseConfig = app.options || {};
      
      // Verificar usuário atual
      const currentUser = auth.currentUser;
      const currentUserString = currentUser 
        ? `${currentUser.email} (${currentUser.uid})` 
        : null;
      
      // Atualizar o estado com todas as informações
      setDiagnosticInfo(prev => ({
        ...prev,
        initialized,
        authAvailable,
        currentUser: currentUserString,
        firebaseConfig
      }));
    } catch (error: any) {
      setDiagnosticInfo(prev => ({
        ...prev,
        error: `Erro na inicialização: ${error.message}`,
      }));
    }
  }, []);

  // Estilo para o componente
  const styles = {
    container: {
      margin: '20px',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      backgroundColor: '#f9f9f9',
      fontFamily: 'monospace',
      fontSize: '14px',
    },
    title: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#333',
    },
    section: {
      marginBottom: '15px',
    },
    label: {
      fontWeight: 'bold',
      color: '#555',
    },
    value: {
      marginLeft: '10px',
      wordBreak: 'break-word' as const,
    },
    status: (ok: boolean) => ({
      padding: '3px 6px',
      borderRadius: '3px',
      backgroundColor: ok ? '#d4edda' : '#f8d7da',
      color: ok ? '#155724' : '#721c24',
      display: 'inline-block',
    }),
    pre: {
      background: '#eee',
      padding: '10px',
      borderRadius: '4px',
      overflowX: 'auto' as const,
    },
    error: {
      color: '#dc3545',
      fontWeight: 'bold',
    },
    button: {
      backgroundColor: '#6930c3',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      marginTop: '10px',
      fontWeight: 'bold',
    }
  };

  const handleCopyInfo = () => {
    const infoText = JSON.stringify(diagnosticInfo, null, 2);
    navigator.clipboard.writeText(infoText)
      .then(() => alert('Informações de diagnóstico copiadas para a área de transferência!'))
      .catch(err => alert(`Erro ao copiar: ${err.message}`));
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        Diagnóstico de Autenticação Firebase
        <span style={{ fontSize: '12px', color: '#777', display: 'block' }}>
          Versão 1.0.0 - {new Date().toLocaleString()}
        </span>
      </div>

      <div style={styles.section}>
        <span style={styles.label}>Domínio:</span>
        <span style={styles.value}>{diagnosticInfo.domain}</span>
      </div>

      <div style={styles.section}>
        <span style={styles.label}>Firebase inicializado:</span>
        <span style={styles.status(diagnosticInfo.initialized)}>
          {diagnosticInfo.initialized ? 'Sim' : 'Não'}
        </span>
      </div>

      <div style={styles.section}>
        <span style={styles.label}>Auth disponível:</span>
        <span style={styles.status(diagnosticInfo.authAvailable)}>
          {diagnosticInfo.authAvailable ? 'Sim' : 'Não'}
        </span>
      </div>

      <div style={styles.section}>
        <span style={styles.label}>Usuário atual:</span>
        <span style={styles.value}>
          {diagnosticInfo.currentUser || 'Nenhum usuário conectado'}
        </span>
      </div>

      {diagnosticInfo.error && (
        <div style={styles.section}>
          <span style={styles.label}>Erro:</span>
          <div style={styles.error}>{diagnosticInfo.error}</div>
        </div>
      )}

      <div style={styles.section}>
        <span style={styles.label}>Configuração Firebase:</span>
        <pre style={styles.pre}>
          {JSON.stringify(diagnosticInfo.firebaseConfig, null, 2)}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button onClick={handleCopyInfo} style={styles.button}>
          Copiar Diagnóstico
        </button>
        <button 
          onClick={() => {
            const url = window.location.origin;
            window.open(`/auth`, '_blank');
          }} 
          style={{...styles.button, backgroundColor: '#28a745'}}
        >
          Testar Auth em Nova Janela
        </button>
      </div>
    </div>
  );
};

export default FirebaseAuthDiagnostic;