"use client";

import { useState } from "react";

type Props = {
  onSearch: (query: string) => void;
};

export default function SearchBar({ onSearch }: Props) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md mx-auto mt-4">
      <input
        type="text"
        placeholder="Buscar producto..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 rounded-l border border-gray-300 focus:outline-none"
      />
      <button
        type="submit"
        className="bg-red-600 text-white px-4 py-2 rounded-r hover:bg-red-700"
      >
        Buscar
      </button>
    </form>
  );
}