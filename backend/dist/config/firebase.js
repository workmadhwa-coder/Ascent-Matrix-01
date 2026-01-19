"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.db = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
// Ensure .env is loaded BEFORE this file runs
// (Best loaded once in server.ts, but safe here too)
require("dotenv/config");
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is missing in .env');
}
// Parse service account
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// 🔥 CRITICAL FIX: restore newlines in private_key
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
    });
}
exports.db = firebase_admin_1.default.firestore();
exports.db.settings({ ignoreUndefinedProperties: true });
