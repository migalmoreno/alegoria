import { LucideProps } from "lucide-react";
import { ButtonHTMLAttributes, cloneElement } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  icon?: React.ReactElement;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  extraClassName?: string;
  size?: "sm" | "md";
};

export const Button = ({
  children,
  icon,
  onClick,
  extraClassName,
  size = "md",
  ...buttonProps
}: ButtonProps) => {
  const sizeClass =
    size === "sm"
      ? "px-3 py-1.5 text-xs gap-x-1.5"
      : "p-3";
  const iconSize = size === "sm" ? 14 : 18;
  return (
    <button
      className={`flex items-center transition-colors hover:bg-neutral-800 rounded-full cursor-pointer text-white ${sizeClass} ${extraClassName ?? ""}`}
      onClick={onClick}
      {...buttonProps}
    >
      {icon &&
        cloneElement(icon as React.ReactElement, { size: iconSize } as LucideProps)}
      {children}
    </button>
  );
};
