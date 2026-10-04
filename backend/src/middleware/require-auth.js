import User from "../models/user.schema.js";
import * as authService from "../services/auth.service.js";
import AppError from "../utils/app-error.js";

const requireAuth = async (req, res, next) => {
    const sessionCookie = req.get("cookie")
        ?.split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${authService.AUTH_COOKIE_NAME}=`));
    if (!sessionCookie) {
        throw new AppError(401, "Sign in to continue");
    }

    const token = sessionCookie.slice(authService.AUTH_COOKIE_NAME.length + 1);
    const userId = authService.verifyAccessToken(token);
    const user = await User.findById(userId).select("_id");
    if (!user) {
        throw new AppError(401, "User account no longer exists");
    }

    req.userId = user._id;
    return next();
};

export default requireAuth;
