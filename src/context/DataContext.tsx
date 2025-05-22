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
  fetchItemsByCustomerId: (customerId: string) => Promise<void>;
  updateItem: (item: ProductItem) => Promise<void>;
}

// Create the context with a default value
const DataContext = createContext<DataContextType>({
  items: [],
  customers: [],
  loading: false,
  error: null,
  fetchItemsByCustomerId: async () => {},
  updateItem: async () => {},
});

// Custom hook for using the data context
export const useData = () => useContext(DataContext);

// Base API URL - configure this based on your environment
const API_BASE_URL = "http://localhost:5000/api";

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
        console.log("Fetching customers from:", `${API_BASE_URL}/orders/customers`);
        const response = await axios.get(`${API_BASE_URL}/orders/customers`);
        
        console.log("Customers response:", response.data);
        
        // Extract customer IDs from the response
        const customerIds = response.data.map((customer: any) => customer.customerId || customer._id);
        
        setCustomers(customerIds || []);
      } catch (err) {
        console.error("Error fetching customers:", err);
        // Since this is not critical, we'll just log the error
      }
    };

    fetchCustomers();
  }, []);

  // Fetch items by customer ID
  const fetchItemsByCustomerId = async (customerId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching data for customer ID: ${customerId}`);
      
      // Fetch orders data (primary data source)
      let ordersData = [];
      try {
        console.log("Fetching orders from:", `${API_BASE_URL}/orders/customer/${customerId}`);
        const ordersResponse = await axios.get(`${API_BASE_URL}/orders/customer/${customerId}`);
        ordersData = ordersResponse.data || [];
        console.log("Orders data:", ordersData);
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        if (err.response?.status === 404) {
          setError(`No orders found for customer ID: ${customerId}`);
          return;
        }
        throw err;
      }

      if (ordersData.length === 0) {
        setError(`No orders found for customer ID: ${customerId}`);
        return;
      }
      
      // Fetch additional status data
      let cuttingData = [];
      let stitchingData = [];
      let qualityData = [];
      
      try {
        console.log("Fetching cutting data from:", `${API_BASE_URL}/cutting/customer/${customerId}`);
        const cuttingResponse = await axios.get(`${API_BASE_URL}/cutting/customer/${customerId}`);
        cuttingData = cuttingResponse.data || [];
        console.log("Cutting data:", cuttingData);
      } catch (err) {
        console.warn("Error fetching cutting data:", err);
      }
      
      try {
        console.log("Fetching stitching data from:", `${API_BASE_URL}/stitching/customer/${customerId}`);
        const stitchingResponse = await axios.get(`${API_BASE_URL}/stitching/customer/${customerId}`);
        stitchingData = stitchingResponse.data || [];
        console.log("Stitching data:", stitchingData);
      } catch (err) {
        console.warn("Error fetching stitching data:", err);
      }
      
      try {
        console.log("Fetching quality data from:", `${API_BASE_URL}/quality/customer/${customerId}`);
        const qualityResponse = await axios.get(`${API_BASE_URL}/quality/customer/${customerId}`);
        qualityData = qualityResponse.data || [];
        console.log("Quality data:", qualityData);
      } catch (err) {
        console.warn("Error fetching quality data:", err);
      }

      // Process and combine all data
      const processedItems = ordersData.map((order: any) => {
        console.log("Processing order:", order);
        
        // Convert order ID to string for consistent comparison
        const orderIdString = order._id?.toString() || order.id?.toString() || "";
        
        // Find matching cutting data
        const cuttingItem = cuttingData.find((item: any) => {
          const itemOrderId = item.orderId?.toString() || "";
          return itemOrderId === orderIdString;
        }) || {};
        
        // Find matching stitching data - IMPROVED MATCHING LOGIC
        const stitchingItem = stitchingData.find((item: any) => {
          const itemOrderId = item.orderId?.toString() || "";
          return itemOrderId === orderIdString;
        }) || {};
        
        console.log("Found stitching item for order", orderIdString, ":", stitchingItem);
        
        // Find matching quality data based on color
        const qualityItem = qualityData.find((item: any) => 
          item.color === order.color
        ) || {};
        
        // Combine all data into a single item
        const processedItem = {
          id: orderIdString,
          customerId: order.customerId || "",
          itemName: order.itemName || "",
          size: order.size || "",
          color: order.color || "",
          quantity: order.quantity || 0,
          clothType: order.clothType || qualityItem.clothType || "",
          cuttingStatus: cuttingItem.status || order.cuttingStatus || "Not Started",
          stitchingStatus: stitchingItem.status || order.stitchingStatus || "Not Started",
          qualityStatus: qualityItem.qualityStatus || qualityItem.status || "Not Started",
          supervisor: cuttingItem.supervisor || qualityItem.supervisor || "",
          tailor: stitchingItem.tailor || "", // This should now work correctly
          rejectedReason: qualityItem.rejectedReason || "",
          imageUrl: qualityItem.photoUrl || qualityItem.imageUrl || "",
          // IMPROVED DATE HANDLING - prioritize stitching date when available
          date: stitchingItem.date || cuttingItem.date || order.date || qualityItem.date || new Date().toISOString().split('T')[0],
        };
        
        console.log("Processed item:", processedItem);
        return processedItem;
      });
      
      console.log("Final processed items:", processedItems);
      setItems(processedItems);
      
    } catch (err: any) {
      console.error("Error fetching data:", err);
      
      // Provide more specific error messages
      if (err.response?.status === 404) {
        setError(`Customer ID "${customerId}" not found. Please check the customer ID and try again.`);
      } else if (err.response?.status === 500) {
        setError("Server error occurred. Please try again later.");
      } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        setError("Cannot connect to server. Please check if the backend server is running.");
      } else {
        setError(err.message || "Failed to fetch data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update an item
  const updateItem = async (updatedItem: ProductItem): Promise<void> => {
    try {
      console.log("Updating item:", updatedItem);
      
      // Handle different types of updates based on what changed
      
      // For cutting status updates
      if (updatedItem.cuttingStatus && updatedItem.cuttingStatus !== "Not Started") {
        try {
          const response = await axios.put(`${API_BASE_URL}/cutting/${updatedItem.id}`, {
            status: updatedItem.cuttingStatus,
            supervisor: updatedItem.supervisor
          });
          console.log("Cutting update response:", response.data);
        } catch (err) {
          console.error("Error updating cutting status:", err);
        }
      }
      
      // For stitching status updates - IMPROVED STITCHING UPDATE
      if (updatedItem.stitchingStatus && updatedItem.stitchingStatus !== "Not Started") {
        try {
          const stitchingUpdateData = {
            status: updatedItem.stitchingStatus,
            tailor: updatedItem.tailor,
            date: updatedItem.date || new Date().toISOString().split('T')[0]
          };
          
          console.log("Sending stitching update data:", stitchingUpdateData);
          
          const response = await axios.put(`${API_BASE_URL}/stitching/${updatedItem.id}`, stitchingUpdateData);
          console.log("Stitching update response:", response.data);
        } catch (err) {
          console.error("Error updating stitching status:", err);
        }
      }
      
      // For quality updates (UNCHANGED)
      if (updatedItem.qualityStatus && updatedItem.qualityStatus !== "Not Started") {
        try {
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
          
          // Handle image upload if there's a new image
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
            `${API_BASE_URL}/quality/${updatedItem.customerId}/${updatedItem.color}`, 
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          console.log("Quality update response:", response.data);
        } catch (err) {
          console.error("Error updating quality status:", err);
        }
      }
      
      // Update local state
      const updatedItems = items.map(item => {
        if (item.id === updatedItem.id) {
          return { ...item, ...updatedItem };
        }
        return item;
      });
      
      setItems(updatedItems);
      
    } catch (err) {
      console.error("Error updating item:", err);
      throw err; // Re-throw so the component can handle it
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