const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const userModel = require("../models/user.model");
const adminModel = require("../models/admin.model");
const passwordResetModel = require("../models/passwordReset.model");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (userId, role = "user") => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "Missing Google Token" });

    // Try to verify token. For local testing, if verify fails or CLIENT_ID isn't set, it might throw.
    // In production, GOOGLE_CLIENT_ID should match the audience (Web or iOS/Android).
    // An array of client IDs can be passed if multiple platforms are used.
    const audience = [
      process.env.GOOGLE_CLIENT_ID_WEB,
      process.env.GOOGLE_CLIENT_ID_IOS,
      process.env.GOOGLE_CLIENT_ID_ANDROID,
      process.env.GOOGLE_CLIENT_ID
    ].filter(Boolean);

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: audience.length > 0 ? audience : undefined,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: google_id } = payload;

    if (!email) {
      return res.status(400).json({ message: "Google account missing email" });
    }

    // 1. Check if admin
    let user = await adminModel.findByEmail(email);
    let role = "admin";

    if (!user) {
      // 2. Check if normal user
      user = await userModel.findByEmail(email);
      if (user) {
        role = user.role || "user";
        // Optionally backfill google_id if missing
        if (!user.google_id) {
          await db.execute("UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?", [google_id, picture, user.id]);
        }
      }
    }

    if (!user) {
      // 3. Register new user automatically
      const hashed = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      user = await userModel.createUser({ name: name || "Google User", email, password: hashed, avatar_url: picture });
      // update google_id specifically
      await db.execute("UPDATE users SET google_id = ? WHERE id = ?", [google_id, user.id]);
      role = "user";
    }

    const token = signToken(user.id, role);
    const { password_hash: _p, ...safeUser } = user;
    safeUser.role = role;

    res.json({ message: "Đăng nhập Google thành công", user: safeUser, token });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: "Google Token không hợp lệ", error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await userModel.createUser({ name, email, password: hashed });

    const token = signToken(user.id, "user");

    const { password_hash: _p, ...safeUser } = user;
    safeUser.role = "user";

    res.status(201).json({ message: "User created", user: safeUser, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    let user = await adminModel.findByEmail(email);
    let role = "admin";

    if (!user) {
      user = await userModel.findByEmail(email);
      if (user) {
        role = user.role || "user";
      }
    }

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user.id, role);
    const { password_hash: _p, ...safeUser } = user;
    safeUser.role = role;

    res.json({ message: "Logged in", user: safeUser, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const role = req.role || "user";
    let user;

    if (role === "admin") {
      user = await adminModel.findById(req.userId);
      if (!user) {
        user = await userModel.findById(req.userId);
      }
    } else {
      user = await userModel.findById(req.userId);
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const { password_hash: _p, ...safeUser } = user;
    safeUser.role = role;
    res.json({ user: safeUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Missing email" });

    const user = await userModel.findByEmail(email);
    if (!user) return res.status(200).json({ message: "If the email exists, a reset link will be sent." });

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    // Expire in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");

    await userModel.savePasswordResetToken(user.id, token, expiresAt);

    // Send email with reset link
    const appUrl = process.env.APP_URL || `http://localhost:3000`;
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Expense Tracker" <no-reply@example.com>',
      to: user.email,
      subject: 'Yêu cầu đặt lại mật khẩu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #6366f1;">Đặt lại mật khẩu</h2>
          <p>Chào <strong>${user.full_name}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng bấm vào nút bên dưới để thiết lập mật khẩu mới (link có hiệu lực trong 1 giờ):</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Đặt Lại Mật Khẩu
            </a>
          </div>
          <p>Nếu bạn không yêu cầu điều này, xin vui lòng bỏ qua email này.</p>
          <hr style="border: 1px solid #f0f0f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Đây là email tự động, vui lòng không phản hồi.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (e) {
      console.error('Failed to send reset email', e.message || e);
    }

    return res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Missing token or password' });
    if (password.length < 6) return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });

    const user = await userModel.findByPasswordResetToken(token);
    if (!user) {
      return res.status(400).json({ message: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    // Update password
    await userModel.updatePassword(user.id, hashed);
    // Clear token
    await userModel.savePasswordResetToken(user.id, null, null);

    res.json({ message: 'Đặt lại mật khẩu thành công.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE PROFILE (name + email)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.userId;
    if (!name && !email) return res.status(400).json({ message: 'No data to update' });

    await db.execute(
      'UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email) WHERE id = ?',
      [name || null, email || null, userId]
    );
    const user = await userModel.findById(userId);
    const { password_hash: _p, ...safeUser } = user;
    res.json({ message: 'Profile updated', user: safeUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CHANGE PASSWORD (old password check)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(userId, hashed);
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
