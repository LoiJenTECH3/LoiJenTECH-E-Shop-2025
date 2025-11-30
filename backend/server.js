import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';

import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.routes.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
//const PORT = 5000;
const PORT = process.env.PORT || 5000;

// Fix 1: Corrected __dirname function.
const __dirname = path.resolve()

app.use(express.json()); //allows to parse json data in request body
app.use(cookieParser()); //middleware to parse cookies

// authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

if (process.env.NODE_ENV === 'production') {
    // Fix 2: Corrected path for static files (removed redundant '/api').
    app.use(express.static(path.join(__dirname(), "/frontend/dist")));
    
    // Fix 3: Corrected and properly closed the app._router.get block.
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname(), "frontend", "dist", "index.html"));
    });
}


connectDB();

app.listen(PORT, () => {
    console.log('LoiJenTECH Server is running on port http://localhost:' + PORT);
});