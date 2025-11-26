import { Route } from "react-router-dom";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import OnlyGuests from "./guards/OnlyGuests";

export const AuthRoutes = () => (
  <>
    <Route path="/login" element={<OnlyGuests><Login /></OnlyGuests>} />
    <Route path="/signup" element={<OnlyGuests><Signup /></OnlyGuests>} />
  </>
);

