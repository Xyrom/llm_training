import React from "react";
import type { BasketItem } from "../types/product-types";
import { FiMinus, FiShoppingCart } from "react-icons/fi";

interface BasketProps {
  basket: BasketItem[];
  onRemove: (productId: number) => void;
}

const Basket: React.FC<BasketProps> = ({ basket, onRemove }) => {
  if (basket.length === 0) return null;
  return (
    <div
      className="fixed left-8 bottom-8 z-50 bg-white border border-[#E5E7EB] rounded-[12px] shadow-lg p-5 min-w-[260px] max-w-[320px]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <h3 className="text-[16px] font-bold mb-3 text-[#18181B] flex items-center gap-2">
        <FiShoppingCart className="h-5 w-5 text-[#18181B]" />
        Basket
      </h3>
      <ul className="mb-3">
        {basket.map(({ product, quantity }) => (
          <li
            key={product.id}
            className="flex justify-between items-center mb-2 text-[14px]"
          >
            <span className="truncate max-w-[90px] font-semibold text-[#18181B]">
              {product.name}
            </span>
            <span className="ml-2 font-bold text-[#22c55e]">x{quantity}</span>
            <span className="ml-4 font-semibold text-[#18181B]">
              ${(product.price * quantity).toFixed(2)}
            </span>
            <button
              className="ml-2 px-2 py-1 rounded bg-[#F43F5E] text-white hover:bg-[#e11d48] transition-all duration-150"
              title="Remove one"
              onClick={() => onRemove(product.id)}
            >
              <FiMinus className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-center font-bold text-[17px] mt-2 border-t border-[#E5E7EB] pt-2">
        <span className="text-[#18181B]">Total:</span>
        <span className="text-[#22c55e]">
          $
          {basket
            .reduce(
              (sum, { product, quantity }) => sum + product.price * quantity,
              0
            )
            .toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default Basket;
