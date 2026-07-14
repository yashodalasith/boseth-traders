// client/src/components/admin/ItemModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Plus,
  Edit2,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useItem } from "../../context/ItemContext";

const ItemModal = ({ isOpen, onClose, onSave, item }) => {
  const {
    createCategory,
    updateCategory,
    deleteCategory,
    createBrand,
    updateBrand,
    deleteBrand,
    categories, // Get categories from context
    brands, // Get brands from context
  } = useItem();

  const [formData, setFormData] = useState({
    name: "",
    modelNumber: "",
    description: "",
    price: "",
    buyingPrice: "",
    category: "",
    brand: "",
    availability: "not specified",
    quantity: "0",
    hasDiscount: false,
    discountType: "percentage",
    discountValue: "",
    features: JSON.stringify([{ key: "", value: "" }]),
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [newImages, setNewImages] = useState([]);

  // Category management states
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Brand management states
  const [showBrandManager, setShowBrandManager] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "", description: "" });
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [quantityError, setQuantityError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        modelNumber: item.modelNumber || "",
        description: item.description || "",
        price: item.price || "",
        buyingPrice: item.buyingPrice ?? "",
        category: item.category?.name || "",
        brand: item.brand?.name || "",
        availability: item.availability || "not specified",
        quantity: item.quantity || "0",
        hasDiscount: item.hasDiscount || false,
        discountType: item.discountType || "percentage",
        discountValue: item.discountValue || "",
        features: item.features
          ? JSON.stringify(item.features)
          : JSON.stringify([{ key: "", value: "" }]),
        images: item.images || [],
      });
      setImagePreviews(item.images?.map((img) => img.url) || []);
    } else {
      // Reset form for new item
      setFormData({
        name: "",
        modelNumber: "",
        description: "",
        price: "",
        buyingPrice: "",
        category: "",
        brand: "",
        availability: "not specified",
        quantity: "0",
        hasDiscount: false,
        discountType: "percentage",
        discountValue: "",
        features: JSON.stringify([{ key: "", value: "" }]),
        images: [],
      });
      setImagePreviews([]);
      setNewImages([]);
    }

    // Reset management states when modal opens/closes
    setShowCategoryManager(false);
    setShowBrandManager(false);
    setNewCategory({ name: "", description: "" });
    setNewBrand({ name: "", description: "" });
    setEditingCategory(null);
    setEditingBrand(null);
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["quantity", "price", "buyingPrice", "discountValue"].includes(name)
            ? Number(value)
            : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (index < formData.images.length) {
      // This is an existing image
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    } else {
      // This is a new image
      const newIndex = index - formData.images.length;
      setNewImages((prev) => prev.filter((_, i) => i !== newIndex));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Quantity validation
    if (
      formData.availability === "available" &&
      (!formData.quantity || formData.quantity <= 0)
    ) {
      setQuantityError(
        "Quantity must be greater than 0 when item is available",
      );
      return;
    }

    // Clear error if valid
    setQuantityError("");

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "images") {
        submitData.append(key, formData[key]);
      }
    });

    // Append new images
    newImages.forEach((image) => {
      submitData.append("images", image);
    });

    onSave(submitData);
  };

  // Category management functions - update to refresh after operations
  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return;

    setLoading(true);
    try {
      await createCategory(newCategory);
      setNewCategory({ name: "", description: "" });
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;

    setLoading(true);
    try {
      await updateCategory(editingCategory._id, {
        name: editingCategory.name,
        description: editingCategory.description,
      });
      setEditingCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    setLoading(true);
    try {
      await deleteCategory(categoryId);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setLoading(false);
    }
  };

  // Brand management functions - update to refresh after operations
  const handleCreateBrand = async () => {
    if (!newBrand.name.trim()) return;

    setLoading(true);
    try {
      await createBrand(newBrand);
      setNewBrand({ name: "", description: "" });
    } catch (error) {
      console.error("Error creating brand:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand || !editingBrand.name.trim()) return;

    setLoading(true);
    try {
      await updateBrand(editingBrand._id, {
        name: editingBrand.name,
        description: editingBrand.description,
      });
      setEditingBrand(null);
    } catch (error) {
      console.error("Error updating brand:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId) => {
    setLoading(true);
    try {
      await deleteBrand(brandId);
      setBrandToDelete(null);
    } catch (error) {
      console.error("Error deleting brand:", error);
    } finally {
      setLoading(false);
    }
  };

  // Feature management functions
  const addFeatureField = () => {
    const features = JSON.parse(formData.features);
    features.push({ key: "", value: "" });
    setFormData((prev) => ({
      ...prev,
      features: JSON.stringify(features),
    }));
  };

  const removeFeatureField = (index) => {
    const features = JSON.parse(formData.features);
    features.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      features: JSON.stringify(features),
    }));
  };

  const updateFeatureField = (index, field, value) => {
    const features = JSON.parse(formData.features);
    features[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      features: JSON.stringify(features),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl sm:max-w-5xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            {item ? "Edit Item" : "Add New Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Number *
              </label>
              <input
                type="text"
                name="modelNumber"
                value={formData.modelNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price per Item (Rs.) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buying Price per Item (Rs.)
              </label>
              <input
                type="number"
                name="buyingPrice"
                value={formData.buyingPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Enhanced Category Section */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setShowCategoryManager(!showCategoryManager)}
                  className="text-xs text-green-600 hover:text-green-700 flex items-center"
                >
                  Manage Categories
                  {showCategoryManager ? (
                    <ChevronUp size={14} className="ml-1" />
                  ) : (
                    <ChevronDown size={14} className="ml-1" />
                  )}
                </button>
              </div>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Category Manager */}
              {showCategoryManager && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Category Management
                  </h4>

                  {/* Add New Category */}
                  <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Category name"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="flex-1 p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={newCategory.description}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="flex-1 p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={loading || !newCategory.name.trim()}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Existing Categories */}
                  <div className="max-h-32 overflow-y-auto">
                    {categories.map((category) => (
                      <div
                        key={category._id}
                        className="flex items-center gap-2 mb-2 p-2 bg-white rounded border"
                      >
                        {editingCategory?._id === category._id ? (
                          <>
                            <input
                              type="text"
                              value={editingCategory.name}
                              onChange={(e) =>
                                setEditingCategory((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="flex-1 p-1 text-sm border border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              value={editingCategory.description}
                              onChange={(e) =>
                                setEditingCategory((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              className="flex-1 p-1 text-sm border border-gray-300 rounded"
                            />
                            <button
                              type="button"
                              onClick={handleUpdateCategory}
                              disabled={loading}
                              className="p-1 text-green-600 hover:text-green-700"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategory(null)}
                              className="p-1 text-gray-600 hover:text-gray-700"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {category.name}
                              </div>
                              {category.description && (
                                <div className="text-xs text-gray-500">
                                  {category.description}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingCategory(category)}
                              className="p-1 text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCategoryToDelete(category._id)}
                              className="p-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Enhanced Brand Section */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Brand *
                </label>
                <button
                  type="button"
                  onClick={() => setShowBrandManager(!showBrandManager)}
                  className="text-xs text-green-600 hover:text-green-700 flex items-center"
                >
                  Manage Brands
                  {showBrandManager ? (
                    <ChevronUp size={14} className="ml-1" />
                  ) : (
                    <ChevronDown size={14} className="ml-1" />
                  )}
                </button>
              </div>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>

              {/* Brand Manager */}
              {showBrandManager && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Brand Management
                  </h4>

                  {/* Add New Brand */}
                  <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Brand name"
                        value={newBrand.name}
                        onChange={(e) =>
                          setNewBrand((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="flex-1 p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={newBrand.description}
                        onChange={(e) =>
                          setNewBrand((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="flex-1 p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleCreateBrand}
                        disabled={loading || !newBrand.name.trim()}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Existing Brands */}
                  <div className="max-h-32 overflow-y-auto">
                    {brands.map((brand) => (
                      <div
                        key={brand._id}
                        className="flex items-center gap-2 mb-2 p-2 bg-white rounded border"
                      >
                        {editingBrand?._id === brand._id ? (
                          <>
                            <input
                              type="text"
                              value={editingBrand.name}
                              onChange={(e) =>
                                setEditingBrand((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="flex-1 p-1 text-sm border border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              value={editingBrand.description}
                              onChange={(e) =>
                                setEditingBrand((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              className="flex-1 p-1 text-sm border border-gray-300 rounded"
                            />
                            <button
                              type="button"
                              onClick={handleUpdateBrand}
                              disabled={loading}
                              className="p-1 text-green-600 hover:text-green-700"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingBrand(null)}
                              className="p-1 text-gray-600 hover:text-gray-700"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {brand.name}
                              </div>
                              {brand.description && (
                                <div className="text-xs text-gray-500">
                                  {brand.description}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingBrand(brand)}
                              className="p-1 text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setBrandToDelete(brand._id)}
                              className="p-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability *
              </label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="not available">Not Available</option>
                <option value="not specified">Not Specified</option>
              </select>
            </div>
          </div>

          {formData.availability === "available" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value > 0) {
                    setQuantityError("");
                  }
                }}
                min="1"
                className={`w-full p-2 rounded-lg focus:ring-2 focus:ring-green-500
        ${
          quantityError
            ? "border border-red-500 focus:ring-red-500"
            : "border border-gray-300"
        }`}
              />

              {quantityError && (
                <p className="mt-1 text-sm text-red-600">{quantityError}</p>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="hasDiscount"
                checked={formData.hasDiscount}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Has Discount
              </span>
            </label>
          </div>

          {formData.hasDiscount && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value{" "}
                  {formData.discountType === "percentage" ? "(%)" : "(Rs.)"}
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  required
                  min="0"
                  step={formData.discountType === "percentage" ? "1" : "0.01"}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Features
            </label>
            {JSON.parse(formData.features).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Feature name"
                  value={feature.key}
                  onChange={(e) =>
                    updateFeatureField(index, "key", e.target.value)
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Feature value"
                  value={feature.value}
                  onChange={(e) =>
                    updateFeatureField(index, "value", e.target.value)
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeFeatureField(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeatureField}
              className="mt-2 text-sm text-green-600 hover:text-green-700"
            >
              + Add Feature
            </button>
            <input type="hidden" name="features" value={formData.features} />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload Images</span>
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary px-4 py-2 rounded-lg">
              {item ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>

        {/* Delete Confirmation Modals */}
        {categoryToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Delete Category
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this category? This action
                cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setCategoryToDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCategory(categoryToDelete)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {brandToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Delete Brand
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this brand? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setBrandToDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteBrand(brandToDelete)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemModal;
