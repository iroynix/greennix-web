"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
// Announce notable changes. Update the `lastNotableUpdate` to current version to announce. Use sparingly.
function announcement(extensionContext) {
    if (extensionContext) {
        // Prevents tests from breaking
        const lastNotableUpdate = '0.0.7';
        const hasUserSeenCurrentUpdateMessage = extensionContext.globalState.get('lastUpdateSeen') === lastNotableUpdate ? true : false;
        if (!hasUserSeenCurrentUpdateMessage) {
            vscode_1.window.showInformationMessage('htmltagwrap now supports adding attributes on opening tags');
            extensionContext.globalState.update('lastUpdateSeen', lastNotableUpdate);
            console.log('lastUpdateSeen = ', extensionContext.globalState.get('lastUpdateSeen'));
        }
    }
}
exports.default = announcement;
//# sourceMappingURL=announcement.js.map