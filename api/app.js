import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth_route.js";
// import userRoute from "./routes/user.route.js";
import mongoose from "mongoose";

const app = express();

// Development CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins for development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // You can add production domain checks here when needed
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
};

mongoose.connect('mongodb://127.0.0.1:27017/home_buddy')
.then(() => { console.log('Mongoose has connected'); });

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
// app.use("/api/users", userRoute);

const PORT = process.env.API_PORT || 8800;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}: http://localhost:${PORT}`);
});
