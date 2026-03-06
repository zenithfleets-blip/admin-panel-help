import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkStyle = ({ isActive }) => ({
    padding: "12px 16px",
    borderRadius: 10,
    textDecoration: "none",
    color: isActive ? "#fff" : "#9CA3AF",
    background: isActive ? "#2563EB" : "transparent",
    fontWeight: 600,
    display: "block",
    marginBottom: 8,
  });

  return (
    <aside className="sidebar">
      <h2>Support Admin</h2>
      <p className="subtitle">Task Management</p>

      <nav>
        <NavLink to="/" style={linkStyle} end>Dashboard</NavLink>
        <NavLink to="/tasks" style={linkStyle}>📦 Tasks</NavLink>
        <NavLink to="/vehicles" style={linkStyle}>🚗 Vehicles</NavLink>
        <NavLink to="/users" style={linkStyle}>👤 Users</NavLink>
        <NavLink to="/inspection" style={linkStyle}>👤 Inspection</NavLink>
        <NavLink to="/support" style={linkStyle}>👤 Support-staff</NavLink>
        <NavLink to="/live" style={linkStyle}>👤 Live Tracking</NavLink>
      </nav>
    </aside>
  );
}
