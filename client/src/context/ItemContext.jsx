import React, { createContext, useContext, useState } from "react";
import api from "../utils/api";

const ItemContext = createContext();

export const useItem = () => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error("useItem must be used within an ItemProvider");
  }
  return context;
};

export const ItemProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [userFavorites, setUserFavorites] = useState([]); // Array of product IDs
  const [userWishlist, setUserWishlist] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const getItems = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/items?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching items:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getItem = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/items/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching item:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData) => {
    try {
      setLoading(true);
      const response = await api.post("/items", itemData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating item:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      setLoading(true);
      const response = await api.put(`/items/${id}`, itemData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      setLoading(true);
      const response = await api.delete(`/items/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  };

  const createCategory = async (categoryData) => {
    try {
      const response = await api.post("/categories", categoryData);
      await getCategories();
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  };

  const updateCategory = async (categoryId, categoryData) => {
    try {
      const response = await api.put(`/categories/${categoryId}`, categoryData);
      await getCategories();
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const response = await api.delete(`/categories/${categoryId}`);
      await getCategories();
      return response.data;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  };

  const getBrands = async () => {
    try {
      const response = await api.get("/brands");
      setBrands(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching brands:", error);
      throw error;
    }
  };

  const createBrand = async (brandData) => {
    try {
      const response = await api.post("/brands", brandData);
      await getBrands();
      return response.data;
    } catch (error) {
      console.error("Error creating brand:", error);
      throw error;
    }
  };

  const updateBrand = async (brandId, brandData) => {
    try {
      const response = await api.put(`/brands/${brandId}`, brandData);
      await getBrands();
      return response.data;
    } catch (error) {
      console.error("Error updating brand:", error);
      throw error;
    }
  };

  const deleteBrand = async (brandId) => {
    try {
      const response = await api.delete(`/brands/${brandId}`);
      await getBrands();
      return response.data;
    } catch (error) {
      console.error("Error deleting brand:", error);
      throw error;
    }
  };

  const getSales = async () => {
    try {
      const response = await api.get("/sales");
      return response.data;
    } catch (error) {
      console.error("Error fetching sales:", error);
      throw error;
    }
  };

  const addSale = async (saleData) => {
    try {
      const response = await api.post("/sales", saleData);
      return response.data;
    } catch (error) {
      console.error("Error adding sale:", error);
      throw error;
    }
  };

  const addToFavorites = async (itemId) => {
    try {
      const response = await api.post(`/users/me/favorites/${itemId}`);
      getFavorites(); // Refresh favorites after addition
      return response.data;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw error;
    }
  };

  const removeFromFavorites = async (itemId) => {
    try {
      const response = await api.delete(`/users/me/favorites/${itemId}`);
      getFavorites(); // Refresh favorites after removal
      return response.data;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      throw error;
    }
  };

  const addToWishlist = async (itemId) => {
    try {
      const response = await api.post(`/users/me/wishlist/${itemId}`);
      getWishlist(); // Refresh wishlist after addition
      return response.data;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw error;
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      const response = await api.delete(`/users/me/wishlist/${itemId}`);
      getWishlist(); // Refresh wishlist after removal
      return response.data;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      throw error;
    }
  };

  const getFeaturedProducts = async () => {
    try {
      const response = await api.get("/items?limit=8&sort=-createdAt");
      return response.data.items || response.data;
    } catch (error) {
      console.error("Error fetching featured products:", error);
      throw error;
    }
  };

  const getFavorites = async () => {
    try {
      const response = await api.get("/users/me/favorites");
      const favoriteIds = response.data.map((item) => item._id); // 🟢 Only IDs
      setUserFavorites(favoriteIds);
      return response.data;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw error;
    }
  };

  const getWishlist = async () => {
    try {
      const response = await api.get("/users/me/wishlist");
      const wishlistIds = response.data.map((item) => item._id); // 🟢 Only IDs
      setUserWishlist(wishlistIds);
      return response.data;
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      throw error;
    }
  };

  const updateSale = async (saleId, saleData) => {
    try {
      const response = await api.put(`/sales/${saleId}`, saleData);
      return response.data;
    } catch (error) {
      console.error("Error updating sale:", error);
      throw error;
    }
  };

  const deleteSale = async (saleId) => {
    try {
      const response = await api.delete(`/sales/${saleId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting sale:", error);
      throw error;
    }
  };

  const value = {
    loading,
    categories,
    brands,
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    getCategories,
    getBrands,
    getSales,
    addSale,
    updateSale,
    deleteSale,
    addToFavorites,
    removeFromFavorites,
    addToWishlist,
    removeFromWishlist,
    getFavorites,
    getWishlist,
    getFeaturedProducts,
    userFavorites,
    userWishlist,
    setUserFavorites, // optional: only needed if components will update them manually
    setUserWishlist,
    createCategory,
    updateCategory,
    deleteCategory,
    createBrand,
    updateBrand,
    deleteBrand,
  };

  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
};
