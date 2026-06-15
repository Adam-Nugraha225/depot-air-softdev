require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // <-- WAJIB TAMBAHKAN BARIS INI, DAM!

const app = express();
const PORT = process.env.PORT || 5000;

// Hubungkan ke Database MongoDB Atlas
connectDB(); // <-- Sekarang baris ini tidak akan error lagi karena sudah di-import di atas

// Middleware
app.use(cors()); // Wajib agar FE bisa konek
app.use(express.json()); // Agar bisa membaca body request format JSON
app.use(express.urlencoded({ extended: true }));

// Import Routes
const depotRoutes = require("./routes/depotRoutes");
const authRoutes = require("./routes/authRoutes");

// Gunakan Routes
app.use("/api/depot", depotRoutes);
app.use("/api/auth", authRoutes);

// Route Test Dasar
app.get("/", (req, res) => {
  res.json({ message: "Server B2B Depot Air berjalan dengan lancar!" });
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
