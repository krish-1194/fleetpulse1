import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a vehicle name'],
    trim: true,
  },
  year: {
    type: Number,
    required: [true, 'Please provide the vehicle year'],
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  isFavorited: {
    type: Boolean,
    default: false,
  },
  fuelType: {
    type: String,
    required: [true, 'Please provide the fuel type'],
    trim: true,
  },
  registeredName: {
    type: String,
    required: [true, 'Please provide the registered name'],
    trim: true,
  },
  transmissionType: {
    type: String,
    required: [true, 'Please provide the transmission type'],
    trim: true,
  },
  registrationNo: {
    type: String,
    required: [true, 'Please provide the registration number'],
    unique: true,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', VehicleSchema);
export default Vehicle;

