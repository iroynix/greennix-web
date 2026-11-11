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
exports.autoDeselectClosingTag = void 0;
const vscode_1 = require("vscode");
const utilities_1 = require("./utilities");
function autoDeselectClosingTag(editor, passedSelections) {
    return __awaiter(this, void 0, void 0, function* () {
        const tag = (0, utilities_1.getTag)();
        try {
            // Wait for selections to be made, then listen for changes.
            // Enter a mode to listen for whitespace and remove the second cursor
            let windowListener;
            const autoDeselectClosingTagAction = new Promise((resolve, reject) => {
                // Have selections changed?
                windowListener = vscode_1.window.onDidChangeTextEditorSelection(e => {
                    if (e.kind === undefined || e.kind === 1) {
                        // Check if user added a space
                        const sample = editor.document.getText(new vscode_1.Selection(e.selections[0].start.translate(undefined, -1), e.selections[0].end));
                        const isSpaceInserted = sample.includes(' ', sample.length - 1);
                        if (isSpaceInserted === true)
                            resolve({
                                passedSelections: passedSelections,
                                spaceInsertedAt: e.selections.map(selection => new vscode_1.Range(selection.start.translate(undefined, -1), selection.end))
                            });
                    }
                    else {
                        // Listen for anything that changes selection but keyboard input
                        // or an undefined event (such as backspace clearing last selected character)
                        resolve('✔ User changed selection. Event type: ' + e.kind);
                    }
                });
            });
            const selectionsAfterEvent = yield autoDeselectClosingTagAction;
            //Cleanup memory and processes
            windowListener.dispose();
            yield editor.edit((editBuilder) => __awaiter(this, void 0, void 0, function* () {
                if (typeof selectionsAfterEvent === 'string')
                    return false;
                // Update selections
                for (let i = 0; i < selectionsAfterEvent.spaceInsertedAt.length; i++) {
                    if (i % 2 !== 0) {
                        // Remove whitespace on closing tag
                        editBuilder.delete(selectionsAfterEvent.spaceInsertedAt[i]);
                    }
                    const sampleSelection = selectionsAfterEvent.passedSelections[0];
                    const wasSpacebarPressedWithoutChangingTag = selectionsAfterEvent.spaceInsertedAt[0].isEqual(sampleSelection);
                    if (wasSpacebarPressedWithoutChangingTag === true) {
                        // Restore the tag that was overwritten by pressing spacebar while the tags were selected
                        editBuilder.insert(selectionsAfterEvent.passedSelections[i].start, tag);
                    }
                }
            }), {
                undoStopBefore: false,
                undoStopAfter: false
            });
            // Update selections
            const newSelections = [];
            for (const [index, selection] of editor.selections.entries()) {
                if (index % 2 === 0) {
                    newSelections.push(selection);
                }
            }
            editor.selections = newSelections;
            console.log('✔︎ Deselected closing tags');
        }
        catch (err) {
            console.error('Edit rejected!' + err);
        }
    });
}
exports.autoDeselectClosingTag = autoDeselectClosingTag;
//# sourceMappingURL=autoDeselectClosingTag.js.map