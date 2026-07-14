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
  Trash2,
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
    totalRevenue: 0,
    totalProfit: 0,
    totalCustomers: 0,
    totalProducts: 0,
    salesGrowth: 0,
    trendingUp: true,
  });
  const [topProducts, setTopProducts] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [updatingMessageId, setUpdatingMessageId] = useState("");
  const [deletingMessageId, setDeletingMessageId] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setAnalyticsError("");

      try {
        const [summaryResponse, hourlyResponse, topProductsResponse] =
          await Promise.all([
            api.get("/sales/analytics/summary", {
              params: { range: timeRange },
            }),
            api.get("/sales/analytics/hourly", {
              params: { range: timeRange },
            }),
            api.get("/sales/analytics/top-products", {
              params: { range: timeRange },
            }),
          ]);

        const summary = summaryResponse.data || {};
        setStats({
          totalSales: Number(summary.totalSales || 0),
          totalRevenue: Number(summary.totalRevenue || 0),
          totalProfit: Number(summary.totalProfit || 0),
          totalCustomers: Number(summary.totalCustomers || 0),
          totalProducts: Number(summary.totalProducts || 0),
          salesGrowth: Number(summary.salesGrowth || 0),
          trendingUp: summary.trendingUp !== false,
        });

        const chartData = Array.isArray(hourlyResponse.data)
          ? hourlyResponse.data.map((entry) => ({
              label: entry.label || entry.hour || "",
              sales: Number(entry.sales || 0),
              revenue: Number(entry.revenue || 0),
            }))
          : [];

        setSalesData(chartData);
        setTopProducts(
          Array.isArray(topProductsResponse.data)
            ? topProductsResponse.data
            : [],
        );
      } catch (error) {
        console.error("Error loading dashboard analytics:", error);
        setSalesData([]);
        setTopProducts([]);
        setStats({
          totalSales: 0,
          totalRevenue: 0,
          totalProfit: 0,
          totalCustomers: 0,
          totalProducts: 0,
          salesGrowth: 0,
          trendingUp: true,
        });
        setAnalyticsError(
          "Unable to load analytics right now. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  const handleDeleteMessage = async (messageId) => {
    if (
      !window.confirm(
        "Delete this completed customer message? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeletingMessageId(messageId);
      await api.delete(`/contact-messages/${messageId}`);
      setContactMessages((currentMessages) =>
        currentMessages.filter((message) => message._id !== messageId),
      );
    } catch (error) {
      console.error("Error deleting contact message:", error);
    } finally {
      setDeletingMessageId("");
    }
  };

  const COLORS = ["#10B981", "#3B82F6", "#EF4444", "#8B5CF6", "#F59E0B"];

  const formatCurrency = (value) =>
    `Rs. ${Number(value || 0).toLocaleString()}`;

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
                <span className="ml-1 text-sm">
                  {Math.abs(stats.salesGrowth).toFixed(0)}% vs previous period
                </span>
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
                {formatCurrency(stats.totalProfit)}
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
                <span className="ml-1 text-sm">
                  {formatCurrency(stats.totalRevenue)} revenue
                </span>
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
                <span className="ml-1 text-sm">
                  {stats.totalCustomers} registered users
                </span>
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
                <span className="ml-1 text-sm">
                  {stats.totalProducts} items in inventory
                </span>
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Package size={24} className="text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {analyticsError ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {analyticsError}
        </div>
      ) : null}

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
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#10B981"
                    fill="#A7F3D0"
                    name="Sales count"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    fill="#BFDBFE"
                    name="Revenue (Rs.)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-500">
                No sales activity recorded for this period yet.
              </div>
            )}
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
            {topProducts.length > 0 ? (
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
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-500">
                No top-selling products available for this period.
              </div>
            )}
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
          </div>
        </div>

        <div className="overflow-x-auto">
          {topProducts.length > 0 ? (
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
                  <th className="text-right py-3 px-4">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index} className="border-b hover:bg-green-50">
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="text-center py-3 px-4">
                      {product.favorites}
                    </td>
                    <td className="text-center py-3 px-4">
                      {product.wishlists}
                    </td>
                    <td className="text-center py-3 px-4">{product.sales}</td>
                    <td className="text-right py-3 px-4">
                      {formatCurrency(product.revenue || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
              No product activity yet for this period.
            </div>
          )}
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
            to="/admin/customers"
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
                  <th className="py-3 pr-4">Delete</th>
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
                    <td className="py-4 pr-4">
                      {["done", "resolved"].includes(message.status) ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(message._id)}
                          disabled={deletingMessageId === message._id}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">Locked</span>
                      )}
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
