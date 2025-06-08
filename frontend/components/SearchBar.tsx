'use client';

import { useState } from "react";
import Link from "next/link";

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
    <form
      onSubmit={handleSubmit}
      className="flex items-center w-full max-w-xl mx-auto mt-2 gap-2"
    >
      <Link href="/">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="h-20 w-auto object-contain"
        />
      </Link>
      <div className="flex flex-grow">
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
      </div>
    </form>
  );
}
