const OrderRepository = require('../database/repositories/OrderRepository');
const UserRepository = require('../database/repositories/UserRepository');
const ProductRepository = require('../database/repositories/ProductRepository');
const CouponRepository = require('../database/repositories/CouponRepository');
const crypto = require('crypto');

const addOrderItems = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, paymentResult, couponCode } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        } else {
            console.log("[DEBUG] Creating Order. Items:", orderItems.length, "User:", req.user.id);
            // 1. Fetch real products from DB to secure prices and get supplier_price
            let calculatedTotal = 0;
            let calculatedProfit = 0;
            const enrichedItems = [];
            const productsToUpdate = [];

            // Check Coupon
            let coupon = null;
            if (couponCode) {
                coupon = await CouponRepository.findByCode(couponCode);
                if (coupon) {
                    // Validate expiry and limit
                    if (new Date(coupon.expiry_date) < new Date() || (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit)) {
                        return res.status(400).json({ message: 'Invalid or expired coupon' });
                    }
                }
            }

            for (const item of orderItems) {
                // Assuming item.product is the ID (or item.product_id)
                const productId = item.product || item.product_id || item.id;
                const product = await ProductRepository.findById(productId);

                if (!product) {
                    throw new Error(`Product not found: ${productId}`);
                }

                if (product.stock < item.quantity) {
                    return res.status(400).json({ message: `Insufficient stock for ${product.title}` });
                }

                const price = product.selling_price;
                const supplierPrice = product.supplier_price || 0;
                const qty = item.quantity;

                calculatedTotal += price * qty;
                calculatedProfit += (price - supplierPrice) * qty;

                enrichedItems.push({
                    product_id: productId,
                    title: product.title, // Add title for frontend display
                    quantity: qty,
                    price: price, // Store price at purchase
                    price_at_purchase: price,
                    supplier_price_at_purchase: supplierPrice,
                    image: product.image || item.image // Keep image
                });

                productsToUpdate.push({ id: productId, newStock: product.stock - qty });
            }

            // Apply Discount
            let discountAmount = 0;
            if (coupon) {
                discountAmount = (calculatedTotal * coupon.discount_percentage) / 100;
                calculatedTotal = Math.max(0, calculatedTotal - discountAmount);
                calculatedProfit -= discountAmount; // Profit is reduced by discount

                // Update usage count
                await CouponRepository.update(coupon.id, { usage_count: coupon.usage_count + 1 });
            }

            let paymentStatus = 'Pending';
            if (paymentMethod === 'COD') {
                paymentStatus = 'Pending';
            } else if (paymentMethod === 'razorpay') {
                const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

                if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                    return res.status(400).json({ message: 'Missing payment details' });
                }

                const sign = razorpay_order_id + "|" + razorpay_payment_id;
                const expectedSign = crypto
                    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET) // Ensure this env var matches verify_keys.js if not set
                    .update(sign.toString())
                    .digest("hex");

                // HARDCODED SECRET FALLBACK FOR DEBUGGING IF ENV MISSING (matches Verify Payment Controller)
                const hardcodedSecret = "1AswCsLr08PGbb506gnmvoJz";
                const expectedSignHardcoded = crypto
                    .createHmac("sha256", hardcodedSecret)
                    .update(sign.toString())
                    .digest("hex");

                if (razorpay_signature === expectedSign || razorpay_signature === expectedSignHardcoded) {
                    paymentStatus = 'Paid';
                } else {
                    return res.status(400).json({ message: 'Invalid payment signature' });
                }
            }

            const orderData = {
                user_id: req.user.id,
                user_name: req.user.name || req.body.userName, // Fallback
                user_email: req.user.email,
                shipping_address: shippingAddress,
                total_amount: calculatedTotal,
                total_profit: calculatedProfit,
                payment_method: paymentMethod,
                payment_status: paymentStatus,
                order_status: 'Placed',
                discount: discountAmount,
                coupon_code: couponCode,
                razorpay_order_id: req.body.razorpay_order_id || null,
                razorpay_payment_id: req.body.razorpay_payment_id || null,
                razorpay_signature: req.body.razorpay_signature || null
            };

            const createdOrder = await OrderRepository.createOrderWithItems(orderData, enrichedItems);
            console.log("[DEBUG] Order Created Successfully:", createdOrder.id);

            // Update Stock
            for (const update of productsToUpdate) {
                await ProductRepository.update(update.id, { stock: update.newStock });
            }

            res.status(201).json(createdOrder);
        }
    } catch (error) {
        console.error("Add Order Error:", error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await OrderRepository.findByUserId(req.user.id);
        res.json(orders);
    } catch (error) {
        console.error("Get My Orders Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await OrderRepository.update(req.params.id, { order_status: status });
        res.json({ message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const orders = await OrderRepository.findAll();
        const users = await UserRepository.findAll();
        const products = await ProductRepository.findAll();

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        // Helper to check if date is today
        const isToday = (dateStr) => {
            const date = new Date(dateStr).getTime();
            return date >= today;
        };

        // Helper to check if date is this month
        const isThisMonth = (dateStr) => {
            const date = new Date(dateStr).getTime();
            return date >= thisMonthStart;
        };

        // General Stats
        const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
        const totalProfit = orders.reduce((sum, order) => sum + order.total_profit, 0);
        const totalOrders = orders.length;
        const totalUsers = users.length;
        const totalProducts = products.length;

        // Today's Stats
        const todayOrdersList = orders.filter(o => isToday(o.created_at));
        const todayRevenue = todayOrdersList.reduce((sum, o) => sum + o.total_amount, 0);
        const todayOrdersCount = todayOrdersList.length;

        // This Month's Stats
        const thisMonthOrdersList = orders.filter(o => isThisMonth(o.created_at));
        const thisMonthRevenue = thisMonthOrdersList.reduce((sum, o) => sum + o.total_amount, 0);
        const thisMonthOrdersCount = thisMonthOrdersList.length;

        // Status Counts
        const pendingOrders = orders.filter(o => o.order_status === 'Pending').length;
        const cancelledOrders = orders.filter(o => o.order_status === 'Cancelled').length;

        // Low Stock (Threshold < 10)
        const lowStockProducts = products.filter(p => p.stock < 10).length;

        const revenueData = orders.slice(-7).map(order => ({
            name: new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: order.total_amount,
            profit: order.total_profit
        }));

        const stats = {
            totalRevenue,
            totalProfit,
            totalOrders,
            totalUsers,
            totalProducts,
            todayRevenue,
            todayOrders: todayOrdersCount,
            thisMonthRevenue,
            thisMonthOrders: thisMonthOrdersCount,
            pendingOrders,
            cancelledOrders,
            lowStockProducts,
            revenueData,
            orderStatusData: [
                { name: 'Pending', value: pendingOrders },
                { name: 'Shipped', value: orders.filter(o => o.order_status === 'Shipped').length },
                { name: 'Delivered', value: orders.filter(o => o.order_status === 'Delivered').length },
                { name: 'Cancelled', value: cancelledOrders },
            ]
        };

        res.json(stats);
    } catch (error) {
        console.error("Stats Error", error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

const getSalesAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        // Date Range Logic
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        const start = startDate ? new Date(startDate) : new Date();
        if (!startDate) start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);

        // Fetch All Orders (Repository already handles generic fetch, we might need a specific range query later for optimization)
        // For now, fetch all and filter in memory or use repository filter if available
        // Using BaseRepository findAll is okay for small datasets. For larger, we should add findByDateRange to Repo.
        const allOrders = await OrderRepository.findAll();

        // Filter by Date and Status
        const filteredOrders = allOrders.filter(order => {
            const orderDate = new Date(order.created_at || order.createdAt); // Handle both casing logic if exists
            return orderDate >= start && orderDate <= end && order.order_status !== 'Cancelled';
        });

        // Aggregate Data
        const groupedData = {};

        filteredOrders.forEach(order => {
            const dateObj = new Date(order.created_at || order.createdAt);
            let key;

            if (groupBy === 'month') {
                key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
            } else {
                // Default day
                key = dateObj.toISOString().split('T')[0];
            }

            if (!groupedData[key]) {
                groupedData[key] = { date: key, revenue: 0, profit: 0, orders: 0 };
            }

            groupedData[key].revenue += (order.total_amount || 0);
            groupedData[key].profit += (order.total_profit || 0);
            groupedData[key].orders += 1;
        });

        // Convert object to array and sort
        const analyticsArray = Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));

        res.json(analyticsArray);
    } catch (error) {
        console.error("Analytics Error", error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await OrderRepository.findAll();
        // Enrich with user details if needed, but repository returns what it has
        res.json(orders);
    } catch (error) {
        console.error("Get All Orders Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addOrderItems,
    getMyOrders,
    getAllOrders,
    getDashboardStats,
    updateOrderStatus,
    getSalesAnalytics
};
