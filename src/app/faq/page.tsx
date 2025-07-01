"use client";

import { useState } from "react";
import Link from "next/link";

const faqData = [
  {
    category: "Comprar",
    questions: [
      {
        question: "¿Cómo puedo comprar un producto?",
        answer:
          "Busca el producto que te interesa, haz clic en 'Comprar ahora', completa el pago con Stripe y listo. Recibirás un email de confirmación y podrás contactar con el vendedor.",
      },
      {
        question: "¿Es seguro el pago?",
        answer:
          "Sí, utilizamos Stripe como procesador de pagos, que es uno de los sistemas más seguros del mundo. Tus datos están completamente protegidos.",
      },
      {
        question: "¿Qué pasa si el producto no es como se describe?",
        answer:
          "Puedes contactar con nosotros en las primeras 48h. Mediamos entre comprador y vendedor para resolver cualquier problema.",
      },
      {
        question: "¿Puedo cancelar una compra?",
        answer:
          "Una vez completado el pago, debes contactar directamente con el vendedor. Si no hay acuerdo, puedes contactar con soporte.",
      },
    ],
  },
  {
    category: "Vender",
    questions: [
      {
        question: "¿Cómo vendo mi producto?",
        answer:
          "Regístrate, ve a 'Vender', sube fotos de calidad, describe tu producto honestamente y establece un precio competitivo.",
      },
      {
        question: "¿Cuánto cobráis de comisión?",
        answer:
          "Cobramos un 5% del precio de venta solo cuando se completa la transacción. Publicar es completamente gratis.",
      },
      {
        question: "¿Cuándo recibo el dinero?",
        answer:
          "El dinero se procesa automáticamente tras la venta. Recibes el 95% del precio de venta (descontando nuestra comisión del 5%).",
      },
      {
        question: "¿Puedo editar mi producto después de publicarlo?",
        answer:
          "Sí, puedes editar precio, descripción e imágenes desde tu panel 'Mis Productos' en cualquier momento.",
      },
    ],
  },
  {
    category: "Cuenta y Seguridad",
    questions: [
      {
        question: "¿Cómo me registro?",
        answer:
          "Puedes registrarte con tu email o usando tu cuenta de Google. Es rápido y seguro.",
      },
      {
        question: "¿Cómo cambio mi contraseña?",
        answer:
          "Ve a tu perfil > Configuración > Cambiar contraseña. También puedes usar 'Olvidé mi contraseña' en el login.",
      },
      {
        question: "¿Verificáis a los usuarios?",
        answer:
          "Todos los usuarios deben verificar su email. Además, tenemos sistemas automáticos para detectar actividad sospechosa.",
      },
      {
        question: "¿Puedo eliminar mi cuenta?",
        answer:
          "Sí, contacta con soporte y eliminaremos tu cuenta y todos tus datos según GDPR.",
      },
    ],
  },
  {
    category: "Productos",
    questions: [
      {
        question: "¿Qué tipos de productos puedo vender/comprar?",
        answer:
          "Bicicletas de carretera, montaña, spinning, eléctricas y patinetes eléctricos. Todos deben estar en buen estado.",
      },
      {
        question: "¿Qué significan los estados A, B, C?",
        answer:
          "Estado A: Excelente (como nuevo), Estado B: Bueno (signos leves de uso), Estado C: Aceptable (signos visibles pero funcional).",
      },
      {
        question: "¿Cuántas fotos puedo subir?",
        answer:
          "Hasta 8 fotos por producto. Recomendamos mostrar el producto desde todos los ángulos.",
      },
      {
        question: "¿Hay restricciones de precio?",
        answer:
          "El precio mínimo es 10€ y el máximo 10.000€. Recomendamos investigar precios similares antes de publicar.",
      },
    ],
  },
  {
    category: "Entrega y Envío",
    questions: [
      {
        question: "¿SpinAndSell gestiona envíos?",
        answer:
          "No, la entrega se coordina directamente entre comprador y vendedor a través de nuestro sistema de mensajes.",
      },
      {
        question: "¿Qué opciones de entrega hay?",
        answer:
          "Recogida en persona, envío por cuenta del comprador, o envío por cuenta del vendedor. Se acuerda en el chat.",
      },
      {
        question: "¿Qué pasa si hay problemas con la entrega?",
        answer:
          "Contacta con soporte inmediatamente. Mediamos para resolver cualquier problema de entrega.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const categories = ["all", ...faqData.map((section) => section.category)];

  const filteredData =
    selectedCategory === "all"
      ? faqData
      : faqData.filter((section) => section.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Encuentra respuestas a las preguntas más comunes sobre SpinAndSell
            </p>

            {/* Filtros por categoría */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border"
                  }`}
                >
                  {category === "all" ? "Todas" : category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Content */}
          <div className="space-y-8">
            {filteredData.map((section) => (
              <div
                key={section.category}
                className="bg-white rounded-lg shadow-sm"
              >
                <div className="border-b border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {section.category}
                  </h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {section.questions.map((faq, index) => {
                    const itemId = `${section.category}-${index}`;
                    const isOpen = openItems.includes(itemId);

                    return (
                      <div key={itemId} className="p-6">
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="flex justify-between items-center w-full text-left"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          <div className="flex-shrink-0">
                            <svg
                              className={`w-5 h-5 transition-transform ${
                                isOpen ? "transform rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </button>

                        {isOpen && (
                          <div className="mt-4 text-gray-600">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 bg-green-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¿No encuentras la respuesta que buscas?
            </h2>
            <p className="text-gray-600 mb-6">
              Nuestro equipo de soporte está aquí para ayudarte con cualquier
              pregunta
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contacto">
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Contactar Soporte
                </button>
              </Link>
              <a
                href="mailto:support@spinandsell.com"
                className="bg-white text-green-600 border border-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                Enviar Email
              </a>
            </div>
          </div>

          {/* Enlaces útiles */}
          <div className="mt-12 text-center text-gray-500">
            <p className="mb-4">Enlaces útiles:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/terminos" className="hover:text-green-600">
                Términos y Condiciones
              </Link>
              <span>•</span>
              <Link
                href="/politica-privacidad"
                className="hover:text-green-600"
              >
                Política de Privacidad
              </Link>
              <span>•</span>
              <Link href="/productos" className="hover:text-green-600">
                Ver Productos
              </Link>
              <span>•</span>
              <Link href="/vender" className="hover:text-green-600">
                Vender Producto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
