"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const withdrawal_controller_1 = require("../controllers/withdrawal.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const validations_1 = require("../validations");
const router = (0, express_1.Router)();
router.get('/my', auth_1.authenticate, (0, auth_1.authorize)('creator'), withdrawal_controller_1.withdrawalController.getMyWithdrawals);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('creator'), (0, validate_1.validate)(validations_1.withdrawalSchema), withdrawal_controller_1.withdrawalController.request);
exports.default = router;
//# sourceMappingURL=withdrawal.routes.js.map