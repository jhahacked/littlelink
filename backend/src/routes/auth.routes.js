import express from "express";
import {
    getCurrentUser,
    googleSignIn,
    googleSignInRedirect,
    signOut,
} from "../controllers/auth.controller.js";
import { requireTrustedOrigin } from "../middleware/cors.js";
import requireAuth from "../middleware/require-auth.js";

const router = express.Router();

router.post("/api/auth/google/redirect", googleSignInRedirect);
router.post("/api/auth/google", requireTrustedOrigin, googleSignIn);
router.get("/api/auth/me", requireAuth, getCurrentUser);
router.post("/api/auth/logout", requireTrustedOrigin, signOut);

export default router;
