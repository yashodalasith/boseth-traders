import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Mail, Phone, Send, ShieldCheck } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Contact = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.subject.trim() || !formData.message.trim()) {
      setError("Please add a subject and message.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/contact-messages", {
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setSuccess("Your message has been sent. We will get back to you soon.");
      setFormData({ subject: "", message: "" });
    } catch (submissionError) {
      setError(
        submissionError.response?.data?.message || "Failed to send message",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr] min-w-0">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-100/60 sm:p-8"
        >
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </span>
            <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Send us a message
            </h1>
            <p className="mt-3 max-w-2xl text-gray-600">
              This form is available only to signed-in users so we can keep your
              conversation attached to your account.
            </p>
          </div>

          {success && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={8}
                placeholder="Tell us what you need, and we’ll follow up with the right team."
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="rounded-3xl bg-gradient-to-br from-emerald-700 to-green-600 p-6 text-white shadow-xl shadow-emerald-200/60">
            <ShieldCheck className="h-10 w-10 text-emerald-100" />
            <h2 className="mt-4 text-2xl font-bold">Your account is linked</h2>
            <p className="mt-2 text-sm text-emerald-50/90">
              Messages are stored against your signed-in profile so the admin
              team can reply with the right context.
            </p>
            <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-emerald-50/90">{user?.email}</p>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-100/60">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">011 282 0387</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">
                  bosethtraders25@gmail.com
                </p>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
};

export default Contact;
