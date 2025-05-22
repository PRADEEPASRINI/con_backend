import React, { useState, useEffect } from "react";
import { useData, ProductItem } from "@/context/DataContext";
import DataTable, { Column } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/use-toast";
import { Check, Save } from "lucide-react";
import axios from "axios";

// Analytics tracking helper
const trackAnalytics = (event: string, data: object) => {
  console.log(`Analytics Event: ${event}`, data);
  
  // Log to console for debugging
  console.log({
    event,
    customerId: data.customerId || '',
    timestamp: new Date().toISOString()
  });
};

// Format date for input fields
const formatDateForInput = (dateString: string | undefined) => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return "";
    
    // Format as YYYY-MM-DD for input[type="date"]
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

const StitchingProcess = () => {
  const { items, loading, error, fetchItemsByCustomerId } = useData();
  const [searchId, setSearchId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProductItem>>({});
  const [saving, setSaving] = useState(false);
  const [dataFound, setDataFound] = useState(true);
  const { toast } = useToast();

  const handleSearch = () => {
    if (searchId.trim()) {
      setSelectedCustomerId(searchId.trim());
      fetchItemsByCustomerId(searchId.trim());
      setEditingId(null);
      
      // Track search event
      trackAnalytics('Search Initiated', { 
        customerId: searchId.trim(),
        page: 'StitchingProcess'
      });
    }
  };

  // Handle searching with Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Update state when items change
  useEffect(() => {
    if (items && items.length === 0 && !loading && selectedCustomerId) {
      setDataFound(false);
    } else {
      setDataFound(true);
    }
  }, [items, loading, selectedCustomerId]);

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
    trackAnalytics('Edit Initiated', { 
      itemId: item.id, 
      itemName: item.itemName,
      customerId: item.customerId
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleSave = async (item: ProductItem) => {
    setSaving(true);

    try {
      const updatedItem = {
        ...item,
        ...editForm,
      };

      // Call the backend API directly
      await axios.put(`http://localhost:5000/api/stitching/${item.id}`, {
        status: editForm.stitchingStatus,
        tailor: editForm.tailor,
        date: editForm.date
      });

      // Refresh the data to see the updated values
      await fetchItemsByCustomerId(item.customerId);
      
      setEditingId(null);
      
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
        customerId: item.customerId
      });
    } catch (error) {
      console.error("Error updating stitching status:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the stitching status.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleRowClick = (item: ProductItem) => {
    if (editingId === null && item.cuttingStatus === "Done") {
      handleEdit(item);
    }
  };

  // Filter items to show only those where cutting is either done or in progress
  const filteredItems = items && Array.isArray(items) 
    ? items.filter(item => item.cuttingStatus === "Done" || item.stitchingStatus !== "Not Started") 
    : [];

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
              <option value="Robert Lee">Robert Lee</option>
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
          <span className={`status-badge ${item.stitchingStatus?.toLowerCase().replace(' ', '-') || 'not-started'}`}>
            {item.stitchingStatus || "Not Started"}
          </span>
        );
      },
      width: "150px",
    },
    {
      header: "Cutting Status",
      accessor: (item) => (
        <span className={`status-badge ${item.cuttingStatus?.toLowerCase().replace(' ', '-') || 'not-started'}`}>
          {item.cuttingStatus || "Not Started"}
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
              value={editForm.date || formatDateForInput(item.date)}
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
    <div className="container mx-auto max-w-6xl px-4 py-8 bg-gray-900">
      <h1 className="mb-8 text-3xl font-bold text-white">Stitching Process</h1>

      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center">
        <input
          type="text"
          placeholder="Enter Customer ID (e.g., CUST001)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-md border border-textile-300 px-3 py-2 text-black md:w-1/3"
        />
        <button
          onClick={handleSearch}
          className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 md:mt-0"
        >
          Search
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-4 text-red-800">
          <p>{error}</p>
        </div>
      )}

      {/* No data message */}
      {!loading && selectedCustomerId && filteredItems.length === 0 && (
        <div className="mb-4 rounded-md bg-yellow-100 p-4 text-yellow-800">
          <p>
            {dataFound
              ? "No stitching data found for this customer. Please check the customer ID or ensure that items have completed the cutting process."
              : "No orders found for this customer ID."}
          </p>
        </div>
      )}

      {/* Apply text-white to the DataTable container */}
      <div className="text-white">
        <DataTable
          columns={columns}
          data={filteredItems}
          keyExtractor={(item) => item.id}
          onRowClick={handleRowClick}
          isLoading={loading}
          emptyMessage={selectedCustomerId ? "No matching records found" : "Search for a customer ID to see records"}
        />
      </div>

      {selectedCustomerId && filteredItems.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-md bg-white p-4 shadow-md text-gray-800">
            <h3 className="mb-2 text-lg font-medium text-textile-800">Tailor Assignments</h3>
            <ul className="space-y-2 text-sm">
              {["Robert Lee", "Ravi", "Anjali", "Krish", "Devi", "Amaan", "Nisha"].map(tailor => {
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

          <div className="rounded-md bg-white p-4 shadow-md text-gray-800">
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

          <div className="rounded-md bg-white p-4 shadow-md text-gray-800">
            <h3 className="mb-2 text-lg font-medium text-textile-800">Instructions</h3>
            <ul className="ml-5 list-disc text-sm text-textile-700">
              <li>Search Customer ID to view items</li>
              <li>Click any row to assign tailor and update stitching</li>
              <li>Only items with "Done" cutting status can be edited</li>
              <li>Items with "Done" stitching move to Quality Check</li>
              <li>Press ESC to cancel editing</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StitchingProcess;