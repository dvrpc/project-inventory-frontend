import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/Admin';
import RequireAuth from './pages/RequireAuth';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
