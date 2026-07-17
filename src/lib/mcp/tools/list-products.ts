import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PRODUKTY } from "../../config/products";

export default defineTool({
  name: "list_products",
  title: "List products",
  description: "Vrátí seznam všech typů produktů (tričko, mikina, dětské, taška, polštář, zástěra) s jejich Upgates slugy.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const items = Object.entries(PRODUKTY).map(([key, cfg]) => ({
      key,
      slugy: cfg.slugy,
      pocet_zon: cfg.zony.length,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { products: items },
    };
  },
});

// Silence unused import warning for z in case schema is empty
void z;
