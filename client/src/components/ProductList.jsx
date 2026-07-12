import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useItem } from "../context/ItemContext";
import { Link } from "react-router-dom";
import { isPaymentEnabled } from "../utils/featureFlags";

const ProductList = ({ product }) => {
  const { user } = useAuth();
  const {
    addToFavorites,
    removeFromFavorites,
    addToWishlist,
    removeFromWishlist,
    userFavorites,
    userWishlist,
    getFavorites,
    getWishlist,
  } = useItem();

  const [isFavorite, setIsFavorite] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ✅ Sync local state with global context
  useEffect(() => {
    if (user) {
      setIsFavorite(userFavorites.includes(product._id));
      setIsWishlisted(userWishlist.includes(product._id));
    } else {
      setIsFavorite(false);
      setIsWishlisted(false);
    }
  }, [user, userFavorites, userWishlist, product._id]);

  const handleFavorite = async () => {
    if (!user) return (window.location.href = "/login");
    try {
      if (isFavorite) {
        await removeFromFavorites(product._id);
      } else {
        await addToFavorites(product._id);
      }
      setIsFavorite((prev) => !prev);
      getFavorites(); // Optional, if backend sync is needed
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleWishlist = async () => {
    if (!user) return (window.location.href = "/login");
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
      setIsWishlisted((prev) => !prev);
      getWishlist(); // Optional, if backend sync is needed
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 hover-lift">
      <div className="relative flex flex-col md:flex-row items-center">
        {/* Discount Badge */}
        {product.hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discountType === "percentage"
              ? `${product.discountValue}% OFF`
              : `Rs. ${product.discountValue} OFF`}
          </div>
        )}

        <div className="md:w-1/4 mb-4 md:mb-0">
          <img
            src={product.images[0]?.url || "/images/placeholder-product.jpg"}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>

        <div className="md:w-3/4 md:pl-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {product.name}
          </h3>
          <p className="text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex flex-wrap items-center justify-between mb-3">
            <div className="flex items-center">
              {product.hasDiscount ? (
                <>
                  <span className="text-xl font-bold text-green-700">
                    Rs.{" "}
                    {Math.round(
                      product.price -
                        (product.discountType === "percentage"
                          ? (product.price * product.discountValue) / 100
                          : product.discountValue),
                    )}
                  </span>
                  <span className="text-sm text-gray-500 line-through ml-2">
                    Rs. {product.price}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-green-700">
                  Rs. {product.price}
                </span>
              )}
            </div>

            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                product.availability === "available"
                  ? "bg-green-100 text-green-800"
                  : product.availability === "not available"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {product.availability}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Favorite Button */}
              <button
                onClick={handleFavorite}
                className={`flex items-center transition-colors ${
                  isFavorite
                    ? "text-red-600 bg-red-100 px-2 py-1 rounded"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                <Heart
                  size={18}
                  className={isFavorite ? "fill-red-600 mr-1" : "mr-1"}
                />
                <span className="text-sm">Favorite</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlist}
                className={`flex items-center transition-colors ${
                  isWishlisted
                    ? "text-yellow-600 bg-yellow-100 px-2 py-1 rounded"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                <ShoppingCart
                  size={18}
                  className={isWishlisted ? "fill-yellow-600 mr-1" : "mr-1"}
                />
                <span className="text-sm">Wishlist</span>
              </button>

              {/* View Details */}
              <Link
                to={`/product/${product._id}`}
                className="flex items-center text-green-600 hover:text-green-700"
              >
                <Eye size={18} className="mr-1" />
                <span className="text-sm">View Details</span>
              </Link>
            </div>

            {isPaymentEnabled && (
              <button className="btn-primary px-4 py-2 rounded-lg text-sm">
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
