import { timingSafeEqual } from "node:crypto";
import * as authService from "../services/auth.service.js";
import User from "../models/user.schema.js";
import AppError from "../utils/app-error.js";

export const googleSignIn = async (req, res) => {
    const result = await authService.authenticateGoogleCredential(
        req.body?.credential
    );
    res.cookie(
        authService.AUTH_COOKIE_NAME,
        result.token,
        authService.getAuthCookieOptions()
    );
    return res.json({ user: result.user });
};

export const googleSignInRedirect = async (req, res) => {
    const csrfCookie = req.get("cookie")
        ?.split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("g_csrf_token="))
        ?.slice("g_csrf_token=".length);
    const csrfToken = req.body?.g_csrf_token;

    if (
        typeof csrfCookie !== "string" ||
        typeof csrfToken !== "string" ||
        !csrfCookie ||
        csrfCookie.length !== csrfToken.length ||
        !timingSafeEqual(Buffer.from(csrfCookie), Buffer.from(csrfToken))
    ) {
        throw new AppError(400, "Google sign-in request could not be verified");
    }

    try {
        const result = await authService.authenticateGoogleCredential(
            req.body?.credential
        );
        res.cookie(
            authService.AUTH_COOKIE_NAME,
            result.token,
            authService.getAuthCookieOptions()
        );

        const state = req.body?.state;
        const destination =
            typeof state === "string" &&
            state.startsWith("/") &&
            !state.startsWith("//") &&
            !state.includes("\\")
                ? state
                : "/";

        return res.redirect(303, destination);
    } catch (error) {
        if (error instanceof AppError) {
            const loginUrl = new URL("/login", "https://littlelink.invalid");
            loginUrl.searchParams.set("error", error.message);
            return res.redirect(
                303,
                `${loginUrl.pathname}${loginUrl.search}`
            );
        }
        throw error;
    }
};

export const getCurrentUser = async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) {
        throw new AppError(401, "User account no longer exists");
    }
    return res.json({ user: authService.getPublicUser(user) });
};

export const signOut = (req, res) => {
    res.clearCookie(
        authService.AUTH_COOKIE_NAME,
        authService.getAuthCookieOptions()
    );
    return res.json({ message: "Signed out" });
};
