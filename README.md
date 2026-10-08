# REXJAR - Sistema de Referencia de Tarifas de Taxi y Rendición de Cuentas

[![Project Status: Initialized](https://img.shields.io/badge/Status-MVP_Initialized-blue.svg)](#)

## 📌 Descripción General
**REXJAR** es una solución híbrida B2C/B2B que optimiza la rendición de viáticos de colaboradores en campo (Front-Office) y provee a las empresas (Back-Office B2B) un motor de auditoría financiera apoyado en un **Core Referencial Geoespacial de Tarifas de Taxi** basado en la cuadrícula de celdas hexagonales **H3** y ruteo **OSRM**.

---

## 🏗️ Estructura del Monorepo

```
rexjar/
├── apps/
│   ├── mobile-pwa/        # Front-Office PWA Móvil para Colaboradores en Campo
│   ├── web-dashboard/     # Back-Office B2B Desktop para Auditores y CFOs
│   └── backend-api/       # API Core Transaccional, Colas y Servicio H3
├── packages/
│   ├── shared-types/      # DTOs y tipos compartidos de TypeScript
│   └── h3-geo-utils/      # Utilidades geoespaciales H3 y cálculo de T_base
├── docker/
│   ├── postgres/          # Init script de base de datos con esquemas OLTP y OLAP
│   ├── osrm/              # Motor de ruteo autoalojado
│   └── docker-compose.yml # Entorno local de Docker (PostgreSQL, Redis, OSRM)
└── docs/                  # Especificaciones técnicas y de arquitectura
```

---

## 🚀 Guía de Inicio Rápido

### 1. Iniciar Servicios de Infraestructura (Docker)
```bash
npm run docker:up
```

### 2. Instalar Dependencias del Monorepo
```bash
npm install
```

### 3. Iniciar Aplicaciones en Desarrollo
```bash
# Iniciar Backend API (Puerto 4000)
cd apps/backend-api && npm run dev

# Iniciar Mobile PWA (Vite - Puerto 5173)
cd apps/mobile-pwa && npm run dev

# Iniciar B2B Web Dashboard (Vite - Puerto 5174)
cd apps/web-dashboard && npm run dev
```

---

## 🛡️ Principios Arquitectónicos Clave

1. **Segregación Estricta de Dominios (Zero PII):**
   * `corp_expense` (OLTP): Base transaccional aislada por empresa mediante PostgreSQL Row Level Security (RLS).
   * `mobility_intelligence` (OLAP): Eventos de movilidad anónimos sin claves foráneas a datos de usuarios o comprobantes (Garantía Legal GDPR / k-anonimato).
2. **Offline-First & Graceful Degradation:**
   * Encolado local en móvil vía **IndexedDB** (`Dexie.js`).
   * Reducción de imágenes en cliente para evitar fallos de memoria en móviles gama baja.
3. **Flujo Express en 3 Pasos:**
   * Experiencia táctil acelerada con chips para peajes, espera y parking (< 10 segundos).
