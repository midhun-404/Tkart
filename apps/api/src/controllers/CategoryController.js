const BaseRepository = require('../database/repositories/BaseRepository');
const CategoryRepo = new BaseRepository('categories');

const getAll = async (req, res) => {
    try {
        const categories = await CategoryRepo.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const create = async (req, res) => {
    try {
        const { name, image_url, is_active } = req.body;
        const newCategory = await CategoryRepo.create({ name, image_url, is_active });
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await CategoryRepo.update(id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        await CategoryRepo.delete(id);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAll, create, update, remove };
