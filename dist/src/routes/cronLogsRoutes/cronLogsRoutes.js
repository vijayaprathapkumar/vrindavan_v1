"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/cronLogsRoutes.ts
const express_1 = require("express");
const cronLogsController_1 = require("../../controllers/cronLogsController/cronLogsController");
const router = (0, express_1.Router)();
router.get('/', cronLogsController_1.getCronLogsController);
exports.default = router;
