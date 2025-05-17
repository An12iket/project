const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next){
    const rawToken = req.headers.authorization;
 
    if(!rawToken || !rawToken.startsWith('Bearer')){
        return res.status(400).json({ message: "Token is invalid" });
    }

    const token = rawToken.split('')[1];

    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        
        if(!decoded){
            return res.status(401).json({ message: "Invalid token or cannot verify it" })
        }
        req.userId = decoded.userId;

        next();

    } catch (err){
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
module.exports = authMiddleware;