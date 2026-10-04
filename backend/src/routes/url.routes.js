import express from "express";
import {
    createShortUrl,
    getShortUrlClicks,
    listMyShortUrls,
    redirectToOriginalUrl,
    deleteExpiredShortUrl,
} from "../controllers/url.controller.js";
import { requireTrustedOrigin } from "../middleware/cors.js";
import requireAuth from "../middleware/require-auth.js";

const router = express.Router();

router.post("/api/createshorturl", requireTrustedOrigin, requireAuth, createShortUrl);
router.get("/api/my/urls", requireAuth, listMyShortUrls);
router.get("/api/shorturl/:shortId/clicks", getShortUrlClicks);
router.delete(
    "/api/shorturl/:shortId",
    requireTrustedOrigin,
    requireAuth,
    deleteExpiredShortUrl
);
router.get("/:shortId", redirectToOriginalUrl);

export default router;
