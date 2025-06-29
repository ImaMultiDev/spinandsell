"use client";

import { Conversation } from "@/types";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export default function ConversationsList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ConversationsListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400 dark:text-gray-500"
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
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            No hay conversaciones
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Inicia una conversación desde los productos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`
            p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer
            hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
            ${
              selectedConversationId === conversation.id
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                : ""
            }
          `}
        >
          <div className="flex items-start space-x-3">
            {/* Avatar del otro usuario */}
            <div className="flex-shrink-0">
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
                    {conversation.otherParticipant.name
                      ?.charAt(0)
                      .toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                {/* Nombre del usuario */}
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {conversation.otherParticipant.name || "Usuario"}
                </h3>

                {/* Tiempo del último mensaje */}
                {conversation.lastMessageAt && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                    {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                )}
              </div>

              {/* Información del producto */}
              {conversation.product && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                  {conversation.product.brand} {conversation.product.model} - €
                  {conversation.product.publicPrice}
                </p>
              )}

              {/* Último mensaje */}
              {conversation.lastMessage ? (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                  {conversation.lastMessage.content}
                </p>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 italic">
                  Conversación iniciada
                </p>
              )}
            </div>

            {/* Indicador de mensajes no leídos */}
            {conversation.lastMessage &&
              conversation.lastMessage.readAt === null &&
              conversation.lastMessage.senderId !== "current-user-id" && (
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
