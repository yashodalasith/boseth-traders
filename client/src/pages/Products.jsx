// client/src/pages/Products.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Grid, List, SlidersHorizontal } from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductList from "../components/ProductList";
import FilterSidebar from "../components/FilterSidebar";
import { useItem } from "../context/ItemContext";

const Products = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get search query from URL if present
  const urlSearch = searchParams.get("search") || "";

  // Separate search input state from applied filters
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [filters, setFilters] = useState({
    search: urlSearch,
    category: "",
    brand: "",
    availability: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
    page: 1,
    limit: 12,
  });

  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const { getItems, getCategories, getBrands } = useItem();

  // Only trigger on filters change (not on search input change)
  useEffect(() => {
    loadProducts();
  }, [filters]);

  // Load categories and brands once on mount
  useEffect(() => {
    loadCategories();
    loadBrands();
  }, []);

  // Update filters when URL search param changes
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch) {
      setSearchInput(urlSearch);
      setFilters((prev) => ({ ...prev, search: urlSearch, page: 1 }));
    }
  }, [searchParams]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getItems(filters);
      setProducts(response.items);
      setTotalItems(response.totalItems);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadBrands = async () => {
    try {
      const brandsData = await getBrands();
      setBrands(brandsData);
    } catch (error) {
      console.error("Error loading brands:", error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Only update filters (triggering the API call) when search is submitted
    setFilters({ ...filters, search: searchInput, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo(0, 0);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setFilters({
      search: "",
      category: "",
      brand: "",
      availability: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
      page: 1,
      limit: 12,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Our Products
          </h1>
          <p className="text-gray-600">
            Discover our wide range of electronics, home appliances, and more
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6 relative">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products by name, model number, or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-1/4">
            <FilterSidebar
              filters={filters}
              categories={categories}
              brands={brands}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Products Section */}
          <div className="lg:w-3/4">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-green-600 font-medium"
              >
                <SlidersHorizontal size={20} className="mr-2" />
                Filters
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-green-100 text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${
                    viewMode === "list"
                      ? "bg-green-100 text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Mobile Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden mb-6 bg-white p-4 rounded-lg shadow"
                >
                  <FilterSidebar
                    filters={filters}
                    categories={categories}
                    brands={brands}
                    onFilterChange={handleFilterChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop View Toggle */}
            <div className="hidden lg:flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600">
                Showing {products.length} of {totalItems} products
              </p>

              <div className="flex items-center space-x-4">
                <span className="text-gray-600">View:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${
                      viewMode === "grid"
                        ? "bg-green-100 text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${
                      viewMode === "list"
                        ? "bg-green-100 text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>

                <select
                  value={filters.sort}
                  onChange={(e) =>
                    setFilters({ ...filters, sort: e.target.value })
                  }
                  className="border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-green-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="loading-spinner mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="products-grid">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow">
                    {products.map((product) => (
                      <ProductList key={product._id} product={product} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center space-x-2 bg-white rounded-lg shadow p-4">
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page === 1}
                        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-full ${
                              filters.page === page
                                ? "bg-green-600 text-white"
                                : "border text-gray-700 hover:bg-green-50"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page === totalPages}
                        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Search size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-green-600 hover:text-green-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
