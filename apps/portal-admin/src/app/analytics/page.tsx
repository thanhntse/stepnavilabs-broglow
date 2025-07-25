"use client";

import { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import {
  ChartLine,
  Users,
  ShoppingBag,
  CreditCard,
  TrendUp,
  TrendDown
} from "@phosphor-icons/react";

interface AnalyticsData {
  totalUsers: number;
  totalRevenue: number;
  totalProducts: number;
  totalOrders: number;
  userGrowth: number;
  revenueGrowth: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    amount: number;
    timestamp: string;
  }>;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = async () => {
      setLoading(true);
      setTimeout(() => {
        setAnalyticsData({
          totalUsers: 1247,
          totalRevenue: 45230,
          totalProducts: 89,
          totalOrders: 156,
          userGrowth: 12.5,
          revenueGrowth: 8.3,
          topProducts: [
            { name: "Men's Facial Cleanser", sales: 234, revenue: 5841.66 },
            { name: "Anti-Aging Serum", sales: 189, revenue: 9448.11 },
            { name: "Moisturizing Cream", sales: 156, revenue: 5458.44 },
            { name: "Sunscreen SPF 50", sales: 123, revenue: 3075.00 },
            { name: "Night Repair Cream", sales: 98, revenue: 3430.00 }
          ],
          recentActivity: [
            { type: "order", description: "New order #1234", amount: 89.99, timestamp: "2 minutes ago" },
            { type: "user", description: "New user registered", amount: 0, timestamp: "5 minutes ago" },
            { type: "product", description: "Product updated", amount: 0, timestamp: "15 minutes ago" },
            { type: "order", description: "Order #1233 completed", amount: 124.50, timestamp: "1 hour ago" }
          ]
        });
        setLoading(false);
      }, 1000);
    };

    loadAnalytics();
  }, [timeRange]);

  const timeRangeOptions = [
    { label: "Last 7 days", value: "7" },
    { label: "Last 30 days", value: "30" },
    { label: "Last 90 days", value: "90" },
    { label: "Last year", value: "365" }
  ];

  const userChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Users',
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        borderColor: '#4bc0c0',
        tension: 0.4
      },
      {
        label: 'Active Users',
        data: [28, 48, 40, 19, 86, 27],
        fill: false,
        borderColor: '#ff6384',
        tension: 0.4
      }
    ]
  };

  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: '#4bc0c0',
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag size={16} />;
      case 'user': return <Users size={16} />;
      case 'product': return <ShoppingBag size={16} />;
      default: return <ChartLine size={16} />;
    }
  };

  const amountBodyTemplate = (rowData: any) => {
    return rowData.amount > 0 ? `$${rowData.amount.toFixed(2)}` : '-';
  };

  const metricCards = [
    {
      title: "Total Users",
      value: analyticsData?.totalUsers.toLocaleString() || "0",
      icon: <Users size={24} />,
      color: "bg-blue-500",
      growth: analyticsData?.userGrowth || 0
    },
    {
      title: "Total Revenue",
      value: `$${analyticsData?.totalRevenue.toLocaleString() || "0"}`,
      icon: <CreditCard size={24} />,
      color: "bg-green-500",
      growth: analyticsData?.revenueGrowth || 0
    },
    {
      title: "Total Products",
      value: analyticsData?.totalProducts.toLocaleString() || "0",
      icon: <ShoppingBag size={24} />,
      color: "bg-purple-500",
      growth: 5.2
    },
    {
      title: "Total Orders",
      value: analyticsData?.totalOrders.toLocaleString() || "0",
      icon: <ChartLine size={24} />,
      color: "bg-orange-500",
      growth: 15.7
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
          <div className="flex items-center gap-3">
            <ChartLine size={24} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <div className="w-full sm:w-48">
            <Dropdown
              value={timeRange}
              options={timeRangeOptions}
              onChange={(e) => setTimeRange(e.value)}
              placeholder="Select time range"
              className="w-full"
            />
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {card.growth > 0 ? (
                      <TrendUp size={16} className="text-green-500" />
                    ) : (
                      <TrendDown size={16} className="text-red-500" />
                    )}
                    <span className={`text-sm ${card.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(card.growth)}%
                    </span>
                    <span className="text-sm text-gray-500">vs last period</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${card.color} text-white`}>
                  {card.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <Card title="User Growth">
            <div className="h-64">
              <Chart type="line" data={userChartData} options={chartOptions} />
            </div>
          </Card>

          {/* Revenue Chart */}
          <Card title="Revenue Overview">
            <div className="h-64">
              <Chart type="bar" data={revenueChartData} options={chartOptions} />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <Card title="Top Products">
            <DataTable value={analyticsData?.topProducts || []} className="p-datatable-sm">
              <Column field="name" header="Product" />
              <Column field="sales" header="Sales" />
              <Column
                field="revenue"
                header="Revenue"
                body={(rowData) => `$${rowData.revenue.toFixed(2)}`}
              />
            </DataTable>
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Activity">
            <DataTable value={analyticsData?.recentActivity || []} className="p-datatable-sm">
              <Column
                header="Type"
                body={(rowData) => (
                  <div className="flex items-center gap-2">
                    {getActivityIcon(rowData.type)}
                    <span className="capitalize">{rowData.type}</span>
                  </div>
                )}
              />
              <Column field="description" header="Description" />
              <Column
                field="amount"
                header="Amount"
                body={amountBodyTemplate}
              />
              <Column field="timestamp" header="Time" />
            </DataTable>
          </Card>
        </div>
      </div>
    </div>
  );
}
