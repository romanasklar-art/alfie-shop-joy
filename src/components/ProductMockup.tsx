import { RotateCcw } from "lucide-react";
import { useState } from "react";
import type { PlacementZone } from "@/config/products";

interface ZoneImageData {
  image: string | null;
  rotation: number;
}

interface ProductMockupProps {
  productImage: string;
  productName: string;
  zones: PlacementZone[];
  activeZones: string[];
  zoneImages: Record<string, ZoneImageData>;
}

const ProductMockup = ({
  productImage,
  productName,
  zones,
  activeZones,
  zoneImages,
}: ProductMockupProps) => {
  const [viewSide, setViewSide] = useState<"front" | "back">("front");

  const activeOnThisSide = zones.filter(
    (z) => activeZones.includes(z.id) && z.predni === (viewSide === "front") && zoneImages[z.id]?.image
  );

  return (
    <div className="configurator-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">
          {viewSide === "front" ? "Přední strana" : "Zadní strana"}
        </span>
        <button
          onClick={() => setViewSide((s) => (s === "front" ? "back" : "front"))}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Otočit
        </button>
      </div>

      <div className="relative aspect-square rounded-xl overflow-hidden bg-background">
        <img
          src={productImage}
          alt={productName}
          className={`w-full h-full object-contain ${viewSide === "back" ? "scale-x-[-1]" : ""}`}
        />

        {activeOnThisSide.map((zone) => {
          const data = zoneImages[zone.id];
          if (!data?.image) return null;
          return (
            <div
              key={zone.id}
              className="absolute pointer-events-none"
              style={{
                left: `${zone.position.x}%`,
                top: `${zone.position.y}%`,
                width: `${zone.imageScale}%`,
                transform: `translate(-50%, -50%) rotate(${data.rotation}deg)`,
              }}
            >
              <img
                src={data.image}
                alt="Kresba"
                className="w-full h-auto rounded"
                style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))" }}
              />
            </div>
          );
        })}

        {activeOnThisSide.length === 0 && activeZones.some((id) => {
          const z = zones.find((x) => x.id === id);
          return z && z.predni !== (viewSide === "front") && zoneImages[id]?.image;
        }) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-muted-foreground bg-background/80 px-3 py-1.5 rounded-full">
              Výšivka je na {viewSide === "front" ? "zadní" : "přední"} straně
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductMockup;
