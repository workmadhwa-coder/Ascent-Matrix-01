"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSponsorship = void 0;
const firebase_js_1 = require("../config/firebase.js");
const createSponsorship = async (req, res) => {
    try {
        const sponsorshipData = req.body;
        // Validate required fields
        if (!sponsorshipData.id || !sponsorshipData.companyName || !sponsorshipData.email) {
            return res.status(400).json({
                error: 'Missing required sponsorship data'
            });
        }
        // Save to Firestore
        await firebase_js_1.db.collection('sponsorships').doc(sponsorshipData.id).set(sponsorshipData);
        return res.status(201).json({
            message: 'Sponsorship inquiry created successfully',
            inquiryId: sponsorshipData.id
        });
    }
    catch (error) {
        console.error('Sponsorship creation error:', error);
        return res.status(500).json({
            error: 'Failed to create sponsorship inquiry',
            message: error.message
        });
    }
};
exports.createSponsorship = createSponsorship;
