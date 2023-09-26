FROM gcr.io/distroless/nodejs:18
USER root
USER apprunner

COPY node_dist ./node_dist
COPY frontend_production ./frontend_production

CMD ["--es-module-specifier-resolution=node", "node_dist/backend/server.js"]