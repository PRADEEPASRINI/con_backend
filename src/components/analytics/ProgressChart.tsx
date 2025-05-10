import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ProductItem } from "@/context/DataContext";

interface ProgressChartProps {
  items: ProductItem[];
  days?: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ items, days = 7 }) => {
  // Group items by date and count the status
  const generateChartData = () => {
    const today = new Date();
    const daysData = [];
    
    // Generate data for the last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      daysData.push({
        date: dateString,
        cut: 0,
        stitched: 0,
        rejected: 0,
      });
    }
    
    // Populate with actual data
    items.forEach(item => {
      const dateIndex = daysData.findIndex(d => d.date === item.date);
      if (dateIndex !== -1) {
        if (item.cuttingStatus === "Done") {
          daysData[dateIndex].cut += 1;
        }
        
        if (item.stitchingStatus === "Done") {
          daysData[dateIndex].stitched += 1;
        }
        
        if (item.qualityStatus === "Rejected") {
          daysData[dateIndex].rejected += 1;
        }
      }
    });
    
    // Format date for display
    return daysData.map(day => ({
      ...day,
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  };
  
  const data = generateChartData();
  
  return (
    <div className="chart-container bg-black p-6 rounded-lg shadow-lg">
      <h3 className="mb-4 text-lg font-medium text-white">Progress Overview (Last {days} Days)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis dataKey="date" stroke="#FFFFFF" />
            <YAxis stroke="#FFFFFF" />
            <Tooltip contentStyle={{ backgroundColor: "#333333", borderColor: "#555555", color: "#FFFFFF" }} />
            <Legend wrapperStyle={{ color: "#FFFFFF" }} />
            <Line 
              type="monotone" 
              dataKey="cut" 
              name="Cut Items" 
              stroke="#1A1F2C" 
              strokeWidth={2} 
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="stitched" 
              name="Stitched Items" 
              stroke="#403E43"
              strokeWidth={2} 
            />
            <Line 
              type="monotone" 
              dataKey="rejected" 
              name="Rejected Items" 
              stroke="#FF3A29"
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;
