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
      date: formatDateForInput(item.date),
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
              className="w-full rounded-md border border-textile-300 px-2 py-1 text-sm text-black"
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
              className="w-full rounded-md border border-textile-300 px-2 py-1 text-sm text-black"
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
    {
      header: "Date", 
      accessor: (item) => {
        if (editingId === item.id) {
          return (
            <input
              type="date"
              name="date"
              value={editForm.date || item.date}
              onChange={handleInputChange}
              className="w-full rounded-md border border-textile-300 px-2 py-1 text-sm text-black"
            />
          );
        }
        return item.date;
      }, 
      width: "110px" 
    },
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
    <div className="container mx-auto max-w-6xl px-4 py-8 bg-gray-900"> {/* Removed text-white, added dark background */}
      <h1 className="mb-8 text-3xl font-bold text-white">Stitching Process</h1> {/* Title explicitly white */}

      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center">
        <input
          type="text"
          placeholder="Enter Customer ID (e.g., SFD12345)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="w-full rounded-md border border-textile-300 px-3 py-2 text-black md:w-1/3"
        />
        <button
          onClick={handleSearch}
          className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 md:mt-0"
        >
          Search
        </button>
      </div>

      {/* Apply text-white to the DataTable container */}
      <div className="text-white">
        <DataTable
          columns={columns}
          data={filteredItems}
          keyExtractor={(item) => item.id}
          onRowClick={handleRowClick}
          isLoading={loading}
        />
      </div>

      {selectedCustomerId && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-md bg-white p-4 shadow-md text-gray-800"> {/* Added text color */}
            <h3 className="mb-2 text-lg font-medium text-textile-800">Tailor Assignments</h3>
            <ul className="space-y-2 text-sm">
              {["Ravi", "Anjali", "Krish", "Devi", "Amaan", "Nisha"].map(tailor => {
                const count = filteredItems.filter(item => item.tailor === tailor).length;
                return (
                  <li key={tailor} className="flex items-center justify-between">
                    <span>{tailor}</span>
                    <span className="rounded-full bg-textile-100 px-2 py-1 text-xs font-medium text-textile-800">
                      {count} items
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-md bg-white p-4 shadow-md text-gray-800"> {/* Added text color */}
            <h3 className="mb-2 text-lg font-medium text-textile-800">Progress Summary</h3>
            <div className="space-y-3">
              {["Not Started", "In Progress", "Done"].map(status => {
                const count = filteredItems.filter(item => item.stitchingStatus === status).length;
                const percentage = filteredItems.length > 0 ? Math.round((count / filteredItems.length) * 100) : 0;
                let bgColor;
                switch (status) {
                  case "Not Started": bgColor = "bg-textile-300"; break;
                  case "In Progress": bgColor = "bg-blue-500"; break;
                  case "Done": bgColor = "bg-green-500"; break;
                  default: bgColor = "bg-textile-300";
                }

                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{status}</span>
                      <span>{count} items ({percentage}%)</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-textile-100">
                      <div className={`h-full ${bgColor}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-md bg-white p-4 shadow-md text-gray-800"> {/* Added text color */}
            <h3 className="mb-2 text-lg font-medium text-textile-800">Instructions</h3>
            <ul className="ml-5 list-disc text-sm text-textile-700">
              <li>Search Customer ID to view items</li>
              <li>Click any row to assign tailor and update stitching</li>
              <li>Only items with "Done" cutting status are shown</li>
              <li>Items with "Done" stitching go to Quality Check</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StitchingProcess;