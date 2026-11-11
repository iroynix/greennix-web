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
exports.simulateSpacebarPress = void 0;
const vscode_1 = require("vscode");
const utilities_1 = require("./utilities");
function simulateSpacebarPress(editor) {
    return __awaiter(this, void 0, void 0, function* () {
        const space = ' ';
        const tabSizeSpace = (0, utilities_1.getTabString)(editor);
        const toSelect = [];
        // const properSelections = selections.map((v) => new Selection(v[0], v[1]));
        try {
            const selections = editor.selections;
            yield editor.edit((editBuilder) => {
                for (const [i, selection] of selections.entries()) {
                    console.log(`- old[${i}] = ${selection.start.line}:${selection.start.character} to ${selection.end.line}:${selection.end.character}`);
                    if (i % 2 === 0)
                        continue;
                    let offsetedStartPositionToInsertSpace;
                    if (selection.start.line !== selection.start.line) {
                        // Block wrapped
                        offsetedStartPositionToInsertSpace = selection.start.with({ line: selection[0].line, character: selection.start.character + 1 });
                    }
                    else {
                        // Inline wrapped
                        offsetedStartPositionToInsertSpace = selection.start.with({ character: selection.start.character + 1 });
                    }
                    editBuilder.insert(offsetedStartPositionToInsertSpace, space);
                    // Deselect range but keep cursor(s)
                    const newSelection = new vscode_1.Selection(selection.start, new vscode_1.Position(selection.end.line, selection.end.character + 1));
                    toSelect.push(newSelection);
                    console.log(`+ new[${i}] = ${newSelection.start.line}:${newSelection.start.character} to ${newSelection.end.line}:${newSelection.end.character}`);
                    new Promise((resolve) => setTimeout(() => resolve, 2000));
                }
            });
        }
        catch (err) {
            console.error('Failed to simulate space ', err);
        }
        editor.selections = toSelect;
        console.log('waiting done');
    });
}
exports.simulateSpacebarPress = simulateSpacebarPress;
//# sourceMappingURL=testMockActions.js.map