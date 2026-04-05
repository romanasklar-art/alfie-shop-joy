import { useState } from "react";
import { Heart, Shirt, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products } from "./ProductSelector";

export type EmbroiderySize = "small" | "large";

export interface PlacementOption {
  id: string;
  label: string;
  description: string;
  size: EmbroiderySize;
  side: "front" | "back";
  position: { x: number; y: number };
  imageScale: number;
}

export const placementOptions: PlacementOption[] = [
  {
    id: "heart-small",
    label: "K srdci",
    description: "Malá výšivka 13×13 cm",
    size: "small",
    side: "front",
    position: { x: 62, y: 38 },
    imageScale: 18,
  },
  {
    id: "front-hem",
    label: "K pravému lemu",
    description: "Malá výšivka 13×13 cm, dole vpravo",
    size: "small",
    side: "front",
    position: { x: 38, y: 75 },
    imageScale: 18,
  },
  {
    id: "back-neck",
    label: "Za krk",
    description: "Malá výšivka 13×13 cm, vzadu nahoře",
    size: "small",
    side: "back",
    position: { x: 50, y: 25 },
    imageScale: 18,
  },
  {
    id: "back-hem",
    label: "Záda k pravému lemu",
    description: "Malá výšivka 13×13 cm, vzadu vpravo",
    size: "small",
    side: "back",
    position: { x: 38, y: 75 },
    imageScale: 18,
  },
  {
    id: "chest-large",
    label: "Uprostřed hrudníku",
    description: "Velká výšivka na střed přední strany",
    size: "large",
    side: "front",
    position: { x: 50, y: 45 },
    imageScale: 35,
  },
  {
    id: "back-large",
    label: "Uprostřed zad",
    description: "Velká výšivka na záda",
    size: "large",
    side: "back",
    position: { x: 50, y: 45 },
    imageScale: 40,
  },
];

interface ProductPreviewProps {
  productId: string;
  uploadedImage: string;
  selectedPlacement: string | null;
  onPlacementChange: (id: string) => void;
  imageRotation: number;
  onRotate: (deg: number) => void;
}

const ProductPreview = ({
  productId,
  uploadedImage,
  selectedPlacement,
  onPlacementChange,
  imageRotation,
  onRotate,
}: ProductPreviewProps) => {
  const product = products.find((p) => p.id === productId);
  const [viewSide, setViewSide] = useState<"front" | "back">("front");

  const placement = placementOptions.find((p) => p.id === selectedPlacement);

  if (!product) return null;

  const smallPlacements = placementOptions.filter((p) => p.size === "small");
  const largePlacements = placementOptions.filter((p) => p.size === "large");

  const showOnProduct = placement && placement.side === viewSide;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">
        Kam chcete výšivku? ✨
      </h2>
      <p className="text-muted-foreground text-center text-sm">
        Vyberte pozici a velikost výšivky na produktu.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        {/* Product Preview */}
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
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-contain ${
                viewSide === "back" ? "scale-x-[-1]" : ""
              }`}
            />
            {showOnProduct && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${placement.position.x}%`,
                  top: `${placement.position.y}%`,
                  width: `${placement.imageScale}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <img
                  src={uploadedImage}
                  alt="Kresba"
                  className="w-full h-auto rounded"
                  style={{
                    filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))",
                  }}
                />
              </div>
            )}

            {/* Placement indicator when viewing other side */}
            {placement && placement.side !== viewSide && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-muted-foreground bg-background/80 px-3 py-1.5 rounded-full">
                  Výšivka je na {placement.side === "front" ? "přední" : "zadní"} straně
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Placement Options */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Malá výšivka (13×13 cm)
            </h3>
            <div className="space-y-2">
              {smallPlacements.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onPlacementChange(opt.id);
                    setViewSide(opt.side);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    selectedPlacement === opt.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedPlacement === opt.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {opt.side === "front" ? "Přední" : "Zadní"} strana
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Velká výšivka
            </h3>
            <div className="space-y-2">
              {largePlacements.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onPlacementChange(opt.id);
                    setViewSide(opt.side);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    selectedPlacement === opt.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedPlacement === opt.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Shirt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {opt.side === "front" ? "Přední" : "Zadní"} strana
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
