import mongoose from "mongoose";

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI?.trim();

    if (!mongoUri) {
        throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected to database "${mongoose.connection.name}"`);
};

export default connectDB;
