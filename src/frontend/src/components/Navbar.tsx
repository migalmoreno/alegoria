import { ArrowLeft, MenuIcon, SearchIcon } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link, useLocation } from "wouter";
import { Button } from "./Button";
import { useAppStore } from "~/store";
import { useShallow } from "zustand/shallow";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, Extractor, SubCategory } from "~/types";
import { ReactNode, useState } from "react";

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
  const [_, navigate] = useLocation();
  const [isCategorySelected, setCategorySelected] = useState<boolean>();
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

  const isSearchable = activeSubCategory?.searchable !== false;

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

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    if (extractor) {
      const searchUrl = extractor.url;
      const interpolatedUrl = searchUrl.replace(
        new RegExp(`/${extractor.groups[0]}(/|$)`),
        `/${formData.searchValue}$1`,
      );
      navigate(`/post/${encodeURIComponent(interpolatedUrl)}`);
    } else {
      navigate(`/post/${encodeURIComponent(formData.searchValue)}`);
    }
  };

  return (
    <div className="flex gap-x-4 w-full md:w-auto flex-wrap sm:flex-nowrap gap-y-4 top-0">
      <form
        className="flex-auto border border-neutral-800 rounded-full px-4 py-2 w-full md:min-w-[300px] bg-neutral-900 flex items-center gap-x-2"
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
          <div className="flex gap-x-1 items-center w-40 shrink-0">
            <SearchSelect
              className="flex-1 min-w-0"
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
            {activeCategory && activeCategory?.subcategories?.length > 0 && (
              <SearchSelect
                className="flex-1 min-w-0"
                value={activeSubCategory?.name}
                onChange={async (e) => {
                  const subcategory = activeCategory?.subcategories.find(
                    (subcategory) => subcategory.name === e.target.value,
                  ) as SubCategory;
                  dispatch({ type: "setActiveSubCategory", subcategory });
                  await handleNonSearchableSubcategory(
                    activeCategory?.name ?? "",
                    subcategory,
                  );
                }}
              >
                {activeCategory.subcategories.map((subcategory, i) => (
                  <option key={i} value={subcategory.name}>
                    {subcategory.name}
                  </option>
                ))}
              </SearchSelect>
            )}
          </div>
        )}
        <input
          className="outline-none flex-1 min-w-0 disabled:opacity-40 disabled:cursor-not-allowed"
          placeholder="Search"
          disabled={!isSearchable}
          onFocus={() => setCategorySelected(true)}
          onInput={() => setCategorySelected(true)}
          {...register("searchValue", { required: true })}
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
