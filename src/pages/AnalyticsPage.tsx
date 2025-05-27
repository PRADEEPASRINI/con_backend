import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Package, Clock, CheckCircle, AlertCircle } from "lucide-react";

const AnalyticsDashboard = () => {
  const { items, loading, error, fetchItemsByCustomerId } = useData();
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    const trimmedValue = searchValue.trim();
    if (!trimmedValue) return;
    
    setIsSearching(true);
    try {
      await fetchItemsByCustomerId(trimmedValue);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Calculate analytics data
  const analytics = React.useMemo(() => {
    if (!items.length) return null;

    const totalOrders = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Status counts - check for specific status fields first, then fall back to general status
    const cuttingComplete = items.filter(item => {
      // Check if there's a specific cutting status field
      if (item.cuttingStatus) {
        return item.cuttingStatus === "Completed" || item.cuttingStatus === "Complete";
      }
      // If no specific field, assume completed items have cutting done
      return item.status === "Done" || item.status === "Completed";
    }).length;
    
    const stitchingComplete = items.filter(item => {
      // Check if there's a specific stitching status field
      if (item.stitchingStatus) {
        return item.stitchingStatus === "Completed" || item.stitchingStatus === "Complete";
      }
      // If no specific field, assume completed items have stitching done
      return item.status === "Done" || item.status === "Completed";
    }).length;
    
    const qualityPassed = items.filter(item => {
      // Check if there's a specific quality status field
      if (item.qualityStatus) {
        return item.qualityStatus === "Passed" || item.qualityStatus === "Approved";
      }
      // If no specific field, assume completed items passed quality
      return item.status === "Done" || item.status === "Completed";
    }).length;
    
    const qualityRejected = items.filter(item => {
      if (item.qualityStatus) {
        return item.qualityStatus === "Rejected" || item.qualityStatus === "Failed";
      }
      // If no specific field, assume no rejections for now
      return false;
    }).length;

    // Progress percentages
    const cuttingProgress = totalOrders > 0 ? Math.round((cuttingComplete / totalOrders) * 100) : 0;
    const stitchingProgress = totalOrders > 0 ? Math.round((stitchingComplete / totalOrders) * 100) : 0;
    const qualityProgress = totalOrders > 0 ? Math.round((qualityPassed / totalOrders) * 100) : 0;

    return {
      totalOrders,
      totalQuantity,
      cuttingComplete,
      stitchingComplete,
      qualityPassed,
      qualityRejected,
      cuttingProgress,
      stitchingProgress,
      qualityProgress
    };
  }, [items]);

  const getStatusBadge = (status: string, type: 'cutting' | 'stitching' | 'quality', generalStatus?: string) => {
    // If no specific status provided, use general status
    const statusToCheck = status || generalStatus || '';
    const normalizedStatus = statusToCheck.toLowerCase();
    
    if (type === 'quality') {
      if (normalizedStatus === 'passed' || normalizedStatus === 'approved' || normalizedStatus === 'done') {
        return <Badge className="bg-green-500 text-white">Passed</Badge>;
      } else if (normalizedStatus === 'rejected' || normalizedStatus === 'failed') {
        return <Badge variant="destructive">Rejected</Badge>;
      } else if (normalizedStatus === 'pending' || normalizedStatus === 'in progress') {
        return <Badge variant="secondary">Pending</Badge>;
      }
      return <Badge variant="outline">Not Started</Badge>;
    }
    
    if (normalizedStatus === 'completed' || normalizedStatus === 'complete' || normalizedStatus === 'done') {
      return <Badge className="bg-green-500 text-white">Completed</Badge>;
    } else if (normalizedStatus === 'in progress' || normalizedStatus === 'pending') {
      return <Badge variant="secondary">In Progress</Badge>;
    }
    return <Badge variant="outline">Not Started</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Customer ID or Name
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter customer ID (e.g., CUST001)"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || loading}
              className="px-6"
            >
              {isSearching || loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Load Data
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Enter a customer ID or name to see analytics for that customer.
          </p>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Content */}
      {!loading && !error && items.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No matches found</p>
              <p className="text-sm text-gray-500 mt-1">
                Try typing a customer ID or name to see analytics for that customer.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalQuantity}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cutting Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.cuttingProgress}%</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.cuttingComplete} of {analytics.totalOrders} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analytics.qualityPassed}</div>
                <p className="text-xs text-muted-foreground">
                  Passed, {analytics.qualityRejected} rejected
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cutting Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span>{analytics.cuttingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${analytics.cuttingProgress}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stitching Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span>{analytics.stitchingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${analytics.stitchingProgress}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Passed</span>
                    <span>{analytics.qualityProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${analytics.qualityProgress}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Item</th>
                      <th className="text-left p-2">Size</th>
                      <th className="text-left p-2">Color</th>
                      <th className="text-left p-2">Quantity</th>
                      <th className="text-left p-2">Cutting</th>
                      <th className="text-left p-2">Stitching</th>
                      <th className="text-left p-2">Quality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{item.itemName}</td>
                        <td className="p-2">{item.size}</td>
                        <td className="p-2">{item.color}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">{getStatusBadge(item.cuttingStatus, 'cutting', item.status)}</td>
                        <td className="p-2">{getStatusBadge(item.stitchingStatus, 'stitching', item.status)}</td>
                        <td className="p-2">{getStatusBadge(item.qualityStatus, 'quality', item.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;