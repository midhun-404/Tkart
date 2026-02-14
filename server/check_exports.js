try {
    const ctrl = require('./src/controllers/OrderController');
    console.log("OrderController Exports:", Object.keys(ctrl));
    console.log("getAllOrders type:", typeof ctrl.getAllOrders);
    console.log("getDashboardStats type:", typeof ctrl.getDashboardStats);
} catch (e) {
    console.error("Error loading controller:", e);
}
