import { Metadata } from "next";
import ProfileView from "@/views/profile/ProfileView";

export const metadata: Metadata = {
  title: "Mi Perfil - SpinAndSell",
  description:
    "Gestiona tu información personal y configuraciones de cuenta en SpinAndSell",
};

export default function ProfilePage() {
  return <ProfileView />;
}
