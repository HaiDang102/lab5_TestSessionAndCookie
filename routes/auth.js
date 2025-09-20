const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Đăng ký
router.post("/register", async(req, res) => {
    try {
        const user = await User.create({
            username: req.body.username,
            password: req.body.password, // sẽ tự động hash nhờ middleware
        });
        res.status(201).json({ message: "User registered", user: user.username });
    } catch (err) {
        res.status(400).json({ error: "User already exists" });
    }
});

// Đăng nhập
// Login
router.post('/login', async(req, res) => {
    try {
        const { username, password } = req.body;

        // Tìm user trong DB
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Lưu userId vào session// // 
        req.session.userId = user._id;

        // Set thêm cookie xác nhận (ngoài connect.sid)
        res.cookie('sid', req.sessionID, {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60
        });

        res.json({ message: 'Login successful!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});


// Đăng xuất
// Logout
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.clearCookie('sid')
        res.clearCookie("connect.sid"); // xóa cookie ở client
        res.json({ message: "Logout successful" });
    });
});

// Route bảo vệ (ví dụ)
router.get("/profile", async(req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Not logged in" });

    const user = await User.findById(req.session.userId).select("-password");
    res.json({ message: "This is your profile", user });
});

module.exports = router;