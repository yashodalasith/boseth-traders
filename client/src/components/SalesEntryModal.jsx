// client/src/components/SalesEntryModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { X, Search, Plus, Trash2, Package, UserCircle2 } from "lucide-react";
import { useItem } from "../context/ItemContext";

const emptyLine = () => ({
  itemId: "",
  itemName: "",
  buyingPrice: "",
  sellingPrice: "",
  quantity: "1",
});

const emptyAdjustment = () => ({ label: "", value: "" });

const defaultCustomer = () => ({
  userId: "",
  name: "",
  contact: "",
  address: "",
});

const SalesEntryModal = ({ isOpen, onClose, onSave, initialSale }) => {
  const [lines, setLines] = useState([emptyLine()]);
  const [customer, setCustomer] = useState(defaultCustomer());
  const [additionalCharges, setAdditionalCharges] = useState([
    emptyAdjustment(),
  ]);
  const [additionalCosts, setAdditionalCosts] = useState([emptyAdjustment()]);
  const [itemSearchTerms, setItemSearchTerms] = useState([]);
  const [itemSearchResults, setItemSearchResults] = useState([]);
  const [showItemResults, setShowItemResults] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [showUserResults, setShowUserResults] = useState(false);
  const [userSearchExecuted, setUserSearchExecuted] = useState(false);
  const [dateTime, setDateTime] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [error, setError] = useState("");
  const { getItems, getUsers } = useItem();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // If an initial sale is provided, populate the modal for editing
    if (initialSale) {
      const populatedLines = (initialSale.items || []).map((li) => ({
        itemId: li.item?._id || li.item || "",
        itemName: li.itemName || li.item?.name || "",
        buyingPrice: li.buyingPrice ?? "",
        sellingPrice: li.sellingPrice ?? "",
        quantity: li.quantity ?? 1,
      }));

      setLines(populatedLines.length ? populatedLines : [emptyLine()]);

      setCustomer({
        userId:
          initialSale.customer?.user?._id || initialSale.customer?.user || "",
        name: initialSale.customer?.name || "",
        contact: initialSale.customer?.contact || "",
        address: initialSale.customer?.address || "",
      });

      setAdditionalCharges(
        (initialSale.additionalCharges || []).map((c) => ({
          label: c.label || "",
          value: c.value ?? "",
        })) || [emptyAdjustment()],
      );

      setAdditionalCosts(
        (initialSale.additionalCosts || []).map((c) => ({
          label: c.label || "",
          value: c.value ?? "",
        })) || [emptyAdjustment()],
      );

      setDateTime(
        initialSale.dateTime
          ? new Date(initialSale.dateTime).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
      );
      setItemSearchTerms([]);
      setItemSearchResults([]);
      setShowItemResults([]);
      setUserSearchQuery("");
      setUserSearchResults([]);
      setShowUserResults(false);
      setUserSearchExecuted(false);
      setError("");
      return;
    }

    setLines([emptyLine()]);
    setCustomer(defaultCustomer());
    setAdditionalCharges([emptyAdjustment()]);
    setAdditionalCosts([emptyAdjustment()]);
    setItemSearchTerms([]);
    setItemSearchResults([]);
    setShowItemResults([]);
    setUserSearchQuery("");
    setUserSearchResults([]);
    setShowUserResults(false);
    setUserSearchExecuted(false);
    setDateTime(new Date().toISOString().slice(0, 16));
    setError("");
  }, [isOpen, initialSale]);

  useEffect(() => {
    setItemSearchTerms((prev) =>
      Array.from({ length: lines.length }, (_, index) => prev[index] || ""),
    );
    setItemSearchResults((prev) =>
      Array.from({ length: lines.length }, (_, index) => prev[index] || []),
    );
    setShowItemResults((prev) =>
      Array.from({ length: lines.length }, (_, index) => prev[index] || false),
    );
  }, [lines.length]);

  const searchItems = async (index) => {
    const query = itemSearchTerms[index]?.trim();
    if (!query) {
      setItemSearchResults((prev) => {
        const next = [...prev];
        next[index] = [];
        return next;
      });
      setShowItemResults((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
      return;
    }

    try {
      const results = await getItems({ search: query, limit: 5 });
      setItemSearchResults((prev) => {
        const next = [...prev];
        next[index] = results.items || results;
        return next;
      });
      setShowItemResults((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
    } catch (err) {
      console.error("Error searching items:", err);
      setItemSearchResults((prev) => {
        const next = [...prev];
        next[index] = [];
        return next;
      });
      setShowItemResults((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
    }
  };

  const searchUsers = async () => {
    const query = userSearchQuery.trim();
    if (!query) {
      setUserSearchResults([]);
      setShowUserResults(false);
      setUserSearchExecuted(false);
      return;
    }

    setUserSearchExecuted(true);

    try {
      const results = await getUsers({ search: query, limit: 5 });
      // support multiple API response shapes: array, { items: [] }, { users: [] }
      let users = [];
      if (Array.isArray(results)) {
        users = results;
      } else if (results && Array.isArray(results.items)) {
        users = results.items;
      } else if (results && Array.isArray(results.users)) {
        users = results.users;
      } else if (results && Array.isArray(results.data)) {
        users = results.data;
      }
      // debug log the resolved users and raw response to trace issues
      console.debug("searchUsers: resolved users:", users, "raw:", results);
      setUserSearchResults(users);
      // always open the results container so we can inspect rendering in devtools
      setShowUserResults(true);
    } catch (err) {
      console.error("Error searching users:", err);
      setUserSearchResults([]);
      setShowUserResults(false);
    }
  };

  const totals = useMemo(() => {
    const saleLines = lines.map((line) => ({
      ...line,
      buyingPrice: Number(line.buyingPrice || 0),
      sellingPrice: Number(line.sellingPrice || 0),
      quantity: Number(line.quantity || 0),
    }));

    const totalSale = saleLines.reduce(
      (sum, line) => sum + line.sellingPrice * line.quantity,
      0,
    );
    const grossProfit = saleLines.reduce(
      (sum, line) =>
        sum + (line.sellingPrice - line.buyingPrice) * line.quantity,
      0,
    );
    const totalCharges = additionalCharges.reduce(
      (sum, charge) => sum + Number(charge.value || 0),
      0,
    );
    const totalCosts = additionalCosts.reduce(
      (sum, cost) => sum + Number(cost.value || 0),
      0,
    );

    return {
      totalSale,
      grossProfit,
      totalCharges,
      totalCosts,
      netProfit: grossProfit + totalCharges - totalCosts,
    };
  }, [lines, additionalCharges, additionalCosts]);

  const updateLine = (index, field, value) => {
    setLines((prev) =>
      prev.map((line, currentIndex) =>
        currentIndex === index ? { ...line, [field]: value } : line,
      ),
    );
  };

  const updateItemSearchTerm = (index, value) => {
    setItemSearchTerms((prev) => {
      const next = Array.from(
        { length: Math.max(prev.length, lines.length) },
        (_, idx) => prev[idx] || "",
      );
      next[index] = value;
      return next;
    });
  };

  const handleSelectItem = (item, index) => {
    updateLine(index, "itemId", item._id);
    updateLine(index, "itemName", item.name);
    updateLine(index, "buyingPrice", item.buyingPrice ?? "");
    updateLine(index, "sellingPrice", item.price ?? "");
    setItemSearchTerms((prev) => {
      const next = [...prev];
      next[index] = item.name;
      return next;
    });
    setItemSearchResults((prev) => {
      const next = [...prev];
      next[index] = [];
      return next;
    });
    setShowItemResults((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  const clearSelectedItem = (index) => {
    // clear all item-related fields for this line (match customer clear behavior)
    updateLine(index, "itemId", "");
    updateLine(index, "itemName", "");
    updateLine(index, "buyingPrice", "");
    updateLine(index, "sellingPrice", "");
    setItemSearchTerms((prev) => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
    setItemSearchResults((prev) => {
      const next = [...prev];
      next[index] = [];
      return next;
    });
    setShowItemResults((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);

  const removeLine = (index) => {
    if (lines.length === 1) {
      setLines([emptyLine()]);
      return;
    }

    setLines((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const updateAdjustment = (list, setter, index, field, value) => {
    setter((prev) =>
      prev.map((entry, currentIndex) =>
        currentIndex === index ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const addAdjustment = (setter) =>
    setter((prev) => [...prev, emptyAdjustment()]);
  const removeAdjustment = (setter, index, list) => {
    if (list.length === 1) {
      setter([emptyAdjustment()]);
      return;
    }

    setter((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleCustomerSelect = (user) => {
    setCustomer({
      userId: user._id,
      name: user.name || "",
      contact: user.contact || "",
      address: user.address
        ? [
            user.address.street,
            user.address.city,
            user.address.state,
            user.address.zipCode,
          ]
            .filter(Boolean)
            .join(", ")
        : "",
    });
    setUserSearchQuery(user.name || "");
    setUserSearchResults([]);
    setShowUserResults(false);
    setUserSearchExecuted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // clear previous server errors on lines
    setLines((prev) => prev.map((l) => ({ ...l, serverError: undefined })));

    const normalizedLines = lines
      .map((line) => ({
        ...line,
        buyingPrice: line.buyingPrice === "" ? "" : Number(line.buyingPrice),
        sellingPrice: line.sellingPrice === "" ? "" : Number(line.sellingPrice),
        quantity: line.quantity === "" ? 1 : Number(line.quantity),
      }))
      .filter((line) => line.itemName?.trim());

    if (!normalizedLines.length) {
      setError("Please add at least one item.");
      return;
    }

    const invalidLine = normalizedLines.find(
      (line) =>
        !Number.isFinite(Number(line.sellingPrice)) ||
        Number(line.sellingPrice) < 0 ||
        !Number.isFinite(Number(line.quantity)) ||
        Number(line.quantity) < 1,
    );
    if (invalidLine) {
      setError("Each item needs a valid selling price and quantity.");
      return;
    }

    const normalizedCustomer = {
      ...customer,
      name: customer.name.trim(),
      contact: customer.contact.trim(),
      address: customer.address.trim(),
    };

    if (
      !normalizedCustomer.name ||
      !normalizedCustomer.contact ||
      !normalizedCustomer.address
    ) {
      setError("Please provide customer name, contact, and address.");
      return;
    }

    try {
      await onSave({
        items: normalizedLines.map((line) => ({
          itemId: line.itemId || undefined,
          itemName: line.itemName.trim(),
          buyingPrice: line.buyingPrice === "" ? undefined : line.buyingPrice,
          sellingPrice: line.sellingPrice,
          quantity: line.quantity,
        })),
        customer: {
          userId: customer.userId?._id || customer.userId || undefined,
          name: normalizedCustomer.name,
          contact: normalizedCustomer.contact,
          address: normalizedCustomer.address,
        },
        additionalCharges: additionalCharges
          .filter((entry) => entry.label?.trim())
          .map((entry) => ({
            label: entry.label.trim(),
            value: Number(entry.value || 0),
          })),
        additionalCosts: additionalCosts
          .filter((entry) => entry.label?.trim())
          .map((entry) => ({
            label: entry.label.trim(),
            value: Number(entry.value || 0),
          })),
        dateTime,
      });
    } catch (err) {
      // Axios error with structured 422 response
      const resp = err?.response?.data;
      if (resp && resp.code === "INSUFFICIENT_STOCK") {
        setError(resp.message || "Insufficient stock");
        // mark related line with serverError if possible
        setLines((prev) =>
          prev.map((line) => {
            const matchesId =
              line.itemId && resp.itemId && line.itemId === resp.itemId;
            const matchesName =
              !line.itemId &&
              resp.itemName &&
              String(line.itemName || "")
                .trim()
                .toLowerCase() ===
                String(resp.itemName || "")
                  .trim()
                  .toLowerCase();
            if (matchesId || matchesName) {
              return {
                ...line,
                serverError: `Only ${resp.available} available, requested ${resp.requested}`,
              };
            }
            return line;
          }),
        );
        return;
      }

      // fallback generic error
      setError(
        err?.response?.data?.message || err.message || "Error saving sale",
      );
      return;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl sm:max-w-5xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialSale ? "Edit Sales Entry" : "Add Sales Entry"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Items</h3>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <Plus size={16} className="mr-2" /> Add item
              </button>
            </div>

            <div className="space-y-4">
              {lines.map((line, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <Package size={16} className="mr-2 text-green-600" /> Item{" "}
                      {index + 1}
                    </div>
                    {lines.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="relative">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Item
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={line.itemName}
                          onChange={(event) => {
                            const value = event.target.value;
                            updateLine(index, "itemName", value);
                            updateLine(index, "itemId", "");
                            updateItemSearchTerm(index, value);
                          }}
                          placeholder="Type item name or search"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => searchItems(index)}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            <Search size={14} className="mr-2" />
                            Search
                          </button>
                          {showItemResults[index] &&
                          itemSearchResults[index]?.length === 0 ? (
                            <span className="text-sm text-gray-500">
                              No matching items. You can keep this as a manual
                              name.
                            </span>
                          ) : null}
                        </div>
                        {line.itemId ? (
                          <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                            Selected item: {line.itemName}
                            <button
                              type="button"
                              onClick={() => clearSelectedItem(index)}
                              className="ml-3 rounded-lg border border-green-300 bg-white px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                            >
                              Change
                            </button>
                          </div>
                        ) : null}
                        {showItemResults[index] &&
                        itemSearchResults[index]?.length > 0 ? (
                          <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                            {itemSearchResults[index].map((item) => (
                              <button
                                key={item._id}
                                type="button"
                                className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50"
                                onClick={() => handleSelectItem(item, index)}
                              >
                                <span>{item.name}</span>
                                <span className="text-xs text-gray-500">
                                  {item.modelNumber}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(event) =>
                          updateLine(index, "quantity", event.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Buying Price (per item)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.buyingPrice}
                        onChange={(event) =>
                          updateLine(index, "buyingPrice", event.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Selling Price (per item)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.sellingPrice}
                        onChange={(event) =>
                          updateLine(index, "sellingPrice", event.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>
                  </div>
                  {line.serverError ? (
                    <div className="mt-2 text-sm text-red-600">
                      {line.serverError}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Customer</h3>
              <div className="flex items-center text-sm text-gray-500">
                <UserCircle2 size={16} className="mr-2" /> One customer per sale
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Search user
              </label>
              <div className="relative flex gap-2">
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(event) => {
                    setUserSearchQuery(event.target.value);
                    setCustomer((prev) => ({
                      ...prev,
                      userId: "",
                    }));
                    setUserSearchResults([]);
                    setShowUserResults(false);
                    setUserSearchExecuted(false);
                  }}
                  placeholder="Search by name, email, or contact"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
                <button
                  type="button"
                  onClick={searchUsers}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Search size={14} className="mr-2" />
                  Search
                </button>

                {showUserResults && userSearchResults.length > 0 ? (
                  <div className="absolute left-0 z-20 mt-2 w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="max-h-60 overflow-y-auto">
                      {userSearchResults.map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => handleCustomerSelect(user)}
                          className="w-full border-b border-gray-100 px-3 py-3 text-left hover:bg-gray-50 last:border-b-0"
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="mt-1 text-xs text-gray-500 truncate">
                            {user.email}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              {userSearchExecuted &&
              userSearchQuery.trim() &&
              userSearchResults.length === 0 ? (
                <div className="mt-2 text-sm text-gray-500">
                  No users found. You can enter customer details manually below.
                </div>
              ) : null}
              {customer.userId ? (
                <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  Selected customer: {customer.name} ({customer.contact})
                  <button
                    type="button"
                    onClick={() => {
                      // clear all customer fields
                      setCustomer(defaultCustomer());
                      setUserSearchQuery("");
                      setUserSearchResults([]);
                      setShowUserResults(false);
                      setUserSearchExecuted(false);
                    }}
                    className="ml-3 rounded-lg border border-green-300 bg-white px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                  >
                    Change
                  </button>
                </div>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(event) =>
                    setCustomer((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={customer.contact}
                  onChange={(event) =>
                    setCustomer((prev) => ({
                      ...prev,
                      contact: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                rows={3}
                value={customer.address}
                onChange={(event) =>
                  setCustomer((prev) => ({
                    ...prev,
                    address: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Additional Charges
                </h3>
                <button
                  type="button"
                  onClick={() => addAdjustment(setAdditionalCharges)}
                  className="flex items-center rounded-lg border border-green-600 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                >
                  <Plus size={16} className="mr-2" /> Add charge
                </button>
              </div>
              <div className="space-y-3">
                {additionalCharges.map((entry, index) => (
                  <div
                    key={index}
                    className="grid gap-3 md:grid-cols-[1fr,140px,auto]"
                  >
                    <input
                      type="text"
                      value={entry.label}
                      onChange={(event) =>
                        updateAdjustment(
                          additionalCharges,
                          setAdditionalCharges,
                          index,
                          "label",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. Delivery"
                      className="rounded-lg border border-gray-300 px-3 py-2"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={entry.value}
                      onChange={(event) =>
                        updateAdjustment(
                          additionalCharges,
                          setAdditionalCharges,
                          index,
                          "value",
                          event.target.value,
                        )
                      }
                      placeholder="0"
                      className="rounded-lg border border-gray-300 px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        removeAdjustment(
                          setAdditionalCharges,
                          index,
                          additionalCharges,
                        )
                      }
                      className="rounded-lg border border-gray-200 px-3 py-2 text-red-600 hover:bg-gray-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Additional Costs
                </h3>
                <button
                  type="button"
                  onClick={() => addAdjustment(setAdditionalCosts)}
                  className="flex items-center rounded-lg border border-green-600 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                >
                  <Plus size={16} className="mr-2" /> Add cost
                </button>
              </div>
              <div className="space-y-3">
                {additionalCosts.map((entry, index) => (
                  <div
                    key={index}
                    className="grid gap-3 md:grid-cols-[1fr,140px,auto]"
                  >
                    <input
                      type="text"
                      value={entry.label}
                      onChange={(event) =>
                        updateAdjustment(
                          additionalCosts,
                          setAdditionalCosts,
                          index,
                          "label",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. Packaging"
                      className="rounded-lg border border-gray-300 px-3 py-2"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={entry.value}
                      onChange={(event) =>
                        updateAdjustment(
                          additionalCosts,
                          setAdditionalCosts,
                          index,
                          "value",
                          event.target.value,
                        )
                      }
                      placeholder="0"
                      className="rounded-lg border border-gray-300 px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        removeAdjustment(
                          setAdditionalCosts,
                          index,
                          additionalCosts,
                        )
                      }
                      className="rounded-lg border border-gray-200 px-3 py-2 text-red-600 hover:bg-gray-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(event) => setDateTime(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Total Sale
                </label>
                <div className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800">
                  Rs. {totals.totalSale.toLocaleString()}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Net Profit / Loss
                </label>
                <div
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold ${totals.netProfit >= 0 ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}
                >
                  Rs. {totals.netProfit.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
            >
              {initialSale ? "Update Entry" : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesEntryModal;
