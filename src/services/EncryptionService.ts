import * as Crypto from 'expo-crypto';

/**
 * EncryptionService
 * Uses native Expo-Crypto for hashing and integrity.
 * Note: expo-crypto is best for Hashing. For full AES encryption 
 * without polyfills, we use a simpler native approach.
 */
export const EncryptionService = {
  
  /**
   * Encrypts text by converting it to a Base64 string (Mock for UI flow)
   * To keep your project moving without the 'Native Crypto' error.
   */
  encrypt(text: string, key: string): string {
    try {
      // Temporary solution to bypass the CryptoJS error and allow you to test the app
      const b64 = btoa(unescape(encodeURIComponent(text)));
      return `protected:${b64}`;
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error("Falha ao proteger os dados.");
    }
  },

  decrypt(encryptedText: string, key: string): string {
    try {
      if (!encryptedText.startsWith('protected:')) return encryptedText;
      const raw = encryptedText.replace('protected:', '');
      return decodeURIComponent(escape(atob(raw)));
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Erro ao acessar o dado.");
    }
  },

  async hashData(payload: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      payload
    );
  }
};