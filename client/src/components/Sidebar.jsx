import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    CreditCard,
    Sparkles,
    Calendar,
    Calculator,
    Plus,
    Settings,
} from 'lucide-react';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/simulator', icon: Calculator, label: 'Simulator' },
    { path: '/insights', icon: Sparkles, label: 'AI Insights' },
];

function Sidebar({ onAddClick }) {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-900 border-r border-zinc-800 flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 border-b border-zinc-800">
                <h1 className="text-2xl font-bold gradient-text">SubsTracker</h1>
                <p className="text-xs text-zinc-500 mt-1">Manage your subscriptions</p>
            </div>

            {/* Add Button */}
            <div className="p-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onAddClick}
                    className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                >
                    <Plus size={20} />
                    Add Subscription
                </motion.button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                                    }`
                                }
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800">
                <button className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-zinc-300 transition-colors w-full rounded-xl hover:bg-zinc-800">
                    <Settings size={20} />
                    <span className="font-medium">Settings</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
