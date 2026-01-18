"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegistration = exports.createRegistration = void 0;
const firebase_js_1 = require("../config/firebase.js");
const createRegistration = async (req, res) => {
    try {
        const registrationData = req.body;
        // Validate required fields
        if (!registrationData.id || !registrationData.fullName || !registrationData.email) {
            return res.status(400).json({
                error: 'Missing required registration data'
            });
        }
        // Ensure paymentStatus is set to PENDING
        registrationData.paymentStatus = 'PENDING';
        // Save to Firestore
        await firebase_js_1.db.collection('registrations').doc(registrationData.id).set(registrationData);
        return res.status(201).json({
            message: 'Registration created successfully',
            registrationId: registrationData.id
        });
    }
    catch (error) {
        console.error('Registration creation error:', error);
        return res.status(500).json({
            error: 'Failed to create registration',
            message: error.message
        });
    }
};
exports.createRegistration = createRegistration;
const getRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                error: 'Registration ID is required'
            });
        }
        const docRef = firebase_js_1.db.collection('registrations').doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({
                error: 'Registration not found'
            });
        }
        const registrationData = docSnap.data();
        return res.status(200).json(registrationData);
    }
    catch (error) {
        console.error('Registration fetch error:', error);
        return res.status(500).json({
            error: 'Failed to fetch registration',
            message: error.message
        });
    }
};
exports.getRegistration = getRegistration;
