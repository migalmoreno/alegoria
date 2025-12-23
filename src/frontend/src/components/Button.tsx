import { LucideProps } from "lucide-react";
import { ButtonHTMLAttributes, cloneElement } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  icon?: React.ReactElement;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  extraClassName?: string;
};

export const Button = ({
  children,
  icon,
  onClick,
  extraClassName,
  ...buttonProps
}: ButtonProps) => {
  return (
    <button
      className={`transition-colors hover:bg-neutral-800 rounded-full p-3 cursor-pointer text-white ${extraClassName}`}
      onClick={onClick}
      {...buttonProps}
    >
      {icon &&
        cloneElement(icon as React.ReactElement, { size: 18 } as LucideProps)}
      {children}
    </button>
  );
};
