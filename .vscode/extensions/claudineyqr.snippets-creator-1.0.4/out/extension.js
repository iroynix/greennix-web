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
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const message_1 = require("./helpers/message");
const file_1 = require("./helpers/file");
const text_1 = require("./helpers/text");
function showFileInEditor(filepath) {
    vscode.workspace
        .openTextDocument(filepath)
        .then((doc) => vscode.window.showTextDocument(doc))
        .then(() => vscode.commands.executeCommand("cursorBottom"));
}
function activate(context) {
    let disposable = vscode.commands.registerCommand("snippets-creator.createSnippet", () => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            return;
        }
        const selection = activeTextEditor.selection;
        const textSelected = activeTextEditor.document.getText(new vscode.Range(selection.start, selection.end));
        if (selection.isEmpty) {
            message_1.errorMessage("Select code blocks");
            return;
        }
        const languages = yield vscode.languages.getLanguages();
        let snippet = {
            prefix: "",
            name: "",
            scope: [],
            languageId: activeTextEditor.document.languageId,
            body: text_1.textToArray(textSelected),
            description: "",
            isGlobal: false,
        };
        const snippetTypes = [
            `Snippet for Language: ${snippet.languageId}`,
            "Snippet Global",
        ];
        const snippetType = yield vscode.window.showQuickPick(snippetTypes, {
            placeHolder: "Select the snippet type",
        });
        if (snippetType === undefined || snippetType === "") {
            message_1.errorMessage("Unselected snippet type");
            return;
        }
        snippet.isGlobal = snippetType === "Snippet Global";
        if (snippet.isGlobal) {
            const languagesOrdened = languages.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
            let quickPickItems = languagesOrdened.map((item) => {
                return {
                    label: item,
                    picked: item === snippet.languageId,
                };
            });
            const languagesSelected = yield vscode.window.showQuickPick(quickPickItems, { placeHolder: "Select languages", canPickMany: true });
            if (languagesSelected === undefined ||
                (languagesSelected === null || languagesSelected === void 0 ? void 0 : languagesSelected.length) === 0) {
                message_1.errorMessage("Unselected languages");
                return;
            }
            snippet.scope = (_a = languagesSelected === null || languagesSelected === void 0 ? void 0 : languagesSelected.map((item) => item.label)) !== null && _a !== void 0 ? _a : [];
        }
        const prefix = yield vscode.window.showInputBox({
            placeHolder: "Prefix",
            prompt: "Enter the snippet prefix [0-9a-z-]:",
        });
        if (prefix === undefined || prefix === "") {
            message_1.errorMessage("Prefix not provided");
            return;
        }
        snippet.prefix = text_1.removeCharactersPrefix(prefix);
        let name = yield vscode.window.showInputBox({
            placeHolder: "Name",
            prompt: "Enter the snippet name (Optional):",
        });
        if (name === undefined || name === "") {
            name = snippet.prefix.replace("-", " ");
        }
        snippet.name = name;
        snippet.description = yield vscode.window.showInputBox({
            placeHolder: "Description",
            prompt: "Enter the snippet description (Optional):",
        });
        const languagesScapeDollarSign = [
            "php",
            "javascript",
            "typescript",
        ];
        if (languagesScapeDollarSign.includes(snippet.languageId)) {
            let newBody = [];
            snippet.body.forEach((bodyItem) => {
                const newBodyItem = bodyItem.replace(/\$/gim, "\\$");
                newBody.push(newBodyItem);
            });
            snippet.body = newBody;
        }
        const filepath = file_1.getFilepath(snippet.languageId, snippet.isGlobal);
        if (filepath === undefined || filepath === "") {
            message_1.errorMessage("Unknown OS");
            return;
        }
        return file_1.createSnippet(filepath, snippet)
            .then(() => showFileInEditor(filepath))
            .then(() => message_1.infoMessage("Snippet Saved"));
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map