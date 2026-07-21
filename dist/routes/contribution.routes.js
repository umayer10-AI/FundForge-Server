"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contribution_controller_1 = require("../controllers/contribution.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const validations_1 = require("../validations");
const router = (0, express_1.Router)();
router.get('/my', auth_1.authenticate, (0, auth_1.authorize)('supporter'), contribution_controller_1.contributionController.getMyContributions);
router.get('/creator', auth_1.authenticate, (0, auth_1.authorize)('creator'), contribution_controller_1.contributionController.getCreatorContributions);
router.get('/campaign/:campaignId', auth_1.authenticate, (0, auth_1.authorize)('creator', 'admin'), contribution_controller_1.contributionController.getCampaignContributions);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('supporter'), (0, validate_1.validate)(validations_1.contributionSchema), contribution_controller_1.contributionController.create);
router.put('/:id/approve', auth_1.authenticate, (0, auth_1.authorize)('creator', 'admin'), contribution_controller_1.contributionController.approve);
router.put('/:id/reject', auth_1.authenticate, (0, auth_1.authorize)('creator', 'admin'), contribution_controller_1.contributionController.reject);
exports.default = router;
//# sourceMappingURL=contribution.routes.js.map