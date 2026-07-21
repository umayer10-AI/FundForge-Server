"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const validations_1 = require("../validations");
const router = (0, express_1.Router)();
router.post('/chat', auth_1.authenticate, (0, validate_1.validate)(validations_1.aiChatSchema), ai_controller_1.aiController.chat);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map