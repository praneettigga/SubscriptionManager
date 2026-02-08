import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, TrendingDown, Sparkles, X } from 'lucide-react';

function SavingsToast({ isVisible, savings, message, onClose }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <div className="glass rounded-2xl p-4 pr-12 min-w-[300px] border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-start gap-3">
                            <motion.div
                                initial={{ rotate: -15, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    delay: 0.2
                                }}
                                className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0"
                            >
                                <PartyPopper className="text-emerald-400" size={20} />
                            </motion.div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-white">Great Savings!</h4>
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-center gap-1 text-sm text-emerald-400 font-medium"
                                    >
                                        <TrendingDown size={14} />
                                        ₹{savings}
                                    </motion.span>
                                </div>
                                <p className="text-sm text-zinc-400">{message}</p>
                            </div>
                        </div>

                        {/* Animated confetti dots */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{
                                        opacity: 0,
                                        scale: 0,
                                        x: '50%',
                                        y: '50%'
                                    }}
                                    animate={{
                                        opacity: [0, 1, 0],
                                        scale: [0, 1.5, 0],
                                        x: `${Math.random() * 100}%`,
                                        y: `${Math.random() * 100}%`
                                    }}
                                    transition={{
                                        duration: 1,
                                        delay: i * 0.08,
                                        ease: 'easeOut'
                                    }}
                                    className="absolute w-2 h-2 rounded-full"
                                    style={{
                                        backgroundColor: ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][i % 4]
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default SavingsToast;
