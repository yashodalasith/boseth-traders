// client/src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Save,
  Edit3,
  Heart,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useItem } from "../context/ItemContext";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { getFavorites, getWishlist, removeFromFavorites, removeFromWishlist } =
    useItem();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    contact: "",
  });
  const [favorites, setFavorites] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingFavorites, setRemovingFavorites] = useState([]);
  const [removingWishlist, setRemovingWishlist] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        address: user.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
        },
        contact: user.contact || "",
      });

      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const favoritesData = await getFavorites();
      const wishlistData = await getWishlist();
      setFavorites(favoritesData);
      setWishlist(wishlistData);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleRemoveFavorite = async (itemId) => {
    try {
      setRemovingFavorites((prev) => [...prev, itemId]);
      await removeFromFavorites(itemId);
      setFavorites((prev) => prev.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    } finally {
      setRemovingFavorites((prev) => prev.filter((id) => id !== itemId));
    }
  };

  // Remove from wishlist handler
  const handleRemoveWishlist = async (itemId) => {
    try {
      setRemovingWishlist((prev) => [...prev, itemId]);
      await removeFromWishlist(itemId);
      setWishlist((prev) => prev.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    } finally {
      setRemovingWishlist((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setMessage("");
      setLoading(true);
      const result = await updateProfile(formData);
      if (result.success) {
        setMessage("Profile updated successfully");
        setIsEditing(false);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto min-w-0"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center text-green-600 hover:text-green-700"
              >
                <Edit3 size={18} className="mr-1" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>

          {message && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            {isEditing && (
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <Save size={18} className="mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Heart size={20} className="text-red-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                Favorites ({favorites.length})
              </h2>
            </div>

            {favorites.length > 0 ? (
              <div className="space-y-3">
                {favorites.slice(0, 5).map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg"
                  >
                    <img
                      src={
                        item.images?.[0]?.url ||
                        "/images/placeholder-product.jpg"
                      }
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded mr-3"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 text-sm">
                        {item.name}
                      </h3>
                      <p className="text-green-600 font-semibold text-sm">
                        Rs. {item.price}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(item._id)}
                      disabled={removingFavorites.includes(item._id)}
                      className="ml-3 text-red-500 hover:text-red-700"
                      aria-label={`Remove ${item.name} from favorites`}
                      title="Remove from favorites"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {favorites.length > 5 && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    +{favorites.length - 5} more items
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">
                No favorite items yet
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <ShoppingCart size={20} className="text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                Wishlist ({wishlist.length})
              </h2>
            </div>

            {wishlist.length > 0 ? (
              <div className="space-y-3">
                {wishlist.slice(0, 5).map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg"
                  >
                    <img
                      src={
                        item.images?.[0]?.url ||
                        "/images/placeholder-product.jpg"
                      }
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded mr-3"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 text-sm">
                        {item.name}
                      </h3>
                      <p className="text-green-600 font-semibold text-sm">
                        Rs. {item.price}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveWishlist(item._id)}
                      disabled={removingWishlist.includes(item._id)}
                      className="ml-3 text-red-500 hover:text-red-700"
                      aria-label={`Remove ${item.name} from wishlist`}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {wishlist.length > 5 && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    +{wishlist.length - 5} more items
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">
                No wishlist items yet
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
