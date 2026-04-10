"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center text-center px-6">
        <div className="absolute inset-0">
          <Image
            src="/images/hero1.jpg"
            alt="Smart Parking"
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            ACCESO TOTAL
          </h1>

          <h2 className="text-2xl md:text-3xl font-semibold text-[#1e8391] mb-6">
            Control de acceso inteligente
          </h2>

          <p className="text-lg text-gray-300 mb-6">
            Software + hardware en una sola plataforma para controlar accesos, pagos y flujo vehicular en tiempo real.
          </p>

          <p className="text-sm text-gray-400 mb-8">
            QR · Estacionamiento · Control · Conexión
          </p>

          <div className="flex gap-4 justify-center">
            <button className="primary-button text-white px-8 py-6 text-lg rounded-2xl shadow-lg cursor-pointer">
              Solicitar demo
            </button>

            <button className="px-8 py-6 text-lg rounded-2xl cursor-pointer">
              Ver solución
            </button>
          </div>
        </motion.div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-16 text-center border-t border-zinc-800">
        <p className="text-gray-400 mb-6">Diseñado para empresas modernas</p>
        <div className="flex flex-wrap justify-center gap-10 opacity-70">
          <span>Plazas</span>
          <span>Corporativos</span>
          <span>Hospitales</span>
          <span>Residenciales</span>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Control en tiempo real",
              desc: "Monitorea entradas y salidas con dashboards inteligentes y métricas en vivo.",
            },
            {
              title: "Pagos integrados",
              desc: "Acepta efectivo, tarjeta y pagos digitales automatizados desde la app.",
            },
            {
              title: "Acceso con QR",
              desc: "Entrada y salida sin fricción usando códigos QR desde el celular.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-zinc-900 p-6 rounded-2xl shadow-xl hover:scale-105 transition"
            >
              <h3 className="text-xl font-bold mb-3 text-[#1e8391] ">
                {item.title}
              </h3>
              <p className="text-gray-300">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRODUCT VISUAL */}
      <section className="py-24 bg-zinc-950 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Todo en una sola plataforma
            </h2>
            <p className="text-gray-300 mb-6">
              Controla accesos, administra pagos y supervisa operaciones desde una interfaz web moderna conectada con dispositivos físicos.
            </p>
            <button className="primary-button">Ver dashboard</button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="rounded-2xl overflow-hidden shadow-2xl"
          >
            <Image
              src="/images/image1.jpg"
              alt="Dashboard"
              width={800}
              height={600}
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12">Flujo simple, potente</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {["Escanea QR", "Sistema registra", "Salida y pago automático"].map(
            (step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-zinc-900 p-6 rounded-xl"
              >
                <div className="text-[#1e8391] text-xl font-bold mb-2">
                  {i + 1}
                </div>
                <p className="text-gray-300">{step}</p>
              </motion.div>
            )
          )}
        </div>
      </section>

      {/* FUTURE */}
      <section className="py-24 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-center px-6">
        <h2 className="text-4xl font-bold mb-6">El futuro del acceso</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Próximamente: control de empleados con biometría, reconocimiento facial y automatización avanzada.
        </p>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <h2 className="text-4xl font-bold mb-6">¿Listo para modernizar tu acceso?</h2>
        <button className="bg-[#1e8391] hover:bg-[#16525a] px-10 py-6 text-lg rounded-2xl shadow-lg cursor-pointer">
          Contáctanos
        </button>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-500 text-sm border-t border-zinc-800">
        © {new Date().getFullYear()} NexoTech.mx — Todos los derechos reservados
      </footer>
    </main>
  );
}
