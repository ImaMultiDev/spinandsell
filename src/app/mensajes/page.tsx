import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MessagesView from "@/views/messages/MessagesView";

export const metadata: Metadata = {
  title: "Mensajes - SpinAndSell",
  description: "Conversaciones y mensajes en SpinAndSell",
};

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return <MessagesView />;
}
