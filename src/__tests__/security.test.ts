import { describe, it, expect } from 'vitest';
import { encryptData, decryptData, hashPassword, ADMIN_PASSWORD_HASH } from '../utils/security';

describe('Security Utils', () => {
  it('should encrypt and decrypt an object correctly', () => {
    const testData = { name: 'TestUser', gems: 100, isAdmin: true };
    const encrypted = encryptData(testData);
    
    // Ensure it's not plainly visible
    expect(encrypted).not.toContain('TestUser');
    expect(encrypted).not.toBeNull();
    
    const decrypted = decryptData(encrypted);
    expect(decrypted).toEqual(testData);
  });

  it('should return null when decrypting tampered data', () => {
    const testData = { name: 'TestUser', gems: 100 };
    let encrypted = encryptData(testData);
    
    // Tamper with the data (change a character in base64 string)
    encrypted = encrypted.substring(0, encrypted.length - 1) + 'a';
    
    // Our decryptData catches errors and returns null
    const decrypted = decryptData(encrypted);
    
    // Since it uses XOR, changing a bit might just flip a bit in JSON causing a parse error,
    // which results in null.
    expect(decrypted).toBeNull();
  });

  it('should hash a password consistently', async () => {
    const hash = await hashPassword('lingoquest');
    expect(hash).toBe(ADMIN_PASSWORD_HASH);
  });
});
