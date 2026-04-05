import { Upload, Image as ImageIcon, X } from "lucide-react";
import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  image: string | null;
  onImageChange: (dataUrl: string | null) => void;
}

const ImageUpload = ({ image, onImageChange }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageChange(e.target?.result as string);
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">
        Nahrajte kresbu 🎨
      </h2>
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
          <div className="configurator-card p-4">
            <div className="relative rounded-xl overflow-hidden bg-background">
              <img
                src={image}
                alt="Nahraná kresba"
                className="w-full max-h-80 object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full w-8 h-8"
                onClick={() => onImageChange(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <ImageIcon className="w-4 h-4" />
              <span>Kresba nahrána ✓</span>
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
