import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Define consistent cookie options to avoid repetition
const cookieOptions = {
    httpOnly: true, // prevents client-side JavaScript access (XSS)
    secure: process.env.NODE_ENV === "production", // requires HTTPS in production
    sameSite: "strict", // prevents CSRF attack
};

const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
    // 7 days in seconds for Redis 'EX'
	await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); 
};

const setCookies = (res, accessToken, refreshToken) => {
    // FIX 1: Set maxAge for accessToken to match expiresIn: "15m"
	res.cookie("accessToken", accessToken, {
		...cookieOptions,
		maxAge: 15 * 60 * 1000, // 15 minutes
	});
    // FIX 2: Set maxAge for refreshToken to match expiresIn: "7d"
	res.cookie("refreshToken", refreshToken, {
		...cookieOptions,
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});
};

export const signup = async (req, res) => {
	const { email, password, name } = req.body;
	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}
        
        // Ensure password is not exposed in the response payload
		const user = await User.create({ name, email, password });

		// authenticate
		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);

		setCookies(res, accessToken, refreshToken);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
            // FIX 3: Include the necessary data for immediate client use if needed (e.g., initial profile state)
		});
	} catch (error) {
		console.error("Error in signup controller:", error.message); // FIX 4: Use console.error
		res.status(500).json({ message: "LoiJenTECH Server error during signup", error: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (user && (await user.comparePassword(password))) {
			const { accessToken, refreshToken } = generateTokens(user._id);
			await storeRefreshToken(user._id, refreshToken);
			setCookies(res, accessToken, refreshToken);

			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			});
		} else {
            // FIX 5: Use a 401 Unauthorized status for login failures
			res.status(401).json({ message: "Invalid email or password" }); 
		}
	} catch (error) {
		console.error("Error in login controller:", error.message); // FIX 4: Use console.error
		res.status(500).json({ message: "LoiJenTECH Server error during login", error: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
        
        // FIX 6: Add a check for successful token verification before deleting from Redis
        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                await redis.del(`refresh_token:${decoded.userId}`);
            } catch (jwtError) {
                // If token is invalid/expired, we still proceed to clear cookies but log the issue
                console.warn("Warning: Attempted logout with invalid refresh token:", jwtError.message);
            }
        }
        
		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.json({ message: "Logged Out Successfully" });
	} catch (error) {
		console.error("Error in logout controller:", error.message); // FIX 4: Use console.error
		res.status(500).json({ message: "LoiJenTECH Server error during logout", error: error.message });
	}
};

// this will refresh the access token
export const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

        let decoded;
        try {
            // FIX 7: If verification fails, it throws, which is handled below.
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); 
        } catch (jwtError) {
            // FIX 8: Return 401 for token verification failure
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }
        
		const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

		if (!storedToken || storedToken !== refreshToken) { // FIX 9: Check for token existence too
            // FIX 10: Clear cookies if tokens are mismatched or deleted (Theft detection)
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
			return res.status(401).json({ message: "Session expired or refresh token tampered" });
		}

		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

		res.cookie("accessToken", accessToken, {
			...cookieOptions,
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Token Refreshed Successfully" });
	} catch (error) {
		console.error("Error in refreshToken controller:", error.message); // FIX 4: Use console.error
		res.status(500).json({ message: "LoiJenTECH Server error during token refresh", error: error.message });
	}
};

export const getProfile = async (req, res) => {
    // Assuming 'req.user' is set by an authentication middleware (e.g., protectRoute)
	try {
        if (!req.user) {
            // Handle case where middleware failed to set user or was skipped
            return res.status(401).json({ message: "Unauthorized: User data not found in request" });
        }
		res.json(req.user);
	} catch (error) {
		console.error("Error in getProfile controller:", error.message); // FIX 4: Use console.error
		res.status(500).json({ message: "Server error during profile fetch", error: error.message });
	}
};
