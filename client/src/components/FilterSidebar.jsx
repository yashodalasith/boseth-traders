// client/src/components/FilterSidebar.jsx
import React from "react";
import { X } from "lucide-react";

const FilterSidebar = ({ filters, categories, brands, onFilterChange }) => {
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
      availability: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
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

      {/* Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category._id} className="flex items-center">
              <input
                type="radio"
                id={`category-${category._id}`}
                name="category"
                checked={filters.category === category._id}
                onChange={() => handleFilterChange("category", category._id)}
                className="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor={`category-${category._id}`}
                className="ml-2 text-sm text-gray-700"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Brands</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand._id} className="flex items-center">
              <input
                type="radio"
                id={`brand-${brand._id}`}
                name="brand"
                checked={filters.brand === brand._id}
                onChange={() => handleFilterChange("brand", brand._id)}
                className="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor={`brand-${brand._id}`}
                className="ml-2 text-sm text-gray-700"
              >
                {brand.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Availability</h4>
        <div className="space-y-2">
          {["available", "not available", "not specified"].map((status) => (
            <div key={status} className="flex items-center">
              <input
                type="radio"
                id={`availability-${status}`}
                name="availability"
                checked={filters.availability === status}
                onChange={() => handleFilterChange("availability", status)}
                className="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor={`availability-${status}`}
                className="ml-2 text-sm text-gray-700 capitalize"
              >
                {status.replace("-", " ")}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
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
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
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
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="100000"
            />
          </div>
        </div>
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Sort By</h4>
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange("sort", e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>
    </div>
  );
};

export default FilterSidebar;
