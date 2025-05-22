import React, { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import axios from "axios";

interface BlueQualityCheckProps {
  customerId?: string;
}

const BlueQualityCheck: React.FC<BlueQualityCheckProps> = ({ customerId = '' }) => {
  const [clothType, setClothType] = useState("Cotton");
  const [qualityStatus, setQualityStatus] = useState("Passed");
  const [rejectionReason, setRejectionReason] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [inspectionDate, setInspectionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  // Fetch existing data if we have a customerId
  useEffect(() => {
    if (customerId) {
      fetchExistingData();
    }
  }, [customerId]);
  
  const fetchExistingData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/quality/customer/${customerId}`);
      const blueColorData = response.data.find((item: any) => item.color === "Blue");
      
      if (blueColorData) {
        setClothType(blueColorData.clothType || "Cotton");
        setQualityStatus(blueColorData.qualityStatus || "Passed");
        setRejectionReason(blueColorData.rejectedReason || "");
        setSupervisor(blueColorData.supervisor || "");
        
        // Set date if available, otherwise use current date
        if (blueColorData.date) {
          setInspectionDate(blueColorData.date.split('T')[0]);
        }
        
        if (blueColorData.photoUrl) {
          setPreviewUrl(`http://localhost:5000${blueColorData.photoUrl}`);
        }
      }
    } catch (error) {
      console.error("Error fetching existing quality data:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      
      console.log("File selected:", file.name);
    } else {
      console.log("No file selected");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId) {
      alert("Please search for a customer ID first");
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("clothType", clothType);
      formData.append("qualityStatus", qualityStatus);
      formData.append("date", inspectionDate);
      
      if (qualityStatus === "Rejected") {
        formData.append("rejectedReason", rejectionReason);
        
        if (selectedFile) {
          formData.append("photo", selectedFile);
          console.log("Attaching photo:", selectedFile.name);
        }
      }
      
      formData.append("supervisor", supervisor);
      
      console.log("Submitting form data:", {
        clothType,
        qualityStatus,
        rejectedReason: qualityStatus === "Rejected" ? rejectionReason : "",
        supervisor,
        date: inspectionDate,
        hasPhoto: !!selectedFile
      });
      
      const response = await axios.put(
        `http://localhost:5000/api/quality/${customerId}/Blue`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log("Quality update response:", response.data);
      setSubmitSuccess(true);
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving quality check:", error);
      alert("Failed to save quality check. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 bg-zinc-900 rounded-lg">
      <h2 className="text-xl font-bold mb-6 text-white">Blue Quality Check</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Cloth Type</label>
          <input
            type="text"
            value={clothType}
            onChange={(e) => setClothType(e.target.value)}
            className="w-full p-2 bg-zinc-800 border border-gray-600 rounded-md text-white"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Quality Status</label>
          <select
            value={qualityStatus}
            onChange={(e) => setQualityStatus(e.target.value)}
            className="w-full p-2 bg-zinc-800 border border-gray-600 rounded-md text-white"
          >
            <option value="Passed">Passed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Inspection Date</label>
          <input
            type="date"
            value={inspectionDate}
            onChange={(e) => setInspectionDate(e.target.value)}
            className="w-full p-2 bg-zinc-800 border border-gray-600 rounded-md text-white"
          />
        </div>
        
        {qualityStatus === "Rejected" && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Rejection Reason</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 bg-zinc-800 border border-gray-600 rounded-md text-white"
              >
                <option value="">Select reason</option>
                <option value="CLOTH NOT GOOD">CLOTH NOT GOOD</option>
                <option value="Stitch Pull">Stitch Pull</option>
                <option value="Color Fade">Color Fade</option>
                <option value="Tear">Tear</option>
                <option value="Pattern Issue">Pattern Issue</option>
                <option value="SDC">SDC</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Upload Image</label>
              <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-600 rounded-md">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-white"
                  id="file-upload"
                />
                <p className="mt-2 text-sm text-gray-400">PNG, JPG or GIF (max. 5MB)</p>
                
                {previewUrl && (
                  <div className="mt-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-40 w-auto object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Supervisor</label>
          <input
            type="text"
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
            className="w-full p-2 bg-zinc-800 border border-gray-600 rounded-md text-white"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center p-2 rounded-md ${
            submitSuccess
              ? "bg-green-500 hover:bg-green-600"
              : "bg-white text-black hover:bg-gray-200"
          } transition-colors duration-200`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : submitSuccess ? (
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Saved!
            </span>
          ) : (
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
              Save
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default BlueQualityCheck;