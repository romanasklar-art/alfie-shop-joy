import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_pricing",
  title: "Get embroidery pricing",
  description: "Vrátí ceník výšivek Alfie Store (příplatky za další výšivky).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const pricing = {
      mena: "CZK",
      pravidla: [
        "První malá výšivka (13×13 cm) je zahrnuta v ceně produktu.",
        "Každá další malá výšivka navíc: +300 Kč",
        "Velká výšivka (25×15 cm): +500 Kč",
      ],
      polozky: {
        mala_prvni: 0,
        mala_navic: 300,
        velka: 500,
      },
    };
    return {
      content: [{ type: "text", text: JSON.stringify(pricing, null, 2) }],
      structuredContent: pricing,
    };
  },
});

void z;
