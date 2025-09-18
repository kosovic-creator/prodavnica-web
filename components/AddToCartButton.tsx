"use client";
import React from "react";
import { useCart } from "./CartContext";

interface AddToCartButtonProps {
  productId: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ productId }) => {
  const [loading, setLoading] = React.useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(productId, 1);
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Greška pri dodavanju u korpu");
    }
    setLoading(false);
  };

  return (
    <button
      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 mt-6"
      onClick={handleAddToCart}
      disabled={loading}
    >
      {loading ? "Dodajem..." : "Add to Cart"}
    </button>
  );
};

export default AddToCartButton;
