/**
 * Generate a unique device fingerprint to prevent reward abuse
 * Combines multiple browser properties to create a unique identifier
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const components = {
    // Browser properties
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,

    // Screen properties
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,

    // Canvas fingerprint (basic)
    canvasFingerprint: getCanvasFingerprint(),

    // Timezone
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  // Create hash from components
  const fingerprint = await hashObject(components);
  return fingerprint;
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "canvas-error";

    const text = "Canvas Fingerprint";
    ctx.textBaseline = "top";
    ctx.font = '14px "Arial"';
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText(text, 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(text, 4, 17);

    return canvas.toDataURL().slice(-50);
  } catch {
    return "canvas-unsupported";
  }
}

async function hashObject(obj: any): Promise<string> {
  const str = JSON.stringify(obj);
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex.slice(0, 24); // Return first 24 chars
}
