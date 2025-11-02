import { Link } from "react-router";

function Navbar() {
  return (
    <div className="flex justify-between items-center p-4">
      <h1 className="text-2xl font-bold">Hostelia</h1>
      <nav className="flex gap-4">
        <ul className="flex gap-4">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
