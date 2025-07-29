const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const { router: authRoutes } = require("./auth");
const cartRoutes = require("./cart");

app.use(authRoutes);
app.use(cartRoutes);

mongoose
  .connect(
    "mongodb+srv://nehalath611:monulath5064502@cluster0.fzgftzu.mongodb.net/ecommerce",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  thumbnail: String,
  description: String,
  brand: String,
  stock: Number,
  category: String,
  discountPercentage: Number,
  rating: Number,
});
const Product = mongoose.model("Product", productSchema);
module.exports.Product = Product;

app.get("/", (req, res) => {
  res.send("🚀 Flipkart Clone Backend is running");
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching products" });
  }
});

app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
