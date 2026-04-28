import mongoose from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

const hospitalSchema = mongoose.Schema({
  _id: Number,

  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    lowercase: true,
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true,
    minlength: 5,
    maxlength: 10,
  },

  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
  },

  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },

  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    
  },

 

 

 




  role: {
    type: String,
    default: 'hospital',
  },

  status: {
    type: Number,
    
  },

  info: String,
});

// Apply plugin
hospitalSchema.plugin(mongooseUniqueValidator);

// Model
const hospitalSchemaModel = mongoose.model('hospital_collection', hospitalSchema);

export default hospitalSchemaModel;
