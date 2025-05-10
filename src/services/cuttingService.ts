import api from './api';
import { ProductItem } from '@/context/DataContext';

export interface CuttingUpdate {
  status: "Not Started" | "In Progress" | "Done";
  supervisor?: string;
  date?: string;
}

export const getCuttingStatusByCustomerId = async (customerId: string): Promise<ProductItem[]> => {
  try {
    const response = await api.get(`/cutting/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cutting statuses:', error);
    throw error;
  }
};

export const updateCuttingStatus = async (orderId: string, data: CuttingUpdate) => {
  try {
    const response = await api.put(`/cutting/${orderId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating cutting status:', error);
    throw error;
  }
};