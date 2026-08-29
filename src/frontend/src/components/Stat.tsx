import { ReactElement, cloneElement } from "react";
import { LucideProps } from "lucide-react";
import { formatNumber } from "~/utils";

interface StatProps {
  icon: ReactElement;
  value: number;
}

export const Stat = ({ icon, value }: StatProps) => (
  <span className="flex items-center gap-x-1 text-xs text-neutral-400">
    {cloneElement(icon as ReactElement<LucideProps>, { size: 13 })}
    {formatNumber(value)}
  </span>
);
