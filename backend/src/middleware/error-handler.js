export const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

export const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const isMalformedJson = error.type === "entity.parse.failed";
    const isDuplicateKey = error.code === 11000;
    const statusCode = isMalformedJson
        ? 400
        : isDuplicateKey
          ? 409
          : error.statusCode || 500;

    if (statusCode >= 500) {
        console.error("Unhandled request error:", error);
    }

    const message = isMalformedJson
        ? "Request body contains invalid JSON"
        : isDuplicateKey
          ? "A record with this value already exists"
          : statusCode >= 500
            ? "Internal server error"
            : error.message;

    return res.status(statusCode).json({ message });
};
