import React, { useState, useRef } from "react";
import { useData, ProductItem } from "@/context/DataContext";
import DataTable, { Column } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Check, Save } from "lucide-react";

const CuttingManagement = () => {
  const { items, loading, updateItem, customers, fetchItemsByCustomerId } = useData();
  const [customerId, setCustomerId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProductItem>>({});
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleCustomerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerId(e.target.value);
  };

  const handleCustomerIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerId.trim()) {
      fetchItemsByCustomerId(customerId.trim());
      setEditingId(null);

      toast({
        title: "Customer ID updated",
        description: `Now showing data for ${customerId}`,
      });
    }
  };

  const handleEdit = (item: ProductItem) => {
    setEditingId(item.id);
    setEditForm({
      cuttingStatus: item.cuttingStatus,
      supervisor: item.supervisor,
      date: item.date,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleSave = (item: ProductItem) => {
    setSaving(true);
    setTimeout(() => {
      const updatedItem = {
        ...item,
        ...editForm,
      };
      updateItem(updatedItem);
      setEditingId(null);
      setSaving(false);
      toast({
        title: "Cutting status updated",
        description: `${item.itemName} has been updated to ${editForm.cuttingStatus}.`,
      });
    }, 600);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleRowClick = (item: ProductItem) => {
    if (editingId === null) {
      handleEdit(item);
    }
  };

  const columns: Column<ProductItem>[] = [
    { header: "#", accessor: (row, index) => index + 1, width: "60px" },
    { header: "Item Name", accessor: "itemName" },
    { header: "Color", accessor: "color", width: "100px" },
    { header: "Size", accessor: "size", width: "80px" },
    { header: "Quantity", accessor: "quantity", width: "100px" },
    {
      header: "Cutting Status",
      accessor: (item) =>
        editingId === item.id ? (
          <select
            name="cuttingStatus"
            value={editForm.cuttingStatus}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-700 bg-gray-900 text-white px-2 py-1 text-sm"
            autoFocus
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        ) : (
          <span className={`status-badge ${item.cuttingStatus.toLowerCase().replace(' ', '-')}`}>
            {item.cuttingStatus}
          </span>
        ),
      width: "150px",
    },
    {
      header: "Supervisor",
      accessor: (item) =>
        editingId === item.id ? (
          <input
            type="text"
            name="supervisor"
            value={editForm.supervisor || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-700 bg-gray-900 text-white px-2 py-1 text-sm"
          />
        ) : (
          item.supervisor
        ),
      width: "150px",
    },
    {
      header: "Date",
      accessor: (item) => 
        editingId === item.id ? (
          <input
            type="date"
            name="date"
            value={editForm.date || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-700 bg-gray-900 text-white px-2 py-1 text-sm"
          />
        ) : (
          item.date
        ),
      width: "110px",
    },
    {
      header: "Actions",
      accessor: (item) =>
        editingId === item.id ? (
          <div className="flex space-x-2">
            <button
              onClick={() => handleSave(item)}
              disabled={saving}
              className="inline-flex items-center rounded-md bg-green-700 px-4 py-2 text-xs text-white hover:bg-green-600 transition-all"
            >
              {saving ? (
                <span className="flex items-center">
                  <span className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Saving
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="mr-1 h-3 w-3" />
                  Save
                </span>
              )}
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center rounded-md bg-gray-700 px-4 py-2 text-xs text-gray-300 hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleEdit(item)}
            className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-xs text-white hover:bg-blue-600 transition-all"
          >
            Edit
          </button>
        ),
      width: "120px",
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-6 py-8 bg-black text-white rounded-lg shadow-xl">
      <h1 className="mb-8 text-3xl font-bold text-center">Cutting Management</h1>

      <div className="mb-6">
        <form onSubmit={handleCustomerIdSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="w-full sm:w-2/3">
            <label htmlFor="customerId" className="mb-2 block text-sm font-medium text-white">
              Enter Customer ID
            </label>
            <Input
              id="customerId"
              value={customerId}
              onChange={handleCustomerIdChange}
              placeholder="Enter customer ID (e.g., SFD12345)"
              className="w-full text-sm p-3 rounded-md border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <button
            type="submit"
            className="mt-4 sm:mt-0 sm:self-end rounded-md bg-gray-800 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-600 transition-all"
          >
            Load Data
          </button>
        </form>
      </div>

      <form ref={formRef}>
        <DataTable
          columns={columns}
          data={items}
          keyExtractor={(item) => item.id}
          onRowClick={handleRowClick}
          isLoading={loading}
        />
      </form>

      <div className="mt-6 rounded-md bg-gray-900 p-4 text-sm text-gray-300">
        <p className="font-medium text-white">Instructions:</p>
        <ul className="ml-5 mt-2 list-disc">
          <li>Click on any row to edit the cutting status, supervisor, and date</li>
          <li>Save to update the status and notify the stitching department</li>
          <li>Items marked "Done" will be available for the stitching process</li>
          <li>Type a customer ID manually to load data</li>
        </ul>
      </div>
    </div>
  );
};

export default CuttingManagement;