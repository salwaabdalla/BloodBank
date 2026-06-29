import { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar       from './components/Sidebar';
import Splash        from './components/Splash';
import ChatWidget    from './components/ChatWidget';
import Login         from './pages/Login';
import Dashboard     from './pages/Dashboard';
import Donors        from './pages/Donors';
import Donations     from './pages/Donations';
import Requests      from './pages/Requests';
import Inventory     from './pages/Inventory';
import Patients      from './pages/Patients';
import Camps         from './pages/Camps';
import Staff         from './pages/Staff';
import Notifications from './pages/Notifications';
import Banks         from './pages/Banks';
import Hospitals     from './pages/Hospitals';
import Tests         from './pages/Tests';
import Payments      from './pages/Payments';

// Layout wrapper for all authenticated pages (sidebar + scrollable content area)
function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <ChatWidget />
    </div>
  );
}

export default function App() {
  // Lazy-initialise: read sessionStorage once at mount, never on re-renders.
  // sessionStorage clears when the tab is closed, so the splash replays in
  // every new tab/session but NOT on navigations or page refreshes within
  // the same tab.
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('splash_seen'),
  );

  return (
    <BrowserRouter>
      {/*
        Splash is rendered INSIDE BrowserRouter (so it can useNavigate)
        but OUTSIDE Routes (it's a one-time overlay, not a route).
        When onDone fires it sets sessionStorage so subsequent renders skip it.
      */}
      {showSplash && (
        <Splash
          onDone={() => {
            sessionStorage.setItem('splash_seen', '1');
            setShowSplash(false);
          }}
        />
      )}

      <Routes>
        {/* Login renders full-viewport, no sidebar */}
        <Route path="/login" element={<Login />} />

        {/* All other pages render inside the sidebar shell */}
        <Route element={<AppShell />}>
          <Route path="/"               element={<Dashboard />} />
          <Route path="/donors"         element={<Donors />} />
          <Route path="/donations"      element={<Donations />} />
          <Route path="/blood-requests" element={<Requests />} />
          <Route path="/inventory"      element={<Inventory />} />
          <Route path="/patients"       element={<Patients />} />
          <Route path="/camps"          element={<Camps />} />
          <Route path="/staff"          element={<Staff />} />
          <Route path="/notifications"  element={<Notifications />} />
          <Route path="/banks"          element={<Banks />} />
          <Route path="/hospitals"      element={<Hospitals />} />
          <Route path="/tests"          element={<Tests />} />
          <Route path="/payments"       element={<Payments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
