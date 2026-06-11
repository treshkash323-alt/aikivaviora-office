import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { RequireAuth } from './components/RequireAuth';
import { StaffLayout } from './components/StaffLayout';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import LeadsPage from './pages/LeadsPage';
import AdminPage from './pages/AdminPage';

function ChatBySlug() {
  const { tenantSlug } = useParams();
  return <ChatPage tenantSlug={tenantSlug ?? 'customer-demo'} />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/c/:tenantSlug" element={<ChatBySlug />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/app" element={<StaffLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route
                path="admin"
                element={
                  <RequireAuth roles={['admin']}>
                    <AdminPage />
                  </RequireAuth>
                }
              />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
