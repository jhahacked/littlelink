import AppError from "../utils/app-error.js";

const DEFAULT_ORIGINS = ["http://localhost:5173"];

export const getAllowedOrigins = () => {
    const configuredOrigins = process.env.FRONTEND_ORIGINS
        ?.split(",")
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean);

    return new Set(configuredOrigins?.length ? configuredOrigins : DEFAULT_ORIGINS);
};

export const cors = (req, res, next) => {
    const origin = req.get("origin");
    if (origin) {
        res.vary("Origin");
        if (getAllowedOrigins().has(origin)) {
            res.set("Access-Control-Allow-Origin", origin);
            res.set("Access-Control-Allow-Credentials", "true");
            res.set("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
            res.set("Access-Control-Allow-Headers", "Content-Type");
            res.set("Access-Control-Max-Age", "600");
        }
    }

    if (req.method === "OPTIONS") {
        return res.sendStatus(origin && !getAllowedOrigins().has(origin) ? 403 : 204);
    }

    return next();
};

export const requireTrustedOrigin = (req, res, next) => {
    const origin = req.get("origin");
    if (!origin || !getAllowedOrigins().has(origin)) {
        throw new AppError(403, "Request origin is not allowed");
    }
    return next();
};
