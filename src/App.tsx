import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './state/SettingsContext';
import { AssistantProvider } from './state/AssistantContext';

// Pages
import { LandingPage }    from './pages/LandingPage';
import { LoginPage }      from './pages/LoginPage';
import { RegisterPage }   from './pages/RegisterPage';
import { DashboardPage }  from './pages/DashboardPage';
import { ProfilePage }    from './pages/ProfilePage';
import { SettingsPage }   from './pages/SettingsPage';
import { TablesPage }     from './pages/TablesPage';
import { FormsPage }      from './pages/FormsPage';

// Workspace shell layout
import { WorkspaceLayout } from './components/layout/WorkspaceLayout';

export const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AssistantProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/"          element={<LandingPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />

          {/* Authenticated workspace — all wrapped in sidebar + header shell */}
          <Route path="/workspace" element={<WorkspaceLayout />}>
            <Route index             element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"  element={<DashboardPage />} />
            <Route path="database"   element={<TablesPage />} />
            <Route path="upload"     element={<FormsPage />} />
            <Route path="settings"   element={<SettingsPage />} />
            <Route path="profile"    element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AssistantProvider>
    </SettingsProvider>
  );
};

export default App;
