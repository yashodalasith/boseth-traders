// client/src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Star, Truck, Shield, ArrowRight } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useItem } from "../context/ItemContext";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const { getFeaturedProducts, getFavorites, getWishlist } = useItem();

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const products = await getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error loading featured products:", error);
      }
    };

    loadFeaturedProducts();
  }, [getFeaturedProducts]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-emerald-800 opacity-90"></div>
          {/* Optional Pattern Overlay */}
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 z-10 text-center text-white">
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Welcome to <span className="text-green-300">Boseth Traders</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your trusted partner for electronics, home appliances, and more with
            over 20 years of excellence
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to="/products"
              className="btn-primary inline-flex items-center px-8 py-3 text-lg rounded-full"
            >
              Explore Products <ArrowRight className="ml-2" size={20} />
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-8 z-10">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowRight size={32} className="text-white transform rotate-90" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            Why Choose Boseth Traders?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="text-center p-6 rounded-lg hover-lift"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Quality</h3>
              <p className="text-gray-600">
                20 years of excellence in providing quality products with
                warranty
              </p>
            </motion.div>

            <motion.div
              className="text-center p-6 rounded-lg hover-lift"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Island-wide delivery with secure packaging and quick turnaround
              </p>
            </motion.div>

            <motion.div
              className="text-center p-6 rounded-lg hover-lift"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Competitive pricing with regular discounts and special offers
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
            Featured Products
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Discover our most popular items loved by customers
          </p>

          {featuredProducts.length > 0 ? (
            <div className="products-grid">
              {featuredProducts.slice(0, 8).map((product, index) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading featured products...</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/products" className="btn-primary px-8 py-3 rounded-full">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div
              className="md:w-1/2 mb-8 md:mb-0"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="w-full h-96 bg-green-200 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold">Our Showroom</h3>
                    <p>Nugegoda, Sri Lanka</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="md:w-1/2 md:pl-12"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
                About Boseth Traders
              </h2>
              <p className="text-gray-600 mb-4">
                For nearly 20 years, Boseth Traders has been a trusted name in
                Sri Lanka for electronics, electricals, and household
                essentials. We take pride in offering quality products at
                reasonable prices with exceptional customer service.
              </p>
              <p className="text-gray-600 mb-6">
                Our showroom in Nugegoda is designed to provide a comfortable
                shopping experience where you can explore a wide range of
                products and get expert advice from our knowledgeable staff.
              </p>
              <Link to="/about" className="btn-primary px-6 py-2 rounded-lg">
                Learn More About Us
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
