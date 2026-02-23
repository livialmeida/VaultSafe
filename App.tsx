import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Alert, ScrollView } from 'react-native';
import { dbService } from './src/services/DatabaseService';
import { EncryptionService } from './src/services/EncryptionService';
import { AuthService } from './src/services/AuthService';


export default function App() {
  
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  
  // A temporary Master Key (In a real scenario, this would be derived from a PBKDF2 hash)
  const MASTER_KEY = "Livia_Secure_Key_2026";

  useEffect(() => {
    const setup = async () => {
      try {
        await dbService.initialize();
        loadNotes();
      } catch (err: any) {
        Alert.alert("Erro", err.message);
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
    if (!noteTitle || !noteContent) return;

    try {
      // 1. Encrypt before saving
      const encrypted = EncryptionService.encrypt(noteContent, MASTER_KEY);
      
      // 2. Persist in Database
      await dbService.saveNote(noteTitle, encrypted);
      
      setNoteTitle('');
      setNoteContent('');
      loadNotes();
      Alert.alert("Sucesso", "Anotação protegida e salva!");
    } catch (err: any) {
      Alert.alert("Erro", err.message);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>VaultSafe</Text>
      
      <View style={styles.inputContainer}>
        <TextInput 
          placeholder="Título (ex: Banco Inter)" 
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
        />
        <Button title="Salvar no Cofre" onPress={handleSaveNote} color="#5D7B93" />
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.subHeader}>Notas Protegidas:</Text>
        {savedNotes.map((note) => (
          <View key={note.id} style={styles.card}>
            <Text style={styles.cardTitle}>{note.title}</Text>
            <Text style={styles.cardContent}>Conteúdo: ********</Text>
            <Button title="Ver Nota" onPress={() => handleViewNote(note.content)} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 40, backgroundColor: '#F4F7F6', flexGrow: 1 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#5D7B93' },
  subHeader: { fontSize: 18, marginBottom: 10 },
  inputContainer: { marginBottom: 30 },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 8 },
  listContainer: { width: '100%' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 3 },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  cardContent: { color: '#666', marginVertical: 5 }
});
