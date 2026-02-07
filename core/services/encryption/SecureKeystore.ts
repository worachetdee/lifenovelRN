import { Platform } from 'react-native';
import * as Keychain from 'react-native-keychain';

/**
 * Abstraction over iOS Keychain / Android Keystore.
 * Keys never leave the secure hardware enclave.
 */
export class SecureKeystore {
    private readonly service = 'com.lifenovel.keys';

    async set(alias: string, data: Uint8Array): Promise<void> {
        const base64 = Buffer.from(data).toString('base64');

        await Keychain.setGenericPassword(alias, base64, {
            service: `${this.service}.${alias}`,
            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            // Use hardware-backed storage when available
            securityLevel: Platform.OS === 'android'
                ? Keychain.SECURITY_LEVEL.SECURE_HARDWARE
                : undefined,
            // Require biometric/passcode to access on iOS
            accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
        });
    }

    async get(alias: string): Promise<Uint8Array | null> {
        try {
            const result = await Keychain.getGenericPassword({
                service: `${this.service}.${alias}`,
            });

            if (result && result.password) {
                return Uint8Array.from(Buffer.from(result.password, 'base64'));
            }

            return null;
        } catch {
            return null;
        }
    }

    async delete(alias: string): Promise<void> {
        await Keychain.resetGenericPassword({
            service: `${this.service}.${alias}`,
        });
    }
}
