import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { reportController } from '../controllers/report.controller';
import { withdrawalController } from '../controllers/withdrawal.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);

router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);

router.get('/campaigns', adminController.getAllCampaigns);
router.put('/campaigns/:id/approve', adminController.approveCampaign);
router.put('/campaigns/:id/reject', adminController.rejectCampaign);

router.get('/withdrawals', withdrawalController.getAll);
router.get('/withdrawals/pending', withdrawalController.getPending);
router.put('/withdrawals/:id/approve', withdrawalController.approve);
router.put('/withdrawals/:id/reject', withdrawalController.reject);

router.get('/reports', reportController.getAll);
router.put('/reports/:id/review', reportController.review);
router.put('/reports/:id/dismiss', reportController.dismiss);
router.put('/reports/:id/resolve', reportController.resolve);
router.put('/reports/:id/suspend', reportController.suspendCampaign);

router.get('/payments', adminController.getPayments);

export default router;
