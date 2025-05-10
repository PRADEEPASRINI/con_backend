import api from './api';
import { ProductItem } from '@/context/DataContext';

export interface StitchingUpdate {
  status: "Not Started" | "In Progress" | "Done";
  tailor?: string;
  date?: string;
}

export const getStitchingStatusByCustomerId = async (customerId: string): Promise<ProductItem[]> => {
  try {
    const response = await api.get(`/stitching/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stitching statuses:', error);
    throw error;
  }
};

export const updateStitchingStatus = async (orderId: string, data: StitchingUpdate) => {
  try {
    const response = await api.put(`/stitching/${orderId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating stitching status:', error);
    throw error;
  }
};
