// client/src/pages/Home.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ShoppingBag,
  Star,
  Truck,
  Shield,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Zap,
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  Globe,
  Headphones,
  RefreshCw,
  Menu,
  X,
  Search,
  Heart,
  ShoppingCart,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useItem } from "../context/ItemContext";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const productsRef = useRef(null);
  const aboutRef = useRef(null);

  const { getItems, getFavorites, getWishlist, getCategories, categories } =
    useItem();
  const { user } = useAuth();

  const showroomImages = [
    "/images/showroom-1.jpg",
    "/images/showroom-2.jpg",
    "/images/showroom-3.jpg",
    "/images/showroom-4.jpg",
    "/images/showroom-5.jpg",
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    years: 0,
    satisfaction: 0,
  });

  // Mouse move effect for interactive background
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto slider for showroom
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % showroomImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [showroomImages.length]);

  // Testimonial auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Animated stats counter
  useEffect(() => {
    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      const increments = {
        customers: 12500 / steps,
        products: 8500 / steps,
        years: 20 / steps,
        satisfaction: 98 / steps,
      };

      let step = 0;
      const interval = setInterval(() => {
        step++;
        setStats({
          customers: Math.min(Math.floor(step * increments.customers), 12500),
          products: Math.min(Math.floor(step * increments.products), 8500),
          years: Math.min(Math.floor(step * increments.years), 20),
          satisfaction: Math.min(
            Math.floor(step * increments.satisfaction),
            98,
          ),
        });

        if (step >= steps) clearInterval(interval);
      }, duration / steps);
    };

    const timer = setTimeout(animateStats, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      setIsLoading(true);
      try {
        const filters = {
          limit: 8,
          sort: "-createdAt",
        };

        if (activeCategory !== "all") {
          filters.category = activeCategory;
        }

        const response = await getItems(filters);
        const products = response.items || response;
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error loading featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedProducts();
  }, [activeCategory, getItems]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        await getCategories();
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setIsCategoryLoading(false);
      }
    };

    loadCategories();
  }, [getCategories]);

  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      if (!user) {
        setNewsletterSubscribed(false);
        return;
      }

      try {
        const response = await api.get("/subscribers/me");
        setNewsletterSubscribed(Boolean(response.data.subscribed));
      } catch (error) {
        console.error("Error loading subscription status:", error);
      }
    };

    loadSubscriptionStatus();
  }, [user]);

  const getCategoryIcon = (categoryName = "") => {
    const normalizedName = categoryName.toLowerCase();

    if (normalizedName.includes("electronic")) return <Zap size={18} />;
    if (normalizedName.includes("appliance")) return <Sparkles size={18} />;
    if (normalizedName.includes("kitchen")) return <Award size={18} />;
    if (normalizedName.includes("furniture")) return <TrendingUp size={18} />;

    return <ShoppingBag size={18} />;
  };

  const visibleCategories = categories.slice(0, 4);

  const handleNewsletterAction = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    try {
      setNewsletterLoading(true);
      setNewsletterMessage("");

      const response =
        await api[newsletterSubscribed ? "delete" : "post"]("/subscribers/me");

      setNewsletterSubscribed(!newsletterSubscribed);
      setNewsletterMessage(response.data.message);
    } catch (error) {
      setNewsletterMessage(
        error.response?.data?.message || "Subscription failed",
      );
    } finally {
      setNewsletterLoading(false);
    }
  };

  const testimonials = [
    {
      id: 1,
      name: "Amitha Perera",
      role: "Interior Designer",
      content:
        "Boseth Traders transformed my entire home with their premium appliances. The quality is unmatched!",
      rating: 5,
      image: "/images/team/amitha.jpg",
    },
    {
      id: 2,
      name: "Shirley Fernando",
      role: "Restaurant Owner",
      content:
        "Our commercial kitchen equipment from Boseth has been running flawlessly for 3 years now.",
      rating: 5,
      image: "/images/team/shirley.jpg",
    },
    {
      id: 3,
      name: "Vinura Jayasinghe",
      role: "Hotel Manager",
      content:
        "Exceptional service and premium products. They've been our trusted supplier for over 5 years.",
      rating: 5,
      image: "/images/team/vinura.jpg",
    },
  ];

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Certified Quality",
      description:
        "All products come with manufacturer warranty and quality certification",
      gradient: "from-emerald-500 to-green-400",
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Home Delivery",
      description: "Island-wide delivery with secure packaging",
      gradient: "from-green-500 to-emerald-400",
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: "Easy Returns",
      description: "30-day return policy with no questions asked",
      gradient: "from-teal-500 to-emerald-400",
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Customer Support",
      description: "Round-the-clock customer service for all your needs",
      gradient: "from-emerald-600 to-green-500",
    },
  ];

  // Parallax effect for hero
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Floating animation for elements
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  // Staggered children animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-white to-emerald-50">
      {/* Animated Background Elements */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-emerald-300"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              x: mousePosition.x * 0.1,
              y: mousePosition.y * 0.1,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-700" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(72, 187, 120, 0.2) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.2) 0%, transparent 50%),
                              radial-gradient(circle at 40% 80%, rgba(5, 150, 105, 0.2) 0%, transparent 50%)`,
            }}
          />
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={floatingAnimation}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 1 },
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-300/10 rounded-full blur-3xl"
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            {/* Animated Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-8"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="text-emerald-200 text-sm font-medium">
                #1 Trusted Electronics Dealer in Sri Lanka
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                <span className="text-white">Elevate Your</span>
                <span className="block bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 bg-clip-text text-transparent">
                  Living Experience
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Discover premium electronics & home appliances with
              <span className="text-emerald-300 font-semibold">
                {" "}
                20+ years{" "}
              </span>
              of trusted excellence
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Link
                to="/products"
                className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-400 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-emerald-500/30 transition hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  Start Shopping
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </span>
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 hover:scale-105"
              >
                Contact Us
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {[
                {
                  value: stats.customers,
                  label: "Happy Customers",
                  suffix: "+",
                  icon: <Users />,
                },
                {
                  value: stats.products,
                  label: "Products",
                  suffix: "+",
                  icon: <ShoppingBag />,
                },
                {
                  value: stats.years,
                  label: "Years Experience",
                  suffix: "+",
                  icon: <Award />,
                },
                {
                  value: stats.satisfaction,
                  label: "Satisfaction",
                  suffix: "%",
                  icon: <TrendingUp />,
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-500/20 rounded-xl mb-4 mx-auto">
                    <div className="text-emerald-300">{stat.icon}</div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.value.toLocaleString()}
                    {stat.suffix}
                  </div>
                  <div className="text-emerald-200 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-emerald-300/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-emerald-300 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50 to-white" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%2304d47c%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Experience the
              <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                {" "}
                Boseth Difference
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We're not just a store, we're your partner in creating smarter,
              more efficient living spaces
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className="relative bg-white rounded-2xl p-8 shadow-lg shadow-emerald-100 border border-emerald-50 hover:shadow-2xl hover:shadow-emerald-200 transition-all duration-300">
                  {/* Icon with gradient */}
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>

                  {/* Hover effect line */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-emerald-500 to-green-400 group-hover:w-3/4 transition-all duration-300 rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section
        ref={productsRef}
        className="py-24 bg-gradient-to-br from-emerald-50 via-white to-green-50"
      >
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
              Hot Picks
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Featured
              <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                {" "}
                Products
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Curated selection of our best-selling and highest-rated products
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {isCategoryLoading ? (
              <div className="flex flex-wrap justify-center gap-3">
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className="h-12 w-32 animate-pulse rounded-full bg-emerald-100/80"
                  />
                ))}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all ${
                    activeCategory === "all"
                      ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-white text-gray-700 hover:bg-emerald-50 border border-emerald-100"
                  }`}
                >
                  <ShoppingBag size={18} />
                  <span className="font-medium">All Products</span>
                </button>

                {visibleCategories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => setActiveCategory(category._id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all ${
                      activeCategory === category._id
                        ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-white text-gray-700 hover:bg-emerald-50 border border-emerald-100"
                    }`}
                  >
                    {getCategoryIcon(category.name)}
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </>
            )}
          </motion.div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="w-full h-48 bg-emerald-100 rounded-xl mb-4" />
                  <div className="h-4 bg-emerald-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-emerald-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {featuredProducts.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="relative group"
                >
                  <ProductCard product={product} />
                  {/* Quick action buttons on hover */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-50 transition-colors">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              to="/products"
              className="inline-flex items-center space-x-3 bg-white text-emerald-700 px-8 py-4 rounded-full font-semibold text-lg border-2 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <span>Browse All Products</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section
        ref={aboutRef}
        className="py-24 bg-gradient-to-b from-emerald-50 to-white"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Column - Image Slider */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <div className="relative">
                {/* Main Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentSlide}
                      src={showroomImages[currentSlide]}
                      alt="Showroom"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-[500px] object-cover"
                    />
                  </AnimatePresence>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Content Overlay */}
                  <div className="absolute bottom-8 left-8 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-emerald-300 font-medium">
                        Live Now
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold">
                      Our Flagship Showroom
                    </h3>
                    <p className="text-emerald-100">Nugegoda, Colombo</p>
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex justify-center mt-6 space-x-4">
                  {showroomImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`relative rounded-xl overflow-hidden w-20 h-20 transition-all ${
                        currentSlide === index
                          ? "ring-4 ring-emerald-500 ring-offset-2 scale-110"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Showroom ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                Our Story
              </span>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Two Decades of
                <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                  {" "}
                  Excellence
                </span>
              </h2>

              <p className="text-gray-600 text-lg mb-6">
                Since 2004, Boseth Traders has been at the forefront of
                revolutionizing home and commercial appliance retail in Sri
                Lanka. What started as a small family business has grown into a
                trusted household name.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "20+ years of industry experience",
                  "ISO 9001:2015 Certified",
                  "Authorized dealer for 50+ global brands",
                  "Island-wide service network",
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/about"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-green-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-shadow"
                >
                  <span>Our Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex items-center space-x-2 rounded-full border-2 border-emerald-500 px-8 py-3 font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Contact Us</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 to-green-500">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Stay Updated with
              <span className="text-emerald-100"> Latest Offers</span>
            </h2>

            {user ? (
              <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-left text-white">
                    <p className="text-sm text-emerald-100">Subscribed email</p>
                    <p className="break-all font-semibold">{user.email}</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={handleNewsletterAction}
                      disabled={newsletterLoading}
                      className="w-full rounded-full bg-white px-8 py-3 font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-60 sm:w-auto"
                    >
                      {newsletterLoading
                        ? "Please wait..."
                        : newsletterSubscribed
                          ? "Unsubscribe"
                          : "Subscribe"}
                    </button>
                  </div>
                </div>

                {newsletterMessage && (
                  <p className="mt-4 text-sm text-emerald-100">
                    {newsletterMessage}
                  </p>
                )}
              </div>
            ) : (
              <div className="max-w-md mx-auto text-center">
                <button
                  type="button"
                  onClick={() => (window.location.href = "/login")}
                  className="rounded-full bg-white px-8 py-3 font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                >
                  Subscribe
                </button>
                <p className="mt-4 text-sm text-emerald-100">
                  Sign in to subscribe with your account email and receive
                  discount alerts.
                </p>
              </div>
            )}

            <p className="text-emerald-200 text-sm mt-4">
              By subscribing, you agree to our Privacy Policy
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-400 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold">Boseth Traders</span>
              </div>
              <p className="text-gray-400 mb-6">
                Your trusted partner for premium electronics and home appliances
                since 2004.
              </p>
              <div className="flex space-x-4">
                <motion.a
                  href="https://www.facebook.com/profile.php?id=61578911536697"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </motion.a>

                {import.meta.env.VITE_SHOW_INSTAGRAM === "true" && (
                  <motion.a
                    href="https://www.instagram.com/boseth_traders?igsh=MWNxbDduc2xnM3oxcQ=="
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </motion.a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {[
                  { label: "Home", to: "/" },
                  { label: "Products", to: "/products" },
                  { label: "About", to: "/about" },
                  { label: "Contact", to: "/contact" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-gray-400 transition-colors hover:text-emerald-400"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-bold mb-6">Contact Us</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-900/50 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span>123 Main Street, Nugegoda</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-900/50 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span>011 282 0387</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-900/50 rounded-lg flex items-center justify-center">
                    <Headphones className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span>bosethtraders25@gmail.com</span>
                </li>
              </ul>
            </div>

            {/* Business Hours */}
            <div>
              <h3 className="text-lg font-bold mb-6">Business Hours</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex justify-between">
                  <span>Mon - Sat</span>
                  <span>9:00 AM - 8:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday</span>
                  <span>10:00 AM - 6:00 PM</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>
              &copy; {new Date().getFullYear()} Boseth Traders. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: scrollY > 500 ? 1 : 0,
          scale: scrollY > 500 ? 1 : 0,
        }}
        whileHover={{ scale: 1.1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg"
      >
        <ArrowRight className="h-5 w-5 -rotate-90 transform" />
      </motion.button>

      {/* Floating Chat Button */}
      <Link
        to="/contact"
        className="fixed bottom-8 left-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-xl"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 animate-ping" />
      </Link>
    </div>
  );
};

export default Home;
