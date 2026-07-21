"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, notification_controller_1.notificationController.getAll);
router.get('/unread-count', auth_1.authenticate, notification_controller_1.notificationController.getUnreadCount);
router.put('/:id/read', auth_1.authenticate, notification_controller_1.notificationController.read);
router.put('/read-all', auth_1.authenticate, notification_controller_1.notificationController.readAll);
router.delete('/:id', auth_1.authenticate, notification_controller_1.notificationController.remove);
router.delete('/', auth_1.authenticate, notification_controller_1.notificationController.clearAll);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map