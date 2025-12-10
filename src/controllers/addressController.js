import User from "../models/User.js";

export const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newAddress = req.body;

        // If this is the first address, make it default
        if (user.addresses.length === 0) {
            newAddress.isDefault = true;
        } else if (newAddress.isDefault) {
            // If new address is set as default, unset others
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const addressIndex = user.addresses.findIndex(
            (addr) => addr._id.toString() === req.params.addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({ message: "Address not found" });
        }

        const updatedAddress = { ...user.addresses[addressIndex].toObject(), ...req.body };

        if (req.body.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses[addressIndex] = updatedAddress;
        await user.save();

        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.addresses = user.addresses.filter(
            (addr) => addr._id.toString() !== req.params.addressId
        );

        // If default address was deleted and others exist, make the first one default
        if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const setDefaultAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const addressId = req.params.addressId;
        const addressExists = user.addresses.some(addr => addr._id.toString() === addressId);

        if (!addressExists) {
            return res.status(404).json({ message: "Address not found" });
        }

        user.addresses.forEach(addr => {
            addr.isDefault = addr._id.toString() === addressId;
        });

        await user.save();
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
