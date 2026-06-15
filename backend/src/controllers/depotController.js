// Dummy data untuk sementara waktu
let dummyWaterLevel = {
    depotId: "DPT-001",
    namaDepot: "Depot Air Segar Sukabirus",
    levelAir: 45, // Persentase air di toren
    status: "Aman",
    lastUpdated: new Date()
};

// Fungsi untuk mengambil status air (Nanti akan dihit oleh Frontend)
exports.getWaterLevel = (req, res) => {
    try {
        // Nanti kode ini diganti dengan query ke Database/Firebase
        res.status(200).json({
            success: true,
            data: dummyWaterLevel
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Fungsi untuk membuat order (Dipicu otomatis jika air mau habis)
exports.createOrder = (req, res) => {
    try {
        const { depotId, volumePesanan } = req.body;
        
        // Logika sederhana
        if(!depotId || !volumePesanan) {
            return res.status(400).json({ success: false, message: "Data tidak lengkap" });
        }

        res.status(201).json({
            success: true,
            message: `Pesanan sebanyak ${volumePesanan} liter untuk ${depotId} berhasil dibuat!`,
            orderId: `ORD-${Math.floor(Math.random() * 1000)}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};