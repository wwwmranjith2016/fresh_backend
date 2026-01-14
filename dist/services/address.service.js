"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressService = void 0;
const database_1 = __importDefault(require("../config/database"));
class AddressService {
    async createAddress(userId, data) {
        if (data.isDefault) {
            await database_1.default.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const address = await database_1.default.address.create({
            data: {
                userId,
                label: data.label,
                street: data.street,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                latitude: data.latitude,
                longitude: data.longitude,
                isDefault: data.isDefault || false,
            },
        });
        return address;
    }
    async getUserAddresses(userId) {
        const addresses = await database_1.default.address.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
        return addresses;
    }
    async getAddressById(id, userId) {
        const address = await database_1.default.address.findFirst({
            where: { id, userId },
        });
        if (!address) {
            throw new Error('Address not found');
        }
        return address;
    }
    async updateAddress(id, userId, data) {
        if (data.isDefault) {
            await database_1.default.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const address = await database_1.default.address.updateMany({
            where: { id, userId },
            data,
        });
        if (address.count === 0) {
            throw new Error('Address not found');
        }
        return await this.getAddressById(id, userId);
    }
    async deleteAddress(id, userId) {
        const result = await database_1.default.address.deleteMany({
            where: { id, userId },
        });
        if (result.count === 0) {
            throw new Error('Address not found');
        }
        return { success: true };
    }
}
exports.AddressService = AddressService;
exports.default = new AddressService();
