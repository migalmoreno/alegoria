import { useMutation, useQuery } from "@tanstack/react-query";
import { Navbar } from "./Navbar";
import { MobileMenu, Sidebar } from "./Sidebar";
import { useEffect } from "react";
import { LoadingBarContainer } from "react-top-loading-bar";
import { toast, Toaster } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const {
    data,
    isSuccess,
    isError: configFetchError,
    error: configFetchErrorMsg,
  } = useQuery({
    queryKey: ["/config.json"],
    queryFn: async () => {
      const res = await fetch("/config.json");
      if (!res.ok) {
        throw new Error(`Response failed ${res.status} ${res.statusText}`);
      }
      return await res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: (settings) => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/v1/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
    },
    onError: (error) => {
      toast.error("Failed to load config", { description: error.message });
    },
  });

  useEffect(() => {
    if (configFetchError) {
      toast.error("Failed to load config", {
        description: configFetchErrorMsg?.message,
      });
    }
  }, [configFetchError]);

  useEffect(() => {
    if (isSuccess && data) {
      mutation.mutate(data);
    }
  }, [isSuccess, data]);

  return (
    <LoadingBarContainer>
      <Toaster visibleToasts={1} theme="dark" />
      <div className="flex flex-col h-full overflow-x-clip">
        <Navbar />
        <div className="flex flex-auto bg-black">
          <Sidebar />
          <MobileMenu />
          <div className="flex flex-auto items-center justify-center">
            {children}
          </div>
        </div>
      </div>
    </LoadingBarContainer>
  );
};
