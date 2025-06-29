import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/libs/prisma";

// GET - Obtener mensajes de una conversación
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id: conversationId } = await params;

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es parte de la conversación
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ participant1Id: user.id }, { participant2Id: user.id }],
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversación no encontrada o no tienes permisos" },
        { status: 404 }
      );
    }

    // Obtener mensajes de la conversación
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Marcar mensajes como leídos si no fueron enviados por el usuario actual
    const unreadMessages = messages.filter(
      (message) => message.senderId !== user.id && !message.readAt
    );

    if (unreadMessages.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: unreadMessages.map((m) => m.id) },
        },
        data: { readAt: new Date() },
      });
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Enviar nuevo mensaje
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { message: "El contenido del mensaje es requerido" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { message: "El mensaje no puede exceder 1000 caracteres" },
        { status: 400 }
      );
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es parte de la conversación
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ participant1Id: user.id }, { participant2Id: user.id }],
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversación no encontrada o no tienes permisos" },
        { status: 404 }
      );
    }

    // Crear mensaje
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        conversationId,
        senderId: user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Actualizar timestamp de último mensaje en la conversación
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({
      message: "Mensaje enviado exitosamente",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
