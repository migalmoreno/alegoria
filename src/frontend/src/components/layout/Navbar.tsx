import { ArrowLeft, MenuIcon, SearchIcon } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link, useLocation } from "wouter";
import { Button, Select } from "~/components";
import { useAppStore } from "~/store";
import { useShallow } from "zustand/shallow";
import { useQuery } from "@tanstack/react-query";
import { Category, Extractor, SubCategory } from "~/types";

export const SharedNavbarSubMenu = () => {
  const [showMobileMenu, dispatch] = useAppStore(
    useShallow((state) => [state.showMobileMenu, state.dispatch]),
  );
  return (
    <div className="flex items-center">
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

export interface Inputs {
  searchValue: string;
}

export const Navbar = () => {
  const { register, handleSubmit } = useForm<Inputs>();
  const [_, navigate] = useLocation();
  const [
    showSearchForm,
    categories,
    activeCategory,
    activeSubCategory,
    dispatch,
  ] = useAppStore(
    useShallow((state) => [
      state.showSearchForm,
      state.enabledCategories,
      state.activeCategory,
      state.activeSubCategory,
      state.dispatch,
    ]),
  );

  const { data: extractor } = useQuery<Extractor>({
    enabled:
      !!activeCategory &&
      activeCategory.subcategories.length > 0 &&
      !!activeSubCategory &&
      showSearchForm,
    queryKey: [
      `/extractors?category=${activeCategory?.name}&subcategory=${activeSubCategory?.name}`,
    ],
  });

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    if (extractor) {
      const searchUrl = extractor.url;
      const interpolatedUrl = searchUrl.replace(
        extractor.groups[0],
        formData.searchValue,
      );
      navigate(`/post/${encodeURIComponent(interpolatedUrl)}`);
    } else {
      navigate(`/post/${encodeURIComponent(formData.searchValue)}`);
    }
  };

  return (
    <div className="flex items-center min-h-[60px] bg-black w-full sticky top-0 right-0 justify-between text-white p-2 z-10 border-neutral-800 border-b">
      {showSearchForm ? (
        <Button
          icon={<ArrowLeft />}
          onClick={() => dispatch({ type: "showSearchForm", show: false })}
        />
      ) : (
        <SharedNavbarSubMenu />
      )}
      {showSearchForm ? (
        <div className="px-4 w-full flex">
          <form
            className="flex gap-x-4 w-full flex-wrap sm:flex-nowrap gap-y-4 top-0"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex w-full gap-x-4">
              <input
                className="border border-neutral-600 rounded-md p-1 w-full"
                placeholder="Search"
                {...register("searchValue", { required: true })}
              />
              <button type="submit">
                <SearchIcon />
              </button>
            </div>
            <div className="flex gap-x-2 w-full">
              <Select
                value={activeCategory?.name}
                onChange={(e) => {
                  const category = categories.find(
                    (category) => category.name === e.target.value,
                  ) as Category;
                  dispatch({
                    type: "setActiveCategory",
                    category,
                  });
                  dispatch({
                    type: "setActiveSubCategory",
                    subcategory:
                      category.subcategories &&
                      category.subcategories.length > 0
                        ? category.subcategories[0]
                        : undefined,
                  });
                }}
              >
                {categories.map((category, i) => (
                  <option key={i} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </Select>
              {activeCategory && activeCategory?.subcategories?.length > 0 && (
                <Select
                  value={activeSubCategory?.name}
                  onChange={(e) =>
                    dispatch({
                      type: "setActiveSubCategory",
                      subcategory: activeCategory?.subcategories.find(
                        (subcategory) => subcategory.name === e.target.value,
                      ) as SubCategory,
                    })
                  }
                >
                  {activeCategory.subcategories.map((subcategory, i) => (
                    <option key={i} value={subcategory.name}>
                      {subcategory.name}
                    </option>
                  ))}
                </Select>
              )}
            </div>
          </form>
        </div>
      ) : (
        <Button
          icon={<SearchIcon />}
          onClick={() => dispatch({ type: "showSearchForm", show: true })}
        />
      )}
    </div>
  );
};
