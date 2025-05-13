import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// Define the product item structure
export interface ProductItem {
  id: string;
  customerId: string;
  itemName: string;
  size: string;
  color: string;
  quantity: number;
  clothType: string;
  cuttingStatus: string;
  stitchingStatus: string;
  qualityStatus: string;
  supervisor: string;
  tailor: string;
  rejectedReason?: string;
  imageUrl?: string;
  date: string;
}

// Define our context structure
interface DataContextType {
  items: ProductItem[];
  customers: string[];
  loading: boolean;
  error: string | null;
  fetchItemsByCustomerId: (customerId: string) => void;
  updateItem: (item: ProductItem) => void;
}

// Create the context with a default value
const DataContext = createContext<DataContextType>({
  items: [],
  customers: [],
  loading: false,
  error: null,
  fetchItemsByCustomerId: () => {},
  updateItem: () => {},
});

// Custom hook for using the data context
export const useData = () => useContext(DataContext);

// Base API URL - configure this based on your environment
const API_BASE_URL = "http://localhost:5000";

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [customers, setCustomers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all available customer IDs
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // FIX: Remove reference to undefined customerId variable
        const response = await axios.get(`${API_BASE_URL}/api/orders/customers`);
        setCustomers(response.data || []);
      } catch (err) {
        console.error("Error fetching customers:", err);
        // Since this is not critical, we'll just log the error
      }
    };

    fetchCustomers();
  }, []);

  // Fetch items by customer ID
  const fetchItemsByCustomerId = async (customerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // FIX: Update endpoints to match your actual API structure in server.js
      const [ordersResponse, cuttingResponse, stitchingResponse, qualityResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/orders/customer/${customerId}`),
        axios.get(`${API_BASE_URL}/api/cutting/customer/${customerId}`),
        axios.get(`${API_BASE_URL}/api/stitching/customer/${customerId}`),
        axios.get(`${API_BASE_URL}/api/quality/customer/${customerId}`)
      ]);

      // Process order data as the base
      const orderItems = ordersResponse.data || [];
      
      // Map additional data from other collections
      const processedItems = orderItems.map((order: any) => {
        // Find matching cutting data
        const cuttingData = cuttingResponse.data?.find((item: any) => 
          item.customerId === order.customerId && 
          (item.orderId === order.orderId || item.orderId === order._id)
        ) || {};
        
        // Find matching stitching data
        const stitchingData = stitchingResponse.data?.find((item: any) => 
          item.customerId === order.customerId && 
          (item.orderId === order.orderId || item.orderId === order._id)
        ) || {};
        
        // Find matching quality data
        const qualityData = qualityResponse.data?.find((item: any) => 
          item.customerId === order.customerId && 
          order.color === item.color
        ) || {};
        
        // Combine all data into a single item
        return {
          id: order._id || "",
          customerId: order.customerId || "",
          itemName: order.itemName || "",
          size: order.size || "",
          color: order.color || "",
          quantity: order.quantity || 0,
          clothType: order.clothType || qualityData.clothType || "",
          cuttingStatus: cuttingData.status || "Not Started",
          stitchingStatus: stitchingData.status || "Not Started",
          qualityStatus: qualityData.qualityStatus || "",
          supervisor: cuttingData.supervisor || qualityData.supervisor || "",
          tailor: stitchingData.tailor || "",
          rejectedReason: qualityData.rejectedReason || "",
          imageUrl: qualityData.photoUrl || "",
          date: order.date || cuttingData.date || stitchingData.date || qualityData.date || "",
        };
      });
      
      setItems(processedItems);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please check if the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  // Update an item
  const updateItem = async (updatedItem: ProductItem) => {
    try {
      // FIX: Update API endpoints to match your backend routes
      if (updatedItem.cuttingStatus) {
        await axios.put(`${API_BASE_URL}/api/cutting/${updatedItem.id}`, {
          status: updatedItem.cuttingStatus,
          supervisor: updatedItem.supervisor,
          date: updatedItem.date,
        });
      }

      if (updatedItem.stitchingStatus) {
        await axios.put(`${API_BASE_URL}/api/stitching/${updatedItem.id}`, {
          status: updatedItem.stitchingStatus,
          tailor: updatedItem.tailor,
          date: updatedItem.date,
        });
      }

      if (updatedItem.qualityStatus) {
        await axios.put(`${API_BASE_URL}/api/quality/${updatedItem.customerId}/${updatedItem.color}`, {
          qualityStatus: updatedItem.qualityStatus,
          rejectedReason: updatedItem.rejectedReason,
          supervisor: updatedItem.supervisor,
          photoUrl: updatedItem.imageUrl,
        });
      }

      // Update local state
      setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
    } catch (err) {
      console.error("Error updating item:", err);
      // Handle errors, possibly show a toast
    }
  };

  // Context value
  const value = {
    items,
    customers,
    loading,
    error,
    fetchItemsByCustomerId,
    updateItem,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};