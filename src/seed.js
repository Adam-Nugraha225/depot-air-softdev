const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  // Delete all messages, orders, fleets, payment methods, addresses, vendor profiles, and users
  await prisma.message.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.fleet.deleteMany({});
  await prisma.paymentMethod.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.vendorProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleared. Seeding...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Buyer
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      password: hashedPassword,
      name: 'Budi Hartanto',
      phone: '+62 812 3456 7890',
      role: 'BUYER',
      addresses: {
        create: [
          {
            label: 'Gudang Jakarta Pusat',
            addressLine: 'Jl. Sudirman No. 45, Kavling 3-4, Senayan, Jakarta Pusat, 10210',
            isPrimary: true,
          },
          {
            label: 'Kantor Cabang Bekasi',
            addressLine: 'Kawasan Industri Jababeka II, Blok C No. 12, Cikarang, Bekasi, 17530',
            isPrimary: false,
          }
        ]
      },
      paymentMethods: {
        create: [
          {
            type: 'VIRTUAL_ACCOUNT',
            details: 'BCA - 88291029381'
          }
        ]
      }
    }
  });

  // 2. Create Vendors
  const vendor1 = await prisma.user.create({
    data: {
      email: 'vendor1@example.com',
      password: hashedPassword,
      name: 'AquaStream Logistics',
      phone: '+62 821 9876 5432',
      role: 'VENDOR',
      vendorProfile: {
        create: {
          rating: 4.8,
          verificationStatus: 'VERIFIED',
          profileCompletion: 100,
          specialty: 'Bulk Clean Water, Fleet Logistics',
          mainLocation: 'Cibiru, Bandung Timur (5 KM)',
        }
      }
    }
  });

  const vendor2 = await prisma.user.create({
    data: {
      email: 'vendor2@example.com',
      password: hashedPassword,
      name: 'Mata Air Gunung Papandayan',
      phone: '+62 822 5555 4444',
      role: 'VENDOR',
      vendorProfile: {
        create: {
          rating: 4.9,
          verificationStatus: 'VERIFIED',
          profileCompletion: 100,
          specialty: 'Pure Mountain Spring Water',
          mainLocation: 'Cibiru, Bandung Timur (5 KM)',
        }
      }
    }
  });

  const vendor3 = await prisma.user.create({
    data: {
      email: 'vendor3@example.com',
      password: hashedPassword,
      name: 'Tirta Jaya Mandiri',
      phone: '+62 823 6666 7777',
      role: 'VENDOR',
      vendorProfile: {
        create: {
          rating: 4.7,
          verificationStatus: 'VERIFIED',
          profileCompletion: 100,
          specialty: 'Industrial Clean Water, Refills',
          mainLocation: 'Cileunyi, Bandung (10 KM)',
        }
      }
    }
  });

  const vendor4 = await prisma.user.create({
    data: {
      email: 'vendor4@example.com',
      password: hashedPassword,
      name: 'HydroSource Jakarta',
      phone: '+62 824 8888 9999',
      role: 'VENDOR',
      vendorProfile: {
        create: {
          rating: 4.5,
          verificationStatus: 'PENDING',
          profileCompletion: 80,
          specialty: 'High Volume Bulk Logistics',
          mainLocation: 'Cikarang, Bekasi (2 KM)',
        }
      }
    }
  });

  // 3. Create Fleets for Vendor 1 (AquaStream Logistics)
  const fleet1 = await prisma.fleet.create({
    data: {
      vendorId: vendor1.id,
      truckId: 'TRK-LAG-01',
      driverName: 'John Doe',
      status: 'AKTIF',
      lat: -6.920,
      lng: 107.720,
    }
  });

  const fleet2 = await prisma.fleet.create({
    data: {
      vendorId: vendor1.id,
      truckId: 'TRK-LAG-05',
      driverName: 'Mike Ross',
      status: 'SEDANG JALAN',
      lat: -6.925,
      lng: 107.725,
    }
  });

  const fleet3 = await prisma.fleet.create({
    data: {
      vendorId: vendor1.id,
      truckId: 'TRK-LAG-09',
      driverName: 'Harvey Specter',
      status: 'SIAGA',
      lat: -6.918,
      lng: 107.718,
    }
  });

  // Create Fleets for Vendor 2 (Mata Air Gunung Papandayan)
  const fleet4 = await prisma.fleet.create({
    data: {
      vendorId: vendor2.id,
      truckId: 'TRK-PAP-01',
      driverName: 'Ricky C.',
      status: 'SEDANG JALAN',
      lat: -6.921,
      lng: 107.722,
    }
  });

  const fleet5 = await prisma.fleet.create({
    data: {
      vendorId: vendor2.id,
      truckId: 'TRK-PAP-02',
      driverName: 'Sarah Connor',
      status: 'SIAGA',
      lat: -6.922,
      lng: 107.723,
    }
  });

  // 4. Create sample message history for chat
  // Chat with Vendor 1 (AquaStream Logistics)
  await prisma.message.createMany({
    data: [
      {
        senderId: vendor1.id,
        receiverId: buyer.id,
        content: 'Halo, Selamat pagi Pak Budi. Ada yang bisa kami bantu mengenai pesanan bulk water Anda?',
        createdAt: new Date(Date.now() - 3600000 * 2)
      },
      {
        senderId: buyer.id,
        receiverId: vendor1.id,
        content: 'Selamat pagi. Saya ingin menanyakan status pengiriman untuk pesanan #PO-2023-004. Apakah sudah dalam perjalanan ke lokasi?',
        createdAt: new Date(Date.now() - 3600000 * 1.8)
      },
      {
        senderId: vendor1.id,
        receiverId: buyer.id,
        content: 'Sebentar saya cek koordinat GPS armada kami, Pak.',
        createdAt: new Date(Date.now() - 3600000 * 1.5)
      },
      {
        senderId: vendor1.id,
        receiverId: buyer.id,
        content: 'Tentu, Pak Budi. Pengiriman air mineral 50 galon Anda sudah dalam radius 2km dari titik bongkar. Berikut estimasi posisinya.',
        createdAt: new Date(Date.now() - 3600000 * 1.4)
      }
    ]
  });

  // Chat with Vendor 3 (Tirta Jaya Mandiri)
  await prisma.message.create({
    data: {
      senderId: vendor3.id,
      receiverId: buyer.id,
      content: 'Invoice pesanan #VH-8921 telah diterbitkan.',
      createdAt: new Date(Date.now() - 3600000 * 24)
    }
  });

  // Chat with Vendor 4 (HydroSource Jakarta)
  await prisma.message.create({
    data: {
      senderId: vendor4.id,
      receiverId: buyer.id,
      content: 'Ketersediaan stok di gudang Cawang saat ini penuh.',
      createdAt: new Date(Date.now() - 3600000 * 48)
    }
  });

  // 5. Create some historic orders
  await prisma.order.create({
    data: {
      orderNumber: 'VH-88291',
      buyerId: buyer.id,
      vendorId: vendor3.id,
      volume: 5000,
      totalPrice: 2250000,
      status: 'SELESAI',
      createdAt: new Date(Date.now() - 3600000 * 24 * 5)
    }
  });

  await prisma.order.create({
    data: {
      orderNumber: 'VH-88285',
      buyerId: buyer.id,
      vendorId: vendor1.id,
      volume: 10000,
      totalPrice: 4500000,
      status: 'DIBATALKAN',
      createdAt: new Date(Date.now() - 3600000 * 24 * 10)
    }
  });

  await prisma.order.create({
    data: {
      orderNumber: 'VH-88270',
      buyerId: buyer.id,
      vendorId: vendor2.id,
      volume: 2500,
      totalPrice: 1125000,
      status: 'SELESAI',
      createdAt: new Date(Date.now() - 3600000 * 24 * 15)
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
