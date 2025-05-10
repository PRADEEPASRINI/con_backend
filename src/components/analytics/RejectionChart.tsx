import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ProductItem } from "@/context/DataContext";

interface RejectionChartProps {
  items: ProductItem[];
}

const COLORS = ["#1A1F2C", "#403E43", "#8A898C", "#C8C8C9"];

const RejectionChart: React.FC<RejectionChartProps> = ({ items }) => {
  const rejectedItems = items.filter(item => item.qualityStatus === "Rejected");
  
  const getRejectionData = () => {
    const reasons: Record<string, number> = {};
    
    rejectedItems.forEach(item => {
      if (item.rejectedReason) {
        reasons[item.rejectedReason] = (reasons[item.rejectedReason] || 0) + 1;
      }
    });
    
    return Object.keys(reasons).map(reason => ({
      name: reason,
      value: reasons[reason]
    }));
  };
  
  const data = getRejectionData();
  
  return (
    <div className="chart-container bg-black text-white p-6 rounded-lg shadow-lg">
      <h3 className="mb-4 text-lg font-medium">Rejection Reasons</h3>
      
      {rejectedItems.length > 0 ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
              <Legend wrapperStyle={{ color: "#FFFFFF" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-72 items-center justify-center">
          <p className="text-gray-500">No rejected items to display</p>
        </div>
      )}
      
      <div className="mt-4">
        <h4 className="mb-2 text-sm font-medium">Total Rejected Items</h4>
        <p className="text-2xl font-bold">{rejectedItems.length}</p>
      </div>
    </div>
  );
};

export default RejectionChart;
