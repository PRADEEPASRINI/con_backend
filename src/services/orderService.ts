import api from './api';
import { ProductItem } from '@/context/DataContext';

export const getOrdersByCustomerId = async (customerId: string): Promise<ProductItem[]> => {
  try {
    const response = await api.get(`/orders/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};