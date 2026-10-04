import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/user.schema.js";
import AppError from "../utils/app-error.js";

export const AUTH_COOKIE_NAME = "littlelink_session";

const getGoogleClientId = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
        throw new AppError(503, "Google sign-in is not configured on the server");
    }
    return clientId;
};

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET?.trim();
    if (
        !secret ||
        secret.startsWith("replace-with-") ||
        Buffer.byteLength(secret, "utf8") < 32
    ) {
        throw new AppError(503, "Authentication is not configured on the server");
    }
    return secret;
};

export const authenticateGoogleCredential = async (credential) => {
    if (typeof credential !== "string" || !credential) {
        throw new AppError(400, "Google credential is required");
    }

    const googleClientId = getGoogleClientId();
    const jwtSecret = getJwtSecret();
    let payload;
    try {
        const ticket = await new OAuth2Client(googleClientId).verifyIdToken({
            idToken: credential,
            audience: googleClientId,
        });
        payload = ticket.getPayload();
    } catch (error) {
        if (
            error &&
            typeof error === "object" &&
            ("response" in error || "code" in error)
        ) {
            throw new AppError(
                503,
                "Google sign-in verification is temporarily unavailable"
            );
        }
        throw new AppError(401, "Google sign-in could not be verified");
    }

    if (
        !payload?.sub ||
        !payload.email ||
        !payload.name ||
        payload.email_verified !== true
    ) {
        throw new AppError(401, "A verified Google account is required");
    }

    const user = await User.findOneAndUpdate(
        { googleId: payload.sub },
        {
            $set: {
                email: payload.email,
                name: payload.name,
                picture: payload.picture || "",
            },
        },
        { new: true, upsert: true, runValidators: true }
    );

    const token = jwt.sign({}, jwtSecret, {
        algorithm: "HS256",
        expiresIn: "7d",
        subject: user._id.toString(),
    });

    return {
        token,
        user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            picture: user.picture,
        },
    };
};

export const getPublicUser = (user) => ({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    picture: user.picture,
});

export const verifyAccessToken = (token) => {
    try {
        const payload = jwt.verify(token, getJwtSecret(), {
            algorithms: ["HS256"],
        });
        if (typeof payload !== "object" || !payload.sub) {
            throw new AppError(401, "Invalid access token");
        }
        return payload.sub;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(401, "Invalid or expired access token");
    }
};

export const getAuthCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
});
