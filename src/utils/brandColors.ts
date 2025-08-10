// Utilities to read brand colors from CSS variables and convert formats

function getCssVarRawValue(varName: string): string {
  if (typeof window === 'undefined') return '';
  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(varName).trim();
  return value; // expected format: "H S% L%"
}

export function getCssVarHslColor(varName: string, fallbackHex: string = '#3F8EFC'): string {
  const raw = getCssVarRawValue(varName);
  if (!raw) return fallbackHex;
  // Return CSS hsl() color string, e.g., hsl(213 96% 62%)
  return `hsl(${raw})`;
}

export function hslRawToHex(raw: string, fallbackHex: string = '#3F8EFC'): string {
  try {
    // raw expected like: "213 96% 62%"
    const match = raw.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
    if (!match) return fallbackHex;
    const h = parseFloat(match[1]);
    const s = parseFloat(match[2]) / 100;
    const l = parseFloat(match[3]) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let rPrime = 0, gPrime = 0, bPrime = 0;
    if (h >= 0 && h < 60) {
      rPrime = c; gPrime = x; bPrime = 0;
    } else if (h >= 60 && h < 120) {
      rPrime = x; gPrime = c; bPrime = 0;
    } else if (h >= 120 && h < 180) {
      rPrime = 0; gPrime = c; bPrime = x;
    } else if (h >= 180 && h < 240) {
      rPrime = 0; gPrime = x; bPrime = c;
    } else if (h >= 240 && h < 300) {
      rPrime = x; gPrime = 0; bPrime = c;
    } else {
      rPrime = c; gPrime = 0; bPrime = x;
    }

    const r = Math.round((rPrime + m) * 255);
    const g = Math.round((gPrime + m) * 255);
    const b = Math.round((bPrime + m) * 255);

    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  } catch {
    return fallbackHex;
  }
}

export function getCssVarHexColor(varName: string, fallbackHex: string = '#3F8EFC'): string {
  const raw = getCssVarRawValue(varName);
  if (!raw) return fallbackHex;
  return hslRawToHex(raw, fallbackHex);
}


