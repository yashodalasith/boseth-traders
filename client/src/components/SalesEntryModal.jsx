// client/src/components/admin/SalesEntryModal.jsx
import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { useItem } from "../context/ItemContext";

const SalesEntryModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    itemId: "",
    itemName: "",
    buyingPrice: "",
    sellingPrice: "",
    quantity: "1",
    dateTime: new Date().toISOString().slice(0, 16),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { getItems } = useItem();

  useEffect(() => {
    if (searchTerm) {
      const searchItems = async () => {
        try {
          const results = await getItems({ search: searchTerm, limit: 5 });
          setSearchResults(results.items || results);
          setShowSearchResults(true);
        } catch (error) {
          console.error("Error searching items:", error);
        }
      };

      const timeoutId = setTimeout(searchItems, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm, getItems]);

  const handleItemSelect = (item) => {
    setFormData({
      ...formData,
      itemId: item._id,
      itemName: item.name,
      buyingPrice: item.price * 0.7, // Default buying price as 70% of selling price
      sellingPrice: item.price,
    });
    setSearchTerm(item.name);
    setShowSearchResults(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      buyingPrice: parseFloat(formData.buyingPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      quantity: parseInt(formData.quantity),
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Add Sales Entry
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item
            </label>
            <div className="relative">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
                  {searchResults.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleItemSelect(item)}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        {item.modelNumber}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="itemName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Item Name
            </label>
            <input
              type="text"
              id="itemName"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="buyingPrice"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Buying Price (Rs.)
              </label>
              <input
                type="number"
                id="buyingPrice"
                name="buyingPrice"
                value={formData.buyingPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="sellingPrice"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Selling Price (Rs.)
              </label>
              <input
                type="number"
                id="sellingPrice"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="1"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="dateTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date & Time
              </label>
              <input
                type="datetime-local"
                id="dateTime"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary px-4 py-2 rounded-lg">
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesEntryModal;
