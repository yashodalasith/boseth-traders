import React, { useState } from "react";

const FilterSidebar = ({ filters, categories, brands, onFilterChange }) => {
  const [minPrice, setMinPrice] = useState(filters.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || "");

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      category: "",
      brand: "",
      hasDiscount: false,
      minPrice: "",
      maxPrice: "",
    });
    setMinPrice("");
    setMaxPrice("");
  };

  const applyPriceFilter = () => {
    onFilterChange({
      ...filters,
      minPrice: minPrice,
      maxPrice: maxPrice,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-green-600 hover:text-green-700"
        >
          Clear all
        </button>
      </div>

      {/* Categories Dropdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brands Dropdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Brands</h4>
        <select
          value={filters.brand}
          onChange={(e) => handleFilterChange("brand", e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        >
          <option value="">Select Brand</option>
          {brands.map((brand) => (
            <option key={brand._id} value={brand._id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      {/* Offers (Has Discount) */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Offers</h4>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="hasDiscount"
            checked={filters.hasDiscount}
            onChange={() =>
              handleFilterChange("hasDiscount", !filters.hasDiscount)
            }
            className="h-4 w-4 text-green-600 focus:ring-green-500"
          />
          <label htmlFor="hasDiscount" className="ml-2 text-sm text-gray-700">
            Show Items with Offers
          </label>
        </div>
      </div>

      {/* Price Range with Apply Button */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="minPrice"
              className="block text-xs text-gray-500 mb-1"
            >
              Min Price (Rs.)
            </label>
            <input
              type="number"
              id="minPrice"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label
              htmlFor="maxPrice"
              className="block text-xs text-gray-500 mb-1"
            >
              Max Price (Rs.)
            </label>
            <input
              type="number"
              id="maxPrice"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="100000"
            />
          </div>
        </div>
        <button
          onClick={applyPriceFilter}
          className="w-full bg-green-600 text-white p-2 mt-4 rounded text-sm"
        >
          Apply Price Filter
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
