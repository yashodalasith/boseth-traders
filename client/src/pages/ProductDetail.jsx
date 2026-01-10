// client/src/pages/ProductDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Star,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useItem } from "../context/ItemContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getItem,
    addToFavorites,
    removeFromFavorites,
    addToWishlist,
    removeFromWishlist,
    userFavorites,
    userWishlist,
  } = useItem();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getItem(id);
        setProduct(productData);

        if (user) {
          // Replace with real checks if available
          setIsFavorite(userFavorites.includes(productData._id));
          setIsWishlisted(userWishlist.includes(productData._id));
        }
      } catch (err) {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  const handleFavorite = async () => {
    if (!user) return navigate("/login");
    try {
      if (isFavorite) {
        await removeFromFavorites(product._id);
      } else {
        await addToFavorites(product._id);
      }
      setIsFavorite((prev) => !prev); // Toggle state
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleWishlist = async () => {
    if (!user) return navigate("/login");
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
      setIsWishlisted((prev) => !prev); // Toggle state
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const nextImage = () => {
    setCurrentImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-green-600 hover:text-green-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Product not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-green-600 hover:text-green-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-green-600 hover:text-green-700 mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to products
          </button>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Product Images */}
              <div>
                <div className="relative mb-4">
                  <div className="aspect-w-1 aspect-h-1">
                    <img
                      src={
                        product.images?.[currentImage]?.url ||
                        "/images/placeholder-product.jpg"
                      }
                      alt={product.name}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </div>

                  {product.images?.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`h-20 w-full object-cover rounded border-2 ${
                          currentImage === index
                            ? "border-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`${product.name} ${index + 1}`}
                          className="h-full w-full object-cover rounded"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-600 mb-4">{product.modelNumber}</p>

                <div className="mb-6">
                  {product.hasDiscount ? (
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-green-700">
                        Rs.{" "}
                        {Math.round(
                          product.price -
                            (product.discountType === "percentage"
                              ? (product.price * product.discountValue) / 100
                              : product.discountValue)
                        )}
                      </span>
                      <span className="text-xl text-gray-500 line-through ml-2">
                        Rs. {product.price}
                      </span>
                      <span className="ml-2 bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                        Save {product.discountValue}
                        {product.discountType === "percentage" ? "%" : ""}
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-green-700">
                      LKR. {product.price}
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
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

                <p className="text-gray-700 mb-6">{product.description}</p>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Features
                    </h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-gray-700">
                            <strong>{feature.key}:</strong> {feature.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.availability === "available" && (
                  <div className="flex flex-col items-start mb-6">
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quantity:
                    </label>

                    <input
                      required
                      type="number"
                      id="quantity"
                      min={1}
                      max={product.quantity}
                      value={quantity}
                      onChange={(e) => {
                        const input = e.target.value;

                        if (input === "") {
                          setQuantity(""); // Allow user to backspace/clear input
                          return;
                        }

                        const val = parseInt(input, 10);

                        if (!isNaN(val)) {
                          setQuantity(
                            Math.max(1, Math.min(val, product.quantity))
                          );
                        }
                      }}
                      onBlur={() => {
                        // Fallback to 1 if empty or invalid on blur
                        if (quantity === "" || isNaN(quantity)) {
                          setQuantity(1);
                        }
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 w-24"
                      disabled={product.quantity === 0}
                    />

                    {/* ✅ Always show availability message if stock is low */}

                    <p className="text-sm text-orange-500 mt-1">
                      Only {product.quantity} item
                      {product.quantity > 1 ? "s" : ""} in stock
                    </p>
                  </div>
                )}

                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={handleFavorite}
                    className={`flex items-center justify-center px-4 py-2 border rounded-lg transition-colors ${
                      isFavorite
                        ? "border-red-400 text-red-600 bg-red-50 hover:bg-red-100"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Heart
                      size={20}
                      className={`mr-2 transition ${
                        isFavorite
                          ? "fill-red-500 text-red-500"
                          : "text-gray-500"
                      }`}
                    />
                    {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  </button>

                  <button
                    onClick={handleWishlist}
                    className={`flex items-center justify-center px-4 py-2 border rounded-lg transition-colors ${
                      isWishlisted
                        ? "border-blue-400 text-blue-600 bg-blue-50 hover:bg-blue-100"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ShoppingCart
                      size={20}
                      className={`mr-2 transition ${
                        isWishlisted
                          ? "fill-blue-500 text-blue-500"
                          : "text-gray-500"
                      }`}
                    />
                    {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  </button>
                </div>

                <button
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    product.availability !== "available" ||
                    quantity > product.quantity ||
                    quantity <= 0
                  }
                >
                  {product.availability === "available"
                    ? "Add to Cart"
                    : "Out of Stock"}
                </button>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-t border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Product Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Category
                  </h3>
                  <p className="text-gray-600">{product.category?.name}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Brand
                  </h3>
                  <p className="text-gray-600">{product.brand?.name}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Model Number
                  </h3>
                  <p className="text-gray-600">{product.modelNumber}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Availability
                  </h3>
                  <p className="text-gray-600 capitalize">
                    {product.availability}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
