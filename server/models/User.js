import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  profilePicture: { 
    type: String, 
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/empty
        return v.startsWith('data:image/') || v.startsWith('http');
      },
      message: 'Profile picture must be a valid image URL or base64 data'
    }
  },
  reviewsCount: { 
    type: Number, 
    default: 0,
    min: [0, 'Reviews count cannot be negative']
  },
}, {
  timestamps: true, // Add createdAt and updatedAt timestamps
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password; // Never send password in JSON responses
      return ret;
    }
  }
});

// Index for better query performance (using schema.index instead of duplicate)
userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);
