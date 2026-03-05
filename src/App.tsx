import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/Admin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
