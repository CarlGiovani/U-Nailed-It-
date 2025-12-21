import jwt from "jsonwebtoken";

// admin authebtucation
export const requireAdmin = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
};
