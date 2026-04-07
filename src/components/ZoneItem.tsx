import { Upload, X, Eraser, Loader2, RotateCcw, RotateCw } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { PlacementZone } from "@/config/products";

interface ZoneItemProps {
  zone: PlacementZone;
  isActive: boolean;
  isBlocked: boolean;
  priceBadge: { label: string; free: boolean };
  image: string | null;
  imageRotation: number;
  onToggle: () => void;
  onImageChange: (dataUrl: string | null) => void;
  onRotate: (deg: number) => void;
}

const ZoneItem = ({
  zone,
  isActive,
  isBlocked,
  priceBadge,
  image,
  imageRotation,
  onToggle,
  onImageChange,
  onRotate,
}: ZoneItemProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [bgRemoved, setBgRemoved] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onImageChange(dataUrl);
        setOriginalImage(dataUrl);
        setBgRemoved(false);
      };
      reader.readAsDataURL(file);
    },
    [onImageChange]
  );

  const handleRemoveBackground = async () => {
    if (!image) return;
    setIsRemoving(true);
    try {
      const { data, error } = await supabase.functions.invoke("remove-background", {
        body: { imageBase64: image },
      });
      if (error) throw new Error(error.message);
      if (data?.success && data?.image) {
        onImageChange(data.image);
        setBgRemoved(true);
        toast({ title: "Pozadí odstraněno ✨", description: "Kresba je teď bez pozadí." });
      } else {
        throw new Error(data?.error || "Nepodařilo se odstranit pozadí.");
      }
    } catch (err: any) {
      toast({ title: "Chyba", description: err.message || "Nepodařilo se odstranit pozadí.", variant: "destructive" });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isBlocked
          ? "opacity-35 pointer-events-none border-border bg-card"
          : isActive
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/40 bg-card"
      }`}
    >
      {/* Header — toggle zone */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left"
        disabled={isBlocked}
      >
        {/* Radio indicator */}
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            isActive ? "border-primary bg-primary" : "border-muted-foreground/40"
          }`}
        >
          {isActive && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
        </div>

        {/* Color dot */}
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: zone.barva }} />

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{zone.nazev}</p>
          <p className="text-xs text-muted-foreground">{zone.info}</p>
        </div>

        {/* Price badge */}
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
            priceBadge.free
              ? "bg-accent/15 text-accent"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {priceBadge.label}
        </span>
      </button>

      {/* Upload section — only when active */}
      {isActive && (
        <div className="px-3 pb-3 space-y-2">
          {!image ? (
            <label
              className="upload-zone flex items-center gap-2 py-3 px-4 cursor-pointer text-sm text-muted-foreground"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Nahrát kresbu pro toto umístění
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
          ) : (
            <div className="flex flex-col gap-2 p-2 rounded-lg bg-background border border-border">
              <div className="relative">
                <img
                  src={image}
                  alt="Kresba"
                  className="w-full max-h-48 object-contain rounded-lg"
                  style={{
                    transform: `rotate(${imageRotation}deg)`,
                    background:
                      "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48cmVjdCB4PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTBlMGUwIi8+PHJlY3QgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2UwZTBlMCIvPjwvc3ZnPg==')",
                  }}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 rounded-full w-6 h-6"
                  onClick={() => {
                    onImageChange(null);
                    setOriginalImage(null);
                    setBgRemoved(false);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Rotation */}
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-7 px-2 gap-1 text-xs" onClick={() => onRotate(imageRotation - 90)}>
                    <RotateCcw className="w-3 h-3" /> -90°
                  </Button>
                  <span className="text-xs text-muted-foreground w-8 text-center">{imageRotation % 360}°</span>
                  <Button variant="outline" size="sm" className="h-7 px-2 gap-1 text-xs" onClick={() => onRotate(imageRotation + 90)}>
                    +90° <RotateCw className="w-3 h-3" />
                  </Button>
                </div>

                {/* BG removal */}
                {!bgRemoved ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={handleRemoveBackground}
                    disabled={isRemoving}
                  >
                    {isRemoving ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Odstraňuji…</>
                    ) : (
                      <><Eraser className="w-3 h-3" /> Odstranit pozadí</>
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-accent font-medium">Pozadí odstraněno ✓</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() => {
                        if (originalImage) {
                          onImageChange(originalImage);
                          setBgRemoved(false);
                          toast({ title: "Originál obnoven", description: "Kresba je zpět s původním pozadím." });
                        }
                      }}
                    >
                      <RotateCcw className="w-3 h-3" /> Vrátit originál
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ZoneItem;
