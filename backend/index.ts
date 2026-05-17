import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { dbConnection } from "./db/db.js";
import userRoutes from "./routes/user.route.js";
import leadRoutes from "./routes/lead.route.js";

dotenv.config();
const app = express();

const corsOption = {
    origin: [process.env.FRONTEND_URL || "", "http://localhost:5173"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    headers: ["Content-type", "Authorization"]
};

app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/lead", leadRoutes);

app.listen(process.env.PORT || 8080, () => {
    try {
        dbConnection();
        console.log("Server is Running \nDatabase is connected Successfully");
    } catch (e: any) {
        console.log("Error", e.message);
    }
});
