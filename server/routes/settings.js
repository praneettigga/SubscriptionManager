const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET user settings
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        // Return settings or defaults
        res.json(data || {
            monthly_budget: null,
            alert_threshold: 80,
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// PUT update user settings
router.put('/', async (req, res) => {
    try {
        const { monthly_budget, alert_threshold } = req.body;

        // Check if settings exist
        const { data: existing } = await supabase
            .from('user_settings')
            .select('id')
            .limit(1)
            .single();

        let result;

        if (existing) {
            // Update existing
            result = await supabase
                .from('user_settings')
                .update({
                    monthly_budget: monthly_budget !== undefined ? parseFloat(monthly_budget) : null,
                    alert_threshold: alert_threshold !== undefined ? parseInt(alert_threshold) : 80,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id)
                .select()
                .single();
        } else {
            // Insert new
            result = await supabase
                .from('user_settings')
                .insert([{
                    monthly_budget: monthly_budget !== undefined ? parseFloat(monthly_budget) : null,
                    alert_threshold: alert_threshold !== undefined ? parseInt(alert_threshold) : 80,
                }])
                .select()
                .single();
        }

        if (result.error) throw result.error;
        res.json(result.data);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router;
