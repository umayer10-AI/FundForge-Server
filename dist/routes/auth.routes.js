"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const validations_1 = require("../validations");
const router = (0, express_1.Router)();
router.post('/register', (0, validate_1.validate)(validations_1.registerSchema), auth_controller_1.authController.register);
router.post('/login', (0, validate_1.validate)(validations_1.loginSchema), auth_controller_1.authController.login);
router.post('/google', auth_controller_1.authController.googleAuth);
router.get('/me', auth_1.authenticate, auth_controller_1.authController.getMe);
router.put('/profile', auth_1.authenticate, auth_controller_1.authController.updateProfile);
router.put('/change-password', auth_1.authenticate, auth_controller_1.authController.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map