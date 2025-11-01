import Navbar from "./components/layout/Navbar";
import { Button } from "@/components/ui/button";

function App() {
  return (
    <>
      <Navbar />
      <h1>Home page of hostelia</h1>

      {/* example of how to use the shadcn components */}
      <Button variant="default">Click me</Button>
    </>
  );
}

export default App;
