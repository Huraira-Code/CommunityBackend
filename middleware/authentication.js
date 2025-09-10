const jwt = require("jsonwebtoken");

/**
 * Authentication + Role Authorization Middleware
 * @param {...string} allowedRoles - Roles allowed to access the route
 */
const authenticationMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    try {
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "No token provided" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.role) {
        return res.status(403).json({ msg: "Invalid token" });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ msg: "Access denied: insufficient role" });
      }

      // attach user info to request for downstream use
      req.user = decoded;
      next();
    } catch (error) {
      console.error("Auth error:", error.message);
      res.status(401).json({ msg: "Authentication failed" });
    }
  };
};

module.exports = authenticationMiddleware;
