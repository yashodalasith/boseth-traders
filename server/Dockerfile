FROM node:18-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Install production deps only
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

EXPOSE 5000
CMD ["node", "index.js"]
