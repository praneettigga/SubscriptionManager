import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

function Insights({ subscriptions }) {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const totalMonthly = subscriptions.reduce((sum, sub) => {
        const cost = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost;
        return sum + cost;
    }, 0);

    // Generate mock historical data for chart
    const generateChartData = () => {
        const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
        return months.map((month, i) => ({
            month,
            spending: Math.max(0, totalMonthly + (Math.random() - 0.5) * 50 - (5 - i) * 10),
        }));
    };

    const [chartData] = useState(generateChartData());

    const fetchInsights = async () => {
        if (subscriptions.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptions }),
            });

            if (response.ok) {
                const data = await response.json();
                setInsights(data);
            } else {
                throw new Error('Failed to get AI insights');
            }
        } catch (err) {
            setError('Unable to fetch AI insights. Check your API connection.');
            // Provide fallback insights
            setInsights({
                recommendations: [
                    {
                        type: 'savings',
                        title: 'Switch to Annual Plans',
                        description: 'You could save up to 16% by switching eligible subscriptions to yearly billing.',
                    },
                    {
                        type: 'overlap',
                        title: 'Check for Overlapping Services',
                        description: 'Review your subscriptions for services that offer similar features.',
                    },
                    {
                        type: 'unused',
                        title: 'Review Usage',
                        description: 'Consider canceling subscriptions you haven\'t used in the last month.',
                    },
                ],
                summary: `You're spending $${totalMonthly.toFixed(2)}/month across ${subscriptions.length} subscriptions.`,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, [subscriptions.length]);

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Sparkles className="text-primary-400" />
                        AI Insights
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        Smart analysis of your subscription spending
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={fetchInsights}
                    disabled={loading}
                    className="flex items-center gap-2 bg-surface-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-5 rounded-xl transition-colors border border-zinc-700 disabled:opacity-50"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </motion.button>
            </div>

            {subscriptions.length === 0 ? (
                <div className="text-center py-16 glass rounded-2xl">
                    <Sparkles className="mx-auto text-zinc-500 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-white mb-2">
                        No data to analyze
                    </h3>
                    <p className="text-zinc-500">
                        Add some subscriptions to get AI-powered insights
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Spending Trend Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl p-6"
                    >
                        <h2 className="text-xl font-semibold text-white mb-6">
                            Spending Trend (Last 6 Months)
                        </h2>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                                    <XAxis dataKey="month" stroke="#71717a" />
                                    <YAxis stroke="#71717a" tickFormatter={(v) => `$${v}`} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#18181b',
                                            border: '1px solid #3f3f46',
                                            borderRadius: '12px',
                                        }}
                                        labelStyle={{ color: '#fafafa' }}
                                        formatter={(value) => [`$${value.toFixed(2)}`, 'Spending']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="spending"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                                        activeDot={{ r: 6, fill: '#a78bfa' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* AI Summary */}
                    {insights?.summary && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass rounded-2xl p-6"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="text-primary-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        Summary
                                    </h3>
                                    <p className="text-zinc-300">{insights.summary}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Recommendations */}
                    {insights?.recommendations && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass rounded-2xl p-6"
                        >
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Sparkles className="text-primary-400" size={20} />
                                Recommendations
                            </h2>
                            <div className="space-y-4">
                                {insights.recommendations.map((rec, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        className="p-4 bg-surface-800 rounded-xl border-l-4"
                                        style={{
                                            borderColor:
                                                rec.type === 'savings'
                                                    ? '#10b981'
                                                    : rec.type === 'overlap'
                                                        ? '#f59e0b'
                                                        : '#8b5cf6',
                                        }}
                                    >
                                        <h4 className="font-medium text-white mb-1">{rec.title}</h4>
                                        <p className="text-sm text-zinc-400">{rec.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Error State */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
                        >
                            <AlertTriangle className="text-amber-400" size={20} />
                            <p className="text-amber-300 text-sm">{error}</p>
                        </motion.div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="text-primary-400 animate-spin" size={32} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Insights;
