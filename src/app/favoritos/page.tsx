import { Metadata } from "next";
import FavoritesView from "@/views/favorites/FavoritesView";

export const metadata: Metadata = {
  title: "Mis Favoritos - SpinAndSell",
  description: "Los productos que has marcado como favoritos en SpinAndSell",
};

export default function FavoritesPage() {
  return <FavoritesView />;
}
