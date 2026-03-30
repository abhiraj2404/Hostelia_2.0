import swaggerUi from "swagger-ui-express";
import { buildOpenApiSpec } from "../api-docs/openapi.js";

function resolveServerUrl(req) {
  const configured = process.env.SWAGGER_SERVER_URL;
  if (configured) {
    return configured;
  }

  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
}

export function setupSwagger(app) {
  app.get("/api/docs.json", (req, res) => {
    const spec = buildOpenApiSpec(resolveServerUrl(req));
    res.setHeader("Content-Type", "application/json");
    res.send(spec);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(null, {
      swaggerOptions: {
        url: "/api/docs.json",
        persistAuthorization: true,
        displayRequestDuration: true,
        requestInterceptor: (request) => {
          request.credentials = "include";
          return request;
        },
      },
      customSiteTitle: "Hostelia API Docs",
      explorer: true,
    })
  );
}
