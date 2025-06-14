
/**
 * Service pour générer et gérer les empreintes de navigateur
 */
export class BrowserFingerprintService {
  private static fingerprint: string | null = null;

  /**
   * Génère une empreinte unique du navigateur
   */
  static async generateFingerprint(): Promise<string> {
    if (this.fingerprint) {
      return this.fingerprint;
    }

    const components: string[] = [];

    // Informations de base du navigateur
    components.push(navigator.userAgent);
    components.push(navigator.language);
    components.push(navigator.platform);
    components.push(screen.width + 'x' + screen.height);
    components.push(screen.colorDepth.toString());
    components.push(new Date().getTimezoneOffset().toString());

    // Canvas fingerprinting (plus sophistiqué)
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 200;
        canvas.height = 50;
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('ImmoConnect 🏠', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Fingerprint', 4, 35);
        components.push(canvas.toDataURL());
      }
    } catch (error) {
      // En cas d'erreur, ajouter une valeur par défaut
      components.push('canvas-error');
    }

    // WebGL fingerprinting
    try {
      const gl = document.createElement('canvas').getContext('webgl');
      if (gl) {
        const renderer = gl.getParameter(gl.RENDERER);
        const vendor = gl.getParameter(gl.VENDOR);
        components.push(renderer || 'unknown-renderer');
        components.push(vendor || 'unknown-vendor');
      }
    } catch (error) {
      components.push('webgl-error');
    }

    // Plugins disponibles
    const plugins = Array.from(navigator.plugins).map(p => p.name).sort();
    components.push(plugins.join(','));

    // Générer un hash à partir de tous les composants
    const fingerprintString = components.join('|');
    this.fingerprint = await this.hashString(fingerprintString);
    
    return this.fingerprint;
  }

  /**
   * Génère un hash SHA-256 d'une chaîne
   */
  private static async hashString(str: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      // Fallback si crypto.subtle n'est pas disponible
      return this.simpleHash(str);
    }
  }

  /**
   * Hash simple en cas de fallback
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Efface le fingerprint en cache
   */
  static clearCache(): void {
    this.fingerprint = null;
  }
}
