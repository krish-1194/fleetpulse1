import Vehicle from '../models/Vehicle.js';

// @desc    Get all vehicles for a user
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = async (req, res) => {
  try {
    // Fetch vehicles belonging to the authenticated user
    const vehicles = await Vehicle.find({ user: req.user.id });
    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private
export const createVehicle = async (req, res) => {
  const { name, year, location, imageUrl } = req.body;

  try {
    const vehicle = new Vehicle({
      name,
      year,
      location,
      imageUrl,
      user: req.user.id, // Associate vehicle with the logged-in user
    });

    const createdVehicle = await vehicle.save();
    res.status(201).json(createdVehicle);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid vehicle data' });
  }
};

// @desc    Get a single vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Ensure the vehicle belongs to the logged-in user
    if (vehicle.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
export const updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Ensure the vehicle belongs to the logged-in user
    if (vehicle.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid vehicle data' });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Ensure the vehicle belongs to the logged-in user
    if (vehicle.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await vehicle.deleteOne();

    res.json({ message: 'Vehicle removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
