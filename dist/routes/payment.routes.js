"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/packages', payment_controller_1.paymentController.getCreditPackages);
router.get('/history', auth_1.authenticate, payment_controller_1.paymentController.getPaymentHistory);
router.get('/verify', auth_1.authenticate, payment_controller_1.paymentController.verifySession);
router.post('/create-checkout-session', auth_1.authenticate, (0, auth_1.authorize)('supporter'), payment_controller_1.paymentController.createCheckoutSession);
router.post('/webhook', payment_controller_1.paymentController.handleWebhook);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map