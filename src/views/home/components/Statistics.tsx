export default function Statistics() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
            <div className="text-gray-600">Productos Vendidos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
            <div className="text-gray-600">Usuarios Activos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
            <div className="text-gray-600">Satisfacción</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">24h</div>
            <div className="text-gray-600">Respuesta Media</div>
          </div>
        </div>
      </div>
    </section>
  );
}
