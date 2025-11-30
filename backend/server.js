import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.routes.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

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
    // FIX: Use '..' to go up one directory (out of 'backend')
    const staticPath = path.join(__dirname, '..', 'frontend', 'dist');

    // Serve static files
    app.use(express.static(staticPath));
    
    // Catch-all route for SPA routing
    app.use((req, res) => {
        res.sendFile(path.join(staticPath, 'index.html'));
    });
}

connectDB();

app.listen(PORT, () => {
    console.log('LoiJenTECH Server is running on port http://localhost:' + PORT);
});
