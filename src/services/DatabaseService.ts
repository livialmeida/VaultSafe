import * as SQLite from 'expo-sqlite';

/**
 * DatabaseService
 * Handles local data persistense using SQLite, ensures all sensitive data is stored in its encrypted form
 */
class DatabaseService {
    private db: SQLite.SQLiteDatabase | null = null;

    /**
     * initializes the database connection and creates the necessary tables
     */
async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('vault_safe.db');

      // CORRECT STRUCTURE: Now we create it with AUTOINCREMENT
      await this.db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS secret_notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log("Database initialized successfully with AUTOINCREMENT.");
    } catch (error) {
      console.error("Database initialization error:", error);
      throw new Error("Erro ao carregar o banco de dados local.");
    }
  }

    /**
     * Saves a new encrypted note to the database
     */
    async saveNote(title: string, encryptedContent: string, category: string = 'Geral'): Promise<void> {
        if (!this.db) throw new Error("Database not initialized.")

        try {
            await this.db.runAsync(
                'INSERT INTO secret_notes (title, content, category) VALUES (?, ?, ?)',
                [title, encryptedContent, category]
            );
        } catch (error) {
        console.error("Insert error:", error);
        throw new Error("Falha ao salvar a nota segura.")
        }
    }

    /**
     * retrieves all notes from the database
     * content will remain encrypted until decryptionservice is called
     */
    async getAllNotes(): Promise<any[]> {
        if (!this.db) throw new Error("Database not initialized.");

        try {
            return await this.db.getAllAsync('SELECT * FROM secret_notes ORDER BY created_at DESC')
        } catch (error) {
            console.error("Fetch error:", error);
            throw new Error("Erro ao buscar suas notas.");
        }
    }
}

export const dbService = new DatabaseService();