"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressController = void 0;
const address_service_1 = __importDefault(require("../services/address.service"));
const response_util_1 = require("../utils/response.util");
class AddressController {
    async createAddress(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
            }
            const data = req.body;
            if (!data.label || !data.street || !data.city || !data.state || !data.zipCode) {
                return (0, response_util_1.sendError)(res, 'All address fields are required', 400);
            }
            const address = await address_service_1.default.createAddress(userId, data);
            return (0, response_util_1.sendSuccess)(res, address, 'Address created successfully', 201);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to create address', 400);
        }
    }
    async getUserAddresses(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
            }
            const addresses = await address_service_1.default.getUserAddresses(userId);
            return (0, response_util_1.sendSuccess)(res, addresses);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to fetch addresses', 400);
        }
    }
    async updateAddress(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
            }
            const { id } = req.params;
            const data = req.body;
            const address = await address_service_1.default.updateAddress(id, userId, data);
            return (0, response_util_1.sendSuccess)(res, address, 'Address updated successfully');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to update address', 400);
        }
    }
    async deleteAddress(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
            }
            const { id } = req.params;
            await address_service_1.default.deleteAddress(id, userId);
            return (0, response_util_1.sendSuccess)(res, null, 'Address deleted successfully');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to delete address', 400);
        }
    }
}
exports.AddressController = AddressController;
exports.default = new AddressController();
