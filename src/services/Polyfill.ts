import * as CryptoPolyfill from 'expo-standard-web-crypto';

if (!global.crypto) {
    Object.defineProperty(global, 'crypto', {
        value: CryptoPolyfill
    });
}