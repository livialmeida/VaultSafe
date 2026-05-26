import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, ScrollView, TouchableOpacity, Image, AppState } from 'react-native';
import { dbService } from './src/services/DatabaseService';
import { EncryptionService } from './src/services/EncryptionService';
import { AuthService } from './src/services/AuthService';
import LogoImg from './assets/logo.png';

export default function App() {
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Security parameters for Brute Force Protection (Self-Destruct)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;
  
  // A temporary Master Key (In a real scenario, this would be derived from a PBKDF2 hash)
  const MASTER_KEY = "Livia_Secure_Key_2026";

  /**
   * Centralized Authentication Gatekeeper
   * Manages biometric verification, brute force tracking, and triggers database purge
   */
  const performSecureAuth = async (): Promise<boolean> => {
    try {
      const success = await AuthService.authenticate();

      if (success) {
        setFailedAttempts(0); // Reset tracking on successful authentication
        return true;
      } else {
        // Enforces atomic state update using functional state updates
        setFailedAttempts((prevCount) => {
          const newCount = prevCount + 1;

          if (newCount >= MAX_ATTEMPTS) {
            // Execution of the secure database purge and memory erasure
            dbService.deleteAllNotes()
              .then(() => {
                setSavedNotes([]);
                setNoteTitle('');
                setNoteContent('');
                setIsAuthenticated(false);
                Alert.alert(
                  "🚨 SEGURANÇA VIOLADA",
                  "O limite de tentativas foi excedido. Por medida de segurança jurídica e técnica, todos os dados do cofre foram apagados permanentemente.",
                  [{ text: "Entendido" }]
                );
              })
              .catch((err) => {
                Alert.alert("Erro Crítico", "Falha ao executar o protocolo de expurgo.");
              });
            return 0; // Resets the attack counter state
          } else {
            Alert.alert(
              "Acesso Negado", 
              `Tentativa ${newCount} de ${MAX_ATTEMPTS}. O cofre será limpo se atingir o limite.`
            );
          }
          return newCount;
        });
        return false;
      }
    } catch (error) {
      Alert.alert("Erro", "Falha na comunicação com o hardware de autenticação.");
      return false;
    }
  };

  // App initialization - Executes strictly once on mount
  useEffect(() => {
    const setup = async () => {
      try {
        await dbService.initialize();
        const success = await performSecureAuth();

        if (success) {
          setIsAuthenticated(true);
          loadNotes();
        }
      } catch (err: any) {
        Alert.alert("Erro", "Falha ao inicializar o ambiente seguro.");
      }
    };
    setup();
  }, []); // Empty dependency array prevents initialization loops

  // Background lock - re-locks the app when minimized (Security by Design)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadNotes = async () => {
    try {
      const notes = await dbService.getAllNotes();
      setSavedNotes(notes);
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle || !noteContent) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    } 

    try {
      // 1. Encrypt text payload before hitting database layer
      const encrypted = EncryptionService.encrypt(noteContent, MASTER_KEY);
      
      // 2. Persist in Database
      await dbService.saveNote(noteTitle, encrypted);
      
      Alert.alert("Sucesso", "Anotação protegida e salva!");
      setNoteTitle('');
      setNoteContent('');
      loadNotes();
    } catch (err: any) {
      Alert.alert("Erro", "Não foi possível salvar a nota com segurança.");
    }
  };

  const handleViewNote = async (encryptedText: string) => {
    // Requires authorization check before attempting decryption step
    const success = await performSecureAuth();

    if (success) {
      try {
        const decrypted = EncryptionService.decrypt(encryptedText, MASTER_KEY);
        
        Alert.alert(
          "Conteúdo Protegido", 
          decrypted,
          [{ text: "Fechar", onPress: () => {} }]
        );
      } catch (err: any) {
        Alert.alert("Erro", "Falha catastrófica ao processar decriptografia do registro.");
      }
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await dbService.deleteNote(id);
      loadNotes();
      Alert.alert("Sucesso", "Anotação removida com segurança!");
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    }
  };

  // Fullscreen Gatekeeper Interface
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Image source={LogoImg} style={styles.logoImg} resizeMode='contain' />
        <Text style={styles.authSubtitle}>Seu cofre digital seguro</Text>

        <TouchableOpacity
          style={styles.authButton}
          onPress={async () => {
            const success = await performSecureAuth();
            if (success) {
              setIsAuthenticated(true);
              loadNotes();
            }
          }}
        >
          <Text style={styles.authButtonText}>DESBLOQUEAR COFRE</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>Protegido por Biometria Nativa</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>VaultSafe</Text>
      
      <View style={styles.inputContainer}>
        <TextInput 
          placeholder="Título (ex: Senha do Banco)" 
          value={noteTitle} 
          onChangeText={setNoteTitle} 
          style={styles.input}
        />
        <TextInput 
          placeholder="Conteúdo sensível" 
          value={noteContent} 
          onChangeText={setNoteContent} 
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#95A5A6"
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveNote}>
          <Text style={styles.buttonText}>Salvar no Cofre</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.subHeader}>Notas Protegidas:</Text>
        {savedNotes.length === 0 ? (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: '#95A5A6', fontStyle: 'italic' }}>
              Seu cofre está vazio. Adicione uma nota acima.
            </Text>
          </View>
        ) : (
          savedNotes.map((note) => (
            <View key={note.id} style={styles.card}>
              {/* Wraps titles inside flexible box layout to guarantee element spacing alignment */}
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{note.title}</Text>
                <Text style={styles.cardContent}>Criptografado: ********</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#5D7B93' }]}
                  onPress={() => handleViewNote(note.content)}
                >
                  <Text style={styles.actionButtonText}>Ver</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#E74C3C' }]}
                  onPress={() => handleDeleteNote(note.id)}
                >
                  <Text style={styles.actionButtonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: '#5D7B93',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoImg: {
    width: 450,
    height: 350,
    marginBottom: 20,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#DCDFE1',
    marginBottom: 50,
  },
  authButton: {
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
  },
  authButtonText: {
    color: '#5D7B93',
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  footerText: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  container: { 
    padding: 25, 
    backgroundColor: '#F4F7F6', 
    flexGrow: 1, 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginTop: 35, 
    marginBottom: 20, 
    color: '#5D7B93', 
  },
  inputContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.1, 
    marginBottom: 30, 
  },
  input: { 
    borderBottomWidth: 1, 
    borderBottomColor: '#DCDFE1',
    marginBottom: 15, 
    padding: 10,
    fontSize: 16, 
  },
  primaryButton: {
    backgroundColor: '#5D7B93',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  subHeader: { 
    fontSize: 18,
    fontWeight: 'bold', 
    marginBottom: 15,
    color: '#34495E', 
  },
  card: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    elevation: 2, 
  },
  cardTitle: { 
    fontWeight: 'bold', 
    fontSize: 12,
    marginTop: 4,
  },
  cardContent: { 
    color: '#7F8C8D',
    fontSize: 12, 
    marginTop: 4, 
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContainer: { width: '100%' },
});