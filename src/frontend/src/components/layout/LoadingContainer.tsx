import { LoaderCircle } from "lucide-react";

export interface LoadingContainerProps {
  extraClassName?: string;
}

export const LoadingContainer = ({ extraClassName }: LoadingContainerProps) => {
  return (
    <div
      className={`w-full flex flex-auto items-center justify-center ${extraClassName}`}
    >
      <LoaderCircle className="animate-spin" size={48} />
    </div>
  );
};
