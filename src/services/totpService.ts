import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

export interface TotpSetupData {
  secretKey: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

/**
 * Service providing Google Authenticator (TOTP RFC 6238) 2FA creation and verification
 */
export class TotpService {
  private flexIssuer = 'ChiBoKHCB_CTUMP';

  /**
   * Generates a new random Base32 secret key for Google Authenticator
   */
  public static generateSecretKey(): string {
    const secret = new OTPAuth.Secret({ size: 20 });
    return secret.base32;
  }

  /**
   * Generates complete TOTP setup data including secret key and QR Code Data URL
   */
  public static async createTotpSetup(userEmail: string, existingSecret?: string): Promise<TotpSetupData> {
    const secretKey = existingSecret || this.generateSecretKey();
    const totp = new OTPAuth.TOTP({
      issuer: 'ChiBoKHCB_CTUMP',
      label: userEmail,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretKey),
    });

    const otpauthUrl = totp.toString();
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      margin: 2,
      width: 250,
      color: {
        dark: '#8B1D1D',
        light: '#FFFFFF',
      },
    });

    return {
      secretKey,
      otpauthUrl,
      qrCodeDataUrl,
    };
  }

  /**
   * Verifies a 6-digit TOTP token against a secret key
   * Uses window=1 (+/- 30 seconds clock tolerance) for reliable verification
   */
  public static verifyToken(secretKey: string, userEmail: string, tokenInput: string): boolean {
    try {
      const cleanToken = tokenInput.replace(/\s+/g, '').trim();
      if (!cleanToken || cleanToken.length !== 6) {
        return false;
      }

      const totp = new OTPAuth.TOTP({
        issuer: 'ChiBoKHCB_CTUMP',
        label: userEmail,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secretKey),
      });

      // Delta returns null if invalid, or integer offset if valid
      const delta = totp.validate({
        token: cleanToken,
        window: 1, // Allows clock skew up to 30 seconds
      });

      return delta !== null;
    } catch (err) {
      console.error('Error validating TOTP token:', err);
      return false;
    }
  }

  /**
   * Generates current live TOTP code for testing / fallback display
   */
  public static getCurrentLiveToken(secretKey: string, userEmail: string): string {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: 'ChiBoKHCB_CTUMP',
        label: userEmail,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secretKey),
      });
      return totp.generate();
    } catch {
      return '123456';
    }
  }

  /**
   * Returns remaining seconds in current 30-second TOTP window
   */
  public static getRemainingSeconds(): number {
    return 30 - (Math.floor(Date.now() / 1000) % 30);
  }
}
