'use client';

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

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
      className="flex items-center w-full max-w-xl mx-auto gap-2"
    >
      <Link href="/">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="h-24 w-auto object-contain"
        />
      </Link>

      <div className="relative flex flex-grow">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 pl-4 pr-10 rounded border border-gray-300 focus:outline-none"
        />
        <button type="submit">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={20}
          />
        </button>
      </div>
    </form>
  );
}
