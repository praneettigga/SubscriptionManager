import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, TrendingDown, Zap, Calendar } from 'lucide-react';

function AlternativesModal({ isOpen, onClose, subscription }) {
    const [alternatives, setAlternatives] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && subscription) {
            fetchAlternatives();
        }
    }, [isOpen, subscription]);

    const fetchAlternatives = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/ai/alternatives', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription }),
            });
            if (response.ok) {
                const data = await response.json();
                setAlternatives(data);
            }
        } catch (error) {
            console.error('Error fetching alternatives:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!subscription) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
                    >
                        <div className="glass rounded-2xl p-6 mx-4 max-h-[80vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Sparkles className="text-primary-400" size={20} />
                                        Alternatives for {subscription.name}
                                    </h2>
                                    <p className="text-sm text-zinc-400 mt-1">
                                        Current: ₹{subscription.cost}/{subscription.billing_cycle === 'yearly' ? 'yr' : 'mo'}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="text-primary-400 animate-spin mb-3" size={32} />
                                    <p className="text-zinc-400 text-sm">Finding alternatives...</p>
                                </div>
                            ) : alternatives ? (
                                <div className="space-y-4">
                                    {/* Annual Savings Tip */}
                                    {alternatives.annual_tip && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Calendar className="text-emerald-400 flex-shrink-0 mt-0.5" size={18} />
                                                <div>
                                                    <p className="font-medium text-emerald-400">
                                                        Save ₹{alternatives.annual_savings}/year
                                                    </p>
                                                    <p className="text-sm text-emerald-300/80">
                                                        {alternatives.annual_tip}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Alternatives List */}
                                    <div>
                                        <h3 className="text-sm font-medium text-zinc-400 mb-3">
                                            Alternative Services
                                        </h3>
                                        <div className="space-y-3">
                                            {alternatives.alternatives?.map((alt, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="p-4 bg-surface-800 rounded-xl"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-white">{alt.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white">₹{alt.estimated_cost}</span>
                                                            {alt.savings > 0 && (
                                                                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                                    <TrendingDown size={12} />
                                                                    ₹{alt.savings}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-zinc-400">{alt.reason}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bundle Tip */}
                                    {alternatives.bundle_tip && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Zap className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                                                <div>
                                                    <p className="font-medium text-amber-400">Bundle Opportunity</p>
                                                    <p className="text-sm text-amber-300/80">
                                                        {alternatives.bundle_tip}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-center text-zinc-500 py-8">
                                    Unable to fetch alternatives
                                </p>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default AlternativesModal;
