import { LucideProps } from "lucide-react";
import { cloneElement } from "react";

interface ButtonProps {
  children?: React.ReactNode;
  icon?: React.ReactElement;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  extraClassName?: string;
}

export const Button = ({
  children,
  icon,
  onClick,
  extraClassName,
}: ButtonProps) => {
  return (
    <button
      className={`transition-colors hover:bg-neutral-800 rounded-full p-3 cursor-pointer text-white ${extraClassName}`}
      onClick={onClick}
    >
      {icon &&
        cloneElement(icon as React.ReactElement, { size: 18 } as LucideProps)}
      {children}
    </button>
  );
};
