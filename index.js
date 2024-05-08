const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/Users');
const adminRoute = require('./routes/Admins');
const DataRoute = require('./routes/Datas');
const UserDataRoute = require('./routes/UserData');
const session = require('express-session');
dotenv.config();
app.use(express.json());
app.use(cors());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});
app.use('/api/auth', authRoute);
app.use('/api/user/', userRoute);
app.use('/api/admin/', adminRoute);
app.use('/api/admin/data', DataRoute);
app.use('/api/user/data', UserDataRoute);
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
