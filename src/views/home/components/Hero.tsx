import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Encuentra tu bicicleta o patinete perfecto
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            El marketplace líder para la compraventa de bicicletas y patinetes
            de segunda mano
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/productos">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100 w-full sm:w-auto"
              >
                Explorar Productos
              </Button>
            </Link>
            <Link href="/vender">
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-green-600 hover:bg-gray-100 w-full sm:w-auto"
              >
                Vender mi Producto
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
