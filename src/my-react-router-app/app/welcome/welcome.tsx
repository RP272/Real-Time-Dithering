import { Link } from "react-router";

export function Welcome() {
  return (
    <main className="flex flex-col items-center justify-center pt-16 pb-4 font-[Typewriter]">
      <h1 className="text-3xl font-bold mb-4">Welcome to Real-Time Dithering</h1>
      <h2 className="text-xl mb-4">You can try out these versions:</h2>
      <ul className="list-disc">
        <li>
          <Link className="italic" to="/FloydSteinberg">Floyd-Steinberg Dithering</Link>
        </li>
      </ul>
    </main>
  );
}