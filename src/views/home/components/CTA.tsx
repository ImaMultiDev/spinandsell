import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-16 bg-green-600 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Tienes algo que vender?</h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de vendedores que confían en SpinAndSell para vender
            sus productos
          </p>
          <Link href="/vender">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              Publicar Producto Gratis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
