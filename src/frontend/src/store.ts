import { create } from "zustand";
import { Category, Extractor, SubCategory } from "./types";
import { persist, redux } from "zustand/middleware";

interface AppState {
  categories: Category[];
  enabledCategories: Category[];
  showMobileMenu: boolean;
  showSearchForm: boolean;
  activeCategory?: Category;
  activeSubCategory?: SubCategory;
  activeExtractor?: Extractor;
}

type AppStore = AppState & {
  dispatch: (action: AppAction) => AppAction;
};

type AppAction =
  | { type: "setCategories"; categories: Category[] }
  | { type: "setEnabledCategories"; categories: Category[] }
  | { type: "setActiveCategory"; category: Category }
  | { type: "setActiveSubCategory"; subcategory: SubCategory }
  | { type: "setActiveExtractor"; extractor: Extractor }
  | { type: "showMobileMenu"; show: boolean }
  | { type: "showSearchForm"; show: boolean };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "setCategories":
      return { ...state, categories: action.categories };
    case "setEnabledCategories":
      return { ...state, enabledCategories: action.categories };
    case "setActiveCategory":
      return { ...state, activeCategory: action.category };
    case "setActiveSubCategory":
      return { ...state, activeSubCategory: action.subcategory };
    case "setActiveExtractor":
      return { ...state, activeExtractor: action.extractor };
    case "showMobileMenu":
      return { ...state, showMobileMenu: action.show };
    case "showSearchForm":
      return { ...state, showSearchForm: action.show };
    default:
      return state;
  }
};

const initialState: AppState = {
  categories: [],
  enabledCategories: [],
  showMobileMenu: false,
  showSearchForm: false,
};

export const useAppStore = create<AppStore>()(
  persist(redux(appReducer, initialState), {
    name: "alegoria",
    partialize: (state) => ({
      categories: state.categories,
      enabledCategories: state.enabledCategories,
      activeCategory: state.activeCategory,
      activeSubCategory: state.activeSubCategory,
    }),
  }),
);
