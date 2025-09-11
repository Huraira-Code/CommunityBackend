const jwt = require("jsonwebtoken");

const authenticationMiddleware = (...allowedRoles) => {
  return async (req, res) => {
    const authHeader = req.headers.authorization;

    try {
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "No token provided" });
      }

      const token = authHeader.split(" ")[1];

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined!");
        return res.status(500).json({ msg: "Server configuration error" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.role) {
        return res.status(403).json({ msg: "Invalid token" });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ msg: "Access denied: insufficient role" });
      }

      // attach user info to request for downstream use
      req.user = decoded;
      return req.user; // return user info instead of next()
    } catch (error) {
      console.error("Auth error:", error.message);
      return res.status(401).json({ msg: "Authentication failed" });
    }
  };
};

module.exports = authenticationMiddleware;
