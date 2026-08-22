import { CircleAlertIcon } from "lucide-react";

interface ErrorContainerProps {
  error: Error;
}

export const ErrorContainer = ({ error }: ErrorContainerProps) => {
  return (
    <div className="flex items-center justify-center gap-x-4 w-full lg:max-w-3/4 flex-auto flex-col gap-y-6 p-4 mx-auto">
      <div className="font-semibold text-lg text-red-400 flex items-center gap-x-4">
        <CircleAlertIcon className="text-red-400" />
        <span className="[overflow-wrap:anywhere]">{error.message}</span>
      </div>
      {error.cause ? (
        <span className="[overflow-wrap:anywhere] text-center">
          {String(error.cause)}
        </span>
      ) : null}
    </div>
  );
};
