import jwt from "jsonwebtoken";
import { User } from "../models/user_model.js";
import { createClient } from 'redis';

export const checkAuth = async (req, res, next) => {
    try {
        if (req.session?.user) {
            const user = await User.findById(req.session.user.id);
            if (!user) {
                return res.status(401).json({message:'User Does Not Exist!'});
            }
            req.user = user;
            next();
        } else if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
                const user = await User.findById(decoded.id);
                if (!user) {
                    return res.status(401).json({message:'User Does Not Exist!'});
                }
                req.user = user;
                next();
            } catch (error) {
                return res.status(401).json({message:'Invalid Token!'});
            }
        } else {
            return res.status(401).json({message:'Not Authenticated!'});
        }
    } catch (error) {
        next(error);
    }
}




export const checkBlacklist = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        // Check if the token is blacklisted
        const data = await createClient.get(token);

        if (data === 'blacklisted') {
            return res.status(401).json({ message: 'Token is blacklisted' });
        }

        // Verify token and attach user info to request if valid
        jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            req.user = decoded;  // Attach decoded user info to request
            next();  // Pass control to the next middleware/route handler
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
