const SECRET_KEY = "LingoQuest!2026_SecuR1tY#";

/**
 * Basic XOR encryption to obfuscate local storage data.
 * This is not cryptographically secure, but it prevents casual
 * tampering by normal users through the browser DevTools.
 */
const xorCipher = (text: string, key: string): string => {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

/**
 * Encrypts an object/string to a Base64 obfuscated string
 */
export const encryptData = (data: any): string => {
  try {
    const jsonString = typeof data === "string" ? data : JSON.stringify(data);
    const xorStr = xorCipher(jsonString, SECRET_KEY);
    // Base64 encode using browser btoa
    // Using encodeURIComponent to handle unicode characters in base64
    return btoa(encodeURIComponent(xorStr));
  } catch (error) {
    console.error("Encryption error:", error);
    return "";
  }
};

/**
 * Decrypts a Base64 obfuscated string back to its original form
 */
export const decryptData = (encryptedText: string): any => {
  try {
    if (!encryptedText) return null;
    const decodedUri = decodeURIComponent(atob(encryptedText));
    const jsonString = xorCipher(decodedUri, SECRET_KEY);
    return JSON.parse(jsonString);
  } catch (error) {
    // If decryption fails (e.g. data was tampered with, or it's old unencrypted data)
    console.warn("Decryption error. Data might be tampered or old format:", error);
    return null;
  }
};

/**
 * Simple hashing function (SHA-256 equivalent for frontend)
 * Used to avoid storing the admin password in plain text.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  if (crypto && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  
  // Fallback for very old browsers (basic insecure hash if crypto API is missing)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

// For reference, the hash of "lingoquest" using SHA-256:
// 01f8f88f9aa122017d0ee7fccb3d912dc459efc5cfbe4574d1acf616f8114cef
export const ADMIN_PASSWORD_HASH = "01f8f88f9aa122017d0ee7fccb3d912dc459efc5cfbe4574d1acf616f8114cef";
