import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  imagePath: String,
  productData: {
    type: Object,
    required: true
  },
  analysis: {
    nutritionScore: Number,
    nutritionEvaluation: String,
    allergens: [String],
    additives: [String],
    sustainabilityScore: Number,
    processingLevel: String,
    overallRecommendation: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product; 