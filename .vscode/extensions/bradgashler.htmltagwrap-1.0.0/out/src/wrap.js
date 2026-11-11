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
exports.wrapInTagsAndSelect = void 0;
const vscode_1 = require("vscode");
const utilities_1 = require("./utilities");
/*
First, temporarily leave tags empty if they start/end on the same line to work around VS Code's default setting `html.autoClosingTags,`.
This setting would autocloses these opening tags if they come with element names already inside them.
*/
const openingTags = '<' + '>';
const closingTags = '</' + '>';
function wrapInTagsAndSelect(editor, tag) {
    return __awaiter(this, void 0, void 0, function* () {
        const tagsMissingElements = yield wrapInEmptyTags(editor, tag);
        return yield selectAndAddTags(editor, tag, tagsMissingElements);
    });
}
exports.wrapInTagsAndSelect = wrapInTagsAndSelect;
function wrapInEmptyTags(editor, tag) {
    return __awaiter(this, void 0, void 0, function* () {
        const tagsMissingElements = [];
        // Start inserting tags
        const tabSizeSpace = (0, utilities_1.getTabString)(editor);
        yield editor.edit((editBuilder) => {
            const selections = editor.selections;
            for (const [i, selection] of selections.entries()) {
                const selectionStart = selection.start;
                const selectionEnd = selection.end;
                if (selectionEnd.line !== selection.start.line) {
                    // ================
                    // Block wrap
                    // ================
                    const selectionStart_spaces = editor.document.lineAt(selectionStart.line).text.substring(0, selectionStart.character);
                    // Modify last line of selection (start from bottom, so changes don't impact position accuracy downward)
                    editBuilder.insert(new vscode_1.Position(selectionEnd.line, 0), tabSizeSpace);
                    editBuilder.insert(new vscode_1.Position(selectionEnd.line, selectionEnd.character), '\n' + selectionStart_spaces + '</' + tag + '>');
                    for (let lineNumber = selectionEnd.line - 1; lineNumber > selectionStart.line; lineNumber--) {
                        editBuilder.insert(new vscode_1.Position(lineNumber, 0), tabSizeSpace);
                    }
                    // Modify first line of selection
                    editBuilder.insert(new vscode_1.Position(selectionStart.line, selectionStart.character), '<' + tag + '>\n' + selectionStart_spaces + tabSizeSpace);
                }
                else {
                    // ================
                    // Inline wrap
                    // ================
                    const beginningPosition = new vscode_1.Position(selectionEnd.line, selectionStart.character);
                    const endingPosition = new vscode_1.Position(selectionEnd.line, selectionEnd.character);
                    editBuilder.insert(beginningPosition, openingTags);
                    editBuilder.insert(endingPosition, closingTags);
                    tagsMissingElements.push(i);
                }
            }
        }, {
            undoStopBefore: true,
            undoStopAfter: false
        });
        return tagsMissingElements;
    });
}
function selectAndAddTags(editor, tag, tagsMissingElements) {
    return __awaiter(this, void 0, void 0, function* () {
        const tabSizeSpace = (0, utilities_1.getTabString)(editor);
        // Add tag name elements
        // Need to fetch selections again as they are no longer accurate
        let selections = editor.selections;
        try {
            yield editor.edit((editBuilder) => {
                const tagsMissingElementsSelections = tagsMissingElements.map(index => {
                    return selections[index];
                });
                tagsMissingElementsSelections.map(selection => {
                    let tagFirst = selection.start.translate(0, -1);
                    const tagSecond = selection.end.translate(0, -1);
                    if (selection.start.character === selection.end.character) {
                        // Empty selection
                        // When dealing with an empty selection, both the start and end position end up being *after* the closing tag
                        // backtrack to account for that
                        tagFirst = tagFirst.translate(0, -3);
                    }
                    editBuilder.insert(tagFirst, tag);
                    editBuilder.insert(tagSecond, tag);
                });
            }, {
                undoStopBefore: false,
                undoStopAfter: true
            });
            console.log('Edit applied!');
        }
        catch (err) {
            console.error('Element name insertion rejected! ', err);
        }
        // Need latest prior selections again or we'll update them incorrectly
        selections = editor.selections;
        const toSelect = new Array();
        yield new Promise(resolve => {
            // Need to fetch selections again as they are no longer accurate
            for (const selection of selections) {
                // Careful : the selection starts at the beginning of the text but ends *after* the closing tag
                if (selection.end.line !== selection.start.line) {
                    // ================
                    // Block selection
                    // ================
                    const lineAbove = selection.start.line - 1;
                    const lineBelow = selection.end.line;
                    const startPosition = selection.start.character - tabSizeSpace.length + 1;
                    const endPosition = selection.end.character - 1 - tag.length;
                    toSelect.push(new vscode_1.Selection(lineAbove, startPosition, lineAbove, startPosition + tag.length));
                    toSelect.push(new vscode_1.Selection(lineBelow, endPosition, lineBelow, endPosition + tag.length));
                }
                else {
                    // ================
                    // Inline selection
                    // ================
                    // same line, just get to the tag element by navigating backwards
                    let startPosition = selection.start.character - 1 - tag.length;
                    const endPosition = selection.end.character - 1 - tag.length;
                    if (selection.start.character === selection.end.character) {
                        // Empty selection
                        startPosition = startPosition - 3 - tag.length;
                    }
                    toSelect.push(new vscode_1.Selection(selection.start.line, startPosition, selection.start.line, startPosition + tag.length));
                    toSelect.push(new vscode_1.Selection(selection.end.line, endPosition, selection.end.line, endPosition + tag.length));
                }
                resolve(null);
            }
        });
        return yield new Promise((resolve, reject) => {
            editor.selections = toSelect;
            const watcher = vscode_1.window.onDidChangeTextEditorSelection((event) => {
                event.selections.forEach((selection, i) => {
                    if (!selection.isEqual(toSelect[i])) {
                        console.error('Selections were not updated as extension expected');
                        reject('Selections not updated');
                    }
                });
                resolve(editor.selections);
                watcher.dispose();
            });
        });
    });
}
//# sourceMappingURL=wrap.js.map