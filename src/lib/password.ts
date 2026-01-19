/**
 * Password hashing utilities using Web Crypto API (PBKDF2)
 * Compatible with Edge Runtime in Next.js 15
 *
 * Uses PBKDF2-SHA256 with 100,000 iterations for secure password hashing
 */

const ITERATIONS = 100000;
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16; // 128 bits

/**
 * Convert a string to a BufferSource for Web Crypto API
 */
function stringToBuffer(str: string): BufferSource {
  return new TextEncoder().encode(str);
}

/**
 * Convert a buffer to a hex string
 */
function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert a hex string to a BufferSource
 */
function hexToBuffer(hex: string): BufferSource {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Hash a password using PBKDF2
 * Returns a string in the format: salt:hash
 */
export async function hash(password: string): Promise<string> {
  // Generate a random salt
  const salt: BufferSource = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  // Import the password as a key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive the hash using PBKDF2
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    KEY_LENGTH * 8 // bits
  );

  // Return salt:hash format
  const saltHex = bufferToHex(salt as Uint8Array);
  const hashHex = bufferToHex(hashBuffer);

  return `${saltHex}:${hashHex}`;
}

/**
 * Compare a password with a hash
 * Returns true if the password matches the hash
 */
export async function compare(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // Split the stored hash into salt and hash
    const [saltHex, storedHashHex] = hashedPassword.split(':');

    if (!saltHex || !storedHashHex) {
      return false;
    }

    // Convert salt from hex to BufferSource
    const salt = hexToBuffer(saltHex);

    // Import the password as a key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      stringToBuffer(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    // Derive the hash using PBKDF2 with the same salt
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      KEY_LENGTH * 8 // bits
    );

    // Compare the hashes
    const computedHashHex = bufferToHex(hashBuffer);

    return computedHashHex === storedHashHex;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}
