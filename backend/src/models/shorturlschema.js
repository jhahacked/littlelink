import mongoose from "mongoose";

const shortUrlSchema = new mongoose.Schema(
    {
        full_url: {
            type: String,
            required: true,
            trim: true,
        },
        short_url: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        clicks: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        expires_at: {
            type: Date,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

shortUrlSchema.index({ user: 1, createdAt: -1 });

const ShortUrl = mongoose.model("ShortUrl", shortUrlSchema);
export default ShortUrl;
