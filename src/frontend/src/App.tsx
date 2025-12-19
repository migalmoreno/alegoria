import { Route, Router, Switch } from "wouter";
import { CategoryPage, HomePage, PostPage, Layout } from "./components";
import {
  QueryClient,
  QueryClientProvider,
  QueryFunction,
} from "@tanstack/react-query";

const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1${queryKey[0]}`,
  );
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(`${res.status}: ${res.statusText}`, {
      cause: resData.message,
    });
  }
  return resData;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 0,
      queryFn: defaultQueryFn,
    },
  },
});

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <div className="min-h-[calc(100dvh-60px)] bg-black w-full text-white flex-auto flex">
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/post/:url" component={PostPage} />
              <Route path="/category/:category" component={CategoryPage} />
              <Route>
                <div className="flex-auto flex flex-col items-center justify-center min-h-full min-w-full gap-y-4">
                  <h1 className="text-3xl sm:text-4xl font-extrabold">404</h1>
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    Page Not Found
                  </h2>
                </div>
              </Route>
            </Switch>
          </div>
        </Layout>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
