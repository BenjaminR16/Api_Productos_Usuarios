import "dotenv/config";
import express from "express";
import cors from "cors";
import userRoutes from "./routes/users.routes"
import productRoutes from "./routes/products.routes"

const port = 3000;
const api = express();

api.use(express.json());
api.use(cors());

api.use("/users", userRoutes)
api.use("/productos", productRoutes)

api.listen(port, () => {
    console.log("Servidor en http://localhost:3000");
});