import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    MoreVertical,
    Trash2,
    Edit,
    ExternalLink,
    Filter,
} from 'lucide-react';

const CATEGORIES = {
    entertainment: { color: '#8b5cf6', label: 'Entertainment' },
    productivity: { color: '#10b981', label: 'Productivity' },
    utilities: { color: '#f59e0b', label: 'Utilities' },
    health: { color: '#ef4444', label: 'Health & Fitness' },
    education: { color: '#3b82f6', label: 'Education' },
    other: { color: '#6b7280', label: 'Other' },
};

function Subscriptions({ subscriptions, loading, onDelete, onAddClick }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [openMenu, setOpenMenu] = useState(null);

    const filteredSubs = subscriptions.filter((sub) => {
        const matchesSearch = sub.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesStatus =
            activeFilter === 'all' ||
            (activeFilter === 'active' && sub.status !== 'canceled') ||
            (activeFilter === 'canceled' && sub.status === 'canceled');
        const matchesCategory =
            categoryFilter === 'all' || sub.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    function getNextRenewalDate(sub) {
        if (!sub.first_payment_date) return null;
        const start = new Date(sub.first_payment_date);
        const now = new Date();

        if (sub.billing_cycle === 'yearly') {
            while (start < now) start.setFullYear(start.getFullYear() + 1);
        } else {
            while (start < now) start.setMonth(start.getMonth() + 1);
        }
        return start;
    }

    function getDaysUntil(date) {
        if (!date) return null;
        const now = new Date();
        return Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
                    <p className="text-zinc-400 mt-1">
                        Manage all your active subscriptions
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onAddClick}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 px-5 rounded-xl transition-colors"
                >
                    <Plus size={18} />
                    Add New
                </motion.button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search subscriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-800 border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                    {['all', 'active', 'canceled'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-xl font-medium transition-colors capitalize ${activeFilter === filter
                                ? 'bg-primary-600 text-white'
                                : 'bg-surface-800 text-zinc-400 hover:bg-zinc-700'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Category Filter */}
                <div className="relative">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="appearance-none bg-surface-800 border border-zinc-700 rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-primary-500 cursor-pointer"
                    >
                        <option value="all">All Categories</option>
                        {Object.entries(CATEGORIES).map(([key, { label }]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <Filter
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                        size={16}
                    />
                </div>
            </div>

            {/* Subscriptions Grid */}
            {filteredSubs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filteredSubs.map((sub, index) => {
                            const nextRenewal = getNextRenewalDate(sub);
                            const daysUntil = getDaysUntil(nextRenewal);

                            return (
                                <motion.div
                                    key={sub.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass rounded-2xl p-5 card-hover relative"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                                                style={{
                                                    backgroundColor:
                                                        CATEGORIES[sub.category]?.color || '#6b7280',
                                                }}
                                            >
                                                {sub.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{sub.name}</h3>
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full text-white/80"
                                                    style={{
                                                        backgroundColor:
                                                            CATEGORIES[sub.category]?.color + '40' ||
                                                            '#6b728040',
                                                    }}
                                                >
                                                    {CATEGORIES[sub.category]?.label || 'Other'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Menu */}
                                        <div className="relative">
                                            <button
                                                onClick={() =>
                                                    setOpenMenu(openMenu === sub.id ? null : sub.id)
                                                }
                                                className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {openMenu === sub.id && (
                                                <div className="absolute right-0 top-full mt-1 w-40 bg-surface-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl z-10">
                                                    <button className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-zinc-300 hover:bg-zinc-700 transition-colors">
                                                        <Edit size={16} />
                                                        Edit
                                                    </button>
                                                    <button className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-zinc-300 hover:bg-zinc-700 transition-colors">
                                                        <ExternalLink size={16} />
                                                        Visit Site
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onDelete(sub.id);
                                                            setOpenMenu(null);
                                                        }}
                                                        className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-rose-400 hover:bg-zinc-700 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500 text-sm">Cost</span>
                                            <span className="text-white font-medium">
                                                ₹{sub.cost}/{sub.billing_cycle === 'yearly' ? 'yr' : 'mo'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500 text-sm">Next Renewal</span>
                                            <span
                                                className={`font-medium ${daysUntil !== null && daysUntil <= 3
                                                    ? 'text-rose-400'
                                                    : daysUntil !== null && daysUntil <= 7
                                                        ? 'text-amber-400'
                                                        : 'text-white'
                                                    }`}
                                            >
                                                {nextRenewal
                                                    ? nextRenewal.toLocaleDateString()
                                                    : 'Not set'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500 text-sm">Status</span>
                                            <span
                                                className={`text-sm px-2 py-0.5 rounded-full ${sub.status === 'canceled'
                                                    ? 'bg-rose-500/20 text-rose-400'
                                                    : 'bg-emerald-500/20 text-emerald-400'
                                                    }`}
                                            >
                                                {sub.status === 'canceled' ? 'Canceled' : 'Active'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-800 flex items-center justify-center">
                        <Search className="text-zinc-500" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                        No subscriptions found
                    </h3>
                    <p className="text-zinc-500 mb-6">
                        {searchQuery || categoryFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Add your first subscription to get started'}
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onAddClick}
                        className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 px-5 rounded-xl transition-colors"
                    >
                        <Plus size={18} />
                        Add Subscription
                    </motion.button>
                </div>
            )}
        </div>
    );
}

export default Subscriptions;
