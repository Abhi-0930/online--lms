import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, Check, Loader2, Plus, Building2 } from "lucide-react";
import {
  CompanyLogo,
  POPULAR_COMPANIES,
  MORE_COMPANIES,
  ALL_COMPANIES,
  CompanyItem,
  getCompanyDomain,
} from "./CompanyLogo";

interface CompanySearchSelectProps {
  value: string | string[];
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CompanySearchSelect({
  value,
  onChange,
  label = "Target Companies",
  placeholder = "Search or type company name (e.g. Google, Amazon, Microsoft...)",
  disabled = false,
}: CompanySearchSelectProps) {
  // Parse incoming value into string[]
  const selectedCompanies: string[] = useMemo(() => {
    if (Array.isArray(value)) {
      return value.map((c) => String(c).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((c) => String(c).trim()).filter(Boolean);
        }
      } catch {}
      return trimmed
        .replace(/[\[\]"']/g, "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }
    return [];
  }, [value]);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<CompanyItem[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live Clearbit API search debounced by 200ms
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setApiSuggestions([]);
      setIsSearchingApi(false);
      return;
    }

    setIsSearchingApi(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(
            trimmed
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const formatted: CompanyItem[] = data.map(
              (item: { name?: string; domain?: string }) => ({
                name: item.name || trimmed,
                domain:
                  item.domain ||
                  getCompanyDomain(item.name || trimmed),
              })
            );
            setApiSuggestions(formatted);
          }
        }
      } catch {
        // Fallback silently to local search
      } finally {
        setIsSearchingApi(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Merge local matches and live API suggestions
  const filteredSuggestions: CompanyItem[] = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Default suggestions: show popular companies not yet added
      return ALL_COMPANIES.slice(0, 16);
    }

    const localMatches = ALL_COMPANIES.filter(
      (c) =>
        c.name.toLowerCase().includes(trimmed) ||
        c.domain.toLowerCase().includes(trimmed)
    );

    // Merge API suggestions not in localMatches
    const merged = [...localMatches];
    apiSuggestions.forEach((apiComp) => {
      if (
        !merged.some(
          (m) => m.name.toLowerCase() === apiComp.name.toLowerCase()
        )
      ) {
        merged.push(apiComp);
      }
    });

    return merged;
  }, [query, apiSuggestions]);

  // Update selected companies helper
  const updateSelected = (newList: string[]) => {
    // Unique list
    const unique = Array.from(new Set(newList.map((c) => c.trim()))).filter(
      Boolean
    );
    onChange(unique.join(", "));
  };

  const handleAddCompany = (companyName: string) => {
    const clean = companyName.trim();
    if (!clean) return;
    if (
      !selectedCompanies.some(
        (c) => c.toLowerCase() === clean.toLowerCase()
      )
    ) {
      updateSelected([...selectedCompanies, clean]);
    }
    setQuery("");
    inputRef.current?.focus();
  };

  const handleRemoveCompany = (companyName: string) => {
    updateSelected(
      selectedCompanies.filter(
        (c) => c.toLowerCase() !== companyName.toLowerCase()
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        // If there's a first suggestion, add it, else add query
        if (filteredSuggestions.length > 0) {
          handleAddCompany(filteredSuggestions[0].name);
        } else {
          handleAddCompany(query.trim());
        }
      }
    } else if (e.key === "Backspace" && !query && selectedCompanies.length > 0) {
      // Remove last tag
      handleRemoveCompany(selectedCompanies[selectedCompanies.length - 1]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Popular quick-add suggestions (companies not yet added)
  const popularChips = useMemo(() => {
    return POPULAR_COMPANIES.filter(
      (c) =>
        !selectedCompanies.some(
          (sel) => sel.toLowerCase() === c.name.toLowerCase()
        )
    ).slice(0, 8);
  }, [selectedCompanies]);

  return (
    <div className="space-y-2.5" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>{label}</span>
            <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          {selectedCompanies.length > 0 && (
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {selectedCompanies.length} selected
            </span>
          )}
        </div>
      )}

      {/* Selected Company Tags */}
      {selectedCompanies.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10">
          {selectedCompanies.map((comp) => (
            <span
              key={comp}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#181d2a] border border-slate-200 dark:border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs group hover:border-slate-300 dark:hover:border-white/20 transition-all animate-fadeIn"
            >
              <CompanyLogo name={comp} size="xs" />
              <span>{comp}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveCompany(comp)}
                  className="ml-0.5 rounded-sm p-0.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title={`Remove ${comp}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Search Bar with Live Suggestions Dropdown */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedCompanies.length === 0
                ? placeholder
                : "Add another company..."
            }
            className="w-full rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition"
          />
          {isSearchingApi ? (
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

        {/* Dropdown Suggestions Menu */}
        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] shadow-xl z-50 p-1.5 divide-y divide-slate-100 dark:divide-white/5 animate-fadeIn">
            {/* Header label in dropdown */}
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {query.trim() ? "Matching Companies" : "Suggested Companies"}
            </div>

            <div className="py-1 space-y-0.5">
              {filteredSuggestions.map((comp) => {
                const isSelected = selectedCompanies.some(
                  (c) => c.toLowerCase() === comp.name.toLowerCase()
                );
                return (
                  <button
                    key={comp.name}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        handleRemoveCompany(comp.name);
                      } else {
                        handleAddCompany(comp.name);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/5 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <CompanyLogo name={comp.name} domain={comp.domain} size="sm" />
                      <span className="truncate">{comp.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal truncate hidden sm:inline">
                        {comp.domain}
                      </span>
                    </div>

                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 stroke-[2.5]" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                    )}
                  </button>
                );
              })}

              {/* Option to add custom query if not matched */}
              {query.trim() &&
                !filteredSuggestions.some(
                  (c) => c.name.toLowerCase() === query.trim().toLowerCase()
                ) && (
                  <button
                    type="button"
                    onClick={() => handleAddCompany(query.trim())}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 font-semibold transition cursor-pointer border-t border-slate-100 dark:border-white/5 mt-1"
                  >
                    <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      +
                    </div>
                    <span>
                      Add &ldquo;<span className="underline">{query.trim()}</span>&rdquo; as company
                    </span>
                  </button>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Quick-add Popular Pills */}
      {!disabled && popularChips.length > 0 && (
        <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
          <span className="text-[11px] font-medium text-slate-400 mr-1">
            Quick add:
          </span>
          {popularChips.map((comp) => (
            <button
              key={comp.name}
              type="button"
              onClick={() => handleAddCompany(comp.name)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <CompanyLogo name={comp.name} domain={comp.domain} size="xs" />
              <span>+{comp.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
