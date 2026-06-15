require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Wajib agar FE (Next.js) bisa konek
app.use(express.json()); // Agar bisa membaca body request format JSON
app.use(express.urlencoded({ extended: true }));

// Import Routes
const depotRoutes = require('./routes/depotRoutes');
const authRoutes = require('./routes/authRoutes'); // <-- BARU: Import rute autentikasi di sini

// Gunakan Routes
app.use('/api/depot', depotRoutes);
app.use('/api/auth', authRoutes); // <-- BARU: Pasang rute autentikasi di sini

// Route Test Dasar
app.get('/', (req, res) => {
  res.json({ message: "Server B2B Depot Air berjalan dengan lancar!" });
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});