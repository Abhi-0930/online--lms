import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useRoute } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function CourseDetailRoute() {
  const [, params] = useRoute("/courses/:courseId");
  return <Home page="course-detail" courseId={params?.courseId || "dsa-foundations"} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Home page="dashboard" />} />
      <Route path="/courses" component={() => <Home page="courses" />} />
      <Route path="/courses/:courseId" component={CourseDetailRoute} />
      <Route path="/my-courses" component={() => <Home page="my-courses" />} />
      <Route path="/learn" component={() => <Home page="learn" />} />
      <Route path="/practice" component={() => <Home page="practice" />} />
      <Route path="/practice/:slug" component={() => <Home page="practice" />} />
      <Route path="/progress" component={() => <Home page="progress" />} />
      <Route path="/announcements" component={() => <Home page="announcements" />} />
      <Route path="/community" component={() => <Home page="community" />} />
      <Route path="/notifications" component={() => <Home page="notifications" />} />
      <Route path="/assignments" component={() => <Home page="assignments" />} />
      <Route path="/profile" component={() => <Home page="profile" />} />
      <Route path="/feedback" component={() => <Home page="feedback" />} />
      <Route path="/notes" component={() => <Home page="notes" />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
