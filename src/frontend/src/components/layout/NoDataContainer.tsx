interface NoDataContainerProps {
  message?: string;
}

export const NoDataContainer = ({
  message = "No data available",
}: NoDataContainerProps) => {
  return (
    <div className="w-full flex flex-auto items-center justify-center text-md">
      {message}
    </div>
  );
};
