const endTimeStr1 = "2026-03-01T23:59:00.000Z";
const now = new Date();

console.log("Current time:", now.toISOString());

console.log("\nTesting ending time 1:", endTimeStr1);
const end1 = new Date(endTimeStr1);
console.log("Difference 1:", end1 - now);
