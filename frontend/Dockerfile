FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Vite default port
EXPOSE 5173

# Run in dev mode with host binding so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]
