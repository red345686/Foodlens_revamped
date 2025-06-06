import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  barcode: {
    type: String,
    sparse: true,
    index: true
  },
  imagePath: String,
  ingredientsImagePath: String,
  productPhotoPath: String,
  nutritionalContentImagePath: String,
  // These fields will store the formatted image names with productname_imagetype format
  formattedProductImageName: String,
  formattedIngredientsImageName: String,
  formattedNutrientsImageName: String,
  productData: {
    type: Object,
    required: true
  },
  ingredients: [String],
  ingredientAnalysis: {
    extractedText: String,
    safetyScore: Number,
    harmfulIngredients: [{
      name: String,
      reason: String,
      severity: String // low, medium, high
    }],
    safeIngredients: [String],
    unknownIngredients: [String],
    overallSafety: String,
    detailedAnalysis: String
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

productSchema.index({ barcode: 1 }, { unique: true, sparse: true });

productSchema.pre('save', function(next) {
  // Format image names with productname_imagetype pattern if not already set
  if (this.name && this.productPhotoPath && !this.formattedProductImageName) {
    const sanitizedName = this.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    this.formattedProductImageName = `${sanitizedName}_productimage`;
  }
  
  if (this.name && this.ingredientsImagePath && !this.formattedIngredientsImageName) {
    const sanitizedName = this.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    this.formattedIngredientsImageName = `${sanitizedName}_ingredientsimage`;
  }
  
  if (this.name && this.nutritionalContentImagePath && !this.formattedNutrientsImageName) {
    const sanitizedName = this.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    this.formattedNutrientsImageName = `${sanitizedName}_nutrientsimage`;
  }

  if (!this.analysis) {
    this.analysis = {
      nutritionScore: 50,
      nutritionEvaluation: "No detailed nutrition analysis available",
      allergens: [],
      additives: [],
      sustainabilityScore: 50,
      processingLevel: "processed",
      overallRecommendation: "No specific recommendation available"
    };
  } else {
    if (this.analysis.nutritionScore === undefined || this.analysis.nutritionScore === null) {
      this.analysis.nutritionScore = 50;
    } else {
      this.analysis.nutritionScore = parseFloat(this.analysis.nutritionScore) || 50;
    }

    if (!this.analysis.nutritionEvaluation) {
      this.analysis.nutritionEvaluation = "No detailed nutrition analysis available";
    }

    if (!Array.isArray(this.analysis.allergens)) {
      this.analysis.allergens = [];
    }

    if (!Array.isArray(this.analysis.additives)) {
      this.analysis.additives = [];
    }

    if (this.analysis.sustainabilityScore === undefined || this.analysis.sustainabilityScore === null) {
      this.analysis.sustainabilityScore = 50;
    } else {
      this.analysis.sustainabilityScore = parseFloat(this.analysis.sustainabilityScore) || 50;
    }

    if (!this.analysis.processingLevel) {
      this.analysis.processingLevel = "processed";
    }

    if (!this.analysis.overallRecommendation) {
      this.analysis.overallRecommendation = "No specific recommendation available";
    }
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product; 