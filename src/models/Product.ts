import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'Golf Clubs',
  },
  brand: String,
  price: {
    type: Number,
    required: true,
  },
  salePrice: Number,
  inventoryCount: {
    type: Number,
    default: 0,
  },
  condition: {
    type: String,
    enum: ['New', 'Used', 'Refurbished'],
    default: 'New',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
  description: String,
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Product ||
  mongoose.model('Product', ProductSchema);
