import { Metadata } from "next";
import CheckoutSuccessView from "@/views/checkout/CheckoutSuccessView";

export const metadata: Metadata = {
  title: "Compra Exitosa - SpinAndSell",
  description:
    "Tu compra se ha realizado exitosamente. ¡Gracias por confiar en SpinAndSell!",
  robots: "noindex, nofollow", // No indexar páginas de checkout
};

export default function CheckoutSuccessPage() {
  return <CheckoutSuccessView />;
}
