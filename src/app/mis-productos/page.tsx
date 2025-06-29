import { Metadata } from "next";
import MyProductsView from "@/views/products/MyProductsView";

export const metadata: Metadata = {
  title: "Mis Productos - SpinAndSell",
  description: "Gestiona y administra tus productos publicados en SpinAndSell",
};

export default function MyProductsPage() {
  return <MyProductsView />;
}
