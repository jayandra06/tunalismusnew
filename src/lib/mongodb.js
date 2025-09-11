import mongoose from "mongoose";

let isConnected = false; // Track connection status

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    console.log("✅ MongoDB already connected");
    return;
  }

  try {
    console.log("Connecting to MongoDB...");
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "tunalismusnext",
    });
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
  }
};
