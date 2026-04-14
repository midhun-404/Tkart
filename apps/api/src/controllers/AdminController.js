const UserRepository = require('../database/repositories/UserRepository');
const OrderRepository = require('../database/repositories/OrderRepository'); // For analytics later

const getAllUsers = async (req, res) => {
    try {
        const users = await UserRepository.findAll();
        // Remove passwords
        const safeUsers = users.map(u => {
            const { password, ...rest } = u;
            return rest;
        });
        res.json(safeUsers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const toggleBlockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_blocked } = req.body;

        await UserRepository.update(id, { is_blocked: is_blocked ? 1 : 0 });
        res.json({ message: `User ${is_blocked ? 'blocked' : 'unblocked'} successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllUsers, toggleBlockUser };
