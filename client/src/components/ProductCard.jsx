// client/src/components/ProductCard.jsx

import React, { useState, useRef, useEffect } from "react";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useItem } from "../context/ItemContext";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const [isInView, setIsInView] = useState(false);
  const [localFavorite, setLocalFavorite] = useState(false);
  const [localWishlist, setLocalWishlist] = useState(false);
  const cardRef = useRef();

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

  // ✨ Sync local state with global context
  useEffect(() => {
    if (user) {
      setLocalFavorite(userFavorites.includes(product._id));
      setLocalWishlist(userWishlist.includes(product._id));
    } else {
      setLocalFavorite(false);
      setLocalWishlist(false);
    }
  }, [user, userFavorites, userWishlist, product._id]);

  // 👀 Handle animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // ❤️ Toggle Favorite
  const handleFavorite = async () => {
    if (!user) return (window.location.href = "/login");

    try {
      if (localFavorite) {
        await removeFromFavorites(product._id);
      } else {
        await addToFavorites(product._id);
      }

      // ✅ Update UI immediately
      setLocalFavorite((prev) => !prev);

      // ✅ Sync global state
      getFavorites();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // ⭐ Toggle Wishlist
  const handleWishlist = async () => {
    if (!user) return (window.location.href = "/login");

    try {
      if (localWishlist) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }

      setLocalWishlist((prev) => !prev);
      getWishlist();
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-xl overflow-hidden shadow-lg hover-lift transform transition-all duration-500 ${
        isInView ? "slide-in-up in-view" : "slide-in-up"
      }`}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.images[0]?.url || "/placeholder-image.jpg"}
          alt={product.name}
          className="w-full h-56 object-cover transition-transform duration-700 hover:scale-110"
        />

        {/* Top-right icons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <button
            onClick={handleFavorite}
            className={`bg-white p-2 rounded-full shadow-md transition-colors ${
              localFavorite ? "bg-red-100 text-red-600" : "hover:bg-green-50"
            }`}
            aria-label="Toggle favorite"
          >
            <Heart
              size={18}
              className={localFavorite ? "fill-red-600" : "text-green-600"}
            />
          </button>

          <button
            onClick={handleWishlist}
            className={`bg-white p-2 rounded-full shadow-md transition-colors ${
              localWishlist
                ? "bg-yellow-100 text-yellow-600"
                : "hover:bg-green-50"
            }`}
            aria-label="Toggle wishlist"
          >
            <ShoppingCart
              size={18}
              className={localWishlist ? "fill-yellow-600" : "text-green-600"}
            />
          </button>
        </div>

        {/* Discount Badge */}
        {product.hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discountType === "percentage"
              ? `${product.discountValue}% OFF`
              : `Rs. ${product.discountValue} OFF`}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price + Availability */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {product.hasDiscount ? (
              <>
                <span className="text-xl font-bold text-green-700">
                  Rs.{" "}
                  {Math.round(
                    product.price -
                      (product.discountType === "percentage"
                        ? (product.price * product.discountValue) / 100
                        : product.discountValue)
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

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Link
            to={`/product/${product._id}`}
            className="flex items-center text-green-600 hover:text-green-700 font-medium text-sm"
          >
            <Eye size={16} className="mr-1" />
            View Details
          </Link>

          <button className="btn-primary px-4 py-2 rounded-lg text-white font-medium text-sm">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
