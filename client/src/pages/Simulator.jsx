import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Plus, Minus, TrendingDown, Sparkles, IndianRupee } from 'lucide-react';

const CATEGORIES = {
    entertainment: { color: '#8b5cf6', label: 'Entertainment' },
    productivity: { color: '#10b981', label: 'Productivity' },
    utilities: { color: '#f59e0b', label: 'Utilities' },
    health: { color: '#ef4444', label: 'Health & Fitness' },
    education: { color: '#3b82f6', label: 'Education' },
    other: { color: '#6b7280', label: 'Other' },
};

function Simulator({ subscriptions }) {
    const [selectedForRemoval, setSelectedForRemoval] = useState(new Set());
    const [priceAdjustments, setPriceAdjustments] = useState({});
    const [sharedAdjustments, setSharedAdjustments] = useState({});

    // Calculate current and simulated spending
    const calculations = useMemo(() => {
        let currentMonthly = 0;
        let simulatedMonthly = 0;

        subscriptions.forEach((sub) => {
            let baseCost = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost;
            let userShare = sub.is_shared && sub.shared_with > 1 ? baseCost / sub.shared_with : baseCost;
            currentMonthly += userShare;

            if (selectedForRemoval.has(sub.id)) {
                // Removed - no cost
                return;
            }

            // Apply price adjustments
            let adjustedCost = priceAdjustments[sub.id] !== undefined
                ? priceAdjustments[sub.id]
                : baseCost;

            // Apply shared adjustments
            let sharedWith = sharedAdjustments[sub.id] !== undefined
                ? sharedAdjustments[sub.id]
                : (sub.shared_with || 1);

            let finalCost = sharedWith > 1 ? adjustedCost / sharedWith : adjustedCost;
            simulatedMonthly += finalCost;
        });

        return {
            currentMonthly,
            simulatedMonthly,
            savings: currentMonthly - simulatedMonthly,
            savingsPercent: currentMonthly > 0
                ? ((currentMonthly - simulatedMonthly) / currentMonthly * 100).toFixed(1)
                : 0,
        };
    }, [subscriptions, selectedForRemoval, priceAdjustments, sharedAdjustments]);

    const toggleRemoval = (subId) => {
        const newSet = new Set(selectedForRemoval);
        if (newSet.has(subId)) {
            newSet.delete(subId);
        } else {
            newSet.add(subId);
        }
        setSelectedForRemoval(newSet);
    };

    const adjustShare = (subId, delta) => {
        const current = sharedAdjustments[subId] || subscriptions.find(s => s.id === subId)?.shared_with || 1;
        const newValue = Math.max(1, Math.min(10, current + delta));
        setSharedAdjustments(prev => ({ ...prev, [subId]: newValue }));
    };

    const resetSimulation = () => {
        setSelectedForRemoval(new Set());
        setPriceAdjustments({});
        setSharedAdjustments({});
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Calculator className="text-primary-400" />
                        Scenario Simulator
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        What-if calculator for your subscriptions
                    </p>
                </div>
                <button
                    onClick={resetSimulation}
                    className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white border border-zinc-700 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                    Reset All
                </button>
            </div>

            {/* Savings Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 mb-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-surface-800 rounded-xl">
                        <p className="text-sm text-zinc-400 mb-2">Current Monthly</p>
                        <p className="text-2xl font-bold text-white">
                            ₹{calculations.currentMonthly.toFixed(2)}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-surface-800 rounded-xl">
                        <p className="text-sm text-zinc-400 mb-2">Simulated Monthly</p>
                        <p className="text-2xl font-bold text-primary-400">
                            ₹{calculations.simulatedMonthly.toFixed(2)}
                        </p>
                    </div>
                    <div className={`text-center p-4 rounded-xl ${calculations.savings > 0
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'bg-surface-800'
                        }`}>
                        <p className="text-sm text-zinc-400 mb-2">Potential Savings</p>
                        <div className="flex items-center justify-center gap-2">
                            {calculations.savings > 0 && <TrendingDown className="text-emerald-400" size={20} />}
                            <p className={`text-2xl font-bold ${calculations.savings > 0 ? 'text-emerald-400' : 'text-white'
                                }`}>
                                ₹{calculations.savings.toFixed(2)}
                            </p>
                            {calculations.savings > 0 && (
                                <span className="text-sm text-emerald-400">
                                    ({calculations.savingsPercent}%)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {calculations.savings > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-emerald-400" size={20} />
                            <p className="text-emerald-300">
                                <strong>Yearly savings:</strong> ₹{(calculations.savings * 12).toFixed(2)} if you implement these changes!
                            </p>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Subscription Cards */}
            <div className="space-y-4">
                {subscriptions.map((sub, index) => {
                    const isRemoved = selectedForRemoval.has(sub.id);
                    const currentShare = sharedAdjustments[sub.id] || sub.shared_with || 1;
                    const baseCost = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost;
                    const userCost = currentShare > 1 ? baseCost / currentShare : baseCost;

                    return (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`glass rounded-xl p-4 transition-all ${isRemoved ? 'opacity-40 border border-red-500/30' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {/* Color indicator */}
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                        style={{ backgroundColor: CATEGORIES[sub.category]?.color || '#6b7280' }}
                                    >
                                        {sub.name?.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <p className={`font-medium ${isRemoved ? 'line-through text-zinc-500' : 'text-white'}`}>
                                            {sub.name}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {CATEGORIES[sub.category]?.label} • {sub.billing_cycle}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Share control */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-500">Split:</span>
                                        <button
                                            onClick={() => adjustShare(sub.id, -1)}
                                            disabled={isRemoved || currentShare <= 1}
                                            className="p-1 rounded-lg bg-surface-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors disabled:opacity-30"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="text-white font-medium w-6 text-center">
                                            {currentShare}
                                        </span>
                                        <button
                                            onClick={() => adjustShare(sub.id, 1)}
                                            disabled={isRemoved}
                                            className="p-1 rounded-lg bg-surface-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors disabled:opacity-30"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* Cost display */}
                                    <div className="text-right w-24">
                                        <p className={`font-medium ${isRemoved ? 'text-zinc-500' : 'text-white'}`}>
                                            ₹{userCost.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-zinc-500">/mo</p>
                                    </div>

                                    {/* Remove toggle */}
                                    <button
                                        onClick={() => toggleRemoval(sub.id)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isRemoved
                                                ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                                            }`}
                                    >
                                        {isRemoved ? 'Restore' : 'Remove'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {subscriptions.length === 0 && (
                <div className="text-center py-16 glass rounded-2xl">
                    <IndianRupee className="mx-auto text-zinc-500 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-white mb-2">
                        No subscriptions to simulate
                    </h3>
                    <p className="text-zinc-500">
                        Add some subscriptions to use the simulator
                    </p>
                </div>
            )}
        </div>
    );
}

export default Simulator;
