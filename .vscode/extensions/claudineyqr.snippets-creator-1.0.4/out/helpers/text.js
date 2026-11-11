"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textToArray = exports.createGuid = exports.removeCharactersPrefix = void 0;
const ts_dedent_1 = require("ts-dedent");
function removeCharactersPrefix(prefix) {
    prefix = prefix
        .normalize("NFD")
        .trim()
        .replace(/\s+/gim, "-")
        .replace(/[^0-9a-z-]/gim, "");
    return prefix.toLowerCase();
}
exports.removeCharactersPrefix = removeCharactersPrefix;
function createGuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/gim, function (c) {
        let r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
exports.createGuid = createGuid;
function textToArray(text) {
    text = ts_dedent_1.default(text);
    return text.split("\n");
}
exports.textToArray = textToArray;
//# sourceMappingURL=text.js.map