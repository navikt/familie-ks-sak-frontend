FROM gcr.io/distroless/nodejs:18
USER root
USER apprunner

COPY assets ./assets
COPY backend ./backend
COPY frontend_production ./frontend_production
COPY node_modules ./node_modules
COPY package.json .

CMD ["--es-module-specifier-resolution=node", "backend/backend/server.js"]