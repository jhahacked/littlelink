import * as urlService from "../services/url.service.js";
import AppError from "../utils/app-error.js";

export const createShortUrl = async (req, res) => {
    const originalUrl = req.body?.originalUrl;
    const expiresAtValue = req.body?.expiresAt;

    if (typeof originalUrl !== "string" || !originalUrl.trim()) {
        throw new AppError(400, "originalUrl is required");
    }

    let expiresAt;
    if (expiresAtValue !== undefined) {
        if (typeof expiresAtValue !== "string" || !expiresAtValue.trim()) {
            throw new AppError(400, "expiresAt must be a valid future date");
        }

        expiresAt = new Date(expiresAtValue);
        if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
            throw new AppError(400, "expiresAt must be a valid future date");
        }
    }

    const normalizedUrl = originalUrl.trim();
    const shortUrl = await urlService.createShortUrl(
        normalizedUrl,
        expiresAt,
        req.userId
    );
    return res.status(201).json(shortUrl);
};

export const listMyShortUrls = async (req, res) => {
    const urls = await urlService.getUserShortUrls(req.userId);
    return res.json({ urls });
};

export const getShortUrlClicks = async (req, res) => {
    const shortUrl = await urlService.getShortUrlClicks(req.params.shortId);
    return res.json({
        shortId: shortUrl.short_url,
        clicks: shortUrl.clicks,
    });
};

export const redirectToOriginalUrl = async (req, res) => {
    const shortUrl = await urlService.incrementClicksAndGetUrl(
        req.params.shortId
    );
    return res.redirect(shortUrl.shortUrl.full_url);
};

export const deleteExpiredShortUrl = async (req, res) => {
    await urlService.deleteExpiredShortUrl(req.params.shortId, req.userId);
    return res.json({ message: "Expired short URL deleted" });
};
