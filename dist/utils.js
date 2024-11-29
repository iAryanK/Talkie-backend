"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formattedTime = void 0;
const formattedTime = (date) => {
    const time = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    return time;
};
exports.formattedTime = formattedTime;
