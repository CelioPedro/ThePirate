package com.thepiratemax.backend.service.credential;

import com.thepiratemax.backend.config.CredentialEncryptionProperties;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

@Service
public class CredentialCryptoService {

    private static final String CIPHER = "AES/GCM/NoPadding";
    private static final String AES = "AES";
    private static final int IV_BYTES = 12;
    private static final int TAG_BITS = 128;
    private static final String PREFIX = "aesgcm:v1:";
    private static final String LEGACY_DEV_KEY_VERSION = "dev-v1";

    private final SecureRandom secureRandom = new SecureRandom();
    private final CredentialEncryptionProperties properties;
    private final SecretKeySpec keySpec;

    public CredentialCryptoService(CredentialEncryptionProperties properties) {
        this.properties = properties;
        this.keySpec = new SecretKeySpec(deriveKey(properties.secret()), AES);
    }

    public String encrypt(String value) {
        try {
            byte[] iv = new byte[IV_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(CIPHER);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, new GCMParameterSpec(TAG_BITS, iv));
            byte[] encrypted = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));

            ByteBuffer buffer = ByteBuffer.allocate(iv.length + encrypted.length);
            buffer.put(iv);
            buffer.put(encrypted);
            return PREFIX + Base64.getEncoder().encodeToString(buffer.array());
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Unable to encrypt credential", exception);
        }
    }

    public String decrypt(String value, String keyVersion) {
        if (LEGACY_DEV_KEY_VERSION.equals(keyVersion) || !value.startsWith(PREFIX)) {
            return new String(Base64.getDecoder().decode(value), StandardCharsets.UTF_8);
        }

        try {
            byte[] payload = Base64.getDecoder().decode(value.substring(PREFIX.length()));
            byte[] iv = Arrays.copyOfRange(payload, 0, IV_BYTES);
            byte[] encrypted = Arrays.copyOfRange(payload, IV_BYTES, payload.length);

            Cipher cipher = Cipher.getInstance(CIPHER);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, new GCMParameterSpec(TAG_BITS, iv));
            return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Unable to decrypt credential", exception);
        }
    }

    public String currentKeyVersion() {
        return properties.keyVersion();
    }

    private byte[] deriveKey(String secret) {
        try {
            return MessageDigest.getInstance("SHA-256")
                    .digest(secret.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Unable to derive credential encryption key", exception);
        }
    }
}
