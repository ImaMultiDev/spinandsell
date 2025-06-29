import { Metadata } from "next";
import { Suspense } from "react";
import CheckoutSuccessView from "@/views/checkout/CheckoutSuccessView";

export const metadata: Metadata = {
  title: "Compra Exitosa - SpinAndSell",
  description:
    "Tu compra se ha realizado exitosamente. ¡Gracias por confiar en SpinAndSell!",
  robots: "noindex, nofollow", // No indexar páginas de checkout
};

function CheckoutSuccessLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Cargando información de tu compra...
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessLoading />}>
      <CheckoutSuccessView />
    </Suspense>
  );
}
