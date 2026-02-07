import { box, randomBytes, secretbox } from 'tweetnacl';
import { encode as encodeBase64, decode as decodeBase64 } from '@stablelib/base64';
import { encode as encodeUTF8, decode as decodeUTF8 } from '@stablelib/utf8';
import { SecureKeystore } from './SecureKeystore';

const MASTER_KEY_ALIAS = 'lifenovel_master_key';

export class EncryptionService {
    private keystore: SecureKeystore;
    private cachedMasterKey: Uint8Array | null = null;

    constructor() {
        this.keystore = new SecureKeystore();
    }

    /**
     * Get or create the user's master encryption key.
     * Stored in iOS Keychain / Android Keystore — never leaves the device.
     */
    async getMasterKey(): Promise<Uint8Array> {
        if (this.cachedMasterKey) return this.cachedMasterKey;

        let keyData = await this.keystore.get(MASTER_KEY_ALIAS);

        if (!keyData) {
            // Generate new 256-bit key
            keyData = randomBytes(secretbox.keyLength);
            await this.keystore.set(MASTER_KEY_ALIAS, keyData);
        }

        this.cachedMasterKey = keyData;
        return keyData;
    }

    /**
     * Encrypt plaintext string with user's master key.
     * Returns { ciphertext, nonce } as base64 strings.
     */
    async encrypt(plaintext: string): Promise<{ ciphertext: string; nonce: string }> {
        const key = await this.getMasterKey();
        const nonce = randomBytes(secretbox.nonceLength);
        const messageBytes = encodeUTF8(plaintext);
        const encrypted = secretbox(messageBytes, nonce, key);

        return {
            ciphertext: encodeBase64(encrypted),
            nonce: encodeBase64(nonce),
        };
    }

    /**
     * Decrypt ciphertext back to plaintext string.
     */
    async decrypt(ciphertext: string, nonce: string): Promise<string> {
        const key = await this.getMasterKey();
        const decrypted = secretbox.open(
            decodeBase64(ciphertext),
            decodeBase64(nonce),
            key
        );

        if (!decrypted) {
            throw new Error('Decryption failed — invalid key or corrupted data');
        }

        return decodeUTF8(decrypted);
    }

    /**
     * Encrypt data with a circle group key (for feed items).
     */
    encryptWithGroupKey(
        plaintext: string,
        groupKey: Uint8Array
    ): { ciphertext: string; nonce: string } {
        const nonce = randomBytes(secretbox.nonceLength);
        const messageBytes = encodeUTF8(plaintext);
        const encrypted = secretbox(messageBytes, nonce, groupKey);

        return {
            ciphertext: encodeBase64(encrypted),
            nonce: encodeBase64(nonce),
        };
    }

    /**
     * Decrypt data with a circle group key.
     */
    decryptWithGroupKey(
        ciphertext: string,
        nonce: string,
        groupKey: Uint8Array
    ): string {
        const decrypted = secretbox.open(
            decodeBase64(ciphertext),
            decodeBase64(nonce),
            groupKey
        );

        if (!decrypted) {
            throw new Error('Circle decryption failed');
        }

        return decodeUTF8(decrypted);
    }

    /**
     * Clear cached keys (call on logout).
     */
    clearCache(): void {
        if (this.cachedMasterKey) {
            this.cachedMasterKey.fill(0);
            this.cachedMasterKey = null;
        }
    }
}
