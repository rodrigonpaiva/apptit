# Apptit

## 🚀 Badges

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-20232A?logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![Kafka](https://img.shields.io/badge/Kafka-231F20?logo=apachekafka&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-000000?logo=vercel&logoColor=white)

---

## 📘 Description

**Apptit** is an intelligent system for managing kitchens and inventories in the **collective catering** sector.

- Created to solve issues like food waste, lack of traceability, and low efficiency in managing supplies and meal planning.
- Built with modern technologies such as **NestJS**, **Next.js**, **React Native**, **MongoDB**, **Kafka**, and **Redis**, all structured in a **monorepo using Turborepo**.
- Developed to provide real-time control, task automation, smart recipe suggestions, and consumption forecasting using data.

---

## 🛠️ Installation Instructions

### ✅ Prerequisites

- Node.js v18+
- NPM
- Docker + Docker Compose
- MongoDB (local or Atlas)
- Kafka + Zookeeper (or Redpanda)
- Redis

### 📦 Steps

1.Clone the repository:

```bash
git clone https://github.com/youruser/apptit.git
cd apptit
```

2.Install monorepo dependencies:
```bash
npm install
```
3.Start the necessary containers (Mongo, Kafka, Redis):
```bash
docker-compose up -d
```
4.Run services using Turborepo:
```bash
npx turbo run dev
```
Or run individual apps:
```bash
npx turbo run dev --filter=gateway
npx turbo run dev --filter=web
npx turbo run dev --filter=mobile
```
---

## 📲 Usage Instructions
 • Access the admin dashboard via your browser at <http://localhost:3000>
 • Use the mobile app to log entries, audits, and field operations
 • The system scans product labels using OCR and retrieves metadata from Open Food Facts
 • The backend (Gateway + Microservices) orchestrates business logic via GraphQL and Kafka

### Main features:
 • Inventory Management
 • Expiration Alerts and Anomaly Detection
 • Audit Trails and Traceability
 • Meal Forecasting Based on History
 • AI-Powered Recipe Suggestions
 • Internal Product Marketplace

---

## 📄 License

This is a private project and protected by copyright.
All rights reserved © Rodrigo Paiva – 2025.

---

## 👤 Owner and Contributors
 • Rodrigo Paiva – Creator and CEO of Apptit
 • Deborah Malheiro – Frontend Developer
@debsmalheiro

---

## 🙏 Acknowledgments
 • Open Food Facts (open food metadata)
 • All engineers, testers, and collaborators who contributed.