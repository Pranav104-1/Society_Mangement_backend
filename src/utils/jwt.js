import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  try {
    return jwt.sign(
      { 
        id: user._id || user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        Flat_no: user.Flat_no,
        iat: Math.floor(Date.now() / 1000)
      }, 
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
  } catch (error) {
    console.error('Token Generation Error:', error);
    throw error;
  }
};

export const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token Verification Error:', error);
    return null;
  }
};

