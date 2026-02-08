import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Insights from './pages/Insights';
import CalendarPage from './pages/Calendar';
import Simulator from './pages/Simulator';
import AddSubscriptionModal from './components/AddSubscriptionModal';

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [budget, setBudget] = useState(null);

    useEffect(() => {
        fetchSubscriptions();
        fetchSettings();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch('/api/subscriptions');
            if (response.ok) {
                const data = await response.json();
                setSubscriptions(data);
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setBudget(data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const updateBudget = async (monthlyBudget) => {
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ monthly_budget: monthlyBudget }),
            });
            if (response.ok) {
                const data = await response.json();
                setBudget(data);
            }
        } catch (error) {
            console.error('Error updating budget:', error);
        }
    };

    const addSubscription = async (subscription) => {
        try {
            const response = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription),
            });
            if (response.ok) {
                const newSub = await response.json();
                setSubscriptions([...subscriptions, newSub]);
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error adding subscription:', error);
        }
    };

    const deleteSubscription = async (id) => {
        try {
            const response = await fetch(`/api/subscriptions/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setSubscriptions(subscriptions.filter((s) => s.id !== id));
            }
        } catch (error) {
            console.error('Error deleting subscription:', error);
        }
    };

    return (
        <Router>
            <div className="flex min-h-screen bg-surface-950">
                <Sidebar onAddClick={() => setIsModalOpen(true)} />
                <main className="flex-1 p-8 ml-64">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Dashboard
                                    subscriptions={subscriptions}
                                    loading={loading}
                                    onAddClick={() => setIsModalOpen(true)}
                                    budget={budget}
                                    onUpdateBudget={updateBudget}
                                />
                            }
                        />
                        <Route
                            path="/subscriptions"
                            element={
                                <Subscriptions
                                    subscriptions={subscriptions}
                                    loading={loading}
                                    onDelete={deleteSubscription}
                                    onAddClick={() => setIsModalOpen(true)}
                                />
                            }
                        />
                        <Route
                            path="/insights"
                            element={<Insights subscriptions={subscriptions} />}
                        />
                        <Route
                            path="/calendar"
                            element={<CalendarPage subscriptions={subscriptions} />}
                        />
                        <Route
                            path="/simulator"
                            element={<Simulator subscriptions={subscriptions} />}
                        />
                    </Routes>
                </main>

                <AddSubscriptionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAdd={addSubscription}
                />
            </div>
        </Router>
    );
}

export default App;

