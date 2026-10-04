import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/mongo.config.js";

dotenv.config();

const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer().catch((error) => {
    console.error("Unable to start the server:", error.message);
    process.exit(1);
});
