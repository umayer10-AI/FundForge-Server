"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaign_controller_1 = require("../controllers/campaign.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const validations_1 = require("../validations");
const router = (0, express_1.Router)();
router.get('/featured', campaign_controller_1.campaignController.getFeatured);
router.get('/categories', campaign_controller_1.campaignController.getCategories);
router.get('/', campaign_controller_1.campaignController.getAll);
router.get('/my', auth_1.authenticate, (0, auth_1.authorize)('creator'), campaign_controller_1.campaignController.getMyCampaigns);
router.get('/:id', campaign_controller_1.campaignController.getById);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('creator'), (0, validate_1.validate)(validations_1.campaignSchema), campaign_controller_1.campaignController.create);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('creator', 'admin'), (0, validate_1.validate)(validations_1.campaignUpdateSchema), campaign_controller_1.campaignController.update);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('creator', 'admin'), campaign_controller_1.campaignController.delete);
exports.default = router;
//# sourceMappingURL=campaign.routes.js.map