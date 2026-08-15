import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_cms';
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 2500
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.warn(`⚠️ MongoDB Connection: ${error.message}`);
        console.log(`ℹ️ Server starting in offline fallback mode. Configure MONGODB_URI in server/.env with your MongoDB Atlas or local URI.`);
        return null;
    }
};
