import "server-only";
import QRCode from "qrcode";

/** Generate an inline SVG QR code (server-side). */
export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 0,
    width: 120,
    color: { dark: "#2f2a24", light: "#00000000" },
    errorCorrectionLevel: "M",
  });
}
