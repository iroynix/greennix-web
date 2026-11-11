"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const utilities_1 = require("./utilities");
const wrap_1 = require("./wrap");
const autoDeselectClosingTag_1 = require("./autoDeselectClosingTag");
const utilities_2 = require("./utilities");
function activate(extensionContext) {
    // Code in this function runs each time extension is activated
    // The command's name is pre-declared in package.json
    const disposable = vscode.commands.registerCommand('extension.htmlTagWrap', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (editor == null)
            return;
        (0, utilities_1.announceNotableUpdate)(extensionContext);
        const tag = (0, utilities_2.getTag)();
        const passedSelections = yield (0, wrap_1.wrapInTagsAndSelect)(editor, tag);
        const isEnabledAutodeselectClosingTag = vscode.workspace.getConfiguration().get("htmltagwrap.autoDeselectClosingTag");
        if (!isEnabledAutodeselectClosingTag)
            return;
        yield (0, autoDeselectClosingTag_1.autoDeselectClosingTag)(editor, passedSelections);
    }));
    extensionContext === null || extensionContext === void 0 ? void 0 : extensionContext.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map