"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onLoad = void 0;
const myplugindependency_1 = require("myplugindependency");
const types_1 = require("@kimikobot/types");
const onLoad = (client, logger) => {
    logger.log(types_1.logType.INFO, types_1.logColors.GREEN, 'dependent plugin loaded');
    logger.log(types_1.logType.WARN, types_1.logColors.YELLOW, 'example warn log');
    logger.log(types_1.logType.LOG, types_1.logColors.WHITE, 'example log log');
    logger.log(types_1.logType.DEBUG, types_1.logColors.BLUE, 'example debug log');
    logger.log(types_1.logType.ERROR, types_1.logColors.RED, 'example error log');
    (0, myplugindependency_1.bakeCookies)();
};
exports.onLoad = onLoad;
