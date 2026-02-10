import { motion } from 'framer-motion';
import {
    TrendingUp,
    Calendar,
    IndianRupee,
    Plus,
    CreditCard,
} from 'lucide-react';
import BudgetCard from '../components/BudgetCard';

const CATEGORIES = {
    entertainment: { color: '#8b5cf6', label: 'Entertainment' },
    productivity: { color: '#10b981', label: 'Productivity' },
    utilities: { color: '#f59e0b', label: 'Utilities' },
    health: { color: '#ef4444', label: 'Health & Fitness' },
    education: { color: '#3b82f6', label: 'Education' },
    other: { color: '#6b7280', label: 'Other' },
};

function Dashboard({ subscriptions, loading, onAddClick, budget, onUpdateBudget }) {
    // Calculate total monthly spending (accounting for shared subscriptions)
    const totalMonthly = subscriptions.reduce((sum, sub) => {
        let cost = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost;
        // Divide by number of people if shared
        if (sub.is_shared && sub.shared_with > 1) {
            cost = cost / sub.shared_with;
        }
        return sum + cost;
    }, 0);

    const upcomingRenewals = subscriptions
        .map((sub) => ({
            ...sub,
            nextRenewal: getNextRenewalDate(sub),
        }))
        .filter((sub) => sub.nextRenewal)
        .sort((a, b) => a.nextRenewal - b.nextRenewal)
        .slice(0, 3);

    const categoryBreakdown = subscriptions.reduce((acc, sub) => {
        const cat = sub.category || 'other';
        const cost = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost;
        acc[cat] = (acc[cat] || 0) + cost;
        return acc;
    }, {});

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
        const now = new Date();
        const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        return diff;
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-zinc-400 mt-1">Overview of your subscriptions</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Monthly */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6 card-hover"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center">
                            <IndianRupee className="text-primary-400" size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-sm text-emerald-400">
                            <TrendingUp size={14} />
                            Active
                        </span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Monthly Spending</p>
                    <p className="text-3xl font-bold text-white">
                        ₹{totalMonthly.toFixed(2)}
                    </p>
                </motion.div>

                {/* Total Subscriptions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl p-6 card-hover"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600/20 flex items-center justify-center">
                            <CreditCard className="text-emerald-400" size={24} />
                        </div>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Active Subscriptions</p>
                    <p className="text-3xl font-bold text-white">{subscriptions.length}</p>
                </motion.div>

                {/* Yearly Projection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl p-6 card-hover"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-600/20 flex items-center justify-center">
                            <TrendingUp className="text-amber-400" size={24} />
                        </div>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Yearly Projection</p>
                    <p className="text-3xl font-bold text-white">
                        ₹{(totalMonthly * 12).toFixed(2)}
                    </p>
                </motion.div>

                {/* Next Renewal */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-2xl p-6 card-hover"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-600/20 flex items-center justify-center">
                            <Calendar className="text-rose-400" size={24} />
                        </div>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Next Renewal</p>
                    <p className="text-3xl font-bold text-white">
                        {upcomingRenewals.length > 0
                            ? `${getDaysUntil(upcomingRenewals[0].nextRenewal)} days`
                            : 'N/A'}
                    </p>
                </motion.div>

                {/* Budget Card */}
                <BudgetCard
                    budget={budget}
                    totalSpending={totalMonthly}
                    onUpdateBudget={onUpdateBudget}
                />
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Renewals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-2xl p-6"
                >
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Upcoming Renewals
                    </h2>
                    {upcomingRenewals.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingRenewals.map((sub) => {
                                const days = getDaysUntil(sub.nextRenewal);
                                return (
                                    <div
                                        key={sub.id}
                                        className="flex items-center justify-between p-4 bg-surface-800 rounded-xl"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                                style={{
                                                    backgroundColor:
                                                        CATEGORIES[sub.category]?.color || '#6b7280',
                                                }}
                                            >
                                                {sub.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{sub.name}</p>
                                                <p className="text-sm text-zinc-400">
                                                    {sub.nextRenewal.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-white">₹{sub.cost}</p>
                                            <p
                                                className={`text-sm ${days <= 3
                                                    ? 'text-rose-400'
                                                    : days <= 7
                                                        ? 'text-amber-400'
                                                        : 'text-zinc-400'
                                                    }`}
                                            >
                                                {days} days
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-center py-8">
                            No upcoming renewals
                        </p>
                    )}
                </motion.div>

                {/* Category Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass rounded-2xl p-6"
                >
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Spending by Category
                    </h2>
                    {Object.keys(categoryBreakdown).length > 0 ? (
                        <div className="space-y-4">
                            {Object.entries(categoryBreakdown).map(([cat, amount]) => {
                                const percentage = (amount / totalMonthly) * 100;
                                return (
                                    <div key={cat}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-zinc-300">
                                                {CATEGORIES[cat]?.label || cat}
                                            </span>
                                            <span className="text-sm text-zinc-400">
                                                ₹{amount.toFixed(2)} ({percentage.toFixed(0)}%)
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.5, delay: 0.6 }}
                                                className="h-full rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        CATEGORIES[cat]?.color || '#6b7280',
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-center py-8">
                            Add subscriptions to see breakdown
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default Dashboard;
