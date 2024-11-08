const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/userModel');
const BusinessUser = require('../models/businessUserModel');
const VendorUser = require('../models/vendorUserModel');

// Helper function to get user model based on path
const getUserModel = (path) => {
    if (path.includes('/business/')) return BusinessUser;
    if (path.includes('/vendor/')) return VendorUser;
    return User;
};

// Get addresses
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching addresses for path:', req.path);
        console.log('User ID:', req.user.id);
        console.log('Account Type:', req.user.accountType);

        const UserModel = getUserModel(req.path);
        const user = await UserModel.findById(req.user.id);

        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize addresses if they don't exist
        if (!user.addresses) {
            user.addresses = [];
            await user.save();
        }

        console.log('Returning addresses:', user.addresses);
        res.json(user.addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Error fetching addresses' });
    }
});

// Add address
router.post('/', auth, async (req, res) => {
    try {
        const UserModel = getUserModel(req.path);
        const user = await UserModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { street, city, state, zipCode, country, isDefault } = req.body;

        // Initialize addresses array if it doesn't exist
        if (!user.addresses) {
            user.addresses = [];
        }

        const newAddress = {
            street: street || '',
            city: city || '',
            state: state || '',
            zipCode: zipCode || '',
            country: country || '',
            isDefault: isDefault || user.addresses.length === 0
        };

        // If this is default, update other addresses
        if (newAddress.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json(newAddress);
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Error adding address' });
    }
});

// Update address
router.put('/:addressId', auth, async (req, res) => {
    try {
        const UserModel = getUserModel(req.path);
        const user = await UserModel.findById(req.user.id);

        if (!user || !user.addresses) {
            return res.status(404).json({ message: 'User or addresses not found' });
        }

        const addressIndex = user.addresses.findIndex(
            addr => addr._id.toString() === req.params.addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const { street, city, state, zipCode, country, isDefault } = req.body;

        // Update the address
        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex].toObject(),
            street: street || user.addresses[addressIndex].street,
            city: city || user.addresses[addressIndex].city,
            state: state || user.addresses[addressIndex].state,
            zipCode: zipCode || user.addresses[addressIndex].zipCode,
            country: country || user.addresses[addressIndex].country,
            isDefault: isDefault !== undefined ? isDefault : user.addresses[addressIndex].isDefault
        };

        // If setting as default, update other addresses
        if (isDefault) {
            user.addresses.forEach((addr, index) => {
                if (index !== addressIndex) {
                    addr.isDefault = false;
                }
            });
        }

        await user.save();
        res.json(user.addresses[addressIndex]);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Error updating address' });
    }
});

// Delete address
router.delete('/:addressId', auth, async (req, res) => {
    try {
        const UserModel = getUserModel(req.path);
        const user = await UserModel.findById(req.user.id);

        if (!user || !user.addresses) {
            return res.status(404).json({ message: 'User or addresses not found' });
        }

        const addressIndex = user.addresses.findIndex(
            addr => addr._id.toString() === req.params.addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Remove the address
        user.addresses.splice(addressIndex, 1);

        // If we removed the default address and there are other addresses,
        // make the first one the default
        if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Error deleting address' });
    }
});

module.exports = router;