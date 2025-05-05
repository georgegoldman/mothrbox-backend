# Build stage
FROM node:lts-alpine AS builder
 
USER root
WORKDIR /home/node
 
# Install pnpm globally
RUN npm install -g pnpm

COPY package*.json .
RUN pnpm install
 
COPY --chown=node:node . .
RUN npm run build
 
# Final run stage
FROM node:lts-alpine
 
ENV NODE_ENV=production
USER node
WORKDIR /home/node
 
COPY --from=builder --chown=node:node /home/node/package*.json .
COPY --from=builder --chown=node:node /home/node/node_modules ./node_modules
COPY --from=builder --chown=node:node /home/node/dist ./dist
 
ARG NEST_PORT
EXPOSE ${NEST_PORT:-3000}
 
CMD ["node", "dist/main.js"]