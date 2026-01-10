// client/src/pages/About.jsx
import React from "react";
import { motion } from "framer-motion";
import { Shield, Truck, Star, MapPin, Clock, Phone } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
            About Boseth Traders
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              Welcome to Boseth Traders, your trusted partner for electronics,
              electricals, and household essentials for nearly 20 years. Located
              in the heart of Nugegoda, we have built a strong reputation as one
              of Sri Lanka's leading providers of quality products.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 mb-6">
              At Boseth Traders, we are committed to delivering quality
              products, unbeatable value, and exceptional service to every home
              and business we serve. Our main objective is to serve every
              customer with respect and deliver services of the highest
              standard.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              Our Story
            </h2>
            <p className="text-gray-600 mb-6">
              Founded in 2003, Boseth Traders started as a small electronics
              shop in Nugegoda. Through dedication and commitment to customer
              satisfaction, we have grown into a trusted name across Sri Lanka.
              Today, we offer a wide range of products including electronics,
              home appliances, kitchenware, and gift items.
            </p>

            <p className="text-gray-600">
              We believe in powering your home with trust, quality, and value.
              Thank you for choosing Boseth Traders.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Trusted Quality</h3>
            <p className="text-gray-600">
              20 years of excellence in providing quality products with warranty
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
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
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
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

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Visit Our Showroom
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-4">
                <MapPin size={24} className="text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-800">Address</h3>
                  <p className="text-gray-600">
                    123 Main Street, Nugegoda, Sri Lanka
                  </p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                <Clock size={24} className="text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-800">Opening Hours</h3>
                  <p className="text-gray-600">
                    Monday - Saturday: 9:00 AM - 6:00 PM
                  </p>
                  <p className="text-gray-600">Sunday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone size={24} className="text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-800">Contact</h3>
                  <p className="text-gray-600">+94 11 234 5678</p>
                  <p className="text-gray-600">info@boseth.lk</p>
                </div>
              </div>
            </div>

            <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
              <div className="w-full h-full bg-green-200 flex items-center justify-center">
                <span className="text-gray-600">Map of our location</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
