FROM gcr.io/distroless/nodejs:18
USER root
USER apprunner

COPY assets ./assets
COPY backend ./backend
COPY frontend_production ./frontend_production

# Må kopiere package.json og node_modules for at backend skal fungere. Backend henter avhengigheter runtime fra node_modules, og package.json trengs for at 'import' statements skal fungere.
COPY node_modules ./node_modules
COPY package.json .

CMD ["--es-module-specifier-resolution=node", "backend/backend/server.js"]