FROM node:18-alpine

# Define o diretório raiz
WORKDIR /app

# Copia arquivos essenciais do monorepo
COPY package.json package-lock.json turbo.json ./

# Copia apenas os package.json necessários para instalar dependências
COPY apps/api/package.json apps/api/package.json
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY apps/landing/package.json apps/landing/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json

# Instala dependências do monorepo
RUN npm install --frozen-lockfile

# Copia o restante do código
COPY . .

# Muda para a pasta da API
WORKDIR /app/apps/api

# Compila a aplicação
RUN npm run build

# Expõe a porta usada pela API
EXPOSE 8000

# Define o comando de inicialização
CMD ["node", "dist/main.js"]