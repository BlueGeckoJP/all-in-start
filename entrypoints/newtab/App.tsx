import "./App.css";
import Clock from "./components/Clock";
import Search from "./components/Search";
import Weather from "./components/Weather";

export default function App() {
  return (
    <>
      <Clock />
      <Weather />
      <Search />
    </>
  );
}
