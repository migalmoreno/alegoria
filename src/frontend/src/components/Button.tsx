import { LucideProps } from "lucide-react";
import { cloneElement } from "react";

interface ButtonProps {
  children?: React.ReactNode;
  icon?: React.ReactElement;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Button = ({ children, icon, onClick }: ButtonProps) => {
  return (
    <button
      className="transition-colors hover:bg-neutral-800 rounded-full p-2 cursor-pointer text-white"
      onClick={onClick}
    >
      {icon &&
        cloneElement(icon as React.ReactElement, { size: 18 } as LucideProps)}
      {children}
    </button>
  );
};
