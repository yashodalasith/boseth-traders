// client/src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Heart,
  Star,
  Calendar,
  ArrowUp,
  ArrowDown,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState("day");
  const [messageStatusFilter, setMessageStatusFilter] = useState("all");
  const [salesData, setSalesData] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalCustomers: 0,
    totalProducts: 0,
    trendingUp: true,
  });
  const [topProducts, setTopProducts] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [updatingMessageId, setUpdatingMessageId] = useState("");
  const [loading, setLoading] = useState(true);

  // Sample data - replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Simulate API call
      setTimeout(() => {
        // Sample hourly sales data
        const hourlyData = [
          { hour: "8 AM", sales: 12, profit: 24000 },
          { hour: "9 AM", sales: 19, profit: 38000 },
          { hour: "10 AM", sales: 15, profit: 30000 },
          { hour: "11 AM", sales: 21, profit: 42000 },
          { hour: "12 PM", sales: 25, profit: 50000 },
          { hour: "1 PM", sales: 18, profit: 36000 },
          { hour: "2 PM", sales: 16, profit: 32000 },
          { hour: "3 PM", sales: 22, profit: 44000 },
          { hour: "4 PM", sales: 28, profit: 56000 },
          { hour: "5 PM", sales: 24, profit: 48000 },
          { hour: "6 PM", sales: 19, profit: 38000 },
          { hour: "7 PM", sales: 14, profit: 28000 },
        ];

        setSalesData(hourlyData);

        // Sample stats
        setStats({
          totalSales: 233,
          totalProfit: 466000,
          totalCustomers: 156,
          totalProducts: 89,
          trendingUp: true,
        });

        // Sample top products
        setTopProducts([
          { name: 'Samsung TV 55"', favorites: 45, wishlists: 32, sales: 28 },
          { name: "iPhone 14 Pro", favorites: 38, wishlists: 29, sales: 25 },
          { name: "LG Refrigerator", favorites: 32, wishlists: 24, sales: 21 },
          { name: "Sony Headphones", favorites: 28, wishlists: 19, sales: 18 },
          { name: "Kitchen Mixer", favorites: 24, wishlists: 17, sales: 15 },
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, [timeRange]);

  useEffect(() => {
    const fetchContactMessages = async () => {
      try {
        const params =
          messageStatusFilter === "all"
            ? {}
            : { params: { status: messageStatusFilter } };
        const response = await api.get("/contact-messages", params);
        setContactMessages(response.data || []);
      } catch (error) {
        console.error("Error loading contact messages:", error);
      }
    };

    fetchContactMessages();
  }, [messageStatusFilter]);

  const statusStyles = {
    new: "bg-amber-100 text-amber-700",
    pending: "bg-blue-100 text-blue-700",
    done: "bg-emerald-100 text-emerald-700",
    "in-progress": "bg-purple-100 text-purple-700",
    resolved: "bg-slate-100 text-slate-700",
  };

  const handleStatusChange = async (messageId, status) => {
    try {
      setUpdatingMessageId(messageId);
      const response = await api.patch(
        `/contact-messages/${messageId}/status`,
        {
          status,
        },
      );

      setContactMessages((currentMessages) =>
        currentMessages.map((message) =>
          message._id === messageId ? response.data : message,
        ),
      );
    } catch (error) {
      console.error("Error updating contact message status:", error);
    } finally {
      setUpdatingMessageId("");
    }
  };

  const COLORS = ["#10B981", "#3B82F6", "#EF4444", "#8B5CF6", "#F59E0B"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's your business overview
        </p>
      </motion.div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Analytics Overview
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <Calendar size={18} className="inline mr-2" />
              Date Picker
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Sales</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.totalSales}
              </h3>
              <div
                className={`flex items-center mt-2 ${
                  stats.trendingUp ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.trendingUp ? (
                  <ArrowUp size={16} />
                ) : (
                  <ArrowDown size={16} />
                )}
                <span className="ml-1 text-sm">12% from yesterday</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingBag size={24} className="text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Profit</p>
              <h3 className="text-2xl font-bold text-gray-800">
                Rs. {stats.totalProfit.toLocaleString()}
              </h3>
              <div
                className={`flex items-center mt-2 ${
                  stats.trendingUp ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.trendingUp ? (
                  <ArrowUp size={16} />
                ) : (
                  <ArrowDown size={16} />
                )}
                <span className="ml-1 text-sm">8% from yesterday</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Customers</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.totalCustomers}
              </h3>
              <div
                className={`flex items-center mt-2 ${
                  stats.trendingUp ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.trendingUp ? (
                  <ArrowUp size={16} />
                ) : (
                  <ArrowDown size={16} />
                )}
                <span className="ml-1 text-sm">5% from yesterday</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Products</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.totalProducts}
              </h3>
              <div
                className={`flex items-center mt-2 ${
                  stats.trendingUp ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.trendingUp ? (
                  <ArrowUp size={16} />
                ) : (
                  <ArrowDown size={16} />
                )}
                <span className="ml-1 text-sm">2 new today</span>
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Package size={24} className="text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Hourly Sales Chart */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Hourly Sales Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#10B981"
                  fill="#A7F3D0"
                  name="Sales"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#3B82F6"
                  fill="#BFDBFE"
                  name="Profit (Rs.)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Products Chart */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Top Performing Products
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="favorites" fill="#10B981" name="Favorites" />
                <Bar dataKey="wishlists" fill="#3B82F6" name="Wishlists" />
                <Bar dataKey="sales" fill="#8B5CF6" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Top Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Top 5 Products
          </h3>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Period:</span>
            <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-center py-3 px-4">
                  <Heart size={18} className="inline text-red-500 mr-1" />
                  Favorites
                </th>
                <th className="text-center py-3 px-4">
                  <Star size={18} className="inline text-yellow-500 mr-1" />
                  Wishlists
                </th>
                <th className="text-center py-3 px-4">
                  <ShoppingBag
                    size={18}
                    className="inline text-green-500 mr-1"
                  />
                  Sales
                </th>
                <th className="text-right py-3 px-4">Trend</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={index} className="border-b hover:bg-green-50">
                  <td className="py-3 px-4 font-medium">{product.name}</td>
                  <td className="text-center py-3 px-4">{product.favorites}</td>
                  <td className="text-center py-3 px-4">{product.wishlists}</td>
                  <td className="text-center py-3 px-4">{product.sales}</td>
                  <td className="text-right py-3 px-4">
                    <div className="inline-flex items-center text-green-600">
                      <TrendingUp size={16} className="mr-1" />
                      <span>+12%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/items"
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-xl hover:bg-green-50 transition-colors"
          >
            <Package size={32} className="text-green-600 mb-2" />
            <span className="text-green-700 font-medium">Add New Product</span>
          </Link>
          <Link
            to="/admin/sales"
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <DollarSign size={32} className="text-blue-600 mb-2" />
            <span className="text-blue-700 font-medium">Record Sale</span>
          </Link>

          <Link
            to="/customers"
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-xl hover:bg-purple-50 transition-colors"
          >
            <Users size={32} className="text-purple-600 mb-2" />
            <span className="text-purple-700 font-medium">View Customers</span>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mt-8 bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Customer Messages
            </h3>
            <p className="text-sm text-gray-600">
              Latest contact requests submitted from the authenticated contact
              page.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700">
            <MessageSquare size={18} />
            <span className="text-sm font-medium">
              {contactMessages.length} messages
            </span>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Filter:</span>
          <select
            value={messageStatusFilter}
            onChange={(e) => setMessageStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
            <option value="in-progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {contactMessages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-3 pr-4">User</th>
                  <th className="py-3 pr-4">Subject</th>
                  <th className="py-3 pr-4">Message</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Update</th>
                </tr>
              </thead>
              <tbody>
                {contactMessages.slice(0, 5).map((message) => (
                  <tr key={message._id} className="border-b last:border-0">
                    <td className="py-4 pr-4">
                      <p className="font-medium text-gray-900">
                        {message.name || message.user?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {message.email || message.user?.email}
                      </p>
                    </td>
                    <td className="py-4 pr-4 font-medium text-gray-800">
                      {message.subject}
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-600">
                      {message.message}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[message.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {message.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 pr-4">
                      <select
                        value={message.status}
                        onChange={(e) =>
                          handleStatusChange(message._id, e.target.value)
                        }
                        disabled={updatingMessageId === message._id}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                      >
                        <option value="new">New</option>
                        <option value="pending">Pending</option>
                        <option value="done">Done</option>
                        <option value="in-progress">In progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
            No contact messages yet.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
