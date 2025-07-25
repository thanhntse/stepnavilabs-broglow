"use client";

import { useEffect, useState } from "react";
import { useUserContext } from "@/context/profile-context";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chart } from "primereact/chart";
import {
  Users,
  ShoppingBag,
  FileText,
  CreditCard,
  ChartLine,
  Bell,
  Plus,
  Eye,
  Pencil,
  Trash,
  Gear,
  Shield
} from "@phosphor-icons/react";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalBlogs: number;
  totalRevenue: number;
  activeSubscriptions: number;
  pendingNotifications: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}

export default function AdminDashboard() {
  const { user } = useUserContext();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalBlogs: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    pendingNotifications: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      setLoading(true);
      // In a real app, you would fetch this data from your API
      setTimeout(() => {
        setStats({
          totalUsers: 1247,
          totalProducts: 89,
          totalBlogs: 156,
          totalRevenue: 45230,
          activeSubscriptions: 892,
          pendingNotifications: 23
        });

        setRecentActivities([
          {
            id: "1",
            type: "user",
            description: "New user registered",
            timestamp: "2 minutes ago",
            user: "john.doe@example.com"
          },
          {
            id: "2",
            type: "product",
            description: "Product updated",
            timestamp: "15 minutes ago",
            user: "admin@broglow.com"
          },
          {
            id: "3",
            type: "blog",
            description: "New blog post published",
            timestamp: "1 hour ago",
            user: "content@broglow.com"
          },
          {
            id: "4",
            type: "subscription",
            description: "Subscription renewed",
            timestamp: "2 hours ago",
            user: "user123@example.com"
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, []);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Users',
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        borderColor: '#4bc0c0'
      },
      {
        label: 'Revenue',
        data: [28, 48, 40, 19, 86, 27],
        fill: false,
        borderColor: '#ff6384'
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
      case 'user': return <Users size={20} />;
      case 'product': return <ShoppingBag size={20} />;
      case 'blog': return <FileText size={20} />;
      case 'subscription': return <CreditCard size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const actionBodyTemplate = () => {
    return (
      <div className="flex gap-2">
        <Button icon={<Eye size={16} />} size="small" text />
        <Button icon={<Pencil size={16} />} size="small" text />
        <Button icon={<Trash size={16} />} size="small" text severity="danger" />
      </div>
    );
  };

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: <Users size={24} />,
      color: "bg-blue-500",
      link: "/users"
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: <ShoppingBag size={24} />,
      color: "bg-green-500",
      link: "/products"
    },
    {
      title: "Total Blogs",
      value: stats.totalBlogs.toLocaleString(),
      icon: <FileText size={24} />,
      color: "bg-purple-500",
      link: "/blogs"
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <CreditCard size={24} />,
      color: "bg-yellow-500",
      link: "/analytics"
    },
    {
      title: "Active Subscriptions",
      value: stats.activeSubscriptions.toLocaleString(),
      icon: <ChartLine size={24} />,
      color: "bg-indigo-500",
      link: "/subscriptions"
    },
    {
      title: "Pending Notifications",
      value: stats.pendingNotifications.toLocaleString(),
      icon: <Bell size={24} />,
      color: "bg-red-500",
      link: "/notifications"
    }
  ];

  const quickActions = [
    { label: "Add User", icon: <Plus size={20} />, link: "/users/new" },
    { label: "Add Product", icon: <Plus size={20} />, link: "/products/new" },
    { label: "Create Blog", icon: <Plus size={20} />, link: "/blogs/new" },
    { label: "View Analytics", icon: <ChartLine size={20} />, link: "/analytics" },
    { label: "Manage Roles", icon: <Shield size={20} />, link: "/roles" },
    { label: "System Settings", icon: <Gear size={20} />, link: "/settings" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'Admin'}!
          </h1>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your platform today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <Link key={index} href={card.link}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${card.color} text-white`}>
                    {card.icon}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card title="Quick Actions" className="h-fit">
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.link}>
                    <Button
                      label={action.label}
                      icon={action.icon}
                      className="w-full justify-start"
                      outlined
                      size="small"
                    />
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* Chart */}
          <div className="lg:col-span-2">
            <Card title="Platform Analytics">
              <div className="h-64">
                <Chart type="line" data={chartData} options={chartOptions} />
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card title="Recent Activity">
            <DataTable value={recentActivities} paginator rows={5}>
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
              <Column field="user" header="User" />
              <Column field="timestamp" header="Time" />
              <Column header="Actions" body={actionBodyTemplate} />
            </DataTable>
          </Card>
        </div>
      </div>
    </div>
  );
}
