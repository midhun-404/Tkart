const app = require('./src/app');

console.log("--- Registered Middleware/Routes ---");

if (app._router && app._router.stack) {
    app._router.stack.forEach((r, index) => {
        if (r.route && r.route.path) {
            console.log(`[${index}] ROUTE: ${r.route.path}`);
        } else if (r.name === 'router') {
            console.log(`[${index}] ROUTER: ${r.regexp}`);
        } else {
            console.log(`[${index}] MIDDLEWARE: ${r.name}`);
        }
    });
} else {
    console.log("No _router found on app.");
}
