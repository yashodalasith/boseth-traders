// client/src/pages/About.jsx
import React from "react";
import { motion } from "framer-motion";
import { Shield, Truck, Star, MapPin, Clock, Phone } from "lucide-react";

const teamMembers = [
  {
    name: "Shirley Jayasinghe",
    role: "Chairman",
    image: "/images/team/shirley.jpg",
  },
  {
    name: "Amitha Jayasinghe",
    role: "Director",
    image: "/images/team/amitha.jpg",
  },
  {
    name: "Vinura Jayasinghe",
    role: "Director",
    image: "/images/team/vinura.jpg",
  },
];

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
              electricals, and household essentials for many years. Located in
              the heart of Nugegoda, we have built a strong reputation as one of
              Sri Lanka's leading providers of quality products.
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

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Our Team
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <motion.div
                key={member.name}
                className="text-center bg-gray-50 rounded-xl p-6 shadow hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-lg font-semibold text-gray-800">
                  {member.name}
                </h3>
                <p className="text-green-600 font-medium">{member.role}</p>
              </motion.div>
            ))}
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
              Years of excellence in providing quality products with warranty
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
              Smooth delivery with secure packaging and quick turnaround
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
                    No.282 D 01, Kotte Road, Nugegoda, Sri Lanka
                  </p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                <Clock size={24} className="text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-800">Opening Hours</h3>
                  <p className="text-gray-600">
                    Monday - Saturday: 9:00 AM - 8:00 PM
                  </p>
                  <p className="text-gray-600">Sunday: 9:00 AM - 6:00 PM</p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone size={24} className="text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-800">Contact</h3>
                  <p className="text-gray-600">011 282 0387</p>
                  <p className="text-gray-600">bosethtraders25@gmail.com</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Our Location on Map
              </h3>

              <div className="h-64 rounded-lg overflow-hidden border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.1234567890!2d79.8998009!3d6.8795706!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25bca80351631%3A0x61ac8190bb4a0540!2sBoseth+Traders+Pvt+Ltd+-+Nugegoda!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
