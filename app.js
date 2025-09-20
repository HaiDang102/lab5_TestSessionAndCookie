const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require('cookie-parser');
const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose
    .connect("mongodb://127.0.0.1:27017/sessionAuth", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Session middleware
app.use(session({
    secret: 'your-secret-key', // đổi thành secret mạnh hơn khi chạy thật
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://127.0.0.1:27017/sessionAuth'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60, // 1h
        httpOnly: true,
        secure: false // để true nếu chạy HTTPS
    }
}));
// Routes
app.use("/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({ message: "API running... use /auth/register, /auth/login, /auth/logout, /auth/profile" });
});

// Start server
app.listen(3000, () => {
    console.log("🚀 Server chạy ở http://localhost:3000");
});