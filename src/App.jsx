import { Routes, Route, Navigate } from "react-router-dom";
import Upload from "./pages/Upload";
import Selling from "./pages/Selling";
import Purchase from "./pages/Purchase";
import MyLibrary from "./pages/MyLibrary";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/upload" replace />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/selling" element={<Selling />} />
      <Route path="/purchase" element={<Purchase />} />
      <Route path="/library" element={<MyLibrary />} />
    </Routes>
  );
}

export default App;