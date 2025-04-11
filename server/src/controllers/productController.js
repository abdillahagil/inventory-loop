import { Product } from '../models/index.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error retrieving products' });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product by id error:', error);
    res.status(500).json({ message: 'Server error retrieving product' });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/SuperAdmin
const createProduct = async (req, res) => {
  try {
    const { name, description, sku, category, price, costPrice, imageUrl } = req.body;
    
    // Check if product with same SKU already exists
    const productExists = await Product.findOne({ where: { sku } });
    
    if (productExists) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }
    
    // Create product
    const product = await Product.create({
      name,
      description,
      sku,
      category,
      price,
      costPrice,
      imageUrl
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/SuperAdmin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const { name, description, category, price, costPrice, imageUrl, isActive } = req.body;
    
    // Update product fields
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (price) product.price = price;
    if (costPrice) product.costPrice = costPrice;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;
    if (isActive !== undefined) product.isActive = isActive;
    
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/SuperAdmin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await product.destroy();
    
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

export { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
}; 