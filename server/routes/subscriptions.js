const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET all subscriptions
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// GET single subscription
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Subscription not found' });

        res.json(data);
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ error: 'Failed to fetch subscription' });
    }
});

// POST new subscription
router.post('/', async (req, res) => {
    try {
        const { name, cost, billing_cycle, first_payment_date, category, status, is_shared, shared_with } = req.body;

        if (!name || cost === undefined) {
            return res.status(400).json({ error: 'Name and cost are required' });
        }

        const { data, error } = await supabase
            .from('subscriptions')
            .insert([
                {
                    name,
                    cost: parseFloat(cost),
                    billing_cycle: billing_cycle || 'monthly',
                    first_payment_date: first_payment_date || null,
                    category: category || 'other',
                    status: status || 'active',
                    is_shared: is_shared || false,
                    shared_with: shared_with || 1,
                },
            ])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

// PUT update subscription
router.put('/:id', async (req, res) => {
    try {
        const { name, cost, billing_cycle, first_payment_date, category, status, is_shared, shared_with } = req.body;

        const { data, error } = await supabase
            .from('subscriptions')
            .update({
                name,
                cost: cost !== undefined ? parseFloat(cost) : undefined,
                billing_cycle,
                first_payment_date,
                category,
                status,
                is_shared: is_shared !== undefined ? is_shared : undefined,
                shared_with: shared_with !== undefined ? shared_with : undefined,
                updated_at: new Date().toISOString(),
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Subscription not found' });

        res.json(data);
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ error: 'Failed to update subscription' });
    }
});

// DELETE subscription
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        console.error('Error deleting subscription:', error);
        res.status(500).json({ error: 'Failed to delete subscription' });
    }
});

module.exports = router;
