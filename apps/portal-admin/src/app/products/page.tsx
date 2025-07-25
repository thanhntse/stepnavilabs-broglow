"use client";

import { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Badge } from "primereact/badge";
import {
  ShoppingBag,
  Plus,
  MagnifyingGlass,
  Eye,
  Pencil,
  Trash,
  Tag
} from "@phosphor-icons/react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading products data
    const loadProducts = async () => {
      setLoading(true);
      setTimeout(() => {
        setProducts([
          {
            id: "1",
            name: "Men's Facial Cleanser",
            category: "cleanser",
            price: 24.99,
            stock: 150,
            status: "active",
            createdAt: "2024-01-15",
            updatedAt: "2024-01-20"
          },
          {
            id: "2",
            name: "Anti-Aging Serum",
            category: "serum",
            price: 49.99,
            stock: 75,
            status: "active",
            createdAt: "2024-01-10",
            updatedAt: "2024-01-18"
          },
          {
            id: "3",
            name: "Moisturizing Cream",
            category: "moisturizer",
            price: 34.99,
            stock: 0,
            status: "out_of_stock",
            createdAt: "2024-01-05",
            updatedAt: "2024-01-15"
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    loadProducts();
  }, []);

  const categoryOptions = [
    { label: "All Categories", value: null },
    { label: "Cleanser", value: "cleanser" },
    { label: "Serum", value: "serum" },
    { label: "Moisturizer", value: "moisturizer" },
    { label: "Sunscreen", value: "sunscreen" },
    { label: "Treatment", value: "treatment" }
  ];

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "inactive": return "warning";
      case "out_of_stock": return "danger";
      default: return "info";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "inactive": return "Inactive";
      case "out_of_stock": return "Out of Stock";
      default: return status;
    }
  };

  const getCategoryIcon = () => {
    return <Tag size={16} />;
  };

  const priceBodyTemplate = (rowData: Product) => {
    return `$${rowData.price.toFixed(2)}`;
  };

  const stockBodyTemplate = (rowData: Product) => {
    const severity = rowData.stock === 0 ? "danger" : rowData.stock < 10 ? "warning" : "success";
    return (
      <Badge
        value={rowData.stock}
        severity={severity}
      />
    );
  };

  const actionBodyTemplate = () => {
    return (
      <div className="flex gap-2">
        <Button icon={<Eye size={16} />} size="small" text />
        <Button icon={<Pencil size={16} />} size="small" text />
        <Button icon={<Trash size={16} />} size="small" text severity="danger" />
      </div>
    );
  };

  const header = (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div className="flex items-center gap-3">
        <ShoppingBag size={24} className="text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
      </div>
      <div className="flex gap-2">
        <Button
          label="Add Product"
          icon={<Plus size={16} />}
          className="bg-green-600 hover:bg-green-700"
        />
      </div>
    </div>
  );

  const filters = (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex-1">
        <span className="p-input-icon-left w-full">
          <MagnifyingGlass className="p-input-icon-left" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search products..."
            className="w-full"
          />
        </span>
      </div>
      <div className="w-full sm:w-48">
        <Dropdown
          value={categoryFilter}
          options={categoryOptions}
          onChange={(e) => setCategoryFilter(e.value)}
          placeholder="Filter by category"
          className="w-full"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Card header={header}>
          {filters}
          <DataTable
            value={products}
            loading={loading}
            globalFilter={globalFilter}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            className="p-datatable-sm"
            emptyMessage="No products found."
          >
            <Column field="name" header="Product Name" sortable />
            <Column
              field="category"
              header="Category"
              sortable
              body={(rowData) => (
                <div className="flex items-center gap-2">
                  {getCategoryIcon()}
                  <span className="capitalize">{rowData.category}</span>
                </div>
              )}
            />
            <Column
              field="price"
              header="Price"
              sortable
              body={priceBodyTemplate}
            />
            <Column
              field="stock"
              header="Stock"
              sortable
              body={stockBodyTemplate}
            />
            <Column
              field="status"
              header="Status"
              sortable
              body={(rowData) => (
                <Badge
                  value={getStatusLabel(rowData.status)}
                  severity={getStatusSeverity(rowData.status)}
                />
              )}
            />
            <Column field="createdAt" header="Created" sortable />
            <Column field="updatedAt" header="Updated" sortable />
            <Column header="Actions" body={actionBodyTemplate} />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}
