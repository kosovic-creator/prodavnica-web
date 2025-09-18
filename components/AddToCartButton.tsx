"use client";
import React from "react";
import { useCart } from "./CartContext";
import { useTranslation } from "react-i18next";

interface AddToCartButtonProps {
  productId: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ productId }) => {
  const [loading, setLoading] = React.useState(false);
  const { addToCart } = useCart();
  const { t } = useTranslation("product");

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(productId, 1);
    } catch (err) {
      console.error("Add to cart error:", err);
      alert(t("addToCartError"));
    }
    setLoading(false);
  };

  return (
    <button
      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 mt-6"
      onClick={handleAddToCart}
      disabled={loading}
    >
      {loading ? t("adding") : t("addToCart")}
    </button>
  );
};

export default AddToCartButton;
