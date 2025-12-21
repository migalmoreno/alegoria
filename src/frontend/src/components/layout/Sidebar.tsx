import { ReactElement } from "react";
import type { Category, CategoryConfig } from "~/types";
import { HomeIcon } from "lucide-react";
import { Link } from "wouter";
import { SharedNavbarSubMenu } from "./Navbar";
import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "~/store";
import { useShallow } from "zustand/shallow";
import { useQuery } from "@tanstack/react-query";
import { pageSchema } from "~/page-schema";
import { abbreviatedSha } from "~build/git";

interface MenuLinkProps {
  label: string;
  link: string;
  icon: ReactElement;
}

const MenuLink = ({ link, label, icon }: MenuLinkProps) => {
  return (
    <Link href={link}>
      <div className="flex gap-x-4 hover:bg-neutral-900 rounded-md w-full p-2 transition-colors">
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
};

const Menu = () => {
  return (
    <div className="flex flex-col gap-y-2 justify-between w-[250px] border-r border-neutral-800">
      <div className="p-2">
        <MenuLink label="Home" link="/" icon={<HomeIcon />} />
      </div>
      <div className="border-t border-neutral-800 p-2">
        <span className="flex py-4 p-2 text-sm text-neutral-300">
          Version: {APP_VERSION}-{abbreviatedSha}
        </span>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  const [categories, dispatch] = useAppStore(
    useShallow((state) => [state.categories, state.dispatch]),
  );

  useQuery({
    enabled: categories.length === 0,
    queryKey: ["/categories"],
    select: (categories: Category[]) => {
      if (categories) {
        dispatch({ type: "setCategories", categories });
        const enabledCategories = [
          ...categories
            .filter((category: Category) =>
              Object.keys(pageSchema).includes(category.name),
            )
            .map((category: Category) => ({
              ...category,
              subcategories: category.subcategories.filter((subcategory) =>
                Object.keys(
                  pageSchema[category.name as keyof CategoryConfig],
                ).includes(subcategory.name),
              ),
            })),
          {
            name: "url",
            subcategories: [],
          },
        ];
        dispatch({
          type: "setEnabledCategories",
          categories: enabledCategories,
        });
      }
      return categories;
    },
  });

  return (
    <div className="sticky top-[60px] h-[calc(100dvh-60px)] overflow-auto bg-black text-white hidden lg:flex shrink-0">
      <Menu />
    </div>
  );
};

export const MobileMenu = () => {
  const showMobileMenu = useAppStore((state) => state.showMobileMenu);
  return (
    <AnimatePresence>
      {showMobileMenu && (
        <motion.div
          animate={{ x: 0 }}
          initial={{ x: -320 }}
          exit={{ x: -640 }}
          transition={{ duration: 0.1 }}
          className="z-10 bg-black fixed h-dvh text-white flex flex-col top-0"
        >
          <div className="flex h-[60px] shrink-0 p-2 border-b border-neutral-800">
            <SharedNavbarSubMenu />
          </div>
          <div className="h-full overflow-auto flex">
            <Menu />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
