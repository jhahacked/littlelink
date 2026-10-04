import { nanoid } from "nanoid";
import * as urlDao from "../daos/url.dao.js";
import AppError from "../utils/app-error.js";

export const createShortUrl = async (originalUrl, expiresAt, userId) => {
    const shortId = nanoid(7);

    const record = await urlDao.createShortUrlRecord({
        full_url: originalUrl,
        short_url: shortId,
        clicks: 0,
        user: userId,
        ...(expiresAt ? { expires_at: expiresAt } : {}),
    });

    return {
        originalUrl,
        shortId,
        ...(record.expires_at ? { expiresAt: record.expires_at } : {}),
        createdAt: record.createdAt,
    };
};

export const getUserShortUrls = async (userId) => {
    const records = await urlDao.findUserShortUrls(userId);
    return records.map((record) => ({
        originalUrl: record.full_url,
        shortId: record.short_url,
        clicks: record.clicks,
        ...(record.expires_at ? { expiresAt: record.expires_at } : {}),
        createdAt: record.createdAt,
    }));
};

export const getShortUrlClicks = async (shortId) => {
    const shortUrl = await urlDao.findClicksByShortId(shortId);
    if (!shortUrl) {
        throw new AppError(404, "Short URL not found");
    }

    return shortUrl;
};

export const incrementClicksAndGetUrl = async (shortId) => {
    const shortUrl = await urlDao.incrementClicksByShortId(shortId);
    if (shortUrl) {
        return { status: "active", shortUrl };
    }

    const existingShortUrl = await urlDao.findShortUrlById(shortId);
    if (
        existingShortUrl?.expires_at &&
        existingShortUrl.expires_at <= new Date()
    ) {
        throw new AppError(410, "Short URL has expired");
    }

    throw new AppError(404, "Short URL not found");
};

export const deleteExpiredShortUrl = async (shortId, userId) => {
    const deletedShortUrl = await urlDao.deleteExpiredByShortId(shortId, userId);
    if (deletedShortUrl) {
        return;
    }

    const existingShortUrl = await urlDao.findUserShortUrlById(shortId, userId);
    if (!existingShortUrl) {
        throw new AppError(404, "Short URL not found");
    }

    throw new AppError(409, "Short URL has not expired");
};
