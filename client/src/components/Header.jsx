import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Search,
  LogOut,
  Heart,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useItem } from "../context/ItemContext";
import { isPaymentEnabled } from "../utils/featureFlags";

const navigationLinks = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "About", to: "/about" },
  { label: "Contact Us", to: "/contact" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { userFavorites } = useItem();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      return;
    }

    navigate(`/products?search=${encodeURIComponent(trimmedQuery)}`);
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.45 }}
      className="sticky top-0 z-50 border-b border-emerald-100 bg-white/90 backdrop-blur-md"
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-3 xl:gap-5">
          <div className="shrink-0">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Boseth Traders"
                className="h-10 w-10 rounded-xl object-contain"
              />
              <div>
                <p className="text-lg font-bold text-gray-900">
                  Boseth Traders
                </p>
                <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">
                  Premium Living
                </p>
              </div>
            </Link>{" "}
          </div>

          <div className="hidden lg:flex flex-1 justify-center min-w-0">
            <nav className="flex items-center gap-1 xl:gap-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden lg:flex items-center gap-2 xl:gap-4 min-w-0">
            <form
              onSubmit={handleSearch}
              className="relative w-[220px] xl:w-[280px] 2xl:w-[340px]"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-gray-200 bg-white px-11 py-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </form>

            {user && (
              <Link
                to="/profile"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                aria-label="Favorites"
              >
                <Heart className="h-5 w-5" />
                {userFavorites.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white">
                    {userFavorites.length}
                  </span>
                )}
              </Link>
            )}

            {isPaymentEnabled && (
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                {user.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="rounded-full border border-emerald-200 px-3 xl:px-4 py-2 whitespace-nowrap text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  aria-label="Profile"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-full border border-gray-200 px-3 xl:px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 px-4 xl:px-5 py-2.5 whitespace-nowrap text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-xl"
                >
                  Register
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 lg:hidden justify-self-end"
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-emerald-100 bg-white lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-2xl border border-gray-200 bg-white px-11 py-3 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </form>

              <div className="grid gap-2">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {user ? (
                  <>
                    {user.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="rounded-full border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-full border border-gray-200 px-3 xl:px-4 whitespace-nowrap py-2 text-sm font-medium text-gray-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="rounded-full bg-gradient-to-r from-emerald-600 to-green-500 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
