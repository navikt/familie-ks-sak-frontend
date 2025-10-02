FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24

WORKDIR /app

COPY dist/backend ./backend
COPY dist/frontend ./frontend
COPY assets ./assets

# Må kopiere package.json og node_modules for at backend skal fungere. Backend henter avhengigheter runtime fra node_modules, og package.json trengs for at 'import' statements skal fungere.
COPY node_modules ./node_modules
COPY package.json .

CMD ["backend/server.js"]