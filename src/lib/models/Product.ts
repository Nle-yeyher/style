import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  sizeStock: [{
    _id: false,
    size: { type: String, required: true },
    stock: { type: Number, required: true, default: 10 },
    sold: { type: Number, required: true, default: 0 }
  }],
  sizes: [{ type: String }],
  suggestions_ids: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

ProductSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
