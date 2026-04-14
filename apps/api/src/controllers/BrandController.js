const BaseRepository = require('../database/repositories/BaseRepository');
const BrandRepo = new BaseRepository('brands');

const getAll = async (req, res) => {
    try {
        const brands = await BrandRepo.findAll();
        res.json(brands);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const create = async (req, res) => {
    try {
        const { name, logo_url, is_active } = req.body;
        const newBrand = await BrandRepo.create({ name, logo_url, is_active });
        res.status(201).json(newBrand);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await BrandRepo.update(id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        await BrandRepo.delete(id);
        res.json({ message: 'Brand deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAll, create, update, remove };
