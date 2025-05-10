import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ProductItem } from "@/context/DataContext";

interface TailorPerformanceProps {
  items: ProductItem[];
}

const TailorPerformance: React.FC<TailorPerformanceProps> = ({ items }) => {
  const getTailorData = () => {
    const tailors: Record<string, { stitched: number, rejected: number }> = {};
    
    // Get all items that have been assigned to tailors
    const tailorItems = items.filter(item => item.tailor);
    
    tailorItems.forEach(item => {
      if (item.tailor) {
        if (!tailors[item.tailor]) {
          tailors[item.tailor] = { stitched: 0, rejected: 0 };
        }
        
        if (item.stitchingStatus === "Done") {
          tailors[item.tailor].stitched += 1;
        }
        
        if (item.qualityStatus === "Rejected") {
          tailors[item.tailor].rejected += 1;
        }
      }
    });
    
    return Object.keys(tailors).map(tailor => ({
      name: tailor,
      stitched: tailors[tailor].stitched,
      rejected: tailors[tailor].rejected,
      // Calculate a performance rating (simplified for demo)
      performance: Math.max(0, tailors[tailor].stitched - tailors[tailor].rejected * 2),
    }));
  };
  
  const data = getTailorData();
  
  const renderPerformanceBadge = (performance: number) => {
    if (performance >= 10) {
      return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Top Performer</span>;
    } else if (performance <= 2 && performance >= 0) {
      return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">Needs Attention</span>;
    }
    return null;
  };
  
  return (
    <div className="chart-container bg-black text-white p-6 rounded-lg shadow-lg">
      <h3 className="mb-4 text-lg font-medium">Tailor Performance</h3>
      
      <div className="mb-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
            <XAxis dataKey="name" stroke="#FFFFFF" />
            <YAxis stroke="#FFFFFF" />
            <Tooltip contentStyle={{ backgroundColor: "#333333", borderColor: "#555555", color: "#FFFFFF" }} />
            <Legend wrapperStyle={{ color: "#FFFFFF" }} />
            <Bar dataKey="stitched" name="Items Stitched" fill="#1A1F2C" />
            <Bar dataKey="rejected" name="QC Failures" fill="#FF3A29" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4">
        <h4 className="mb-2 text-sm font-medium text-white">Performance Ranking</h4>
        <div className="rounded-lg border border-gray-700 bg-gray-800">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900">
                <th className="p-2 text-left text-sm font-medium">Tailor</th>
                <th className="p-2 text-center text-sm font-medium">Stitched</th>
                <th className="p-2 text-center text-sm font-medium">Rejected</th>
                <th className="p-2 text-right text-sm font-medium">Performance</th>
              </tr>
            </thead>
            <tbody>
              {data
                .sort((a, b) => b.performance - a.performance)
                .map((tailor, index) => (
                  <tr key={tailor.name} className={index % 2 === 0 ? "bg-gray-700" : "bg-gray-600"}>
                    <td className="p-2 text-sm">{tailor.name}</td>
                    <td className="p-2 text-center text-sm">{tailor.stitched}</td>
                    <td className="p-2 text-center text-sm">{tailor.rejected}</td>
                    <td className="p-2 text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="font-medium">{tailor.performance}</span>
                        {renderPerformanceBadge(tailor.performance)}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TailorPerformance;
