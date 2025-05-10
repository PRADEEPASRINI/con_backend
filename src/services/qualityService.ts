import api from './api';

export interface ColorGroup {
  color: string;
  clothType: string;
  items: any[];
  dyeingStatus: "Not Started" | "In Progress" | "Done";
  qualityStatus: "Pending" | "Passed" | "Rejected";
  rejectedReason?: string;
  photoUrl?: string;
  supervisor?: string;
  date?: string;
}

export interface QualityUpdate {
  qualityStatus: "Pending" | "Passed" | "Rejected";
  dyeingStatus?: "Not Started" | "In Progress" | "Done";
  rejectedReason?: string;
  supervisor?: string;
  date?: string;
  clothType?: string;
}

export const getQualityStatusByCustomerId = async (customerId: string): Promise<ColorGroup[]> => {
  try {
    const response = await api.get(`/quality/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quality statuses:', error);
    throw error;
  }
};

export const updateQualityStatus = async (
  customerId: string, 
  color: string,
  data: QualityUpdate,
  photo?: File
) => {
  try {
    // If there's a photo, use FormData
    if (photo) {
      const formData = new FormData();
      
      // Add all data fields to formData
      Object.keys(data).forEach(key => {
        formData.append(key, data[key as keyof QualityUpdate] as string);
      });
      
      // Add photo file
      formData.append('photo', photo);
      
      const response = await api.put(
        `/quality/${customerId}/${color}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } else {
      // Regular JSON request without photo
      const response = await api.put(`/quality/${customerId}/${color}`, data);
      return response.data;
    }
  } catch (error) {
    console.error('Error updating quality status:', error);
    throw error;
  }
};