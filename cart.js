const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Cart = mongoose.model(
  "Cart",
  new mongoose.Schema(
    {
      userId: { type: String, required: true },
      items: [
        {
          productId: { type: String, required: true },
          quantity: { type: Number, default: 1 },
        },
      ],
      status: { type: String, default: "active" },
      updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
  )
);

router.post("/cart/add", async (req, res) => {
  try {
    const { productId, quantity = 1, user } = req.body;

    if (!productId || !user) {
      return res
        .status(400)
        .json({ success: false, message: "ProductId and user are required" });
    }

    let cart = await Cart.findOne({ userId: user, status: "active" });

    if (!cart) {
      cart = new Cart({ userId: user, items: [] });
    }

    const index = cart.items.findIndex((item) => item.productId === productId);

    if (index > -1) {
      cart.items[index].quantity += parseInt(quantity);
    } else {
      cart.items.push({ productId, quantity: parseInt(quantity) });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
});

router.get("/carts", async (req, res) => {
  try {
    const carts = await Cart.find({});
    res.status(200).json({
      success: true,
      count: carts.length,
      data: carts,
    });
  } catch (error) {
    console.error("Error fetching carts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart data",
      error: error.message,
    });
  }
});

router.delete("/cart/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const { userId } = req.body;

    if (!productId || !userId) {
      return res.status(400).json({
        success: false,
        message: "ProductId and userId are required",
      });
    }

    const cart = await Cart.findOne({ userId: userId, status: "active" });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "No active cart found for this user",
      });
    }

    const originalLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId !== productId);

    if (cart.items.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  } catch (error) {
    console.error("Error deleting item from cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
});

module.exports = router;
