import { ArrowLeft, MenuIcon, SearchIcon } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link, useLocation } from "wouter";
import { Button } from "./Button";
import { useAppStore } from "~/store";
import { useShallow } from "zustand/shallow";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, Extractor, SubCategory } from "~/types";
import { ReactNode, useEffect, useMemo, useState } from "react";

export const SharedNavbarSubMenu = () => {
  const [showMobileMenu, dispatch] = useAppStore(
    useShallow((state) => [state.showMobileMenu, state.dispatch]),
  );
  return (
    <div className="flex items-center z-5">
      <Button
        icon={<MenuIcon />}
        onClick={() =>
          dispatch({
            type: "showMobileMenu",
            show: !showMobileMenu,
          })
        }
      />
      <Link href="/" className="font-bold text-lg text-white px-4">
        Alegoria
      </Link>
    </div>
  );
};

interface SearchSelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children?: ReactNode;
  className?: string;
}

const SearchSelect = ({
  value,
  onChange,
  children,
  className,
}: SearchSelectProps) => (
  <select
    className={`appearance-none bg-neutral-200 rounded-md px-2 flex items-center text-center text-neutral-700 text-xs h-6 font-medium cursor-pointer outline-none ${className ?? ""}`}
    value={value}
    onChange={onChange}
  >
    {children}
  </select>
);

export interface Inputs {
  searchValue: string;
}

const SearchForm = () => {
  const { register, handleSubmit } = useForm<Inputs>();
  const [location, navigate] = useLocation();
  const [isCategorySelected, setCategorySelected] = useState<boolean>();
  const [selectedFilter, setSelectedFilter] = useState("");
  const queryClient = useQueryClient();

  const [
    categories,
    activeCategory,
    activeSubCategory,
    categoriesError,
    dispatch,
  ] = useAppStore(
    useShallow((state) => [
      state.enabledCategories,
      state.activeCategory,
      state.activeSubCategory,
      state.categoriesError,
      state.dispatch,
    ]),
  );

  const currentPageUrl = useMemo(() => {
    const match = location.match(/^\/post\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : "";
  }, [location]);

  const contextualSubcategories = useMemo(() => {
    if (!activeCategory) return [];
    return activeCategory.subcategories.filter((sub) => {
      if (sub.name.startsWith("subreddit-"))
        return /\/r\/[^/?#]+/.test(currentPageUrl);
      if (sub.name.startsWith("user-"))
        return /\/user\/[^/?#]+/.test(currentPageUrl);
      return true;
    });
  }, [activeCategory, currentPageUrl]);

  useEffect(() => {
    if (
      activeSubCategory &&
      !contextualSubcategories.find((s) => s.name === activeSubCategory.name)
    ) {
      dispatch({
        type: "setActiveSubCategory",
        subcategory: contextualSubcategories[0],
      });
    }
  }, [contextualSubcategories]);

  useEffect(() => {
    setSelectedFilter("");
  }, [activeSubCategory?.name]);

  const handleNonSearchableSubcategory = async (
    categoryName: string,
    subcategory?: SubCategory,
  ) => {
    if (subcategory?.searchable === false) {
      const ext = await queryClient.fetchQuery<Extractor>({
        queryKey: [
          `/extractors?category=${categoryName}&subcategory=${subcategory.name}`,
        ],
        staleTime: Infinity,
        gcTime: Infinity,
      });
      navigate(`/post/${encodeURIComponent(ext.url)}`);
    }
  };

  const { data: extractor } = useQuery<Extractor>({
    enabled:
      !!activeCategory &&
      activeCategory.subcategories.length > 0 &&
      !!activeSubCategory &&
      !!isCategorySelected,
    queryKey: [
      `/extractors?category=${activeCategory?.name}&subcategory=${activeSubCategory?.name}`,
    ],
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const isFilterOnly =
    !!extractor?.filters && !extractor.groups.some((g) => g === "QUERY");
  const isSearchable =
    activeSubCategory?.searchable !== false || !!extractor?.filters;

  const buildUrl = (filterValue: string, searchValue: string = "") => {
    if (!extractor) return encodeURIComponent(searchValue);
    let url = extractor.url;
    const urlPathParts = url.split("?")[0].split("/").filter(Boolean);
    const hasQueryGroup = extractor.groups.some((g) => g === "QUERY");
    for (const [i, group] of extractor.groups.entries()) {
      if (!group) continue;
      const raw = group.split("/").filter(Boolean).pop() ?? group;
      let value: string;
      if (extractor.filters && raw === "FILTER") {
        value = filterValue;
      } else if (
        hasQueryGroup ? raw === "QUERY" : !extractor.filters && i === 0
      ) {
        value = encodeURIComponent(searchValue);
      } else {
        const pi = urlPathParts.indexOf(raw);
        const pattern =
          pi > 0 ? new RegExp(`/${urlPathParts[pi - 1]}/([^/?#&]+)/`) : null;
        value = pattern ? (currentPageUrl.match(pattern)?.[1] ?? "") : "";
      }
      url = url.replace(
        new RegExp(`(^|[^a-zA-Z0-9])${raw}([^a-zA-Z0-9]|$)`, "g"),
        `$1${value}$2`,
      );
    }
    return url;
  };

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    const url = extractor
      ? buildUrl(
          selectedFilter || extractor.filters?.[0] || "",
          formData.searchValue,
        )
      : formData.searchValue;
    navigate(`/post/${encodeURIComponent(url)}`);
  };

  return (
    <div className="flex gap-x-4 w-full md:w-[420px] flex-wrap sm:flex-nowrap gap-y-4 top-0">
      <form
        className="flex-1 border border-neutral-800 rounded-full px-4 py-2 w-full bg-neutral-900 flex items-center gap-x-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <button
          type="submit"
          className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          disabled={!isSearchable}
        >
          <SearchIcon size={18} />
        </button>
        {!categoriesError && (
          <div className="flex gap-x-1 items-center shrink-0">
            <SearchSelect
              value={activeCategory?.name}
              onChange={async (e) => {
                setCategorySelected(true);
                const category = categories.find(
                  (category) => category.name === e.target.value,
                ) as Category;
                dispatch({ type: "setActiveCategory", category });
                const subcategory =
                  category.subcategories && category.subcategories.length > 0
                    ? category.subcategories[0]
                    : undefined;
                dispatch({ type: "setActiveSubCategory", subcategory });
                await handleNonSearchableSubcategory(
                  category.name,
                  subcategory,
                );
              }}
            >
              {categories.map((category, i) => (
                <option key={i} value={category.name}>
                  {category.name}
                </option>
              ))}
            </SearchSelect>
            {contextualSubcategories.length > 0 && (
              <SearchSelect
                value={activeSubCategory?.name}
                onChange={async (e) => {
                  setCategorySelected(true);
                  const subcategory = contextualSubcategories.find(
                    (subcategory) => subcategory.name === e.target.value,
                  ) as SubCategory;
                  dispatch({ type: "setActiveSubCategory", subcategory });
                  await handleNonSearchableSubcategory(
                    activeCategory?.name ?? "",
                    subcategory,
                  );
                }}
              >
                {contextualSubcategories.map((subcategory, i) => (
                  <option key={i} value={subcategory.name}>
                    {subcategory.name}
                  </option>
                ))}
              </SearchSelect>
            )}
            {extractor?.filters && (
              <SearchSelect
                value={selectedFilter || extractor.filters[0]}
                onChange={(e) => {
                  setSelectedFilter(e.target.value);
                  if (isFilterOnly) {
                    navigate(
                      `/post/${encodeURIComponent(buildUrl(e.target.value))}`,
                    );
                  }
                }}
              >
                {extractor.filters.map((f, i) => (
                  <option key={i} value={f}>
                    {f}
                  </option>
                ))}
              </SearchSelect>
            )}
          </div>
        )}
        <input
          className="outline-none flex-1 min-w-0"
          placeholder="Search"
          disabled={isFilterOnly || !isSearchable}
          onFocus={() => setCategorySelected(true)}
          onInput={() => setCategorySelected(true)}
          {...register("searchValue", { required: !isFilterOnly })}
        />
      </form>
    </div>
  );
};

export const Navbar = () => {
  const [showSearchForm, dispatch] = useAppStore(
    useShallow((state) => [state.showSearchForm, state.dispatch]),
  );

  return (
    <div className="flex items-center min-h-[60px] bg-black w-full sticky top-0 right-0 justify-between text-white p-2 z-10 border-neutral-800 border-b">
      {showSearchForm ? (
        <Button
          extraClassName="z-10 mr-2"
          icon={<ArrowLeft />}
          onClick={() => dispatch({ type: "showSearchForm", show: false })}
        />
      ) : (
        <SharedNavbarSubMenu />
      )}
      <div
        className={`hidden md:flex ${showSearchForm ? "!flex !md:hidden" : ""} items-center justify-center flex-1 min-w-0 md:w-full md:absolute z-0`}
      >
        <SearchForm />
      </div>
      <Button
        extraClassName={`md:hidden ${showSearchForm ? "hidden" : ""}`}
        icon={<SearchIcon />}
        onClick={() => dispatch({ type: "showSearchForm", show: true })}
      />
    </div>
  );
};
