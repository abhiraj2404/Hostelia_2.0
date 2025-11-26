import Footer from "./components/layout/Footer";
import { SidebarLayout } from "./components/layout/SidebarLayout";
import { AppRoutes } from "./routes";

function App() {
  return (
    <SidebarLayout>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <main className="flex-1">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </SidebarLayout>
  );
}

export default App;
