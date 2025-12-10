// lib/db.js
import mongoose from "mongoose";

const MONGO_URI = process.env.NEXT_MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) throw new Error("Missing MongoDB connection string");

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI).then((mongoose) => {
            return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
