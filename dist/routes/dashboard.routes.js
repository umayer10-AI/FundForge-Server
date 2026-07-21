"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/supporter', auth_1.authenticate, (0, auth_1.authorize)('supporter'), dashboard_controller_1.dashboardController.getSupporterStats);
router.get('/creator', auth_1.authenticate, (0, auth_1.authorize)('creator'), dashboard_controller_1.dashboardController.getCreatorStats);
router.get('/creator/analytics', auth_1.authenticate, (0, auth_1.authorize)('creator'), dashboard_controller_1.dashboardController.getCreatorAnalytics);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map