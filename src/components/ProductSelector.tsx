import productMikina from "@/assets/product-mikina.png";
import productTricko from "@/assets/product-tricko.png";
import productUterka from "@/assets/product-uterka.png";

export interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
}

export const products: Product[] = [
  {
    id: "mikina",
    name: "Mikina",
    image: productMikina,
    description: "Organic bavlna, unisex střih",
  },
  {
    id: "tricko",
    name: "Tričko",
    image: productTricko,
    description: "100% bavlna, měkký materiál",
  },
  {
    id: "uterka",
    name: "Utěrka",
    image: productUterka,
    description: "Lněná kuchyňská utěrka",
  },
];

interface ProductSelectorProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

const ProductSelector = ({ selected, onSelect }: ProductSelectorProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">
        Na co chcete výšivku? 🧵
      </h2>
      <p className="text-muted-foreground text-center text-sm">
        Vyberte produkt, na který vyšijeme kresbu vašeho dítěte.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => onSelect(product.id)}
            className={`product-option text-left ${
              selected === product.id ? "product-option-selected" : ""
            }`}
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-background mb-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4"
                loading="lazy"
                width={800}
                height={800}
              />
            </div>
            <h3 className="font-bold text-lg">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductSelector;
