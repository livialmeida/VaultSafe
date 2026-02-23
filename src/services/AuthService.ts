import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Auth Service - Manages biometric hardware interaction
 * Follows the gatekeeper pattern for secure access control
 */
export const AuthService = {
    /**
     * Checks if the device support biometrics and has enrolled credentials
     * return promise<boolean>
     */
    async isBiometricAvaliable(): Promise<boolean> {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return hasHardware && isEnrolled;
    },

    /**
     * triggers the os-level biometric prompt. logic matches the Auth screen
     */
    async authenticate(): Promise<boolean> {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Auntenticação necessária',
                fallbackLabel: 'Usar senha do dispositivo',
                cancelLabel: 'Cancelar',
                disableDeviceFallback: false,
            });

            return result.success;
        } catch (error) {
            console.error("Authentication Service Error:", error);
            return false;
        }
    }
}