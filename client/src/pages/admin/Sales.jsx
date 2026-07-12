// client/src/pages/admin/Sales.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Package,
} from "lucide-react";
import SalesEntryModal from "../../components/SalesEntryModal";
import { useItem } from "../../context/ItemContext";

const AdminSales = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getSales, addSale, updateSale, deleteSale } = useItem();

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, searchTerm, dateFilter]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const salesData = await getSales();
      setSales(salesData);
    } catch (error) {
      console.error("Error loading sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterSales = () => {
    let filtered = sales;

    if (searchTerm) {
      filtered = filtered.filter((sale) => {
        const itemNames = (sale.items || [])
          .map((item) => item.itemName?.toLowerCase() || "")
          .join(" ");
        const modelNumbers = (sale.items || [])
          .map((item) =>
            item.item?.modelNumber ? item.item.modelNumber.toLowerCase() : "",
          )
          .join(" ");
        const customerName = sale.customer?.name?.toLowerCase() || "";

        return (
          itemNames.includes(searchTerm.toLowerCase()) ||
          modelNumbers.includes(searchTerm.toLowerCase()) ||
          customerName.includes(searchTerm.toLowerCase())
        );
      });
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.dateTime);
        return saleDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredSales(filtered);
  };

  const handleAddSale = async (saleData) => {
    try {
      await addSale(saleData);
      loadSales(); // Reload sales
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding sale:", error);
      throw error;
    }
  };

  const handleSaveSale = async (saleData) => {
    try {
      if (editingSale) {
        await updateSale(editingSale._id, saleData);
      } else {
        await addSale(saleData);
      }

      setEditingSale(null);
      setIsModalOpen(false);
      loadSales();
    } catch (error) {
      console.error("Error saving sale:", error);
      throw error;
    }
  };

  const handleEditClick = (sale) => {
    setEditingSale(sale);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (sale) => {
    if (
      !window.confirm(
        "Delete this sale entry? This will adjust item sales counts.",
      )
    )
      return;
    try {
      await deleteSale(sale._id);
      loadSales();
    } catch (error) {
      console.error("Error deleting sale:", error);
    }
  };

  const calculateTotal = (salesData) => {
    return salesData.reduce((total, sale) => total + sale.totalSale, 0);
  };

  const calculateProfit = (salesData) => {
    return salesData.reduce(
      (total, sale) => total + Number(sale.netProfit || 0),
      0,
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales data...</p>
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
        <h1 className="text-3xl font-bold text-gray-800">Sales Management</h1>
        <p className="text-gray-600">Manage and track your sales entries</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Sales</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {sales.length}
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800">
                Rs. {calculateTotal(sales).toLocaleString()}
              </h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Profit</p>
              <h3 className="text-2xl font-bold text-gray-800">
                Rs. {calculateProfit(sales).toLocaleString()}
              </h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center px-4 py-2"
          >
            <Plus size={20} className="mr-2" />
            Add Sale Entry
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Sale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Profit / Loss
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sale.customer?.name || "Unknown customer"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sale.customer?.contact || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {(sale.items || []).map((item, index) => (
                          <div
                            key={`${sale._id}-${index}`}
                            className="text-sm text-gray-700"
                          >
                            {item.itemName} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sale.dateTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rs. {Number(sale.totalSale || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span
                        className={
                          Number(sale.netProfit || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        Rs. {Number(sale.netProfit || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(sale)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(sale)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {sales.length === 0
                      ? "No sales records found."
                      : "No sales match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Entry Modal */}
      <SalesEntryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSale(null);
        }}
        onSave={handleSaveSale}
        initialSale={editingSale}
      />
    </div>
  );
};

export default AdminSales;
