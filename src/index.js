require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Routes will be imported here
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const vendorRoutes = require('./routes/vendor.routes');
const orderRoutes = require('./routes/order.routes');
const fleetRoutes = require('./routes/fleet.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const chatRoutes = require('./routes/chat.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/fleets', fleetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chats', chatRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Vendor-Hub API' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
