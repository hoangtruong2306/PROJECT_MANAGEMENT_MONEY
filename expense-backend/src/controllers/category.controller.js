const categoryModel = require("../models/category.model");

exports.createCategory = async (req, res) => {
  try {
    const category = await categoryModel.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
