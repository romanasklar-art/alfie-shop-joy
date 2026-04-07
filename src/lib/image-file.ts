import heic2any from "heic2any";

const HEIC_EXTENSION_REGEX = /\.(heic|heif)$/i;
const HEIC_MIME_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

const MAX_DIMENSION = 1024;

const isHeicFile = (file: File) => {
  const fileType = file.type.toLowerCase();
  return HEIC_MIME_TYPES.has(fileType) || HEIC_EXTENSION_REGEX.test(file.name);
};

const isSupportedImageFile = (file: File) => file.type.startsWith("image/") || isHeicFile(file);

const readBlobAsDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Soubor se nepodařilo načíst."));
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Soubor se nepodařilo načíst."));
    };
    reader.readAsDataURL(blob);
  });

const normalizeImageBlob = async (file: File) => {
  if (!isHeicFile(file)) return file;

  try {
    const result = await heic2any({
      blob: file,
      toType: "image/png",
    });
    const blob = Array.isArray(result) ? result[0] : result;
    if (!(blob instanceof Blob)) {
      throw new Error("HEIC fotku se nepodařilo převést.");
    }
    return blob;
  } catch {
    throw new Error("HEIC fotku se nepodařilo převést. Zkuste ji prosím uložit jako JPG nebo PNG.");
  }
};

export const getImageDataUrlFromFile = async (file: File) => {
  if (!isSupportedImageFile(file)) {
    throw new Error("Nahrajte prosím obrázek ve formátu JPG, PNG nebo HEIC.");
  }

  const normalizedBlob = await normalizeImageBlob(file);
  return readBlobAsDataUrl(normalizedBlob);
};

/**
 * Resize a base64 data URL image so its longest side is at most `maxDim` pixels.
 * Returns a new base64 data URL (PNG for transparency support).
 */
export const resizeImageDataUrl = (
  dataUrl: string,
  maxDim: number = MAX_DIMENSION
): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      if (width <= maxDim && height <= maxDim) {
        resolve(dataUrl);
        return;
      }

      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Obrázek se nepodařilo načíst pro změnu velikosti."));
    img.src = dataUrl;
  });
