"use client";

import { useEffect, useState } from "react";

import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct as deleteProductApi,
  getBasket,
  addToBasket,
  removeFromBasket,
} from "../api";
import { FiSearch } from "react-icons/fi";
import type { Product } from "../types/product-types";
import Basket from "../components/Basket";
import ProductGrid from "../components/ProductGrid";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    price: 0,
    description: "",
    stock: 0,
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: 0,
    description: "",
    stock: 0,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Basket state (from backend)
  const [basket, setBasket] = useState<
    { product: Product; quantity: number }[]
  >([]);
  const [basketLoading, setBasketLoading] = useState(false);
  const [basketError, setBasketError] = useState<string | null>(null);

  // Fetch basket from backend
  async function fetchBasket() {
    setBasketLoading(true);
    try {
      const data = await getBasket();
      setBasket(data);
      setBasketError(null);
    } catch (err) {
      setBasketError(err instanceof Error ? err.message : String(err));
    } finally {
      setBasketLoading(false);
    }
  }

  // Add to basket handler (backend)
  async function handleAddToBasket(product: Product) {
    try {
      await addToBasket(product.id, 1);
      await fetchBasket();
      await fetchProducts();
    } catch (err) {
      setBasketError(err instanceof Error ? err.message : String(err));
    }
  }

  // Remove from basket handler (backend)
  async function handleRemoveFromBasket(productId: number) {
    try {
      await removeFromBasket(productId);
      await fetchBasket();
      await fetchProducts();
    } catch (err) {
      setBasketError(err instanceof Error ? err.message : String(err));
    }
  }

  // Delete product handler (backend)
  async function handleDeleteProduct(productId: number) {
    try {
      setDeleteLoading(true);
      await deleteProductApi(productId);
      await fetchProducts();
      await fetchBasket();
      setShowDeleteDialog(false);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleteLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchBasket();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fff] font-[Inter,sans-serif] relative">
      <Basket
        basket={basket.filter((item) =>
          products.some((p) => p.id === item.product.id)
        )}
        onRemove={handleRemoveFromBasket}
      />
      {basketLoading && (
        <div className="fixed left-8 bottom-32 z-50 bg-white border border-[#E5E7EB] rounded-[8px] shadow p-3 text-gray-500">
          Loading basket...
        </div>
      )}
      {basketError && (
        <div className="fixed left-8 bottom-32 z-50 bg-white border border-[#F43F5E] rounded-[8px] shadow p-3 text-[#F43F5E]">
          {basketError}
        </div>
      )}
      <div className="max-w-[1240px] mx-auto pt-8 px-6">
        <div className="flex flex-row items-center justify-between mb-6">
          <h1
            className="text-[16px] font-normal text-[#18181B]"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
          >
            Product Management
          </h1>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#18181B] text-white rounded-[8px] font-medium text-[14px] shadow hover:bg-[#23223a] transition-all duration-150"
            style={{ fontFamily: "Inter, sans-serif" }}
            onClick={() => setShowAddDialog(true)}
          >
            <span className="text-[18px] font-bold">+</span> Add Product
          </button>
        </div>
        <div className="mb-6">
          <div className="relative w-full max-w-[400px] flex items-center">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#18181B] h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full rounded-[8px] bg-[#F7F7F8] text-base text-black placeholder:text-black focus:outline-none shadow-sm border border-[#E5E7EB]"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </div>
        </div>
        <ProductGrid
          products={products}
          onAddToBasket={handleAddToBasket}
          onView={(product) => {
            setDetailProduct(product);
            setShowDetailDialog(true);
          }}
          onEdit={(product) => {
            setEditProduct(product);
            setEditForm({
              name: product.name,
              price: product.price,
              description: product.description || "",
              stock: product.stock,
            });
            setShowEditDialog(true);
            setEditError(null);
          }}
          onDelete={(product) => {
            setDeleteProduct(product);
            setShowDeleteDialog(true);
            setDeleteError(null);
          }}
        />
      </div>
      {/* Add Product Dialog */}
      {showAddDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddDialog(false);
          }}
        >
          <div
            className="bg-white rounded-[16px] shadow-2xl p-8 w-full max-w-[440px] relative border border-[#E5E7EB]"
            style={{ fontFamily: "Inter, sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-5 right-5 text-[#18181B] hover:text-black text-2xl font-bold"
              onClick={() => setShowAddDialog(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-[20px] font-bold mb-6 text-[#18181B] tracking-tight text-left">
              Add New Product
            </h2>
            <form
              className="flex flex-col gap-5"
              onSubmit={async (e) => {
                e.preventDefault();
                setAddLoading(true);
                setAddError(null);
                try {
                  await addProduct(addForm);
                  setShowAddDialog(false);
                  setAddForm({
                    name: "",
                    price: 0,
                    description: "",
                    stock: 0,
                  });
                  fetchProducts();
                } catch (err) {
                  setAddError(err instanceof Error ? err.message : String(err));
                } finally {
                  setAddLoading(false);
                }
              }}
            >
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-semibold text-[#18181B] text-left">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  className="rounded-[8px] px-4 py-2 text-base bg-[#F4F4F5] text-[#18181B] focus:outline-none"
                  required
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-semibold text-[#18181B] text-left">
                  Description
                </label>
                <textarea
                  placeholder="Enter product description"
                  className="rounded-[8px] px-4 py-2 text-base bg-[#F4F4F5] text-[#18181B] focus:outline-none resize-none"
                  value={addForm.description}
                  onChange={(e) =>
                    setAddForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-2 w-1/2">
                  <label className="text-[15px] font-semibold text-[#18181B] text-left">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="rounded-[8px] px-4 py-2 text-base bg-[#F4F4F5] text-[#18181B] focus:outline-none"
                    required
                    min={0}
                    step={0.01}
                    value={addForm.price}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setAddForm((f) => ({
                        ...f,
                        price: isNaN(value) ? 0 : value,
                      }));
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                  <label className="text-[15px] font-semibold text-[#18181B] text-left">
                    Stock
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="rounded-[8px] px-4 py-2 text-base bg-[#F4F4F5] text-[#18181B] focus:outline-none"
                    required
                    min={0}
                    value={addForm.stock}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setAddForm((f) => ({
                        ...f,
                        stock: isNaN(value) ? 0 : value,
                      }));
                    }}
                  />
                </div>
              </div>
              {addError && (
                <div className="text-[#F43F5E] text-sm">{addError}</div>
              )}
              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  className="bg-[#F4F4F5] text-[#18181B] rounded-[8px] px-5 py-2 font-medium text-base border border-[#E5E7EB] hover:bg-[#F7F7F8] transition-all duration-150"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#18181B] text-white rounded-[8px] px-5 py-2 font-semibold text-base hover:bg-[#23223a] transition-all duration-150"
                  disabled={addLoading}
                >
                  {addLoading ? "Adding..." : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Product Dialog */}
      {showEditDialog && editProduct && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditDialog(false);
          }}
        >
          <div
            className="bg-white rounded-[16px] shadow-2xl p-8 w-full max-w-[440px] relative border border-[#E5E7EB]"
            style={{ fontFamily: "Inter, sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-5 right-5 text-[#18181B] hover:text-black text-2xl font-bold"
              onClick={() => setShowEditDialog(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-[20px] font-bold mb-6 text-[#18181B] tracking-tight text-left">
              Edit Product
            </h2>
            <form
              className="flex flex-col gap-5"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editProduct) return;
                setEditLoading(true);
                setEditError(null);
                try {
                  await updateProduct(editProduct.id, editForm);
                  setShowEditDialog(false);
                  fetchProducts();
                } catch (err) {
                  setEditError(
                    err instanceof Error ? err.message : String(err)
                  );
                } finally {
                  setEditLoading(false);
                }
              }}
            >
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-semibold text-[#18181B] text-left">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="Product Name"
                  className="rounded-[8px] px-4 py-2 text-base bg-[#F4F4F5] text-[#18181B] focus:outline-none"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-semibold text-[#18181B] text-left">
                  Description
                </label>
                <textarea
                  placeholder="Description"
                  className="rounded-[8px] px-4 py-2 text-base bg-[#F4F4F5] text-[#18181B] focus:outline-none resize-none"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-2 w-1/2">
                  <label className="text-[15px] font-semibold text-[#18181B] text-left">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    placeholder="Price"
                    className="rounded-[8px] px-4 py-2 text-base bg-[#F4F4F5] text-[#18181B] focus:outline-none"
                    required
                    min={0}
                    step={0.01}
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        price: isNaN(parseFloat(e.target.value))
                          ? 0
                          : parseFloat(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                  <label className="text-[15px] font-semibold text-[#18181B] text-left">
                    Stock
                  </label>
                  <input
                    type="number"
                    placeholder="Stock"
                    className="rounded-[8px] px-4 py-2 text-base bg-[#F4F4F5] text-[#18181B] focus:outline-none"
                    required
                    min={0}
                    value={editForm.stock}
                    onChange={(e) =>
                      setEditForm((f) => {
                        const value = parseInt(e.target.value);
                        return {
                          ...f,
                          stock: isNaN(value) ? 0 : value,
                        };
                      })
                    }
                  />
                </div>
              </div>
              {editError && (
                <div className="text-[#F43F5E] text-sm">{editError}</div>
              )}
              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  className="bg-[#F4F4F5] text-[#18181B] rounded-[8px] px-5 py-2 font-medium text-base border border-[#E5E7EB] hover:bg-[#F7F7F8] transition-all duration-150"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#18181B] text-white rounded-[8px] px-5 py-2 font-semibold text-base hover:bg-[#23223a] transition-all duration-150"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Product Detail Dialog */}
      {showDetailDialog && detailProduct && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDetailDialog(false);
          }}
        >
          <div
            className="bg-white rounded-[16px] shadow-2xl p-8 w-full max-w-[480px] relative border border-[#E5E7EB]"
            style={{ fontFamily: "Inter, sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-5 right-5 text-[#18181B] hover:text-black text-2xl font-bold"
              onClick={() => setShowDetailDialog(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-[18px] font-bold mb-2 text-[#18181B] tracking-tight text-left">
              Product Details
            </h2>
            <h3 className="text-[16px] font-bold mb-2 text-[#18181B] text-left">
              {detailProduct.name}
            </h3>
            <p className="text-[15px] text-[#71717A] mb-4 text-left">
              {detailProduct.description}
            </p>
            <hr className="mb-4" />
            <div className="flex flex-row gap-8 mb-2">
              <div className="flex flex-col items-start w-1/2">
                <span className="text-[13px] text-[#71717A]">Price:</span>
                <span className="text-[15px] font-bold text-[#18181B]">
                  ${detailProduct.price.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col items-start w-1/2">
                <span className="text-[13px] text-[#71717A]">Stock:</span>
                <span className="text-[15px] font-bold text-[#18181B] whitespace-pre">
                  {detailProduct.stock} units
                </span>
              </div>
            </div>
            <div className="mt-2 text-[13px] text-[#71717A]">
              Product ID:
              <br />
              <span className="text-[#18181B]">{detailProduct.id}</span>
            </div>
          </div>
        </div>
      )}
      {/* Delete Product Dialog */}
      {showDeleteDialog && deleteProduct && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteDialog(false);
          }}
        >
          <div
            className="bg-white rounded-[16px] shadow-2xl p-8 w-full max-w-[480px] relative border border-[#E5E7EB]"
            style={{ fontFamily: "Inter, sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[20px] font-bold mb-3 text-[#18181B] tracking-tight text-left">
              Delete Product
            </h2>
            <p className="mb-7 text-base text-[#71717A] text-left">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#18181B]">
                "{deleteProduct.name}"
              </span>
              ? This action cannot be undone.
            </p>
            {deleteError && (
              <div className="text-[#F43F5E] text-sm mb-2">{deleteError}</div>
            )}
            <div className="flex gap-3 justify-end mt-2">
              <button
                className="bg-[#F4F4F5] text-[#18181B] rounded-[8px] px-5 py-2 font-medium text-base border border-[#E5E7EB] hover:bg-[#F7F7F8] transition-all duration-150"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#F43F5E] text-white rounded-[8px] px-5 py-2 font-semibold text-base border border-[#F43F5E] hover:bg-[#e11d48] transition-all duration-150"
                onClick={async () => {
                  if (!deleteProduct) return;
                  setDeleteLoading(true);
                  setDeleteError(null);
                  try {
                    await deleteProductApi(deleteProduct.id);
                    setShowDeleteDialog(false);
                    fetchProducts();
                  } catch (err) {
                    setDeleteError(
                      err instanceof Error ? err.message : String(err)
                    );
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Loading/Error States */}
      {loading && (
        <div className="text-center text-gray-500">Loading products...</div>
      )}
      {error && <div className="text-center text-red-500">{error}</div>}
    </div>
  );
}
