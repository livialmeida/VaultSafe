import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { dbService } from './src/services/DatabaseService';
import { EncryptionService } from './src/services/EncryptionService';
import { AuthService } from './src/services/AuthService';


export default function App() {
  
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // A temporary Master Key (In a real scenario, this would be derived from a PBKDF2 hash)
  const MASTER_KEY = "Livia_Secure_Key_2026";

  // app initialization
  useEffect(() => {
    const setup = async () => {
      try {
        await dbService.initialize();
        const sucess = await AuthService.authenticate();

        if (sucess) {
          setIsAuthenticated(true);
          loadNotes();
        } else {
          Alert.alert(
            "Acesso Negado!",
            "Autenticação necessária para abrir o cofre.",
            [{ text: "Tente novamente", onPress: () => setup() }]
          );
        }
      } catch (err: any) {
        Alert.alert("Erro", "Falha ao inicializar o ambiente seguro.");
      }
    };
    setup();
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
      Alert.alert("Atenção", "Por favor, preencha todos os campos.")
      return;
    } 

    try {
      // 1. Encrypt before saving
      const encrypted = EncryptionService.encrypt(noteContent, MASTER_KEY);
      
      // 2. Persist/save in Database
      await dbService.saveNote(noteTitle, encrypted);
      
      // feedback and cleanup
      Alert.alert("Sucesso", "Anotação protegida e salva!");
      setNoteTitle('');
      setNoteContent('');
      loadNotes();
    } catch (err: any) {
      Alert.alert("Erro", "Não foi possível salvar a nota com segurança.");
    }
  };

  const handleViewNote = async (encryptedText: string) => {
    // 3. Authenticate User (Gatekeeper)
    const isAuthenticated = await AuthService.authenticate();

    if (isAuthenticated) {
      try {
        // 4. Decrypt only after successful Biometry
        const decrypted = EncryptionService.decrypt(encryptedText, MASTER_KEY);
        Alert.alert("Conteúdo Decriptografado", decrypted);
      } catch (err: any) {
        Alert.alert("Erro", err.message);
      }
    } else {
      Alert.alert("Acesso Negado", "Biometria não reconhecida.");
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      // call the database service to remove the record
      await dbService.deleteNote(id);

      // refresh the notes list from the database
      loadNotes();

      Alert.alert("Sucesso", "Anotação removida com segurança!")
    } catch (err: any) {
      Alert.alert("Erro", err.message)
    }
  };

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
          secureTextEntry // UX: Hide characters while typing
          style={styles.input}
          placeholderTextColor="#95A5A6"
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveNote}>
          <Text style={styles.buttonText}>Salvar no Cofre</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.subHeader}>Notas Protegidas:</Text>
        {/* condiitional rendering: if there are no notes, show a feedback message,
        otherwise, map through the saved notes */}
        {savedNotes.length === 0 ? (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: '#95A5A6', fontStyle: 'italic' }}>
              Seu cofre está vazio. Adicione uma nota acima.
            </Text>
          </View>
        ) : (
          savedNotes.map((note) => (
            <View key={note.id} style={styles.card}>
              <Text style={styles.cardTitle}>{note.title}</Text>
              <Text style={styles.cardContent}>Criptografado: ********</Text>
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
  container: { 
    padding: 25, 
    backgroundColor: '#F4F7F6', 
    flexGrow: 1, 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
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
