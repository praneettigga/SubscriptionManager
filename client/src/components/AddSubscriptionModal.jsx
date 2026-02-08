import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Users } from 'lucide-react';

const CATEGORIES = {
    entertainment: 'Entertainment',
    productivity: 'Productivity',
    utilities: 'Utilities',
    health: 'Health & Fitness',
    education: 'Education',
    other: 'Other',
};

const BILLING_CYCLES = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
];

function AddSubscriptionModal({ isOpen, onClose, onAdd }) {
    const [formData, setFormData] = useState({
        name: '',
        cost: '',
        billing_cycle: 'monthly',
        first_payment_date: '',
        category: 'other',
        status: 'active',
        is_shared: false,
        shared_with: 1,
    });
    const [aiSuggesting, setAiSuggesting] = useState(false);
    const [aiTip, setAiTip] = useState('');

    // Debounced AI suggestion for category
    useEffect(() => {
        if (formData.name.length < 3) {
            setAiTip('');
            return;
        }

        const timer = setTimeout(async () => {
            setAiSuggesting(true);
            try {
                const response = await fetch('/api/ai/categorize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serviceName: formData.name }),
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.category && CATEGORIES[data.category]) {
                        setFormData((prev) => ({ ...prev, category: data.category }));
                    }
                    if (data.tip) {
                        setAiTip(data.tip);
                    }
                }
            } catch (error) {
                console.error('AI suggestion error:', error);
            } finally {
                setAiSuggesting(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.name]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.cost) return;

        onAdd({
            ...formData,
            cost: parseFloat(formData.cost),
            is_shared: formData.is_shared,
            shared_with: formData.is_shared ? parseInt(formData.shared_with) : 1,
        });

        // Reset form
        setFormData({
            name: '',
            cost: '',
            billing_cycle: 'monthly',
            first_payment_date: '',
            category: 'other',
            status: 'active',
            is_shared: false,
            shared_with: 1,
        });
        setAiTip('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

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
                        <div className="glass rounded-2xl p-6 mx-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">
                                    Add Subscription
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Service Name */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Service Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Netflix, Spotify"
                                            className="w-full bg-surface-800 border border-zinc-700 rounded-xl py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-primary-500 transition-colors"
                                            required
                                        />
                                        {aiSuggesting && (
                                            <Loader2
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 animate-spin"
                                                size={18}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* AI Tip */}
                                {aiTip && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-start gap-2 p-3 bg-primary-600/10 border border-primary-600/30 rounded-xl"
                                    >
                                        <Sparkles className="text-primary-400 flex-shrink-0 mt-0.5" size={16} />
                                        <p className="text-sm text-primary-300">{aiTip}</p>
                                    </motion.div>
                                )}

                                {/* Cost and Billing Cycle */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            Cost
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                                ₹
                                            </span>
                                            <input
                                                type="number"
                                                name="cost"
                                                value={formData.cost}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                className="w-full bg-surface-800 border border-zinc-700 rounded-xl py-3 pl-8 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-primary-500 transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            Billing Cycle
                                        </label>
                                        <select
                                            name="billing_cycle"
                                            value={formData.billing_cycle}
                                            onChange={handleChange}
                                            className="w-full bg-surface-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
                                        >
                                            {BILLING_CYCLES.map((cycle) => (
                                                <option key={cycle.value} value={cycle.value}>
                                                    {cycle.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* First Payment Date */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        First Payment Date
                                    </label>
                                    <input
                                        type="date"
                                        name="first_payment_date"
                                        value={formData.first_payment_date}
                                        onChange={handleChange}
                                        className="w-full bg-surface-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Category
                                        {aiSuggesting && (
                                            <span className="ml-2 text-xs text-primary-400">
                                                AI suggesting...
                                            </span>
                                        )}
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-surface-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
                                    >
                                        {Object.entries(CATEGORIES).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Shared Subscription */}
                                <div className="p-4 bg-surface-800 rounded-xl border border-zinc-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Users size={18} className="text-zinc-400" />
                                            <div>
                                                <p className="text-sm font-medium text-white">Shared Subscription</p>
                                                <p className="text-xs text-zinc-500">Split cost with others</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                is_shared: !prev.is_shared,
                                                shared_with: prev.is_shared ? 1 : 2
                                            }))}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${formData.is_shared ? 'bg-primary-600' : 'bg-zinc-700'
                                                }`}
                                        >
                                            <span
                                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_shared ? 'left-7' : 'left-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {formData.is_shared && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 pt-4 border-t border-zinc-700"
                                        >
                                            <label className="block text-sm text-zinc-400 mb-2">
                                                Split between how many people?
                                            </label>
                                            <div className="flex items-center gap-3">
                                                {[2, 3, 4, 5].map((num) => (
                                                    <button
                                                        key={num}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, shared_with: num }))}
                                                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${formData.shared_with === num
                                                                ? 'bg-primary-600 text-white'
                                                                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                                            }`}
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                            </div>
                                            {formData.cost && (
                                                <p className="mt-3 text-sm text-primary-400">
                                                    Your share: ₹{(parseFloat(formData.cost) / formData.shared_with).toFixed(2)}/
                                                    {formData.billing_cycle === 'yearly' ? 'yr' : 'mo'}
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </div>

                                {/* Submit */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-3 px-4 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors"
                                    >
                                        Add Subscription
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default AddSubscriptionModal;
