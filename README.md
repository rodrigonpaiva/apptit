# 🍽️ Apptit - FoodTech SaaS for Collective Catering

Apptit is a **FoodTech SaaS** designed for **collective catering**.  
Its mission is to **digitize and optimize** stock management, order forecasting, sanitary compliance, and sustainability reporting, bringing **simplicity and intelligence** to professional kitchens.

---

## 📂 Monorepo Structure

The project is organized as a **monorepo** using **Turborepo**.  
Current structure:

apptit/
├─ apps/
│  ├─ api-gateway/       # GraphQL Gateway (BFF)
│  ├─ auth/              # Authentication microservice
│  └─ users/             # User management microservice
│
├─ packages/
│  ├─ @apptit/common/    # Decorators, DTOs, Guards, Interfaces, Pipes, Utils
│  ├─ @apptit/config/    # Centralized configuration (.env, Redis, DB, services)
│  ├─ @apptit/prisma/    # Shared Prisma client (MongoDB)
│  ├─ @apptit/eslint-config/     # Shared ESLint configuration
│  ├─ @apptit/typescript-config/ # Shared TS configs (base, NestJS, Next.js, React)
│  └─ @apptit/ui/                # Shared UI components

---

## 🚀 Tech Stack

- **Backend**
  - [NestJS](https://nestjs.com/) (microservices mode)
  - **GraphQL** at the Gateway
  - Inter-service communication via **Redis** (RPC + Streams)
  - **Prisma ORM** + **MongoDB**
  - **Kafka** (planned for event streaming)

- **Frontend**
  - [Next.js](https://nextjs.org/) (web)
  - [React Native](https://reactnative.dev/) (mobile)

- **Infrastructure**
  - **Docker & Docker Compose**
  - **CI/CD with GitHub Actions**
  - **Dedicated VPS**

- **Additional Tools**
  - **Tesseract.js** (OCR for invoices/labels)
  - **JWT** (authentication)
  - **TailwindCSS** (UI styling)
  - **Open Food Facts API** (product metadata)

---

## 📌 MVP Features

- 🔑 **Authentication & accounts** *(in progress)* 
- 👥 **User & role management** *(in progress)* 
- 🏢 **Organization / tenant management** *(planned)*  
- 🛒 **Product & multi-stock management** *(in progress)*  
- 📦 **Procurement & menus** *(planned)*  
- 🌡️ **IoT monitoring & HACCP compliance** *(planned)*  
- 📊 **Order & consumption forecasting** *(planned)*  
- 📩 **Notifications (e-mail / SMS)** *(planned)*  
- 📑 **Reporting & dashboards** *(planned)*  

---

## 🧩 Internal Packages Implemented

- `@apptit/common` → global abstractions (DTOs, guards, decorators, utils)  
- `@apptit/config` → strongly-typed environment configuration  
- `@apptit/prisma` → centralized MongoDB connection for all microservices  
- `@apptit/eslint-config` 
- `@apptit/typescript-config` 
- `@apptit/ui`  

---

## 🛠️ Project Setup

### Requirements
- Node.js (>= 20.x)  
- npm  
- Docker & Docker Compose  
- MongoDB  
- Redis  

### Installation

```bash
# Install dependencies
npm install

# Run all services with Docker
docker-compose up -d

# Run in development mode
npm run dev


⸻

📊 MVP Architecture

flowchart LR
    subgraph Gateway
      G[GraphQL Gateway]
    end

    subgraph Services
      A[Auth] --> R[(Redis)]
      U[Users] --> R
    end

    subgraph Data
      M[(MongoDB)]
    end

    G --> R
    R --> M


⸻

🧾 Current Progress
	•	✅ Monorepo setup with Turborepo
	•	⏳ Created microservices auth and users
	•	🔄  Implemented GraphQL Gateway
	•	🔄 Integrated with MongoDB + Prisma
	•	🔄 Inter-service communication via Redis RPC
	•	🔄 Initial Docker Compose setup
	•	🔄 CI/CD pipeline with GitHub Actions
	•	🔄 Developing design system (UI / Figma)
	•	🔄 Writing the Professional Dossier (École Studi final project)
	•	🔮 Next: services products, inventory, tenants, IoT

⸻

📚 References
	•	NestJS Microservices
	•	GraphQL
	•	Prisma ORM
	•	Open Food Facts

⸻

👤 Author

Rodrigo Paiva
CEO & Creator of Apptit
[LinkedIn](https://www.linkedin.com/in/rodrigonpaiva/) | [GitHub](https://github.com/rodrigonpaiva)