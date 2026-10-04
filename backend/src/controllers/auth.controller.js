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
