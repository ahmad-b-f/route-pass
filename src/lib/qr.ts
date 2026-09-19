import QRCode from "qrcode";

export async function qrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    margin: 2,
    width: 480,
    color: {
      dark: "#182642",
      light: "#FFFFFF"
    }
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Generates a short random secret for signing a bus's static QR payload. */
export function generateSecret(length = 24): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
