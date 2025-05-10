import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import ProgressChart from "./ProgressChart";
import RejectionChart from "./RejectionChart";
import TailorPerformance from "./TailorPerformance";
import { Info } from "lucide-react";
import { Combobox } from "@headlessui/react";

const AnalyticsDashboard = () => {
  const { items, loading, customers, fetchItemsByCustomerId } = useData();
  const [query, setQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || "");
  const [dataLoaded, setDataLoaded] = useState(false);  // To track data load

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    fetchItemsByCustomerId(customerId);
  };

  const handleLoadData = () => {
    setDataLoaded(true);
  };

  const filteredCustomers =
    query === ""
      ? customers
      : customers.filter((customer) =>
          `${customer.id} ${customer.name}`.toLowerCase().includes(query.toLowerCase())
        );

  // Summary Metrics
  const totalItems = items.length;
  const cutItems = items.filter(item => item.cuttingStatus === "Done").length;
  const stitchedItems = items.filter(item => item.stitchingStatus === "Done").length;
  const rejectedItems = items.filter(item => item.qualityStatus === "Rejected").length;

  const cutPercentage = totalItems ? Math.round((cutItems / totalItems) * 100) : 0;
  const stitchedPercentage = totalItems ? Math.round((stitchedItems / totalItems) * 100) : 0;
  const rejectionRate = stitchedItems ? Math.round((rejectedItems / stitchedItems) * 100) : 0;

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-3/4 rounded bg-gray-700"></div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="h-32 rounded bg-gray-700"></div>
        ))}
      </div>
      <div className="h-64 rounded bg-gray-700"></div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, idx) => (
          <div key={idx} className="h-80 rounded bg-gray-700"></div>
        ))}
      </div>
    </div>
  );

  const SectionExplanation = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-2 flex items-start gap-2 text-sm text-gray-300">
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <div>
        <span className="font-medium">{title}:</span> {description}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 bg-black text-white animate-fade-in">
      <h1 className="mb-8 text-3xl font-bold">Analytics Dashboard</h1>

      {/* Search bar and load data button */}
      <div className="mb-6 flex items-center gap-4">
        <div className="w-full md:w-1/3">
          <label htmlFor="customer-search" className="mb-2 block text-sm font-medium text-gray-400">
            Search Customer ID or Name
          </label>
          <Combobox value={selectedCustomerId} onChange={handleCustomerSelect}>
            <div className="relative w-full">
              <Combobox.Input
                id="customer-search"
                className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                placeholder="Type customer ID or name..."
                onChange={(e) => setQuery(e.target.value)}
                displayValue={() =>
                  customers.find((c) => c.id === selectedCustomerId)?.id || ""
                }
              />
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5">
                {filteredCustomers.map((customer) => (
                  <Combobox.Option
                    key={customer.id}
                    value={customer.id}
                    className={({ active }) =>
                      `cursor-pointer px-4 py-2 ${active ? "bg-gray-600 text-white" : "text-gray-400"}`
                    }
                  >
                    {customer.id}: {customer.name}
                  </Combobox.Option>
                ))}
                {filteredCustomers.length === 0 && (
                  <div className="px-4 py-2 text-gray-500">No matches found</div>
                )}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>
        {/* Load Data Button */}
        <button
          onClick={handleLoadData}
          className="px-4 py-2 text-sm font-medium text-white bg-black border border-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Load Data
        </button>
      </div>
      <SectionExplanation
        title="Customer Search"
        description="Search by typing a customer ID or name to see analytics for that customer."
      />

      {loading || !dataLoaded ? (
        renderSkeleton()
      ) : (
        <>
          {/* Summary Metrics */}
          <div className="mb-2">
            <SectionExplanation
              title="Summary Metrics"
              description="Production status including cutting and stitching progress and quality outcomes."
            />
          </div>
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[ 
              { label: "Total Items", value: totalItems, color: "bg-gray-800", percent: 100 },
              { label: "Cutting Progress", value: `${cutPercentage}%`, color: "bg-gray-600", percent: cutPercentage },
              { label: "Stitching Progress", value: `${stitchedPercentage}%`, color: "bg-gray-500", percent: stitchedPercentage },
              { label: "Rejection Rate", value: `${rejectionRate}%`, color: "bg-red-500", percent: rejectionRate }
            ].map((card, idx) => (
              <div key={idx} className="rounded-lg bg-gray-900 p-6 shadow-md">
                <h3 className="mb-2 text-sm font-medium text-gray-400">{card.label}</h3>
                <p className="text-3xl font-bold">{card.value}</p>
                <div className="mt-4 h-2 w-full rounded-full bg-gray-700">
                  <div
                    className={`h-full rounded-full ${card.color}`}
                    style={{ width: `${card.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="mb-2">
            <SectionExplanation
              title="Progress Timeline"
              description="Tracks cutting, stitching, and rejection trends."
            />
          </div>
          <div className="mb-8">
            <ProgressChart items={items} />
          </div>

          <div className="mb-2">
            <SectionExplanation
              title="Quality and Performance Analysis"
              description="Tailor performance and rejection insights."
            />
          </div>
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <RejectionChart items={items} />
            <TailorPerformance items={items} />
          </div>

          <div className="mb-2">
            <SectionExplanation
              title="Common Stitching Issues"
              description="Frequent issues sorted by severity."
            />
          </div>
          <div className="mb-8 rounded-lg bg-gray-900 p-6 shadow-md">
            <h3 className="mb-4 text-lg font-medium">Common Stitching Issues</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[ 
                { issue: "Loose stitching", count: 7, level: "high" },
                { issue: "Skipped hems", count: 5, level: "medium" },
                { issue: "Broken thread", count: 3, level: "low" },
                { issue: "Size mismatch", count: 2, level: "low" }
              ].map((issue) => (
                <div
                  key={issue.issue}
                  className={`rounded-lg p-4 ${issue.level === "high" ? "bg-red-800" : issue.level === "medium" ? "bg-yellow-800" : "bg-blue-800"}`}
                >
                  <h4 className="font-medium">{issue.issue}</h4>
                  <p className={`text-sm ${issue.level === "high" ? "text-red-300" : issue.level === "medium" ? "text-yellow-300" : "text-blue-300"}`}>
                    {issue.count} occurrences
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-2">
            <SectionExplanation
              title="Recent Rejections"
              description="Latest rejected items with tailor and reason."
            />
          </div>
          <div className="rounded-lg bg-gray-900 p-6 shadow-md">
            <h3 className="mb-4 text-lg font-medium">Recent Rejections</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400">
                    <th className="px-4 py-2">Item</th>
                    <th className="px-4 py-2">Tailor</th>
                    <th className="px-4 py-2">Reason</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items
                    .filter((item) => item.qualityStatus === "Rejected")
                    .map((item) => (
                      <tr key={item.id} className="border-t border-gray-700">
                        <td className="px-4 py-2">{item.id}</td>
                        <td className="px-4 py-2">{item.tailor}</td>
                        <td className="px-4 py-2">{item.rejectionReason}</td>
                        <td className="px-4 py-2">{item.rejectionDate}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
