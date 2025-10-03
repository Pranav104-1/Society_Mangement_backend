export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Default error status and message
    const status = err.statusCode || 500;
    const message = err.message || 'Something went wrong';

    // Specific error handling
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    if (err.name === 'MongoError' && err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: 'Duplicate Entry',
            field: Object.keys(err.keyPattern)[0]
        });
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
        });
    }

    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            message: 'File upload error',
            error: err.message
        });
    }

    // Production vs Development error response
    const responseError = {
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && {
            error: err.message,
            stack: err.stack
        })
    };

    res.status(status).json(responseError);
    console.error(err.stack);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    if (err.name === 'CastError') {
        return res.status(400).json({
            message: 'Invalid ID format'
        });
    }
    
    res.status(500).json({
        message: 'Something went wrong on the server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};