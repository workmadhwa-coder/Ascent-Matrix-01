"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.volunteerCheckIn = void 0;
const firebase_js_1 = require("../config/firebase.js");
const volunteerCheckIn = async (req, res) => {
    const { ticketId } = req.body;
    try {
        const docRef = firebase_js_1.db.collection('registrations').doc(ticketId);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Ticket ID not found' });
        }
        const data = doc.data();
        if (data?.paymentStatus !== 'PAID') {
            return res.status(403).json({ message: 'Unpaid pass. Admission denied.' });
        }
        if (data?.checkedIn) {
            return res.status(400).json({ message: 'Pass already scanned and checked in.' });
        }
        await docRef.update({ checkedIn: true, checkInTime: new Date().toISOString() });
        res.status(200).json({ status: 'success', message: 'Check-in successful', delegate: data.fullName });
    }
    catch (error) {
        res.status(500).json({ error: 'Check-in failed' });
    }
};
exports.volunteerCheckIn = volunteerCheckIn;
