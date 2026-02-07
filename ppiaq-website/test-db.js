// Quick test to verify database data
const db = require('./lib/database/db.ts');
console.log('Team Members:', db.getAllCMSTeamMembers().length);
console.log('Events:', db.getAllCMSEvents().length);
console.log('FAQ Items:', db.getAllFAQs().length);
