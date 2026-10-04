import express from "express";
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { cors } from "./middleware/cors.js";
import urlRoutes from "./routes/url.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

const app = express();
app.disable("x-powered-by");
app.use(cors);
app.use(express.json());
app.use(healthRoutes);
app.use(authRoutes);
app.use(urlRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
