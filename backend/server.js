import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url'; // FIX 1: Add fileURLToPath import

import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.routes.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

// FIX 2: Correctly define __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

if (process.env.NODE_ENV === 'production') {
    // FIX 3: Remove the incorrect function call (i.e., __dirname() -> __dirname)
    app.use(express.static(path.join(__dirname, "frontend", "dist")));
    
    // FIX 3: Remove the incorrect function call (i.e., __dirname() -> __dirname)
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}


connectDB();

app.listen(PORT, () => {
    console.log('LoiJenTECH Server is running on port http://localhost:' + PORT);
});
