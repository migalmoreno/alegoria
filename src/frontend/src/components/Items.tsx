import { forwardRef, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

interface ItemsPaginationContainerProps {
  hasNextPage?: boolean;
  children?: ReactNode;
}

export const ItemsPaginationContainer = forwardRef<
  HTMLDivElement,
  ItemsPaginationContainerProps
>(({ hasNextPage, children }, ref) => {
  return (
    <div className="flex flex-col w-full p-4">
      <div className="grid w-full xs:grid-cols-3 lg:grid-cols-5 gap-4">
        {children}
      </div>
      {hasNextPage && (
        <div ref={ref} className="p-4 flex w-full justify-center">
          <LoaderCircle className="animate-spin" size={32} />
        </div>
      )}
    </div>
  );
});
