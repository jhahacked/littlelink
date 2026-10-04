import ShortUrl from "../models/shorturlschema.js";

export const createShortUrlRecord = async (urlRecord) => {
    return ShortUrl.create(urlRecord);
};

export const findClicksByShortId = async (shortId) => {
    return ShortUrl.findOne(
        { short_url: shortId },
        { short_url: 1, clicks: 1, _id: 0 }
    );
};

export const findShortUrlById = async (shortId) => {
    return ShortUrl.findOne({ short_url: shortId });
};

export const findUserShortUrls = async (userId) => {
    return ShortUrl.find({ user: userId })
        .select("full_url short_url clicks expires_at createdAt")
        .sort({ createdAt: -1 })
        .lean();
};

export const incrementClicksByShortId = async (shortId) => {
    return ShortUrl.findOneAndUpdate(
        {
            short_url: shortId,
            $or: [
                { expires_at: { $exists: false } },
                { expires_at: null },
                { expires_at: { $gt: new Date() } },
            ],
        },
        { $inc: { clicks: 1 } },
        { returnDocument: "after" }
    );
};

export const deleteExpiredByShortId = async (
    shortId,
    userId,
    now = new Date()
) => {
    return ShortUrl.findOneAndDelete({
        short_url: shortId,
        user: userId,
        expires_at: { $lte: now },
    });
};

export const findUserShortUrlById = async (shortId, userId) => {
    return ShortUrl.findOne({ short_url: shortId, user: userId });
};
