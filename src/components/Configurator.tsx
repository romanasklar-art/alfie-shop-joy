import { useState, useMemo } from "react";
import { Send, Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ZoneItem from "./ZoneItem";
import ProductMockup from "./ProductMockup";
import { getProductByParam, isZoneBlocked, getZonePriceBadge } from "@/config/products";
import { renderAndUploadOrder } from "@/lib/render-order";
import type { PlacementZone } from "@/config/products";

// Product images (reuse existing assets)
import productMikina from "@/assets/product-mikina.png";
import productTricko from "@/assets/product-tricko.png";
import productUterka from "@/assets/product-uterka.png";

const PRODUCT_IMAGES: Record<string, string> = {
  tricko: productTricko,
  mikina: productMikina,
  detske: productTricko,
  taska_velka: productUterka,
  polstar: productUterka,
  zastera: productUterka,
};

const PRODUCT_NAMES: Record<string, string> = {
  tricko: "Tričko",
  mikina: "Mikina",
  detske: "Dětské oblečení",
  taska_velka: "Plátěná taška",
  polstar: "Polštář",
  zastera: "Zástěra",
};

interface ZoneImageData {
  image: string | null;
  rotation: number;
}

const Configurator = () => {
  const params = new URLSearchParams(window.location.search);
  const productParam = params.get("product") || "tricko";
  const product = useMemo(() => getProductByParam(productParam), [productParam]);

  const [activeZones, setActiveZones] = useState<string[]>([]);
  const [zoneImages, setZoneImages] = useState<Record<string, ZoneImageData>>({});
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="configurator-card text-center max-w-md mx-auto space-y-4 py-12">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Neznámý produkt</h2>
          <p className="text-muted-foreground text-sm">
            Parametr <code className="bg-muted px-1.5 py-0.5 rounded text-xs">?product=</code> nebyl rozpoznán.
          </p>
          <p className="text-muted-foreground text-xs">
            Dostupné: tricko, mikina, detske, taska_velka, polstar, zastera
          </p>
        </div>
      </div>
    );
  }

  const { typ, data: config } = product;
  const { zony, kolize } = config;

  const toggleZone = (zoneId: string) => {
    setActiveZones((prev) => {
      if (prev.includes(zoneId)) {
        return prev.filter((id) => id !== zoneId);
      }
      return [...prev, zoneId];
    });
  };

  const setZoneImage = (zoneId: string, image: string | null) => {
    setZoneImages((prev) => ({
      ...prev,
      [zoneId]: { ...prev[zoneId], image, rotation: prev[zoneId]?.rotation || 0 },
    }));
  };

  const setZoneRotation = (zoneId: string, rotation: number) => {
    setZoneImages((prev) => ({
      ...prev,
      [zoneId]: { ...prev[zoneId], image: prev[zoneId]?.image || null, rotation },
    }));
  };

  const handleSubmit = () => {
    if (activeZones.length === 0) {
      toast({ title: "Vyberte alespoň jedno umístění", variant: "destructive" });
      return;
    }
    const zonesWithoutImage = activeZones.filter((id) => !zoneImages[id]?.image);
    if (zonesWithoutImage.length > 0) {
      toast({ title: "Nahrajte kresbu ke všem vybraným umístěním", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Objednávka odeslána! 🎉", description: "Brzy se vám ozveme s náhledem výšivky." });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="configurator-card text-center max-w-md mx-auto space-y-4 py-12">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold">Děkujeme! 🧵</h2>
          <p className="text-muted-foreground">
            Vaši objednávku jsme přijali. Ozveme se vám s náhledem výšivky co nejdříve.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setActiveZones([]);
              setZoneImages({});
              setNotes("");
            }}
            variant="outline"
            className="mt-4"
          >
            Vytvořit další objednávku
          </Button>
        </div>
      </div>
    );
  }

  const predniZony = zony.filter((z) => z.predni);
  const zadniZony = zony.filter((z) => !z.predni);

  // Check for active collisions
  const hasCollision = kolize.some((pair) => pair.every((id) => activeZones.includes(id)));

  const productImage = PRODUCT_IMAGES[typ] || productTricko;
  const productName = PRODUCT_NAMES[typ] || "Produkt";

  const renderZoneSection = (title: string, zones: PlacementZone[]) => {
    if (zones.length === 0) return null;
    return (
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {title}
        </h3>
        <div className="space-y-2">
          {zones.map((zone) => (
            <ZoneItem
              key={zone.id}
              zone={zone}
              isActive={activeZones.includes(zone.id)}
              isBlocked={!activeZones.includes(zone.id) && isZoneBlocked(zone.id, activeZones, kolize)}
              priceBadge={getZonePriceBadge(zone, activeZones, zony)}
              image={zoneImages[zone.id]?.image || null}
              imageRotation={zoneImages[zone.id]?.rotation || 0}
              onToggle={() => toggleZone(zone.id)}
              onImageChange={(img) => setZoneImage(zone.id, img)}
              onRotate={(deg) => setZoneRotation(zone.id, deg)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Konfigurátor výšivky
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {productName} — vyberte umístění a nahrajte kresbu
          </p>
        </div>

        {/* Collision warning */}
        {hasCollision && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3 mb-4">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Vybraná umístění se vzájemně překrývají — odeberte jedno z nich.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Product mockup */}
          <ProductMockup
            productImage={productImage}
            productName={productName}
            zones={zony}
            activeZones={activeZones}
            zoneImages={zoneImages}
          />

          {/* Right: Zone selection */}
          <div className="space-y-4">
            {renderZoneSection("Přední strana", predniZony)}
            {renderZoneSection("Zadní strana", zadniZony)}

            {/* Notes */}
            <div className="configurator-card p-4 space-y-2">
              <label htmlFor="notes" className="text-sm font-semibold">
                Poznámka k objednávce
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Např. "Vyšijte prosím jen tu kočičku vpravo" nebo "Odstraňte pozadí, nechte jen panáčka"'
                rows={3}
                className="resize-none bg-background text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Nepovinné — pokud nic nenapíšete, vyšijeme celý obrázek.
              </p>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              className="w-full gap-2"
              size="lg"
              disabled={activeZones.length === 0 || hasCollision}
            >
              <Send className="w-4 h-4" />
              Odeslat objednávku
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configurator;
