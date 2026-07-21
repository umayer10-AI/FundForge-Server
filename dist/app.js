"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const campaign_routes_1 = __importDefault(require("./routes/campaign.routes"));
const contribution_routes_1 = __importDefault(require("./routes/contribution.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const withdrawal_routes_1 = __importDefault(require("./routes/withdrawal.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);
app.use((0, morgan_1.default)(config_1.config.nodeEnv === 'development' ? 'dev' : 'combined'));
// Stripe webhook needs raw body BEFORE json parser
app.use('/api/payments/webhook', express_1.default.raw({ type: 'application/json' }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_mongo_sanitize_1.default)());
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', server: 'running', timestamp: new Date().toISOString() });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/campaigns', campaign_routes_1.default);
app.use('/api/contributions', contribution_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/withdrawals', withdrawal_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found', errors: [] });
});
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map