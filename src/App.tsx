import { Route, Routes } from "react-router-dom";
import "./App.css";
import Flash from "./components/Flash";
import Home from "./components/Home";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flash/:settings" element={<Flash />} />
      </Routes>
    </div>
  );
}

export default App;
