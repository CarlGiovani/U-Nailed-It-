import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as AdminModel from "../models/adminModel.js";

//seeding function
export async function seedAdmin(req, res) {
  try {
    const username = "owner";
    const plainPassword = "123456";
    const hashed = await bcrypt.hash(plainPassword, 10);

    const existing = await AdminModel.findByUsername(username);
    if (existing)
      return res.json({ message: "Admin already exists", username });

    await AdminModel.createAdmin({
      username,
      password_hash: hashed,
      role: "superadmin",
    });

    res.json({ message: "Admin created", username, password: plainPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

//login fcuntuon
export async function loginAdmin(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const admin = await AdminModel.findByUsername(username);
    if (!admin) return res.status(401).json({ message: "User not found" });

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "✅ Login successful",
      token,
      admin: { id: admin.id, username: admin.username, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
