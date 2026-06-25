import "dotenv/config";
import express from "express";
import cors from "cors";
import userRoutes from "./routes/users.routes";
import productRoutes from "./routes/products.routes";
import Stripe from "stripe";

const port = 3000;
const api = express();


const stripe = new Stripe(process.env.STRIPE_SECRETE!, {
});

const YOUR_DOMAIN = "http://localhost:4200";

api.use(express.json());
api.use(cors());

// routes
api.use("/users", userRoutes);
api.use("/productos", productRoutes);

// Stripe endpoint
api.post("/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: "Producto demo",
                        },
                        unit_amount: 2000,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${YOUR_DOMAIN}/success`,
            cancel_url: `${YOUR_DOMAIN}/cancel`,
        });

        res.json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

api.listen(port, () => {
    console.log(`Servidor en http://localhost:${port}`);
});