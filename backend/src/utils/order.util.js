"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderId = generateOrderId;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generates a cryptographically secure, 8-character uppercase hex string prefixed with VP
 * Example: VP70C07E75
 */
function generateOrderId() {
    const randomHex = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
    return `VP${randomHex}`;
}
//# sourceMappingURL=order.util.js.map