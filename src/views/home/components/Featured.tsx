import FeaturedProducts from "@/components/FeaturedProducts";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Featured() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Productos destacados</h2>
          <p className="text-gray-600">
            Los productos más populares de nuestra plataforma
          </p>
        </div>

        <FeaturedProducts />
        <div className="text-center mt-8">
          <Link href="/productos">
            <Button size="lg" variant="outline">
              Ver todos los productos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
