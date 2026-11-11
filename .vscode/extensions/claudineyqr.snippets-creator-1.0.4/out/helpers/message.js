"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMessage = exports.warnMessage = exports.infoMessage = void 0;
const vscode = require("vscode");
const nameExtension = 'Snippets Creator';
function infoMessage(message) {
    vscode.window.showInformationMessage(`${nameExtension}: ${message}`);
}
exports.infoMessage = infoMessage;
function warnMessage(message) {
    vscode.window.showWarningMessage(`${nameExtension}: ${message}`);
}
exports.warnMessage = warnMessage;
function errorMessage(message) {
    vscode.window.showErrorMessage(`${nameExtension}: ${message}`);
}
exports.errorMessage = errorMessage;
//# sourceMappingURL=message.js.map