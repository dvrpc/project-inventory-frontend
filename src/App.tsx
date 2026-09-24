import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/Admin';
import RequireAdmin from './pages/RequireAdmin';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        }
      />
    </Routes>
  );
}

export default App;
