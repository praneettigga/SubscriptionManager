const express = require('express');
const router = express.Router();
const axios = require('axios');

// Groq API for LLM inference
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

// Optional: Scaledown for prompt compression
const SCALEDOWN_API_KEY = process.env.SCALEDOWN_API_KEY;
const SCALEDOWN_BASE_URL = 'https://api.scaledown.xyz';

// Helper function to compress prompts with Scaledown (optional)
async function compressPrompt(context, prompt) {
    if (!SCALEDOWN_API_KEY) return { context, prompt };

    try {
        const response = await axios.post(
            `${SCALEDOWN_BASE_URL}/compress/raw/`,
            {
                context,
                prompt,
                scaledown: { rate: 'auto' }
            },
            {
                headers: {
                    'x-api-key': SCALEDOWN_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        return {
            context: response.data.compressed_context || context,
            prompt: response.data.compressed_prompt || prompt
        };
    } catch (error) {
        console.log('Scaledown compression skipped:', error.message);
        return { context, prompt };
    }
}

// Helper function to parse JSON from AI responses (handles markdown code blocks)
function parseAIResponse(responseText) {
    if (!responseText) return null;

    // Try parsing directly first
    try {
        return JSON.parse(responseText);
    } catch {
        // If direct parsing fails, try to extract JSON from markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1].trim());
            } catch {
                // Still failed
            }
        }

        // Try to find JSON object/array pattern
        const objectMatch = responseText.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            try {
                return JSON.parse(objectMatch[0]);
            } catch {
                // Still failed
            }
        }

        return null;
    }
}

// Known service categories for fallback
const SERVICE_CATEGORIES = {
    netflix: 'entertainment',
    spotify: 'entertainment',
    'disney+': 'entertainment',
    'disney plus': 'entertainment',
    hulu: 'entertainment',
    'hbo max': 'entertainment',
    'prime video': 'entertainment',
    'amazon prime': 'entertainment',
    youtube: 'entertainment',
    twitch: 'entertainment',
    crunchyroll: 'entertainment',
    'apple tv': 'entertainment',
    'apple music': 'entertainment',

    notion: 'productivity',
    slack: 'productivity',
    asana: 'productivity',
    trello: 'productivity',
    monday: 'productivity',
    todoist: 'productivity',
    evernote: 'productivity',
    dropbox: 'productivity',
    'google one': 'productivity',
    icloud: 'productivity',
    '1password': 'productivity',
    lastpass: 'productivity',
    zoom: 'productivity',

    'aws': 'utilities',
    'google cloud': 'utilities',
    azure: 'utilities',
    digitalocean: 'utilities',
    vercel: 'utilities',
    netlify: 'utilities',
    heroku: 'utilities',
    cloudflare: 'utilities',

    peloton: 'health',
    headspace: 'health',
    calm: 'health',
    fitbit: 'health',
    'apple fitness': 'health',
    strava: 'health',

    coursera: 'education',
    udemy: 'education',
    skillshare: 'education',
    masterclass: 'education',
    duolingo: 'education',
    linkedin: 'education',
    pluralsight: 'education',
};

// POST /api/ai/categorize - Suggest category for a service name
router.post('/categorize', async (req, res) => {
    try {
        const { serviceName } = req.body;

        if (!serviceName) {
            return res.status(400).json({ error: 'Service name is required' });
        }

        // Check local mapping first
        const lowerName = serviceName.toLowerCase();
        for (const [key, category] of Object.entries(SERVICE_CATEGORIES)) {
            if (lowerName.includes(key)) {
                return res.json({
                    category,
                    tip: `Recognized as a ${category} service.`,
                    source: 'local',
                });
            }
        }

        // If no local match, use AI (Groq)
        if (!GROQ_API_KEY) {
            return res.json({
                category: 'other',
                tip: 'AI categorization unavailable. Please select a category manually.',
                source: 'fallback',
            });
        }

        const systemPrompt = `You are a subscription categorization assistant. Given a service name, respond with ONLY a JSON object containing:
1. "category": one of these exact values: "entertainment", "productivity", "utilities", "health", "education", "other"
2. "tip": a brief helpful tip about this service (max 100 chars)

Example response:
{"category": "entertainment", "tip": "Consider the annual plan to save 2 months."}`;

        const userPrompt = `Categorize this subscription service: "${serviceName}"`;

        // Optional: Compress prompts with Scaledown
        const compressed = await compressPrompt(systemPrompt, userPrompt);

        const response = await axios.post(
            `${GROQ_BASE_URL}/chat/completions`,
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: compressed.context },
                    { role: 'user', content: compressed.prompt },
                ],
                max_tokens: 100,
                temperature: 0.3,
            },
            {
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const aiResponse = response.data.choices[0]?.message?.content;
        const parsed = parseAIResponse(aiResponse);

        if (parsed && parsed.category) {
            return res.json({
                ...parsed,
                source: 'ai',
            });
        } else {
            return res.json({
                category: 'other',
                tip: 'Unable to categorize. Please select manually.',
                source: 'ai',
            });
        }
    } catch (error) {
        console.error('AI categorization error:', error.response?.data || error.message);
        res.json({
            category: 'other',
            tip: 'Could not reach AI service. Please select manually.',
            source: 'error',
        });
    }
});

// POST /api/ai/analyze - Analyze spending and provide recommendations
router.post('/analyze', async (req, res) => {
    try {
        const { subscriptions } = req.body;

        if (!subscriptions || !Array.isArray(subscriptions)) {
            return res.status(400).json({ error: 'Subscriptions array is required' });
        }

        const totalMonthly = subscriptions.reduce((sum, sub) => {
            const cost = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost;
            return sum + cost;
        }, 0);

        // If no API key, provide basic analysis
        if (!GROQ_API_KEY) {
            return res.json({
                summary: `You're spending ₹${totalMonthly.toFixed(2)}/month across ${subscriptions.length} subscriptions.`,
                recommendations: [
                    {
                        type: 'savings',
                        title: 'Consider Annual Plans',
                        description: 'Switching to yearly billing often saves 15-20% on subscription costs.',
                    },
                    {
                        type: 'overlap',
                        title: 'Review Similar Services',
                        description: 'Check if any of your subscriptions offer overlapping features.',
                    },
                    {
                        type: 'unused',
                        title: 'Track Your Usage',
                        description: 'Cancel subscriptions you haven\'t used in the last 30 days.',
                    },
                ],
            });
        }

        // Use AI for detailed analysis
        const subscriptionSummary = subscriptions
            .map((s) => `${s.name}: ₹${s.cost}/${s.billing_cycle === 'yearly' ? 'year' : 'month'} (${s.category})`)
            .join('\n');

        const systemPrompt = `You are a financial advisor specializing in subscription management. Analyze the user's subscriptions and provide actionable insights. Respond with ONLY a JSON object containing:
1. "summary": A 1-2 sentence summary of their spending
2. "recommendations": An array of 3 objects, each with:
   - "type": one of "savings", "overlap", or "unused"
   - "title": Short title (max 50 chars)
   - "description": Actionable advice (max 150 chars)

Be specific and reference their actual subscriptions when possible.`;

        const userPrompt = `Analyze these subscriptions:\n${subscriptionSummary}\n\nTotal monthly: ₹${totalMonthly.toFixed(2)}`;

        // Optional: Compress prompts with Scaledown
        const compressed = await compressPrompt(systemPrompt, userPrompt);

        const response = await axios.post(
            `${GROQ_BASE_URL}/chat/completions`,
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: compressed.context },
                    { role: 'user', content: compressed.prompt },
                ],
                max_tokens: 500,
                temperature: 0.5,
            },
            {
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const aiResponse = response.data.choices[0]?.message?.content;
        const parsed = parseAIResponse(aiResponse);

        if (parsed && parsed.recommendations) {
            return res.json(parsed);
        } else {
            // Fallback if parsing failed
            return res.json({
                summary: `You're spending ₹${totalMonthly.toFixed(2)}/month across ${subscriptions.length} subscriptions.`,
                recommendations: [
                    {
                        type: 'savings',
                        title: 'Consider Annual Plans',
                        description: 'Switching to yearly billing often saves 15-20% on subscription costs.',
                    },
                    {
                        type: 'overlap',
                        title: 'Review Similar Services',
                        description: 'Check if any of your subscriptions offer overlapping features.',
                    },
                    {
                        type: 'unused',
                        title: 'Track Your Usage',
                        description: 'Cancel subscriptions you haven\'t used in the last 30 days.',
                    },
                ],
            });
        }
    } catch (error) {
        console.error('AI analysis error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to analyze subscriptions' });
    }
});

// POST /api/ai/alternatives - Get alternative subscription suggestions
router.post('/alternatives', async (req, res) => {
    try {
        const { subscription } = req.body;

        if (!subscription || !subscription.name) {
            return res.status(400).json({ error: 'Subscription data is required' });
        }

        // Calculate potential annual savings if switching from monthly
        let annualSavings = null;
        if (subscription.billing_cycle === 'monthly') {
            // Typically 2 months free with annual = ~16.67% savings
            annualSavings = (subscription.cost * 12 * 0.1667).toFixed(0);
        }

        // If no API key, provide basic suggestions
        if (!GROQ_API_KEY) {
            return res.json({
                alternatives: [
                    {
                        name: 'Generic Alternative',
                        estimated_cost: Math.floor(subscription.cost * 0.7),
                        savings: Math.floor(subscription.cost * 0.3),
                        reason: 'Consider exploring free or lower-cost alternatives in this category.',
                    },
                ],
                bundle_tip: 'Check if any of your other subscriptions offer bundled access to similar services.',
                annual_savings: annualSavings,
                annual_tip: annualSavings ? `Switching to annual billing could save you ~₹${annualSavings}/year` : null,
            });
        }

        // Use AI for detailed alternatives
        const systemPrompt = `You are a subscription advisor helping users save money. Given a subscription service, suggest alternatives and savings opportunities. Respond with ONLY a JSON object containing:
1. "alternatives": An array of 2-3 objects with:
   - "name": Alternative service name
   - "estimated_cost": Monthly cost in INR (number)
   - "savings": Monthly savings vs current service (number)
   - "reason": Why this is a good alternative (max 80 chars)
2. "bundle_tip": A tip about bundling opportunities (max 100 chars, or null)
3. "annual_savings": Estimated yearly savings if switching to annual plan (number, or null)
4. "annual_tip": Advice about annual billing (max 80 chars, or null)

Focus on real, practical alternatives available in India.`;

        const userPrompt = `Find alternatives for: ${subscription.name} (₹${subscription.cost}/${subscription.billing_cycle}, Category: ${subscription.category})`;

        const compressed = await compressPrompt(systemPrompt, userPrompt);

        const response = await axios.post(
            `${GROQ_BASE_URL}/chat/completions`,
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: compressed.context },
                    { role: 'user', content: compressed.prompt },
                ],
                max_tokens: 500,
                temperature: 0.5,
            },
            {
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const aiResponse = response.data.choices[0]?.message?.content;
        const parsed = parseAIResponse(aiResponse);

        if (parsed && parsed.alternatives) {
            // Add annual savings if not provided by AI
            if (!parsed.annual_savings && annualSavings) {
                parsed.annual_savings = parseInt(annualSavings);
                parsed.annual_tip = `Switching to annual billing could save you ~₹${annualSavings}/year`;
            }
            return res.json(parsed);
        } else {
            // Fallback response
            return res.json({
                alternatives: [
                    {
                        name: 'Free tier options',
                        estimated_cost: 0,
                        savings: subscription.cost,
                        reason: 'Many services offer free tiers with limited features.',
                    },
                ],
                bundle_tip: 'Check for bundle deals that include this service.',
                annual_savings: annualSavings,
                annual_tip: annualSavings ? `Annual billing could save ~₹${annualSavings}/year` : null,
            });
        }
    } catch (error) {
        console.error('AI alternatives error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to get alternatives' });
    }
});

module.exports = router;
