import { Metadata } from "next";
import ProductsView from "@/views/products/ProductsView";

export const metadata: Metadata = {
  title: "Productos - SpinAndSell",
  description:
    "Explora nuestra amplia selección de bicicletas y patinetes de segunda mano. Encuentra la mejor oferta al mejor precio.",
  keywords: ["productos", "bicicletas", "patinetes", "segunda mano", "ofertas"],
};

export default function ProductsPage() {
  return <ProductsView />;
}
