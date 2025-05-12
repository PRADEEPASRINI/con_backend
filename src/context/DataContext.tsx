import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as orderService from "@/services/orderService";
import * as cuttingService from "@/services/cuttingService";
import * as stitchingService from "@/services/stitchingService";
import * as qualityService from "@/services/qualityService";

// Define types for our data models
export interface ProductItem {
  id: string;
  customerId: string;
  itemName: string;
  clothType: string;
  size: string;
  color: string;
  totalWeight: number;
  quantity: number;
  date: string;
  cuttingStatus: "Not Started" | "In Progress" | "Done";
  stitchingStatus: "Not Started" | "In Progress" | "Done";
  supervisor?: string;
  tailor?: string;
  qualityStatus?: "Pending" | "Passed" | "Rejected";
  rejectedReason?: string;
  imageUrl?: string;
}

export interface ColorGroup {
  color: string;
  clothType: string;
  items: ProductItem[];
  dyeingStatus: "Not Started" | "In Progress" | "Done";
  qualityStatus: "Pending" | "Passed" | "Rejected";
  rejectedReason?: string;
  photoUrl?: string;
  supervisor?: string;
  date?: string;
}

interface DataContextType {
  // Current customer being viewed
  currentCustomerId: string;
  setCurrentCustomerId: (id: string) => void;
  
  // Data collections
  orders: ProductItem[];
  cuttingItems: ProductItem[];
  stitchingItems: ProductItem[];
  qualityGroups: ColorGroup[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Fetch functions - aliased to match what pages are using
  fetchItemsByCustomerId: (customerId: string) => Promise<void>;
  
  // Refresh functions
  refreshOrders: () => Promise<void>;
  refreshCuttingStatus: () => Promise<void>;
  refreshStitchingStatus: () => Promise<void>;
  refreshQualityStatus: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  
  // Update functions - mapped to match what your components are using
  updateItem: (item: ProductItem) => Promise<void>;
  
  // Original update functions
  updateCuttingStatus: (
    orderId: string, 
    data: cuttingService.CuttingUpdate
  ) => Promise<void>;
  
  updateStitchingStatus: (
    orderId: string, 
    data: stitchingService.StitchingUpdate
  ) => Promise<void>;
  
  updateQualityStatus: (
    customerId: string,
    color: string,
    data: qualityService.QualityUpdate,
    photo?: File
  ) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [currentCustomerId, setCurrentCustomerId] = useState<string>("");
  
  const [orders, setOrders] = useState<ProductItem[]>([]);
  const [cuttingItems, setCuttingItems] = useState<ProductItem[]>([]);
  const [stitchingItems, setStitchingItems] = useState<ProductItem[]>([]);
  const [qualityGroups, setQualityGroups] = useState<ColorGroup[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch items by customer ID - maps to what components expect
  const fetchItemsByCustomerId = async (customerId: string): Promise<void> => {
    setCurrentCustomerId(customerId);
    await refreshAllData();
  };

  // Fetch orders for current customer
  const refreshOrders = async (): Promise<void> => {
    if (!currentCustomerId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await orderService.getOrdersByCustomerId(currentCustomerId);
      setOrders(data);
    } catch (err) {
      setError("Failed to fetch orders");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cutting status for current customer
  const refreshCuttingStatus = async (): Promise<void> => {
    if (!currentCustomerId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await cuttingService.getCuttingStatusByCustomerId(currentCustomerId);
      setCuttingItems(data);
    } catch (err) {
      setError("Failed to fetch cutting status");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stitching status for current customer
  const refreshStitchingStatus = async (): Promise<void> => {
    if (!currentCustomerId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await stitchingService.getStitchingStatusByCustomerId(currentCustomerId);
      setStitchingItems(data);
    } catch (err) {
      setError("Failed to fetch stitching status");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch quality status for current customer
  const refreshQualityStatus = async (): Promise<void> => {
    if (!currentCustomerId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await qualityService.getQualityStatusByCustomerId(currentCustomerId);
      setQualityGroups(data);
    } catch (err) {
      setError("Failed to fetch quality status");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh all data at once
  const refreshAllData = async (): Promise<void> => {
    if (!currentCustomerId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        refreshOrders(),
        refreshCuttingStatus(),
        refreshStitchingStatus(),
        refreshQualityStatus()
      ]);
    } catch (err) {
      setError("Failed to refresh data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generic update item function that maps to what components expect
  const updateItem = async (item: ProductItem): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Determine what type of update to perform based on item properties
      if (item.cuttingStatus) {
        await updateCuttingStatus(item.id, {
          status: item.cuttingStatus,
          supervisor: item.supervisor,
          date: item.date
        });
      }
      
      if (item.stitchingStatus) {
        await updateStitchingStatus(item.id, {
          status: item.stitchingStatus,
          tailor: item.tailor,
          date: item.date
        });
      }
      
      if (item.qualityStatus && item.color) {
        await updateQualityStatus(
          item.customerId,
          item.color,
          {
            qualityStatus: item.qualityStatus,
            rejectedReason: item.rejectedReason,
            supervisor: item.supervisor,
            date: item.date,
            clothType: item.clothType
          }
        );
      }
      
      await refreshAllData();
    } catch (err) {
      setError("Failed to update item");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update cutting status
  const updateCuttingStatus = async (
    orderId: string, 
    data: cuttingService.CuttingUpdate
  ): Promise<void> => {
    try {
      setIsLoading(true);
      await cuttingService.updateCuttingStatus(orderId, data);
      await refreshCuttingStatus();
    } catch (err) {
      setError("Failed to update cutting status");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update stitching status
  const updateStitchingStatus = async (
    orderId: string, 
    data: stitchingService.StitchingUpdate
  ): Promise<void> => {
    try {
      setIsLoading(true);
      await stitchingService.updateStitchingStatus(orderId, data);
      await refreshStitchingStatus();
    } catch (err) {
      setError("Failed to update stitching status");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update quality status
  const updateQualityStatus = async (
    customerId: string,
    color: string,
    data: qualityService.QualityUpdate,
    photo?: File
  ): Promise<void> => {
    try {
      setIsLoading(true);
      await qualityService.updateQualityStatus(customerId, color, data, photo);
      await refreshQualityStatus();
    } catch (err) {
      setError("Failed to update quality status");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically refresh data when customer ID changes
  useEffect(() => {
    if (currentCustomerId) {
      refreshAllData();
    }
  }, [currentCustomerId]);

  const value: DataContextType = {
    currentCustomerId,
    setCurrentCustomerId,
    orders,
    cuttingItems,
    stitchingItems,
    qualityGroups,
    isLoading,
    error,
    fetchItemsByCustomerId, // Added to match what components expect
    refreshOrders,
    refreshCuttingStatus,
    refreshStitchingStatus,
    refreshQualityStatus,
    refreshAllData,
    updateItem, // Added to match what components expect
    updateCuttingStatus,
    updateStitchingStatus,
    updateQualityStatus
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;