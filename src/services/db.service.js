/**
 * Hybrid Database Service Layer
 * 
 * Strategy:
 *   - MongoDB is the PRIMARY database (source of truth)
 *   - InsForge SDK is SECONDARY (background sync + fallback)
 *   - All writes go to MongoDB first, then sync to InsForge in background
 *   - All reads go to MongoDB first, fall back to InsForge if empty/error
 *   - If InsForge returns data not in MongoDB, it's cached into MongoDB
 */

const { isMongoConnected } = require('../config/mongodb');
const { insforge } = require('../config/insforge');

// Mongoose Models
const Admin = require('../models/Admin');
const Member = require('../models/Member');
const Otp = require('../models/Otp');
const Contact = require('../models/Contact');
const Subscriber = require('../models/Subscriber');
const SiteStat = require('../models/SiteStat');

// ─── HELPER: Background sync to InsForge (fire-and-forget) ────────────────
async function syncToInsforge(table, data) {
    if (!insforge) return;
    try {
        const { error } = await insforge.database.from(table).upsert(Array.isArray(data) ? data : [data]);
        if (error) {
            console.warn(`[Sync] InsForge ${table} sync failed:`, error.message);
        }
    } catch (err) {
        console.warn(`[Sync] InsForge ${table} sync error:`, err.message);
    }
}

async function syncDeleteToInsforge(table, field, value) {
    if (!insforge) return;
    try {
        const { error } = await insforge.database.from(table).delete().eq(field, value);
        if (error) {
            console.warn(`[Sync] InsForge ${table} delete sync failed:`, error.message);
        }
    } catch (err) {
        console.warn(`[Sync] InsForge ${table} delete sync error:`, err.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Find admin by email. MongoDB first, InsForge fallback.
 * If found in InsForge but not in MongoDB, caches it.
 */
async function findAdminByEmail(email) {
    email = email.trim().toLowerCase();

    // 1. Try MongoDB
    if (isMongoConnected()) {
        try {
            const admin = await Admin.findOne({ email }).lean();
            if (admin) return admin;
        } catch (err) {
            console.error('[DB] MongoDB admin lookup failed:', err.message);
        }
    }

    // 2. Fallback to InsForge
    if (insforge) {
        try {
            const { data, error } = await insforge.database.from('admins').select('*').eq('email', email).single();
            if (!error && data) {
                // Cache into MongoDB for next time
                if (isMongoConnected()) {
                    Admin.findOneAndUpdate({ email }, data, { upsert: true, new: true })
                        .catch(err => console.warn('[Sync] Failed to cache admin in MongoDB:', err.message));
                }
                return data;
            }
        } catch (err) {
            console.warn('[DB] InsForge admin fallback failed (cold start?):', err.message);
        }
    }

    return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// OTP OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

async function upsertOtp(data) {
    const email = data.email.trim().toLowerCase();
    const otpData = { ...data, email };

    // 1. Try MongoDB
    if (isMongoConnected()) {
        try {
            await Otp.findOneAndUpdate(
                { email },
                otpData,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            // 2. Background sync to InsForge
            syncToInsforge('otps', otpData);
            return { success: true };
        } catch (err) {
            console.error('[DB] MongoDB OTP upsert failed:', err.message);
        }
    }

    // 3. Fallback to InsForge
    if (insforge) {
        try {
            const { error } = await insforge.database.from('otps').upsert(otpData);
            if (error) {
                console.error('[DB] InsForge OTP upsert also failed:', error.message);
                return { success: false, error };
            }
            return { success: true, source: 'insforge' };
        } catch (err) {
            console.warn('[DB] InsForge OTP fallback failed (cold start?):', err.message);
            return { success: false, error: err.message };
        }
    }

    return { success: false, error: 'No database available' };
}

async function findOtpByEmail(email) {
    email = email.trim().toLowerCase();

    // 1. Try MongoDB
    if (isMongoConnected()) {
        try {
            const otp = await Otp.findOne({ email }).lean();
            if (otp) return otp;
        } catch (err) {
            console.error('[DB] MongoDB OTP lookup failed:', err.message);
        }
    }

    // 2. Fallback to InsForge
    if (insforge) {
        try {
            const { data, error } = await insforge.database.from('otps').select('*').eq('email', email).single();
            if (!error && data) {
                // Cache into MongoDB
                if (isMongoConnected()) {
                    Otp.findOneAndUpdate({ email }, data, { upsert: true })
                        .catch(err => console.warn('[Sync] Failed to cache OTP in MongoDB:', err.message));
                }
                return data;
            }
        } catch (err) {
            console.warn('[DB] InsForge OTP lookup fallback failed (cold start?):', err.message);
        }
    }

    return null;
}

async function updateOtpVerified(email) {
    email = email.trim().toLowerCase();

    if (isMongoConnected()) {
        try {
            await Otp.findOneAndUpdate({ email }, { verified: true });
        } catch (err) {
            console.error('[DB] MongoDB OTP verify update failed:', err.message);
        }
    }

    // Sync to InsForge
    if (insforge) {
        try {
            const { error } = await insforge.database.from('otps').update({ verified: true }).eq('email', email);
            if (error) {
                console.warn('[Sync] InsForge OTP verify sync failed:', error.message);
            }
        } catch (err) {
            console.warn('[Sync] InsForge OTP verify sync error:', err.message);
        }
    }
}

async function deleteOtpByEmail(email) {
    email = email.trim().toLowerCase();

    if (isMongoConnected()) {
        try {
            await Otp.deleteOne({ email });
        } catch (err) {
            console.error('[DB] MongoDB OTP delete failed:', err.message);
        }
    }

    syncDeleteToInsforge('otps', 'email', email);
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMBER OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

async function insertMember(data) {
    // 1. Try MongoDB
    if (isMongoConnected()) {
        try {
            const doc = await Member.create(data);
            // 2. Background sync to InsForge
            syncToInsforge('members', data);
            return doc;
        } catch (err) {
            console.error('[DB] MongoDB member insert failed:', err.message);
        }
    }

    // 3. Fallback to InsForge
    if (insforge) {
        try {
            const { data: result, error } = await insforge.database.from('members').insert([data]);
            if (error) {
                console.error('[DB] InsForge member insert also failed:', error.message);
                throw new Error('Failed to save member data');
            }
            return result;
        } catch (err) {
            console.error('[DB] InsForge member fallback failed (cold start?):', err.message);
            throw new Error('Failed to save member data');
        }
    }

    throw new Error('No database available to save member');
}

async function upsertMember(data, conflictField = 'payment_id') {
    // 1. Try MongoDB
    if (isMongoConnected()) {
        try {
            const filter = {};
            filter[conflictField] = data[conflictField];
            
            const doc = await Member.findOneAndUpdate(
                filter,
                data,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            // 2. Background sync to InsForge
            syncToInsforge('members', data);
            return doc;
        } catch (err) {
            console.error('[DB] MongoDB member upsert failed:', err.message);
        }
    }

    // 3. Fallback to InsForge
    if (insforge) {
        try {
            const { data: result, error } = await insforge.database
                .from('members')
                .upsert([data], { onConflict: conflictField });
            if (error) {
                console.error('[DB] InsForge member upsert also failed:', error.message);
                throw new Error('Failed to save member data');
            }
            return result;
        } catch (err) {
            console.error('[DB] InsForge member upsert fallback failed (cold start?):', err.message);
            throw new Error('Failed to save member data');
        }
    }

    throw new Error('No database available to save member');
}

async function findMemberByPaymentId(paymentId) {
    // 1. Try MongoDB
    if (isMongoConnected()) {
        try {
            const member = await Member.findOne({ payment_id: paymentId }).lean();
            if (member) return member;
        } catch (err) {
            console.error('[DB] MongoDB member lookup failed:', err.message);
        }
    }

    // 2. Fallback to InsForge
    if (insforge) {
        try {
            const { data, error } = await insforge.database.from('members').select('name, planId, status, email').eq('payment_id', paymentId).single();
            if (!error && data) {
                // Cache into MongoDB
                if (isMongoConnected()) {
                    Member.findOneAndUpdate({ payment_id: paymentId }, data, { upsert: true })
                        .catch(err => console.warn('[Sync] Failed to cache member in MongoDB:', err.message));
                }
                return data;
            }
        } catch (err) {
            console.warn('[DB] InsForge member lookup fallback failed (cold start?):', err.message);
        }
    }

    return null;
}

async function findMemberByEmail(email) {
    email = email.trim().toLowerCase();

    // 1. Try MongoDB
    if (isMongoConnected()) {
        try {
            // Get all records for this email (could be multiple if they tried multiple times)
            const members = await Member.find({ email }).lean();
            if (members && members.length > 0) {
                // Return an active one if exists, else just the first one
                const active = members.find(m => m.status === 'Active');
                return active || members[0];
            }
        } catch (err) {
            console.error('[DB] MongoDB member lookup by email failed:', err.message);
        }
    }

    // 2. Fallback to InsForge
    if (insforge) {
        try {
            const { data, error } = await insforge.database.from('members').select('*').eq('email', email);
            if (!error && data && data.length > 0) {
                const active = data.find(m => m.status === 'Active');
                return active || data[0];
            }
        } catch (err) {
            console.warn('[DB] InsForge member email lookup fallback failed (cold start?):', err.message);
        }
    }

    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURED LIFETIME MEMBERS
// ─────────────────────────────────────────────────────────────────────────────

async function getActiveLifetimeMembers() {
    // 1. Try MongoDB
    if (isMongoConnected()) {
        try {
            const members = await Member.find({ planId: 'lifetime', status: 'Active' })
                .select('name created_at')
                .sort({ created_at: -1 })
                .lean();
            if (members && members.length > 0) {
                return members.map(m => ({ name: m.name, created_at: m.created_at }));
            }
        } catch (err) {
            console.error('[DB] MongoDB active lifetime members lookup failed:', err.message);
        }
    }

    // 2. Fallback to InsForge
    if (insforge) {
        try {
            const { data, error } = await insforge.database
                .from('members')
                .select('name, created_at')
                .eq('planId', 'lifetime')
                .eq('status', 'Active')
                .order('created_at', { ascending: false });
            if (!error && data) {
                return data.map(m => ({ name: m.name, created_at: m.created_at }));
            }
        } catch (err) {
            console.warn('[DB] InsForge active lifetime members fallback failed:', err.message);
        }
    }

    return [];
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

async function insertContact(data) {
    // 1. Try MongoDB
    if (isMongoConnected()) {
        try {
            const doc = await Contact.create(data);
            syncToInsforge('contacts', data);
            return doc;
        } catch (err) {
            console.error('[DB] MongoDB contact insert failed:', err.message);
        }
    }

    // 2. Fallback to InsForge
    if (insforge) {
        try {
            const { error } = await insforge.database.from('contacts').insert([data]);
            if (error) {
                console.error('[DB] InsForge contact insert also failed:', error.message);
            }
        } catch (err) {
            console.warn('[DB] InsForge contact fallback failed (cold start?):', err.message);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBSCRIBER OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Insert newsletter subscriber. MongoDB first, InsForge sync.
 * Returns null if the email already exists (duplicate).
 */
async function insertSubscriber(data) {
    // 1. Try MongoDB
    if (isMongoConnected()) {
        try {
            // Check if already subscribed
            const existing = await Subscriber.findOne({ email: data.email }).lean();
            if (existing) return null;

            const doc = await Subscriber.create(data);
            syncToInsforge('subscribers', data);
            return doc;
        } catch (err) {
            // Handle duplicate key error (race condition)
            if (err.code === 11000) return null;
            console.error('[DB] MongoDB subscriber insert failed:', err.message);
        }
    }

    // 2. Fallback to InsForge
    if (insforge) {
        try {
            const { error } = await insforge.database.from('subscribers').insert([data]);
            if (error) {
                // Duplicate in InsForge
                if (error.message && error.message.includes('duplicate')) return null;
                console.error('[DB] InsForge subscriber insert also failed:', error.message);
            }
        } catch (err) {
            console.warn('[DB] InsForge subscriber fallback failed (cold start?):', err.message);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SITE STATS OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

async function getSiteStats() {
    // 1. Try MongoDB
    if (isMongoConnected()) {
        try {
            const stats = await SiteStat.find({}).lean();
            if (stats && stats.length > 0) return stats;
        } catch (err) {
            console.error('[DB] MongoDB site_stats read failed:', err.message);
        }
    }

    // 2. Fallback to InsForge
    if (insforge) {
        try {
            const { data, error } = await insforge.database.from('site_stats').select('*');
            if (!error && data && data.length > 0) {
                // Cache into MongoDB
                if (isMongoConnected()) {
                    const ops = data.map(row => ({
                        updateOne: {
                            filter: { key: row.key },
                            update: { $set: row },
                            upsert: true
                        }
                    }));
                    SiteStat.bulkWrite(ops).catch(err =>
                        console.warn('[Sync] Failed to cache site_stats in MongoDB:', err.message)
                    );
                }
                return data;
            }
        } catch (err) {
            console.warn('[DB] InsForge site_stats fallback failed (cold start?):', err.message);
        }
    }

    return [];
}

async function upsertSiteStats(statsArray) {
    // statsArray = [{ key: 'visitors', value: 123 }, { key: 'pv_/index', value: 45 }, ...]
    if (!Array.isArray(statsArray)) statsArray = [statsArray];

    // 1. Try MongoDB
    if (isMongoConnected()) {
        try {
            const ops = statsArray.map(stat => ({
                updateOne: {
                    filter: { key: stat.key },
                    update: { $set: { key: stat.key, value: stat.value } },
                    upsert: true
                }
            }));
            await SiteStat.bulkWrite(ops);
        } catch (err) {
            console.error('[DB] MongoDB site_stats write failed:', err.message);
        }
    }

    // 2. Sync to InsForge in background
    if (insforge) {
        try {
            const { error } = await insforge.database.from('site_stats').upsert(statsArray);
            if (error) {
                console.warn('[Sync] InsForge site_stats sync failed:', error.message);
            }
        } catch (err) {
            console.warn('[Sync] InsForge site_stats sync error:', err.message);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD — AGGREGATED STATS
// ═══════════════════════════════════════════════════════════════════════════

async function getAdminStats() {
    // 1. Try MongoDB
    if (isMongoConnected()) {
        try {
            const [
                statsData,
                contacts,
                subscribers,
                memberships,
                contactsCount,
                subsCount,
                memsCount
            ] = await Promise.all([
                SiteStat.find({}).lean(),
                Contact.find({}).sort({ created_at: -1 }).limit(5).lean(),
                Subscriber.find({}).sort({ subscribed_at: -1 }).limit(5).lean(),
                Member.find({}).sort({ created_at: -1 }).limit(5).lean(),
                Contact.countDocuments(),
                Subscriber.countDocuments(),
                Member.countDocuments()
            ]);

            let totalVisitors = 0;
            let pageViews = {};

            if (statsData) {
                const vis = statsData.find(r => r.key === 'visitors');
                if (vis) totalVisitors = vis.value;
                statsData.filter(r => r.key.startsWith('pv_')).forEach(r => {
                    pageViews[r.key.replace('pv_', '')] = r.value;
                });
            }

            return {
                overview: {
                    totalVisitors,
                    totalContacts: contactsCount,
                    totalSubscribers: subsCount,
                    totalMemberships: memsCount
                },
                pageViews,
                recentContacts: contacts,
                recentSubscribers: subscribers,
                recentMemberships: memberships,
                allContacts: contacts,
                allSubscribers: subscribers,
                allMemberships: memberships
            };
        } catch (err) {
            console.error('[DB] MongoDB admin stats failed:', err.message);
            // Fall through to InsForge
        }
    }

    // 2. Fallback to InsForge
    if (insforge) {
        try {
            const [
                { data: statsData },
                { data: contacts },
                { data: subscribers },
                { data: memberships },
                { count: contactsCount },
                { count: subsCount },
                { count: memsCount }
            ] = await Promise.all([
                insforge.database.from('site_stats').select('*'),
                insforge.database.from('contacts').select('*').order('created_at', { ascending: false }).limit(5),
                insforge.database.from('subscribers').select('*').order('subscribed_at', { ascending: false }).limit(5),
                insforge.database.from('members').select('*').order('created_at', { ascending: false }).limit(5),
                insforge.database.from('contacts').select('*', { count: 'exact', head: true }),
                insforge.database.from('subscribers').select('*', { count: 'exact', head: true }),
                insforge.database.from('members').select('*', { count: 'exact', head: true })
            ]);

            let totalVisitors = 0;
            let pageViews = {};

            if (statsData) {
                const vis = statsData.find(r => r.key === 'visitors');
                if (vis) totalVisitors = vis.value;
                statsData.filter(r => r.key.startsWith('pv_')).forEach(r => {
                    pageViews[r.key.replace('pv_', '')] = r.value;
                });
            }

            // Cache into MongoDB in background
            if (isMongoConnected()) {
                try {
                    if (contacts && contacts.length) {
                        const ops = contacts.map(c => ({
                            updateOne: { filter: { email: c.email, created_at: c.created_at }, update: { $set: c }, upsert: true }
                        }));
                        Contact.bulkWrite(ops).catch(() => {});
                    }
                    if (memberships && memberships.length) {
                        const ops = memberships.filter(m => m.payment_id).map(m => ({
                            updateOne: { filter: { payment_id: m.payment_id }, update: { $set: m }, upsert: true }
                        }));
                        if (ops.length) Member.bulkWrite(ops).catch(() => {});
                    }
                } catch (e) { /* background cache, ignore */ }
            }

            return {
                overview: {
                    totalVisitors,
                    totalContacts: contactsCount || (contacts ? contacts.length : 0),
                    totalSubscribers: subsCount || (subscribers ? subscribers.length : 0),
                    totalMemberships: memsCount || (memberships ? memberships.length : 0)
                },
                pageViews,
                recentContacts: contacts || [],
                recentSubscribers: subscribers || [],
                recentMemberships: memberships || [],
                allContacts: contacts || [],
                allSubscribers: subscribers || [],
                allMemberships: memberships || []
            };
        } catch (err) {
            console.error('[DB] InsForge admin stats fallback failed (cold start?):', err.message);
        }
    }

    // Return empty stats instead of crashing — both DBs unavailable
    console.error('[DB] No database available for admin stats — returning empty data');
    return {
        overview: { totalVisitors: 0, totalContacts: 0, totalSubscribers: 0, totalMemberships: 0 },
        pageViews: {},
        recentContacts: [], recentSubscribers: [], recentMemberships: [],
        allContacts: [], allSubscribers: [], allMemberships: []
    };
}

module.exports = {
    // Admin
    findAdminByEmail,
    // OTP
    upsertOtp,
    findOtpByEmail,
    updateOtpVerified,
    deleteOtpByEmail,
    // Members
    insertMember,
    upsertMember,
    findMemberByPaymentId,
    findMemberByEmail,
    getActiveLifetimeMembers,
    // Contacts
    insertContact,
    // Subscribers
    insertSubscriber,
    // Site Stats
    getSiteStats,
    upsertSiteStats,
    // Admin Dashboard
    getAdminStats
};
