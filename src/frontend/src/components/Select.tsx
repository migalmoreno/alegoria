import { ReactElement } from "react";

interface SelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children?: ReactElement[];
}

export const Select = ({ value, onChange, children }: SelectProps) => {
  return (
    <select
      value={value}
      className="bg-neutral-800 rounded border border-neutral-600 p-2 w-full"
      onChange={onChange}
    >
      {children}
    </select>
  );
};
