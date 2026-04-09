import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Pill, PlusSquare, Calendar as CalendarIcon, LogOut, User, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-container">
            {/* Sidebar Navigation - Desktop only */}
            <aside className="sidebar glass-panel">
                <div className="sidebar-header">
                    <div className="logo-icon">M</div>
                    <h2>Meditrack<span className="pro-badge">Pro</span></h2>
                </div>
                
                <nav className="nav-menu">
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} end>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                    
                    <NavLink to="/medicines" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <Pill size={20} />
                        <span>Medicines</span>
                    </NavLink>

                    <NavLink to="/calendar" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <CalendarIcon size={20} />
                        <span>Calendar</span>
                    </NavLink>

                    <NavLink to="/add" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <PlusSquare size={20} />
                        <span>Add New</span>
                    </NavLink>

                    <NavLink to="/about" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <Info size={20} />
                        <span>About Me</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">
                            <User size={16} />
                        </div>
                        <div className="user-info">
                            <p className="user-email">{user?.name || user?.email?.split('@')[0]}</p>
                            <button className="logout-btn" onClick={handleLogout}>
                                <LogOut size={14} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Top Header */}
            <header className="mobile-header glass-panel">
                <div className="mobile-header-left">
                    <div className="logo-icon sm">M</div>
                    <h2>Meditrack</h2>
                </div>
                <button className="mobile-logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="main-content">
                <header className="top-header desktop-only animate-fade-in">
                    <div className="header-greeting">
                        <h1>Good tracking!</h1>
                        <p className="subtitle">Welcome back, {user?.name || user?.email?.split('@')[0]}. Here is your medical overview.</p>
                    </div>
                </header>
                <div className="content-wrapper animate-fade-in">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-bottom-nav glass-panel">
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? "mobile-nav-item active" : "mobile-nav-item"} end>
                    <LayoutDashboard size={22} />
                    <span>Home</span>
                </NavLink>
                <NavLink to="/medicines" className={({ isActive }) => isActive ? "mobile-nav-item active" : "mobile-nav-item"}>
                    <Pill size={22} />
                    <span>Meds</span>
                </NavLink>
                <NavLink to="/calendar" className={({ isActive }) => isActive ? "mobile-nav-item active" : "mobile-nav-item"}>
                    <CalendarIcon size={22} />
                    <span>Plan</span>
                </NavLink>
                <NavLink to="/add" className={({ isActive }) => isActive ? "mobile-nav-item active" : "mobile-nav-item"}>
                    <PlusSquare size={22} />
                    <span>Add</span>
                </NavLink>
                <NavLink to="/about" className={({ isActive }) => isActive ? "mobile-nav-item active" : "mobile-nav-item"}>
                    <Info size={22} />
                    <span>About</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default Layout;
