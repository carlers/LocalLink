"use client";

import { useState } from "react";
import { getCities, getBarangaysForCity } from "@/lib/constants/locations";

type DiscoverSearchProps = {
  onFilter: (query: string, category: string, city: string, barangay: string) => void;
  isLoading?: boolean;
};

const CATEGORIES = ["All", "Retail", "Food", "Services", "Manufacturing", "Other"];

export function DiscoverSearch({ onFilter, isLoading = false }: DiscoverSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onFilter(value, selectedCategory === "All" ? "" : selectedCategory, selectedCity, selectedBarangay);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onFilter(searchQuery, value === "All" ? "" : value, selectedCity, selectedBarangay);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedBarangay("");
    onFilter(searchQuery, selectedCategory === "All" ? "" : selectedCategory, value, "");
  };

  const handleBarangayChange = (value: string) => {
    setSelectedBarangay(value);
    onFilter(searchQuery, selectedCategory === "All" ? "" : selectedCategory, selectedCity, value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedCity("");
    setSelectedBarangay("");
    onFilter("", "", "", "");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          <label className="block text-sm font-medium" htmlFor="city">
            City
          </label>
          <select
            id="city"
            className="rounded-chip border-border-subtle mt-2 w-full border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={isLoading}
          >
            <option value="">All cities</option>
            {getCities().map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="barangay">
            Barangay
          </label>
          <select
            id="barangay"
            className="rounded-chip border-border-subtle mt-2 w-full border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            value={selectedBarangay}
            onChange={(e) => handleBarangayChange(e.target.value)}
            disabled={isLoading || !selectedCity}
          >
            <option value="">All barangays</option>
            {selectedCity
              ? getBarangaysForCity(selectedCity).map((barangay) => (
                <option key={barangay} value={barangay}>
                  {barangay}
                </option>
              ))
              : null}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Category</label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`btn-secondary ${selectedCategory === category ? 'btn-primary' : ''}`}
              disabled={isLoading}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {(searchQuery || selectedCity || selectedBarangay || selectedCategory !== "All") && (
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
