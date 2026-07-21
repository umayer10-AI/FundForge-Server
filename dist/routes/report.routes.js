"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const validations_1 = require("../validations");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('supporter'), (0, validate_1.validate)(validations_1.reportSchema), report_controller_1.reportController.create);
exports.default = router;
//# sourceMappingURL=report.routes.js.map