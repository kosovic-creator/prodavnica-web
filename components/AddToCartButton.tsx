"use client";
import React from "react";

interface AddToCartButtonProps {
  productId: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ productId }) => {
  const [loading, setLoading] = React.useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await res.json();
      console.log("Add to cart response:", data);
      if (!res.ok) {
        alert(data.error || "Greška pri dodavanju u korpu");
      }
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
