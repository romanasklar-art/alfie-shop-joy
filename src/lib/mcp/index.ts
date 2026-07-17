import { defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list-products";
import getProductZones from "./tools/get-product-zones";
import getPricing from "./tools/get-pricing";

export default defineMcp({
  name: "alfie-store-mcp",
  title: "Alfie Store konfigurátor",
  version: "0.1.0",
  instructions:
    "Nástroje pro Alfie Store — e-shop s výšivkami dětských kreseb. Umožňuje AI asistentům číst konfiguraci produktů, umístění výšivek a ceník.",
  tools: [listProducts, getProductZones, getPricing],
});
