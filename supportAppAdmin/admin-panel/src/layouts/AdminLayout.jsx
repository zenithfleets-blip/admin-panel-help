import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("admin_token");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="layout">
      <style>{css}</style>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebarHeader">
          <div className="sidebarLogo">SA</div>
          <h2>Support Admin</h2>
        </div>

        <nav className="sidebarNav">
          <NavLink to="/" end className="navItem">
            <span className="icon">📊</span>
            <span className="label">Dashboard</span>
          </NavLink>
          <NavLink to="/users" className="navItem">
            <span className="icon">👥</span>
            <span className="label">Users</span>
          </NavLink>
          <NavLink to="/vehicles" className="navItem">
            <span className="icon">🚗</span>
            <span className="label">Vehicles</span>
          </NavLink>
          <NavLink to="/tasks" className="navItem">
            <span className="icon">📋</span>
            <span className="label">Tasks</span>
          </NavLink>
          <NavLink to="/live" className="navItem">
            <span className="icon">🗺️</span>
            <span className="label">Live Tracking</span>
          </NavLink>
          <NavLink to="/inspection" className="navItem">
            <span className="icon">🔍</span>
            <span className="label">Inspection</span>
          </NavLink>
          <NavLink to="/support" className="navItem">
            <span className="icon">🤝</span>
            <span className="label">Support Staff</span>
          </NavLink>
        </nav>

        <div className="sidebarFooter">
          <button className="logoutBtn" onClick={logout}>
            <span className="icon">🚪</span>
            <span className="label">Logout</span>
          </button>
        </div>
      </aside>

      {/* PAGE CONTENT */}
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

const css = `
* {
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.layout {
  display: flex;
  height: 100vh;
  background: #f8fafc;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  padding: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebarHeader {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebarLogo {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.sidebarHeader h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.sidebarNav {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
}

.sidebarNav::-webkit-scrollbar {
  width: 6px;
}

.sidebarNav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebarNav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.navItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  color: #cbd5e1;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.navItem:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

.navItem.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.navItem .icon {
  font-size: 18px;
}

.navItem .label {
  flex: 1;
}

.sidebarFooter {
  padding: 12px 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logoutBtn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.logoutBtn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fecaca;
}

.logoutBtn .icon {
  font-size: 18px;
}

.main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f8fafc;
}

.main::-webkit-scrollbar {
  width: 8px;
}

.main::-webkit-scrollbar-track {
  background: transparent;
}

.main::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.main::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
`;

