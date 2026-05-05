"use client";

import { useState } from "react";

type DiscoverSearchProps = {
  onFilter: (query: string, category: string, location: string) => void;
  isLoading?: boolean;
};

const CATEGORIES = ["All", "Retail", "Food", "Services", "Manufacturing", "Other"];

export function DiscoverSearch({ onFilter, isLoading = false }: DiscoverSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onFilter(value, selectedCategory === "All" ? "" : selectedCategory, selectedLocation);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onFilter(searchQuery, value === "All" ? "" : value, selectedLocation);
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    onFilter(searchQuery, selectedCategory === "All" ? "" : selectedCategory, value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedLocation("");
    onFilter("", "", "");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium" htmlFor="search">
            Search businesses
          </label>
          <input
            id="search"
            type="text"
            placeholder="Business name or description"
            className="rounded-chip border-border-subtle mt-2 w-full border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            type="text"
            placeholder="City or barangay"
            className="rounded-chip border-border-subtle mt-2 w-full border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Category</label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`rounded-chip border px-3 py-3 text-sm transition-colors sm:py-2 ${selectedCategory === category
                ? "border-brand bg-brand text-white"
                : "border-border-subtle bg-surface-muted text-foreground hover:bg-surface"
                }`}
              disabled={isLoading}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {(searchQuery || selectedLocation || selectedCategory !== "All") && (
        <button
          onClick={clearFilters}
          disabled={isLoading}
          className="text-sm font-medium text-brand underline-offset-4 hover:underline"
          type="button"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
