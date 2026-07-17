import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PRODUKTY } from "@/config/products";

export default defineTool({
  name: "get_product_zones",
  title: "Get product placement zones",
  description: "Vrátí konfiguraci umístění výšivky pro daný typ produktu — pozice, velikosti a kolize.",
  inputSchema: {
    product: z.string().describe("Klíč produktu (tricko, mikina, detske, taska_velka, polstar, zastera) nebo Upgates slug."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ product }) => {
    const key = product.toLowerCase();
    let cfg = PRODUKTY[key];
    if (!cfg) {
      const found = Object.values(PRODUKTY).find((p) => p.slugy.includes(key));
      if (found) cfg = found;
    }
    if (!cfg) {
      return {
        content: [{ type: "text", text: `Produkt "${product}" nebyl nalezen. Dostupné: ${Object.keys(PRODUKTY).join(", ")}` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(cfg, null, 2) }],
      structuredContent: { product: cfg },
    };
  },
});
