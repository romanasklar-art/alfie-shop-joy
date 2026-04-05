import { useState } from "react";
import { ArrowLeft, ArrowRight, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import StepIndicator from "./StepIndicator";
import ProductSelector from "./ProductSelector";
import ImageUpload from "./ImageUpload";
import ProductPreview from "./ProductPreview";
import OrderNotes from "./OrderNotes";

const steps = [
  { number: 1, label: "Produkt" },
  { number: 2, label: "Kresba" },
  { number: 3, label: "Umístění" },
  { number: 4, label: "Poznámka" },
];

const Configurator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [imageRotation, setImageRotation] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const canGoNext = () => {
    if (currentStep === 1) return !!selectedProduct;
    if (currentStep === 2) return !!uploadedImage;
    if (currentStep === 3) return !!selectedPlacement;
    return true;
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    toast({
      title: "Objednávka odeslána! 🎉",
      description: "Brzy se vám ozveme s náhledem výšivky.",
    });
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
              setCurrentStep(1);
              setSelectedProduct(null);
              setUploadedImage(null);
              setSelectedPlacement(null);
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

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Alfie Store
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Konfigurátor výšivek z dětských kreseb
          </p>
        </div>

        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Step content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <ProductSelector
              selected={selectedProduct}
              onSelect={(id) => setSelectedProduct(id)}
            />
          )}
          {currentStep === 2 && (
            <ImageUpload image={uploadedImage} onImageChange={setUploadedImage} />
          )}
          {currentStep === 3 && selectedProduct && uploadedImage && (
            <ProductPreview
              productId={selectedProduct}
              uploadedImage={uploadedImage}
              selectedPlacement={selectedPlacement}
              onPlacementChange={setSelectedPlacement}
            />
          )}
          {currentStep === 4 && selectedProduct && uploadedImage && (
            <OrderNotes
              productId={selectedProduct}
              uploadedImage={uploadedImage}
              notes={notes}
              onNotesChange={setNotes}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zpět
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="gap-2"
            >
              Další
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="gap-2">
              <Send className="w-4 h-4" />
              Odeslat objednávku
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configurator;
