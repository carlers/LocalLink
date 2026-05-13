"use client";

import { useState } from "react";
import { getCities, getBarangaysForCity } from "@/lib/constants/locations";
import { useLocale } from "@/lib/hooks/useLocale";
import { translations } from "@/lib/i18n/translations";

type DiscoverSearchProps = {
  onFilter: (query: string, category: string, city: string, barangay: string) => void;
  isLoading?: boolean;
};

const CATEGORIES = ["All", "Retail", "Food", "Services", "Manufacturing", "Other"];

export function DiscoverSearch({ onFilter, isLoading = false }: DiscoverSearchProps) {
  const { locale } = useLocale();
  const copy = translations[locale].discoverSearch;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");

  const getFieldClassName = (isActive: boolean) =>
    `rounded-chip mt-2 w-full border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${isActive
      ? "border-brand bg-brand/5 shadow-sm"
      : "border-border-subtle bg-surface"
    }`;

  const getCategoryClassName = (isActive: boolean) =>
    `btn-secondary ${isActive
      ? "!border-brand !bg-brand !text-white !shadow-sm"
      : ""
    }`;

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
            {copy.searchBusinesses}
          </label>
          <input
            id="search"
            type="text"
            placeholder={copy.searchPlaceholder}
            className={getFieldClassName(Boolean(searchQuery))}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="city">
            {copy.city}
          </label>
          <select
            id="city"
            className={getFieldClassName(Boolean(selectedCity))}
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={isLoading}
          >
            <option value="">{copy.allCities}</option>
            {getCities().map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="barangay">
            {copy.barangay}
          </label>
          <select
            id="barangay"
            className={getFieldClassName(Boolean(selectedBarangay))}
            value={selectedBarangay}
            onChange={(e) => handleBarangayChange(e.target.value)}
            disabled={isLoading || !selectedCity}
          >
            <option value="">{copy.allBarangays}</option>
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
        <label className="block text-sm font-medium">{copy.category}</label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              aria-pressed={selectedCategory === category}
              className={getCategoryClassName(selectedCategory === category)}
              disabled={isLoading}
              type="button"
            >
              {copy.categoryLabels[category as keyof typeof copy.categoryLabels]}
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
          {copy.clearFilters}
        </button>
      )}
    </div>
  );
}
