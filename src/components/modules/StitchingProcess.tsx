import React, { useState } from "react";
import { useData, ProductItem } from "@/context/DataContext";
import DataTable, { Column } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/use-toast";
import { Check, Save } from "lucide-react";

// Placeholder for analytics tracking
const trackAnalytics = (event: string, data: object) => {
  console.log(`Analytics Event: ${event}`, data);
};

const StitchingProcess = () => {
  const { items, loading, updateItem, fetchItemsByCustomerId } = useData();
  const [searchId, setSearchId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProductItem>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSearch = () => {
    if (searchId.trim()) {
      setSelectedCustomerId(searchId.trim());
      fetchItemsByCustomerId(searchId.trim());
      setEditingId(null);
      // Track search event
      trackAnalytics('Search Initiated', { customerId: searchId.trim() });
    }
  };

  const handleEdit = (item: ProductItem) => {
    if (item.cuttingStatus !== "Done") {
      toast({
        title: "Cannot start stitching",
        description: "The cutting process must be completed first.",
        variant: "destructive",
      });
      return;
    }

    setEditingId(item.id);
    setEditForm({
      stitchingStatus: item.stitchingStatus,
      tailor: item.tailor || "",
    });
    // Track edit initiation event
    trackAnalytics('Edit Initiated', { itemId: item.id, itemName: item.itemName });
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
        title: "Stitching process updated",
        description: `${item.itemName} has been updated to ${editForm.stitchingStatus}.`,
      });
      
      // Track save event
      trackAnalytics('Stitching Process Updated', {
        itemId: item.id,
        itemName: item.itemName,
        stitchingStatus: editForm.stitchingStatus,
        tailor: editForm.tailor,
      });
    }, 600);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleRowClick = (item: ProductItem) => {
    if (editingId === null && item.cuttingStatus === "Done") {
      handleEdit(item);
    }
  };

  const filteredItems = items.filter(item => item.cuttingStatus === "Done");

  const columns: Column<ProductItem>[] = [
    { header: "Item Name", accessor: "itemName" },
    { header: "Size", accessor: "size", width: "80px" },
    { header: "Quantity", accessor: "quantity", width: "100px" },
    {
      header: "Tailor",
      accessor: (item) => {
        if (editingId === item.id) {
          return (
            <select
              name="tailor"
              value={editForm.tailor || ""}
              onChange={handleInputChange}
              className="w-full rounded-md border border-textile-300 px-2 py-1 text-sm text-black" // Tailor field text color set to black
              autoFocus
            >
              <option value="">Select Tailor</option>
              <option value="Ravi">Ravi</option>
              <option value="Anjali">Anjali</option>
              <option value="Krish">Krish</option>
              <option value="Devi">Devi</option>
              <option value="Amaan">Amaan</option>
              <option value="Nisha">Nisha</option>
            </select>
          );
        }
        return item.tailor || "-";
      },
      width: "150px",
    },
    {
      header: "Stitching Status",
      accessor: (item) => {
        if (editingId === item.id) {
          return (
            <select
              name="stitchingStatus"
              value={editForm.stitchingStatus}
              onChange={handleInputChange}
              className="w-full rounded-md border border-textile-300 px-2 py-1 text-sm text-black" // Stitching Status field text color set to black
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          );
        }
        return (
          <span className={`status-badge ${item.stitchingStatus.toLowerCase().replace(' ', '-')}`}>
            {item.stitchingStatus}
          </span>
        );
      },
      width: "150px",
    },
    {
      header: "Cutting Status",
      accessor: (item) => (
        <span className={`status-badge ${item.cuttingStatus.toLowerCase().replace(' ', '-')}`}>
          {item.cuttingStatus}
        </span>
      ),
      width: "150px",
    },
    { header: "Date", accessor: "date", width: "110px" },
    {
      header: "Actions",
      accessor: (item) => {
        if (editingId === item.id) {
          return (
            <div className="flex space-x-2">
              <button
                onClick={() => handleSave(item)}
                disabled={saving || !editForm.tailor}
                className="inline-flex items-center rounded-md bg-textile-900 px-2 py-1 text-xs text-white hover:bg-textile-800 disabled:bg-textile-300"
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
                className="inline-flex items-center rounded-md bg-textile-200 px-2 py-1 text-xs text-textile-800 hover:bg-textile-300"
              >
                Cancel
              </button>
            </div>
          );
        }
        if (item.cuttingStatus === "Done") {
          return (
            <button
              onClick={() => handleEdit(item)}
              className="inline-flex items-center rounded-md bg-textile-100 px-2 py-1 text-xs text-textile-800 hover:bg-textile-200"
            >
              Edit
            </button>
          );
        }
        return (
          <span className="text-xs text-textile-400">Cutting pending</span>
        );
      },
      width: "120px",
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 text-white"> {/* Outer page text color set to white */}
      <h1 className="mb-8 text-3xl font-bold text-textile-900">Stitching Process</h1>

      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center">
        <input
          type="text"
          placeholder="Enter Customer ID (e.g., SFD12345)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="w-full rounded-md border border-textile-300 px-3 py-2 text-textile-900 md:w-1/3 text-black" // Search field text color set to black
        />
        <button
          onClick={handleSearch}
          className="mt-2 rounded-md bg-textile-900 px-4 py-2 text-sm font-medium text-white hover:bg-textile-800 md:mt-0"
        >
          Search
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        keyExtractor={(item) => item.id}
        onRowClick={handleRowClick}
        isLoading={loading}
      />
    </div>
  );
};

export default StitchingProcess;
