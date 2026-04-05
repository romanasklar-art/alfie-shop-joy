import { useRef, useState, useCallback, useEffect } from "react";
import { Move, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { products } from "./ProductSelector";

interface ProductPreviewProps {
  productId: string;
  uploadedImage: string;
}

const ProductPreview = ({ productId, uploadedImage }: ProductPreviewProps) => {
  const product = products.find((p) => p.id === productId);
  const containerRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ x: 50, y: 40 });
  const [scale, setScale] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [position]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const dy = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
      setPosition({
        x: Math.max(0, Math.min(100, dragStartRef.current.posX + dx)),
        y: Math.max(0, Math.min(100, dragStartRef.current.posY + dy)),
      });
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!product) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">
        Umístěte kresbu na produkt ✨
      </h2>
      <p className="text-muted-foreground text-center text-sm">
        Přetáhněte obrázek na místo, kde chcete výšivku. Velikost upravte posuvníkem.
      </p>

      <div className="configurator-card mt-6">
        <div
          ref={containerRef}
          className="relative aspect-square rounded-xl overflow-hidden bg-background select-none touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain pointer-events-none"
          />
          <div
            className={`absolute cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${scale}%`,
              transform: "translate(-50%, -50%)",
            }}
            onPointerDown={handlePointerDown}
          >
            <img
              src={uploadedImage}
              alt="Kresba"
              className="w-full h-auto pointer-events-none rounded-lg"
              style={{
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))",
              }}
            />
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
              <Move className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ZoomOut className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Slider
            value={[scale]}
            onValueChange={([v]) => setScale(v)}
            min={10}
            max={70}
            step={1}
            className="flex-1"
          />
          <ZoomIn className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
