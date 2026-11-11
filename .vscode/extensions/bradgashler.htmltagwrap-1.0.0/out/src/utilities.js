"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTabString = exports.getTag = exports.announceNotableUpdate = void 0;
const vscode_1 = require("vscode");
function announceNotableUpdate(extensionContext) {
    // Announce notable changes. Update the `lastNotableUpdate` to current version to announce. Use sparingly.
    if (extensionContext) {
        // Prevents tests from breaking
        const lastNotableUpdate = '0.0.7';
        const hasUserSeenCurrentUpdateMessage = extensionContext.globalState.get('lastUpdateSeen') === lastNotableUpdate ? true : false;
        if (!hasUserSeenCurrentUpdateMessage) {
            vscode_1.window.showInformationMessage('Multiple Htmltagwrap bugfixes have landed. `Auto deselect` closing tags on spacebar press is working again.');
            extensionContext.globalState.update('lastUpdateSeen', lastNotableUpdate);
            console.log('lastUpdateSeen = ', extensionContext.globalState.get('lastUpdateSeen'));
        }
    }
}
exports.announceNotableUpdate = announceNotableUpdate;
function getTag() {
    // You must call this within a function scope, not globally, or else it will not be updated if a test updates it programmatically.
    const tagSetting = vscode_1.workspace.getConfiguration().get("htmltagwrap.tag");
    if (!tagSetting) {
        return 'p';
    }
    return tagSetting;
}
exports.getTag = getTag;
function getTabString(editor) {
    const spacesUsed = editor.options.insertSpaces;
    if (spacesUsed) {
        const numOfUsedSpaces = editor.options.tabSize;
        return ' '.repeat(numOfUsedSpaces);
    }
    return '\t';
}
exports.getTabString = getTabString;
//# sourceMappingURL=utilities.js.map