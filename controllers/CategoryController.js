const Category = require('../models/CategoryModel');

exports.createCategory = async (req, res) => {
    try {
        const userId = req.userId;
        const { name } = req.body;

        // Check if the category already exists for this user
        const existingCategory = await Category.findOne({ name, userId });
        if (existingCategory) {
            return res.status(400).send(`Category "${name}" already exists.`);
        }

        const category = new Category({
            name,
            userId
        });

        await category.save();
        res.status(201).send(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(400).send(`Error creating category: ${error.message}`);
    }
};

// Get all categories for a user
exports.getUserCategories = async (req, res) => {
    try {
        const userId = req.userId;
        let categories = await Category.find({ userId });
        const othersCategoryExists = categories.some(category => category.name === 'Others');
        if (!othersCategoryExists) {
            console.log('no other');
            const othersCategory = new Category({
                name: 'Others',
                userId: userId
            });
            await othersCategory.save();
            categories = [...categories, othersCategory]; // Add "Others" to the categories list
        }
        else categories = await Category.find({ userId });
        res.send(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send(`Error fetching categories: ${error.message}`);
    }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).send(`Category with id ${id} not found.`);
        }

        // // Make sure the category belongs to the user
        // if (category.userId.toString() !== req.userId) {
        //     return res.status(403).send('You do not have permission to delete this category.'); // 403 Forbidden if user doesn't own the category
        // }

        await Category.findByIdAndDelete(id);
        res.status(200).send(`Category with id ${id} deleted successfully.`);
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).send(`Error deleting category: ${error.message}`);
    }
};
