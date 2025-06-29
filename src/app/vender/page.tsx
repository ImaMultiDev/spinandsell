import { Metadata } from "next";
import VenderView from "@/views/vender/VenderView";

export const metadata: Metadata = {
  title: "Vender Producto - SpinAndSell",
  description:
    "Publica tu bicicleta o patinete de segunda mano en SpinAndSell. Proceso fácil y rápido con imágenes optimizadas.",
  keywords:
    "vender bicicleta, vender patinete, segunda mano, marketplace, SpinAndSell",
};

export default function VenderPage() {
  return <VenderView />;
}
