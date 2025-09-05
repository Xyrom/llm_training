import React from "react";
import type { Product } from "../types/product-types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onAddToBasket: (product: Product) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToBasket,
  onView,
  onEdit,
  onDelete,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-6 gap-y-8">
    {products.map((product) => (
      <ProductCard
        key={product.id}
        product={product}
        onAddToBasket={onAddToBasket}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}
  </div>
);

export default ProductGrid;
