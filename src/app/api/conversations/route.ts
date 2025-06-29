import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/libs/prisma";

// GET - Obtener todas las conversaciones del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
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

    // Obtener conversaciones del usuario
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participant1Id: user.id }, { participant2Id: user.id }],
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            brand: true,
            model: true,
            publicPrice: true,
            sold: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            readAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // Formatear respuesta con información del otro participante
    const formattedConversations = conversations.map((conversation) => {
      const otherParticipant =
        conversation.participant1.id === user.id
          ? conversation.participant2
          : conversation.participant1;

      return {
        id: conversation.id,
        otherParticipant,
        product: conversation.product,
        lastMessage: conversation.messages[0] || null,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt,
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error("Error getting conversations:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva conversación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { otherUserId, productId } = await request.json();

    if (!otherUserId) {
      return NextResponse.json(
        { message: "ID del otro usuario es requerido" },
        { status: 400 }
      );
    }

    // Obtener usuario actual
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

    // Verificar que no se esté intentando crear conversación consigo mismo
    if (user.id === otherUserId) {
      return NextResponse.json(
        { message: "No puedes crear una conversación contigo mismo" },
        { status: 400 }
      );
    }

    // Verificar que el otro usuario existe
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true },
    });

    if (!otherUser) {
      return NextResponse.json(
        { message: "El otro usuario no existe" },
        { status: 404 }
      );
    }

    // Verificar si ya existe una conversación entre estos usuarios para este producto
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: user.id,
            participant2Id: otherUserId,
            productId: productId || null,
          },
          {
            participant1Id: otherUserId,
            participant2Id: user.id,
            productId: productId || null,
          },
        ],
      },
    });

    if (existingConversation) {
      return NextResponse.json(
        {
          message: "Ya existe una conversación con este usuario",
          conversationId: existingConversation.id,
        },
        { status: 200 }
      );
    }

    // Crear nueva conversación
    const conversation = await prisma.conversation.create({
      data: {
        participant1Id: user.id,
        participant2Id: otherUserId,
        productId: productId || null,
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            brand: true,
            model: true,
            publicPrice: true,
            sold: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Conversación creada exitosamente",
      conversation,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
