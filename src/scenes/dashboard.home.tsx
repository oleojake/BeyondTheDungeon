import React from "react";

export const DashboardHome: React.FC = () => {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-primary/30 to-accent/20 p-6 shadow-xl">
        <h1 className="text-2xl font-extrabold text-white">Resumen rápido</h1>
        <p className="mt-2 text-sm text-gray-300">
          Métricas principales y accesos.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-dark-card border border-dark-border p-4 shadow-md">
          <div className="text-sm text-gray-300">Usuarios activos</div>
          <div className="mt-2 text-3xl font-bold text-white">1.234</div>
        </div>

        <div className="rounded-xl bg-dark-card border border-dark-border p-4 shadow-md">
          <div className="text-sm text-gray-300">Nuevas sesiones</div>
          <div className="mt-2 text-3xl font-bold text-white">532</div>
        </div>

        <div className="rounded-xl bg-dark-card border border-dark-border p-4 shadow-md">
          <div className="text-sm text-gray-300">Conversiones</div>
          <div className="mt-2 text-3xl font-bold text-white">84</div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-dark-card border border-dark-border p-4 shadow-lg min-h-[220px]">
          <h3 className="text-white font-semibold">Actividad reciente</h3>
          <div className="mt-3 text-sm text-gray-300">
            Últimos eventos del sistema y logs recientes.
          </div>
        </div>

        <div className="rounded-2xl bg-dark-card border border-dark-border p-4 shadow-lg min-h-[220px]">
          <h3 className="text-white font-semibold">Tareas</h3>
          <div className="mt-3 text-sm text-gray-300">
            Estado de tareas y recordatorios.
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;
