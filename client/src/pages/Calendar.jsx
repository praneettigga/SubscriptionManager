import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CATEGORIES = {
    entertainment: { color: '#8b5cf6', label: 'Entertainment' },
    productivity: { color: '#10b981', label: 'Productivity' },
    utilities: { color: '#f59e0b', label: 'Utilities' },
    health: { color: '#ef4444', label: 'Health & Fitness' },
    education: { color: '#3b82f6', label: 'Education' },
    other: { color: '#6b7280', label: 'Other' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function CalendarPage({ subscriptions }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and total days
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Calculate renewal dates for each subscription
    const getRenewalDates = () => {
        const renewals = {};

        subscriptions.forEach((sub) => {
            if (!sub.first_payment_date) return;

            const start = new Date(sub.first_payment_date);
            const checkDate = new Date(start);

            // Calculate renewal dates for this month
            if (sub.billing_cycle === 'yearly') {
                checkDate.setFullYear(year);
                if (checkDate.getMonth() === month) {
                    const day = checkDate.getDate();
                    if (!renewals[day]) renewals[day] = [];
                    renewals[day].push(sub);
                }
            } else {
                // Monthly - check if the day falls in this month
                const renewalDay = start.getDate();
                if (renewalDay <= daysInMonth) {
                    if (!renewals[renewalDay]) renewals[renewalDay] = [];
                    renewals[renewalDay].push(sub);
                }
            }
        });

        return renewals;
    };

    const renewals = getRenewalDates();

    // Calculate spending intensity for heatmap
    const getSpendingIntensity = (daySubs) => {
        if (!daySubs || daySubs.length === 0) return 0;
        const total = daySubs.reduce((sum, sub) => {
            let cost = sub.billing_cycle === 'yearly' ? sub.cost : sub.cost;
            if (sub.is_shared && sub.shared_with > 1) cost = cost / sub.shared_with;
            return sum + cost;
        }, 0);
        // Scale: 0-100 = low, 100-500 = medium, 500+ = high
        if (total > 500) return 3;
        if (total > 100) return 2;
        if (total > 0) return 1;
        return 0;
    };

    const navigateMonth = (direction) => {
        setCurrentDate(new Date(year, month + direction, 1));
        setSelectedDay(null);
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    // Calculate monthly totals for heat bar
    const getMonthlyTotals = () => {
        const totals = [];
        for (let m = 0; m < 12; m++) {
            let total = 0;
            subscriptions.forEach((sub) => {
                if (!sub.first_payment_date) return;
                const start = new Date(sub.first_payment_date);

                if (sub.billing_cycle === 'yearly') {
                    if (start.getMonth() === m) {
                        let cost = sub.cost;
                        if (sub.is_shared && sub.shared_with > 1) cost = cost / sub.shared_with;
                        total += cost;
                    }
                } else {
                    let cost = sub.cost;
                    if (sub.is_shared && sub.shared_with > 1) cost = cost / sub.shared_with;
                    total += cost;
                }
            });
            totals.push({ month: MONTHS[m].slice(0, 3), total, isActive: m === month });
        }
        return totals;
    };

    const monthlyTotals = getMonthlyTotals();
    const maxMonthTotal = Math.max(...monthlyTotals.map(m => m.total), 1);

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <CalendarIcon className="text-primary-400" />
                        Renewal Calendar
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        Track when your subscriptions renew
                    </p>
                </div>
            </div>

            {/* Monthly Spending Heatmap */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 mb-6"
            >
                <h2 className="text-lg font-semibold text-white mb-4">Yearly Spending Overview</h2>
                <div className="flex items-end justify-between gap-2 h-24">
                    {monthlyTotals.map((m, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-full flex justify-center">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(m.total / maxMonthTotal) * 60 + 10}px` }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`w-6 rounded-t-md ${m.isActive ? 'bg-primary-500' : 'bg-zinc-600'}`}
                                    style={{ opacity: 0.4 + (m.total / maxMonthTotal) * 0.6 }}
                                />
                            </div>
                            <span className={`text-xs ${m.isActive ? 'text-primary-400 font-medium' : 'text-zinc-500'}`}>
                                {m.month}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Calendar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6"
            >
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-xl font-semibold text-white">
                        {MONTHS[month]} {year}
                    </h2>
                    <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {DAYS.map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-zinc-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before first day of month */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-12" />
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const daySubs = renewals[day];
                        const intensity = getSpendingIntensity(daySubs);
                        const hasRenewals = daySubs && daySubs.length > 0;

                        return (
                            <motion.button
                                key={day}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.01 }}
                                onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                                className={`h-12 rounded-lg p-1 flex flex-col items-center justify-center relative transition-all ${isToday(day)
                                    ? 'ring-2 ring-primary-500 bg-primary-600/20'
                                    : selectedDay === day
                                        ? 'bg-zinc-700'
                                        : 'hover:bg-zinc-800'
                                    } ${intensity === 3 ? 'bg-rose-500/30' :
                                        intensity === 2 ? 'bg-amber-500/20' :
                                            intensity === 1 ? 'bg-emerald-500/15' : ''
                                    }`}
                            >
                                <span className={`text-sm font-medium ${isToday(day) ? 'text-primary-400' : 'text-white'}`}>
                                    {day}
                                </span>
                                {hasRenewals && (
                                    <div className="flex gap-0.5 mt-1">
                                        {daySubs.slice(0, 3).map((sub, idx) => (
                                            <div
                                                key={idx}
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: CATEGORIES[sub.category]?.color || '#6b7280' }}
                                            />
                                        ))}
                                        {daySubs.length > 3 && (
                                            <span className="text-[8px] text-zinc-400">+{daySubs.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Selected Day Details */}
                {selectedDay && renewals[selectedDay] && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-surface-800 rounded-xl border border-zinc-700"
                    >
                        <h3 className="font-medium text-white mb-3">
                            Renewals on {MONTHS[month]} {selectedDay}
                        </h3>
                        <div className="space-y-2">
                            {renewals[selectedDay].map((sub, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-surface-900 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                                            style={{ backgroundColor: CATEGORIES[sub.category]?.color || '#6b7280' }}
                                        >
                                            {sub.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{sub.name}</p>
                                            <p className="text-xs text-zinc-500">{CATEGORIES[sub.category]?.label}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-white">
                                            ₹{sub.is_shared && sub.shared_with > 1
                                                ? (sub.cost / sub.shared_with).toFixed(2)
                                                : sub.cost}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {sub.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'}
                                            {sub.is_shared && ` • Shared (1/${sub.shared_with})`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-500/15" />
                    <span>Low</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-500/20" />
                    <span>Medium</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-rose-500/30" />
                    <span>High</span>
                </div>
            </div>
        </div>
    );
}

export default CalendarPage;
