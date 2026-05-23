"use client";

import { useEffect, useState } from "react";

interface Inventory {
  warehouseId: number;
  warehouse: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  inventories: Inventory[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();

      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function reserveProduct(
    productId: number,
    warehouseId: number
  ) {
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          warehouseId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      alert("Reservation created!");

      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Reservation failed");
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-xl">
        Loading products...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <h1 className="mb-8 text-4xl font-bold">
        Inventory Reservation System
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-xl bg-white p-6 shadow-md"
          >
            <h2 className="text-2xl font-semibold">
              {product.name}
            </h2>

            <p className="mt-2 text-gray-600">
              {product.description}
            </p>

            <div className="mt-6 space-y-4">
              {product.inventories.map(
                (inventory, index) => (
                  <div
                    key={index}
                    className="rounded-lg border p-4"
                  >
                    <h3 className="font-semibold">
                      {inventory.warehouse}
                    </h3>

                    <p>
                      Total Stock:{" "}
                      {inventory.totalStock}
                    </p>

                    <p>
                      Reserved Stock:{" "}
                      {inventory.reservedStock}
                    </p>

                    <p>
                      Available Stock:{" "}
                      {inventory.availableStock}
                    </p>

                    <button
  onClick={() =>
    reserveProduct(
      product.id,
      inventory.warehouseId
    )
  }
  disabled={inventory.availableStock <= 0}
  className={`mt-3 rounded-lg px-4 py-2 text-white ${
    inventory.availableStock <= 0
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-black hover:bg-gray-800"
  }`}
>
  {inventory.availableStock <= 0
    ? "Out of Stock"
    : "Reserve 1 Item"}
</button>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}