import { Link, useParams } from "wouter";
import { SocialIcon } from "react-social-icons";
import { useQuery } from "@tanstack/react-query";
import { Category, SubCategory } from "~/types";

export const CategoryPage = () => {
  const { category: categoryName } = useParams();

  const { data: category } = useQuery<Category>({
    queryKey: [`extractors?category=${categoryName}`],
  });

  return (
    <div className="flex flex-col gap-y-4 p-2">
      <div className="flex gap-x-4">
        <div className="flex items-center">
          {category && <SocialIcon url={category.root} />}
        </div>
        <div>
          <h1 className="font-bold text-3xl">{category?.name}</h1>
          <h2>{category?.root}</h2>
          <span>{category?.description}</span>
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        {category?.subcategories?.map((sub: SubCategory, i: number) => (
          <div
            className="flex flex-col p-2 border border-neutral-800 rounded-sm w-64 grow"
            key={i}
          >
            <Link
              className="font-bold"
              href={`/category/${categoryName}/${sub.name}`}
            >
              {sub.name}
            </Link>
            <span>{sub.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
