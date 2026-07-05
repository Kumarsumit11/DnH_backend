"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
function validate(schema) {
    return (req, _res, next) => {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });
        next();
    };
}
exports.validate = validate;
