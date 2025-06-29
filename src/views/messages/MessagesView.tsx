"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Conversation, ConversationWithMessages } from "@/types";
import ConversationsList from "./components/ConversationsList";
import ChatWindow from "./components/ChatWindow";

export default function MessagesView() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Cargar conversaciones
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations");

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al cargar conversaciones");
      }
    } catch {
      toast.error("Error al cargar conversaciones");
    } finally {
      setIsLoading(false);
    }
  };

  // Seleccionar conversación y cargar mensajes
  const handleSelectConversation = async (conversation: Conversation) => {
    try {
      const response = await fetch(
        `/api/conversations/${conversation.id}/messages`
      );

      if (response.ok) {
        const messages = await response.json();

        setSelectedConversation({
          ...conversation,
          messages,
        });

        if (isMobile) {
          setShowChat(true);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al cargar mensajes");
      }
    } catch {
      toast.error("Error al cargar mensajes");
    }
  };

  // Enviar mensaje
  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    try {
      const response = await fetch(
        `/api/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (response.ok) {
        const { data: newMessage } = await response.json();

        // Actualizar mensajes de la conversación seleccionada
        setSelectedConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, newMessage],
              }
            : null
        );

        // Actualizar la lista de conversaciones
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  lastMessage: newMessage,
                  lastMessageAt: newMessage.createdAt,
                }
              : conv
          )
        );
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al enviar mensaje");
      }
    } catch {
      toast.error("Error al enviar mensaje");
    }
  };

  // Volver a la lista (móvil)
  const handleBackToList = () => {
    setShowChat(false);
    setSelectedConversation(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Cargando conversaciones...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="flex h-[600px]">
            {/* Lista de conversaciones */}
            {(!isMobile || !showChat) && (
              <div
                className={`${isMobile ? "w-full" : "w-1/3"} border-r border-gray-200 dark:border-gray-700`}
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Mensajes
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {conversations.length} conversación
                    {conversations.length !== 1 ? "es" : ""}
                  </p>
                </div>

                <ConversationsList
                  conversations={conversations}
                  selectedConversationId={selectedConversation?.id || null}
                  onSelectConversation={handleSelectConversation}
                />
              </div>
            )}

            {/* Ventana de chat */}
            {(!isMobile || showChat) && (
              <div className={`${isMobile ? "w-full" : "flex-1"}`}>
                {selectedConversation ? (
                  <ChatWindow
                    conversation={selectedConversation}
                    onSendMessage={handleSendMessage}
                    onBack={isMobile ? handleBackToList : undefined}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400 dark:text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Selecciona una conversación
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Elige una conversación para empezar a chatear
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
