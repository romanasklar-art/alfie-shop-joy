import { Textarea } from "@/components/ui/textarea";
import { products } from "./ProductSelector";

interface OrderNotesProps {
  productId: string;
  uploadedImage: string;
  notes: string;
  onNotesChange: (notes: string) => void;
}

const OrderNotes = ({ productId, uploadedImage, notes, onNotesChange }: OrderNotesProps) => {
  const product = products.find((p) => p.id === productId);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">
        Ještě něco? 💬
      </h2>
      <p className="text-muted-foreground text-center text-sm">
        Napište nám, co z obrázku chcete vyšít, co případně odstranit, nebo nechte prázdné – vyšijeme celý obrázek.
      </p>

      <div className="configurator-card mt-6 space-y-5">
        {/* Mini preview */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-background">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <img
              src={uploadedImage}
              alt="Kresba"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-sm">{product?.name}</p>
            <p className="text-xs text-muted-foreground">Výšivka na míru</p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Poznámka k objednávce
          </label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Např. „Vyšijte prosím jen tu kočičku vpravo" nebo „Odstraňte pozadí, nechte jen panáčka""
            rows={4}
            className="resize-none bg-background"
          />
          <p className="text-xs text-muted-foreground">
            Nepovinné — pokud nic nenapíšete, vyšijeme celý obrázek.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderNotes;
