import { Link } from "react-router";
import "./welcome.css";

export function Welcome() {
  return (
    <main className="flex flex-col items-center justify-center pt-16 pb-4 font-[Typewriter]">
      <h1 className="text-3xl font-bold mb-4 text-center">Welcome to Real-Time Dithering</h1>
      <h2 className="text-xl mb-4 text-center">Try out below versions:</h2>
      <ul className="list-disc ditheringLinks">
        <li>
          <Link className="italic text-center" to="/FloydSteinberg">Floyd-Steinberg Dithering</Link>
        </li>
        <li>
          <Link className="italic text-center" to="/BayerOrdered" >Bayer Ordered Dithering</Link>
        </li>
      </ul>
    </main>
  );
}