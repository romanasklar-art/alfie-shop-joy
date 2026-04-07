import { Upload, Image as ImageIcon, X, Eraser, Loader2, RotateCcw } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  image: string | null;
  onImageChange: (dataUrl: string | null) => void;
}

const ImageUpload = ({ image, onImageChange }: ImageUploadProps) => {
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveBackground = async () => {
    if (!image) return;
    setIsRemoving(true);

    try {
      const { data, error } = await supabase.functions.invoke("remove-background", {
        body: { imageBase64: image },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success && data?.image) {
        onImageChange(data.image);
        setBgRemoved(true);
        toast({
          title: "Pozadí odstraněno ✨",
          description: "Kresba je teď bez pozadí.",
        });
      } else {
        throw new Error(data?.error || "Nepodařilo se odstranit pozadí.");
      }
    } catch (err: any) {
      console.error("BG removal error:", err);
      toast({
        title: "Chyba",
        description: err.message || "Nepodařilo se odstranit pozadí.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Nahrajte kresbu 🎨</h2>
      <p className="text-muted-foreground text-center text-sm">
        Vyfoťte nebo nahrajte obrázek dětské kresby.
      </p>

      {!image ? (
        <div
          className="upload-zone mt-6"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Klikněte nebo přetáhněte obrázek
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG, HEIC — max 10 MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 relative">
          <div className="configurator-card p-4 space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48cmVjdCB4PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTBlMGUwIi8+PHJlY3QgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2UwZTBlMCIvPjwvc3ZnPg==')]">
              <img
                src={image}
                alt="Nahraná kresba"
                className="w-full max-h-80 object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full w-8 h-8"
                onClick={() => {
                  onImageChange(null);
                  setOriginalImage(null);
                  setBgRemoved(false);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="w-4 h-4" />
                <span>
                  {bgRemoved ? "Pozadí odstraněno ✓" : "Kresba nahrána ✓"}
                </span>
              </div>

              {!bgRemoved ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveBackground}
                  disabled={isRemoving}
                  className="gap-2"
                >
                  {isRemoving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Odstraňuji...
                    </>
                  ) : (
                    <>
                      <Eraser className="w-4 h-4" />
                      Odstranit pozadí
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-accent font-medium">Pozadí odstraněno ✓</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      if (originalImage) {
                        onImageChange(originalImage);
                        setBgRemoved(false);
                        toast({ title: "Originál obnoven", description: "Kresba je zpět s původním pozadím." });
                      }
                    }}
                  >
                    <RotateCcw className="w-4 h-4" /> Vrátit originál
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default ImageUpload;
