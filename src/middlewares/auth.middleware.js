import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authMiddleware = (req, res, next) => {
    try {
        let token = null;
        
        // 1. Try to get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (authHeader) {
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7).trim();
                console.log('Token from Authorization:', token);
            } else {
                console.log('Authorization header does not start with Bearer');
            }
        }
        
        // 2. If no token in header, try cookie
        if (!token && req.cookies) {
            token = req.cookies.token;
            console.log('Token from Cookie:', token);
        }

        // 3. Check if we have a token
        if (!token) {
            console.log('No token found in request');
            return res.status(401).json({ 
                message: 'Authentication required',
                details: 'No token found in request. Please log in.'
            });
        }

        // 4. Verify the token
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            return res.status(500).json({
                message: 'Server configuration error',
                details: 'JWT_SECRET is not configured'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);
            req.user = decoded;
            next();
        } catch (verifyError) {
            console.error('Token Verification Error:', verifyError);
            return res.status(401).json({ 
                message: 'Invalid token',
                details: verifyError.message,
                receivedToken: token.substring(0, 10) + '...' // Show first 10 chars of token for debugging
            });
        }
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(500).json({ 
            message: 'Authentication error',
            details: error.message
        });
    }
};

