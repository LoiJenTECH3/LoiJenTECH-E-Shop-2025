import mongoose from "mongoose";

export const connectDB = async () => {
    // FIX: Check if the URI is being accessed correctly from the environment variables
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
        // This check is the safety net that traps the 'undefined' value
        console.error("Error connecting to MONGODB: MONGODB_URI is not set in environment variables.");
        process.exit(1); // Exit the process immediately if the URI is missing
    }

    try {
        await mongoose.connect(mongoURI, {
            // MongoDB driver options (often unnecessary now, but good practice)
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log("LoiJenTECH MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MONGODB:", error.message);
        // Exit the process if the connection fails
        process.exit(1);
    }
};
