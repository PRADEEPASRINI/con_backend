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
        // Get all unique customers from the orders endpoint
        const response = await axios.get(`${API_BASE_URL}/api/orders/customers`);
        
        // Extract customer IDs from the response
        const customerIds = response.data.map((customer: any) => customer.customerId);
        
        setCustomers(customerIds || []);
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
      console.log(`Fetching data for customer ID: ${customerId}`);
      
      // FIX: Try/catch each API call separately to avoid failing the entire Promise.all
      let ordersData = [];
      let cuttingData = [];
      let stitchingData = [];
      let qualityData = [];
      
      try {
        const ordersResponse = await axios.get(`${API_BASE_URL}/api/orders/customer/${customerId}`);
        ordersData = ordersResponse.data || [];
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
      
      try {
        const cuttingResponse = await axios.get(`${API_BASE_URL}/api/cutting/customer/${customerId}`);
        cuttingData = cuttingResponse.data || [];
      } catch (err) {
        console.error("Error fetching cutting data:", err);
      }
      
      try {
        const stitchingResponse = await axios.get(`${API_BASE_URL}/api/stitching/customer/${customerId}`);
        stitchingData = stitchingResponse.data || [];
      } catch (err) {
        console.error("Error fetching stitching data:", err);
      }
      
      try {
        const qualityResponse = await axios.get(`${API_BASE_URL}/api/quality/customer/${customerId}`);
        qualityData = qualityResponse.data || [];
      } catch (err) {
        console.error("Error fetching quality data:", err);
      }

      // Process order data as the base
      if (ordersData.length === 0) {
        setError("No orders found for this customer ID.");
        setLoading(false);
        return;
      }
      
      // Map additional data from other collections
      const processedItems = ordersData.map((order: any) => {
        // Find matching cutting data
        const cuttingItem = cuttingData.find((item: any) => 
          item.orderId === order._id.toString()
        ) || {};
        
        // Find matching stitching data
        const stitchingItem = stitchingData.find((item: any) => 
          item.orderId === order._id.toString()
        ) || {};
        
        // Find matching quality data based on color
        const qualityItem = qualityData.find((item: any) => 
          item.color === order.color
        ) || {};
        
        // Combine all data into a single item
        return {
          id: order._id || "",
          customerId: order.customerId || "",
          itemName: order.itemName || "",
          size: order.size || "",
          color: order.color || "",
          quantity: order.quantity || 0,
          clothType: order.clothType || qualityItem.clothType || "",
          cuttingStatus: cuttingItem.status || order.cuttingStatus || "Not Started",
          stitchingStatus: stitchingItem.status || order.stitchingStatus || "Not Started",
          qualityStatus: qualityItem.qualityStatus || "",
          supervisor: cuttingItem.supervisor || qualityItem.supervisor || "",
          tailor: stitchingItem.tailor || "",
          rejectedReason: qualityItem.rejectedReason || "",
          imageUrl: qualityItem.photoUrl || "",
          date: order.date || qualityItem.date || new Date().toISOString().split('T')[0],
        };
      });
      
      setItems(processedItems);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Update an item
  const updateItem = async (updatedItem: ProductItem) => {
    try {
      // For quality updates, we need to update by color
      if (updatedItem.qualityStatus) {
        // Create form data for file uploads if needed
        const formData = new FormData();
        formData.append('qualityStatus', updatedItem.qualityStatus);
        
        if (updatedItem.rejectedReason) {
          formData.append('rejectedReason', updatedItem.rejectedReason);
        }
        
        if (updatedItem.supervisor) {
          formData.append('supervisor', updatedItem.supervisor);
        }
        
        if (updatedItem.clothType) {
          formData.append('clothType', updatedItem.clothType);
        }
        
        // Convert imageUrl to File object if needed
        // Note: This only works if imageUrl is a Blob URL from this session
        // For existing URLs, we'd need to keep the URL as is
        if (updatedItem.imageUrl && updatedItem.imageUrl.startsWith('blob:')) {
          try {
            const response = await fetch(updatedItem.imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'quality-image.jpg', { type: 'image/jpeg' });
            formData.append('photo', file);
          } catch (err) {
            console.error("Error processing image:", err);
          }
        }
        
        // Make the API call
        const response = await axios.put(
          `${API_BASE_URL}/api/quality/${updatedItem.customerId}/${updatedItem.color}`, 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log("Quality update response:", response.data);
        
        // Update local state for all items with this color
        const updatedItems = items.map(item => {
          if (item.color === updatedItem.color) {
            return {
              ...item,
              qualityStatus: updatedItem.qualityStatus,
              rejectedReason: updatedItem.rejectedReason || item.rejectedReason,
              supervisor: updatedItem.supervisor || item.supervisor,
              imageUrl: updatedItem.imageUrl || item.imageUrl
            };
          }
          return item;
        });
        
        setItems(updatedItems);
      }
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