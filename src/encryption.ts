
import * as CryptoJS from 'crypto-js';
import dotenv from 'dotenv';
dotenv.config();

export function encryptData(data: string, key: string): string {
    // Encrypt the data using AES-256
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    return encrypted;
  }
  // Example usage
  
export function decryptData(encryptedData: string, key: string): string {
    // Decrypt the data using AES-256
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  }