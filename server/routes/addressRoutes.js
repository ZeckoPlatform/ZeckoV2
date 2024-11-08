const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/userModel');
const BusinessUser = require('../models/businessUserModel');
const VendorUser = require('../models/vendorUserModel');

// Get user by type and ID
const getUserByType = async (userId, accountType) => {
    console.log('Getting user by type:', { userId, accountType });
    
    try {
        let user;
        switch(accountType) {
            case 'business':
                user = await BusinessUser.findById(userId);
                break;
            case 'vendor':
                user = await VendorUser.findById(userId);
                break;
            default:
                user = await User.findById(userId);
        }
        
        if (!user) {
            console.log('User not found:', { userId, accountType });
            return null;
        }
        
        return user;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

// Get addresses
router.get('/', auth, async (req, res) => {
    try {
        console.log('Get addresses request:', {
            userId: req.user.id,
            accountType: req.user.accountType,
            path: req.originalUrl
        });

        const user = await getUserByType(req.user.id, req.user.accountType);
        
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found',
                addresses: []
            });
        }

        // Initialize addresses if undefined
        if (!user.addresses) {
            user.addresses = [];
            await user.save();
        }

        console.log('Returning addresses:', user.addresses);
        res.json(user.addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ 
            message: 'Error fetching addresses',
            addresses: []
        });
    }
});

// Add address
router.post('/', auth, async (req, res) => {
    try {
        const user = await getUserByType(req.user.id, req.user.accountType);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize addresses if undefined
        if (!user.addresses) {
            user.addresses = [];
        }

        const { street, city, state, zipCode, country, isDefault } = req.body;

        const newAddress = {
            street: street || '',
            city: city || '',
            state: state || '',
            zipCode: zipCode || '',
            country: country || '',
            isDefault: isDefault || user.addresses.length === 0
        };

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
        const user = await getUserByType(req.user.id, req.user.accountType);
        
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

        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex].toObject(),
            street: street || user.addresses[addressIndex].street || '',
            city: city || user.addresses[addressIndex].city || '',
            state: state || user.addresses[addressIndex].state || '',
            zipCode: zipCode || user.addresses[addressIndex].zipCode || '',
            country: country || user.addresses[addressIndex].country || '',
            isDefault: isDefault !== undefined ? isDefault : user.addresses[addressIndex].isDefault
        };

        if (isDefault) {
            user.addresses.forEach((addr, index) => {
                if (index !== addressIndex) addr.isDefault = false;
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
        const user = await getUserByType(req.user.id, req.user.accountType);
        
        if (!user || !user.addresses) {
            return res.status(404).json({ message: 'User or addresses not found' });
        }

        const addressIndex = user.addresses.findIndex(
            addr => addr._id.toString() === req.params.addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        user.addresses.splice(addressIndex, 1);

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