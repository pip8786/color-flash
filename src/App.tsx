import { useLocation } from "react-router-dom";
import "./App.css";
import Flash from "./components/Flash";
import Home from "./components/Home";

function App() {
  const location = useLocation();

  // Check if we have flash settings in query parameters
  const params = new URLSearchParams(location.search);
  const hasFlashParams = params.has("c") || params.has("f");

  return <div className="App">{hasFlashParams ? <Flash /> : <Home />}</div>;
}

export default App;
