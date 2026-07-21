"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const response_1 = require("../utils/response");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const parsed = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            req.body = parsed.body;
            req.query = parsed.query;
            req.params = parsed.params;
            next();
        }
        catch (error) {
            const errors = error.errors?.map((e) => e.message) || [];
            return (0, response_1.sendError)(res, 'Validation Error', 422, errors);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map