const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Array local untuk simulasi database sementara (Nanti diganti model database asli)
const users = [];

// 1. REGISTER LOGIC
exports.register = async (req, res) => {
  try {
    const { namaLengkap, email, password, confirmPassword } = req.body;

    // Validasi kelengkapan data
    if (!namaLengkap || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Semua kolom wajib diisi!" });
    }

    // Validasi apakah password dan konfirmasi password cocok
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password dan Konfirmasi Password tidak cocok!" });
    }

    // Cek apakah email sudah terdaftar
    const userExists = users.find((u) => u.email === email);
    if (userExists) {
      return res.status(400).json({ message: "Email sudah terdaftar!" });
    }

    // Enkripsi (Hash) Password demi keamanan
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user baru ke database sementara
    const newUser = {
      id: `USR-${Date.now()}`,
      namaLengkap,
      email,
      password: hashedPassword,
      authMethod: "local",
    };
    users.push(newUser);

    res.status(201).json({
      message: "Registrasi berhasil!",
      user: {
        id: newUser.id,
        namaLengkap: newUser.namaLengkap,
        email: newUser.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error saat registrasi", error: error.message });
  }
};

// 2. LOGIN LOGIC
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body; // rememberMe dikirim berupa boolean (true/false) dari checkbox FE

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi!" });
    }

    // Cari user berdasarkan email
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(400).json({ message: "Email atau Password salah!" });
    }

    // Cek apakah password benar
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email atau Password salah!" });
    }

    // Logika "Ingat Saya" (Remember Me)
    // Jika dicentang, token berlaku 7 hari. Jika tidak, cuma 1 hari.
    const expiresIn = rememberMe ? "7d" : "1d";

    // Buat JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "rahasia_super_aman",
      { expiresIn },
    );

    res.status(200).json({
      message: "Login berhasil!",
      token,
      user: { id: user.id, namaLengkap: user.namaLengkap, email: user.email },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error saat login", error: error.message });
  }
};

// 3. GOOGLE OAUTH LOGIC (LOGIN/REGISTER WITH GOOGLE)
exports.googleLogin = async (req, res) => {
  try {
    const { googleToken, email, namaLengkap } = req.body;
    // FE akan mengirim token dari Google beserta info email & nama setelah user klik tombol Google

    if (!email) {
      return res.status(400).json({ message: "Data Google tidak valid" });
    }

    // Cek apakah user sudah ada di database kita
    let user = users.find((u) => u.email === email);

    // Jika belum ada, otomatis daftarkan (Register via Google)
    if (!user) {
      user = {
        id: `USR-${Date.now()}`,
        namaLengkap,
        email,
        password: null, // User Google tidak pakai password lokal
        authMethod: "google",
      };
      users.push(user);
    }

    // Buat JWT Token untuk session di aplikasi kita
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "rahasia_super_aman",
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Login via Google berhasil!",
      token,
      user: { id: user.id, namaLengkap: user.namaLengkap, email: user.email },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error saat Google Login",
        error: error.message,
      });
  }
};

// 4. LUPA PASSWORD LOGIC (ENDPOINT PLACEHOLDER)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi!" });
    }

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email tidak terdaftar di sistem kami." });
    }

    // Skenario asli nanti: Kirim link reset password ke email user lewat Nodemailer
    res.status(200).json({
      message:
        "Link reset password telah dikirim ke email kamu. Silakan periksa kotak masuk.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error saat meminta reset password" });
  }
};
