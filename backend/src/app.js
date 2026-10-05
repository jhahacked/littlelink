import express from "express";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { cors } from "./middleware/cors.js";
import urlRoutes from "./routes/url.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

const app = express();
app.disable("x-powered-by");
app.use(cors);
app.use(express.json());
if (process.env.NODE_ENV === "production") {
    const frontendDistPath = fileURLToPath(
        new URL("../../frontend/dist", import.meta.url)
    );
    const frontendIndexPath = resolve(frontendDistPath, "index.html");

    app.use(express.static(frontendDistPath));
    app.get(
        ["/login", "/stats", "/stats/:shortId", "/links"],
        (req, res, next) => {
            res.sendFile(frontendIndexPath, (error) => {
                if (error) next(error);
            });
        }
    );
}
app.use(healthRoutes);
app.use(authRoutes);
app.use(urlRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
