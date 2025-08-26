FROM node:18-alpine

WORKDIR /app

# Copiar package.json primero para cache
COPY package*.json ./
RUN npm install --production

# Copiar el resto de la aplicación
COPY . .

# Exponer puerto
EXPOSE 3000

# Iniciar aplicación
CMD ["npm", "start"]