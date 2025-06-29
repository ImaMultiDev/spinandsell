"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ConversationWithMessages } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ChatWindowProps {
  conversation: ConversationWithMessages;
  onSendMessage: (content: string) => void;
  onBack?: () => void;
}

export default function ChatWindow({
  conversation,
  onSendMessage,
  onBack,
}: ChatWindowProps) {
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Función auxiliar para determinar si el mensaje es del usuario actual
  const isCurrentUserMessage = (senderId: string) => {
    // Temporal: determinar mensajes propios por email hasta resolver tipos de NextAuth
    const userEmail = session?.user?.email;
    return senderId === userEmail; // Comparación temporal usando email
  };

  // Scroll al final cuando lleguen nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      await onSendMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          {/* Botón de volver (móvil) */}
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
            {conversation.otherParticipant.image ? (
              <Image
                src={conversation.otherParticipant.image}
                alt={conversation.otherParticipant.name || "Usuario"}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {conversation.otherParticipant.name?.charAt(0).toUpperCase() ||
                  "U"}
              </span>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {conversation.otherParticipant.name || "Usuario"}
            </h2>
            {conversation.product && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {conversation.product.brand} {conversation.product.model}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Aún no hay mensajes. ¡Envía el primero!
              </p>
            </div>
          </div>
        ) : (
          <>
            {conversation.messages.map((message) => {
              const isOwn = isCurrentUserMessage(message.senderId);

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex max-w-xs lg:max-w-md">
                    {!isOwn && (
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-2 flex-shrink-0">
                        {message.sender.image ? (
                          <Image
                            src={message.sender.image}
                            alt={message.sender.name || "Usuario"}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {message.sender.name?.charAt(0).toUpperCase() ||
                              "U"}
                          </span>
                        )}
                      </div>
                    )}

                    <div
                      className={`
                        px-4 py-2 rounded-lg break-words
                        ${
                          isOwn
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm"
                        }
                      `}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`
                          text-xs mt-1 
                          ${
                            isOwn
                              ? "text-blue-100"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        `}
                      >
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Formulario de envío */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              maxLength={1000}
              rows={1}
              disabled={isSending}
              className="
                w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                dark:bg-gray-700 dark:text-white resize-none
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="
              px-4 py-2 bg-blue-600 text-white rounded-lg font-medium
              hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors flex items-center
            "
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Enviar
              </>
            )}
          </button>
        </form>

        {newMessage.length > 900 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {1000 - newMessage.length} caracteres restantes
          </p>
        )}
      </div>
    </div>
  );
}
