import React from "react";
import { FiEye, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import type { Product } from "../types/product-types";

interface ProductCardProps {
  product: Product;
  onAddToBasket: (product: Product) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToBasket,
  onView,
  onEdit,
  onDelete,
}) => (
  <div
    className="bg-white rounded-[16px] p-6 flex flex-col gap-4 min-h-[220px] shadow-sm border border-[#E5E7EB]"
    style={{ fontFamily: "Inter, sans-serif" }}
  >
    <h2 className="text-[15px] font-normal text-[#18181B] mb-1 tracking-tight">
      {product.name}
    </h2>
    <p className="text-[13px] text-[#71717A] flex-1 mb-2">
      {product.description}
    </p>
    <div className="flex justify-between items-end mt-2">
      <span className="text-[14px] font-normal text-[#18181B]">
        ${product.price}
      </span>
      <span className="text-[12px] text-[#71717A]">Stock: {product.stock}</span>
    </div>
    <div className="flex gap-2 mt-4">
      <button
        title={product.stock > 0 ? "Add to basket" : "Out of stock"}
        aria-label="Add to basket"
        onClick={() => onAddToBasket(product)}
        disabled={product.stock <= 0}
      >
        <FiPlus className="h-4 w-4" />
      </button>
      <button
        className="flex items-center justify-center gap-2 px-4 py-2 min-w-[110px] bg-[#fff] text-[#18181B] rounded-[8px] text-[13px] font-normal border border-[#E5E7EB] hover:bg-[#F7F7F8] transition-all duration-150"
        onClick={() => onView(product)}
      >
        <FiEye className="h-4 w-4" /> <span>View</span>
      </button>
      <button
        className="flex items-center justify-center gap-2 px-4 py-2 min-w-[110px] bg-[#fff] text-[#18181B] rounded-[8px] text-[13px] font-normal border border-[#E5E7EB] hover:bg-[#F7F7F8] transition-all duration-150"
        onClick={() => onEdit(product)}
      >
        <FiEdit className="h-4 w-4" /> <span>Edit</span>
      </button>
      <button
        className="flex items-center gap-2 px-4 py-2 bg-[#F43F5E] text-white rounded-[8px] text-[13px] font-normal border border-[#F43F5E] hover:bg-[#e11d48] transition-all duration-150"
        onClick={() => onDelete(product)}
      >
        <FiTrash2 className="h-5 w-5" />
      </button>
    </div>
  </div>
);

export default ProductCard;
