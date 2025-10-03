import { User } from '../models/auth/user.models.js';

export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user || !user.isAdmin) {
            return res.status(403).json({
                message: "Access denied. Admin privileges required."
            });
        }
        
        next();
    } catch (error) {
        res.status(500).json({
            message: "Error verifying admin privileges",
            error: error.message
        });
    }
};