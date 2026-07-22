import { supabase } from "@/integrations/supabase/client";
import type { PlacementZone } from "@/config/products";

interface ZoneImageData {
  image: string | null;
  rotation: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mime = meta.match(/data:(.*?);base64/)?.[1] || "image/png";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function renderSide(
  productImageSrc: string,
  zones: PlacementZone[],
  zoneImages: Record<string, ZoneImageData>,
  activeZones: string[],
  side: "front" | "back"
): Promise<string | null> {
  const zonesOnSide = zones.filter(
    (z) => activeZones.includes(z.id) && z.predni === (side === "front") && zoneImages[z.id]?.image
  );
  if (zonesOnSide.length === 0) return null;

  const product = await loadImage(productImageSrc);
  const W = 1000;
  const H = Math.round((product.height / product.width) * W);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Mirror for back view to match the ProductMockup preview
  if (side === "back") {
    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(product, 0, 0, W, H);
    ctx.restore();
  } else {
    ctx.drawImage(product, 0, 0, W, H);
  }

  for (const zone of zonesOnSide) {
    const data = zoneImages[zone.id]!;
    const img = await loadImage(data.image!);
    const targetW = (zone.imageScale / 100) * W;
    const scale = targetW / img.width;
    const targetH = img.height * scale;
    const cx = (zone.position.x / 100) * W;
    const cy = (zone.position.y / 100) * H;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((data.rotation * Math.PI) / 180);
    ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

export function generateOrderNumber(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${stamp}-${rand}`;
}

export interface OrderUploadResult {
  orderNumber: string;
  paths: string[];
}

export async function renderAndUploadOrder(params: {
  productImage: string;
  productType: string;
  zones: PlacementZone[];
  activeZones: string[];
  zoneImages: Record<string, ZoneImageData>;
  notes: string;
}): Promise<OrderUploadResult> {
  const orderNumber = generateOrderNumber();
  const paths: string[] = [];

  const uploadBlob = async (path: string, blob: Blob) => {
    const { error } = await supabase.storage.from("orders").upload(path, blob, {
      contentType: blob.type,
      upsert: false,
    });
    if (error) throw new Error(`Upload failed for ${path}: ${error.message}`);
    paths.push(path);
  };

  // 1) Original uploaded drawings, per zone
  for (const zoneId of params.activeZones) {
    const data = params.zoneImages[zoneId];
    if (!data?.image) continue;
    const blob = dataUrlToBlob(data.image);
    const ext = blob.type.includes("jpeg") ? "jpg" : "png";
    await uploadBlob(`${orderNumber}/kresba-${zoneId}.${ext}`, blob);
  }

  // 2) Composite renders per side
  for (const side of ["front", "back"] as const) {
    const dataUrl = await renderSide(
      params.productImage,
      params.zones,
      params.zoneImages,
      params.activeZones,
      side
    );
    if (dataUrl) {
      await uploadBlob(`${orderNumber}/nahled-${side === "front" ? "predni" : "zadni"}.png`, dataUrlToBlob(dataUrl));
    }
  }

  // 3) Order summary JSON
  const summary = {
    orderNumber,
    productType: params.productType,
    createdAt: new Date().toISOString(),
    notes: params.notes,
    zones: params.activeZones.map((id) => {
      const z = params.zones.find((x) => x.id === id);
      return {
        id,
        name: z?.nazev,
        value: z?.value,
        select: z?.select,
        rotation: params.zoneImages[id]?.rotation || 0,
      };
    }),
  };
  const summaryBlob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
  await uploadBlob(`${orderNumber}/objednavka.json`, summaryBlob);

  return { orderNumber, paths };
}
