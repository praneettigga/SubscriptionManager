import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Edit2, Check, X, AlertTriangle } from 'lucide-react';

function BudgetCard({ budget, totalSpending, onUpdateBudget }) {
    const [isEditing, setIsEditing] = useState(false);
    const [budgetInput, setBudgetInput] = useState(budget?.monthly_budget || '');

    const monthlyBudget = budget?.monthly_budget;
    const alertThreshold = budget?.alert_threshold || 80;

    const percentage = monthlyBudget ? Math.min((totalSpending / monthlyBudget) * 100, 150) : 0;
    const isOverBudget = monthlyBudget && totalSpending > monthlyBudget;
    const isNearLimit = monthlyBudget && percentage >= alertThreshold && !isOverBudget;

    const getStatusColor = () => {
        if (isOverBudget) return { bg: 'bg-rose-600/20', text: 'text-rose-400', bar: 'bg-rose-500' };
        if (isNearLimit) return { bg: 'bg-amber-600/20', text: 'text-amber-400', bar: 'bg-amber-500' };
        return { bg: 'bg-emerald-600/20', text: 'text-emerald-400', bar: 'bg-emerald-500' };
    };

    const colors = getStatusColor();

    const handleSave = () => {
        const value = budgetInput === '' ? null : parseFloat(budgetInput);
        onUpdateBudget(value);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setBudgetInput(budget?.monthly_budget || '');
        setIsEditing(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass rounded-2xl p-6 card-hover"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <Target className={colors.text} size={24} />
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                )}
            </div>

            <p className="text-zinc-400 text-sm mb-1">Monthly Budget</p>

            <AnimatePresence mode="wait">
                {isEditing ? (
                    <motion.div
                        key="editing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                    >
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">₹</span>
                            <input
                                type="number"
                                value={budgetInput}
                                onChange={(e) => setBudgetInput(e.target.value)}
                                placeholder="Set budget"
                                className="w-full bg-surface-800 border border-zinc-700 rounded-lg py-2 pl-8 pr-3 text-white placeholder-zinc-500 focus:outline-none focus:border-primary-500 text-lg"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                        >
                            <Check size={18} />
                        </button>
                        <button
                            onClick={handleCancel}
                            className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="display"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {monthlyBudget ? (
                            <>
                                <p className="text-3xl font-bold text-white mb-3">
                                    ₹{monthlyBudget.toLocaleString()}
                                </p>

                                {/* Progress bar */}
                                <div className="w-full h-3 bg-surface-800 rounded-full overflow-hidden mb-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className={`h-full rounded-full ${colors.bar}`}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className={`text-sm ${colors.text}`}>
                                        {percentage.toFixed(0)}% used
                                    </span>
                                    <span className={`text-sm font-medium ${isOverBudget ? 'text-rose-400' : 'text-zinc-300'}`}>
                                        {isOverBudget
                                            ? `₹${(totalSpending - monthlyBudget).toFixed(0)} over`
                                            : `₹${(monthlyBudget - totalSpending).toFixed(0)} left`
                                        }
                                    </span>
                                </div>

                                {/* Alert indicator */}
                                {(isOverBudget || isNearLimit) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex items-center gap-2 mt-3 p-2 rounded-lg ${isOverBudget ? 'bg-rose-500/10' : 'bg-amber-500/10'}`}
                                    >
                                        <AlertTriangle size={14} className={isOverBudget ? 'text-rose-400' : 'text-amber-400'} />
                                        <span className={`text-xs ${isOverBudget ? 'text-rose-300' : 'text-amber-300'}`}>
                                            {isOverBudget ? 'Over budget!' : 'Approaching limit'}
                                        </span>
                                    </motion.div>
                                )}
                            </>
                        ) : (
                            <p className="text-2xl font-bold text-zinc-500">
                                Not set
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default BudgetCard;
