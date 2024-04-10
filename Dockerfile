FROM gcr.io/distroless/nodejs20-debian12:nonroot

#WORKDIR /var/server

COPY --chown=nonroot:nonroot assets ./assets
COPY --chown=nonroot:nonroot backend ./backend
COPY --chown=nonroot:nonroot frontend_production ./frontend_production

# Må kopiere package.json og node_modules for at backend skal fungere. Backend henter avhengigheter runtime fra node_modules, og package.json trengs for at 'import' statements skal fungere.
COPY --chown=nonroot:nonroot node_modules ./node_modules
COPY --chown=nonroot:nonroot package.json .

CMD ["--import=./backend/backend/register.js", "--es-module-specifier-resolution=node", "backend/backend/server.js"]