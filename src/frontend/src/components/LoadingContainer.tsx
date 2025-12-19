import { LoaderCircle } from "lucide-react";

export const LoadingContainer = () => {
  return (
    <div className="w-full flex items-center justify-center">
      <LoaderCircle className="animate-spin" size={48} />
    </div>
  );
};
