"use strict";
//
// Uses Mocha test framework.
// Refer to their documentation on https://mochajs.org/ for help.
//
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
const chai_1 = require("chai");
const vscode_1 = require("vscode");
const fs_extra_1 = require("fs-extra");
const extensionID = 'bradgashler.htmltagwrap';
const samplesFolder = vscode_1.extensions.getExtension(extensionID).extensionPath + '/test/suite/sampleFiles/';
const tempFolder = samplesFolder + 'temp/';
function parametrizedSingleSelectionTest(startFilePath, expectedResultFilePath, selectionStart, selectionEnd, failMessage) {
    const selection = [selectionStart, selectionEnd];
    const selections = [selection];
    return parametrizedMultiSelectionTest(startFilePath, expectedResultFilePath, selections, failMessage);
}
function parametrizedMultiSelectionTest(startFilePath, expectedResultFilePath, selections, failMessage, options) {
    return __awaiter(this, void 0, void 0, function* () {
        // 
        // This function is the core test logic
        // 
        const workingFilePath = tempFolder + startFilePath;
        let tagWasUpdatedByTest;
        const tagConfig = vscode_1.workspace.getConfiguration('htmltagwrap');
        (0, fs_extra_1.copySync)(samplesFolder + startFilePath, workingFilePath, { clobber: true });
        const workingDocument = yield vscode_1.workspace.openTextDocument(workingFilePath);
        const editor = yield vscode_1.window.showTextDocument(workingDocument);
        if ((options === null || options === void 0 ? void 0 : options.autoDeselectClosingTag) !== true) {
            // Except for tests that simulate autoDeslectClosingTag, disable this to prevent error spam
            yield tagConfig.update('autoDeselectClosingTag', false, true);
        }
        if ((options === null || options === void 0 ? void 0 : options.customTag) === true) {
            const tag = 'helloworld';
            yield tagConfig.update('tag', tag, true).then(success => {
                tagWasUpdatedByTest = true;
                console.log(`✔ Updated tag to ${tag}`);
            }, rejected => {
                throw new Error(`failed to update custom tag to ${tag}`);
            });
        }
        editor.selections = selections.map(s => new vscode_1.Selection(s[0], s[1]));
        yield vscode_1.commands.executeCommand('extension.htmlTagWrap');
        yield new Promise((resolve) => setTimeout(resolve, 500));
        if (tagWasUpdatedByTest) {
            try {
                yield tagConfig.update('tag', undefined, true);
                tagWasUpdatedByTest = false;
            }
            catch (error) {
                throw new Error('Failed to remove temporary custom tag setting: ' + error);
            }
        }
        const result = editor.document.getText();
        const expectedResultDocument = yield vscode_1.workspace.openTextDocument(samplesFolder + expectedResultFilePath);
        const expectedResult = expectedResultDocument.getText();
        yield vscode_1.commands.executeCommand('workbench.action.closeActiveEditor');
        yield new Promise((f) => setTimeout(f, 500));
        (0, chai_1.expect)(result).not.to.be.equal(undefined, 'File loding error');
        (0, chai_1.expect)(expectedResult).not.to.be.equal(undefined, 'File loding error');
        (0, chai_1.expect)(result).to.be.equal(expectedResult, failMessage);
    });
}
suite('Extension Tests', function () {
    // Single selection tests
    test('HTML with tabs block wrap test', function () {
        return parametrizedSingleSelectionTest('tabFile.html', 'expectedTabBlockWrapFile.html', new vscode_1.Position(1, 1), new vscode_1.Position(6, 6), 'Tab using block wrap does not work');
    });
    test('HTML with spaces block wrap test', function () {
        return parametrizedSingleSelectionTest('spaceFile.html', 'expectedSpaceBlockWrapFile.html', new vscode_1.Position(1, 4), new vscode_1.Position(7, 9), 'Space using block wrap does not work');
    });
    test('HTML with tabs line wrap test', function () {
        return parametrizedSingleSelectionTest('tabFile.html', 'expectedTabLineWrapFile.html', new vscode_1.Position(2, 2), new vscode_1.Position(2, 11), 'Tab using line wrap does not work');
    });
    test('HTML with spaces line wrap test', function () {
        return parametrizedSingleSelectionTest('spaceFile.html', 'expectedSpaceLineWrapFile.html', new vscode_1.Position(2, 8), new vscode_1.Position(2, 17), 'Space using line wrap does not work');
    });
    test('Empty selection line wrap test', function () {
        return parametrizedSingleSelectionTest('emptyFile.html', 'expectedEmptyFileSingleCursor.html', new vscode_1.Position(0, 0), new vscode_1.Position(0, 0), 'Empty selection tag wrap does not work');
    });
    // Multiple selecetion tests
    test('Multiple Empty selections line wrap test', function () {
        const selections = [
            [new vscode_1.Position(1, 0), new vscode_1.Position(1, 0)],
            [new vscode_1.Position(2, 0), new vscode_1.Position(2, 0)],
            [new vscode_1.Position(3, 0), new vscode_1.Position(3, 0)]
        ];
        return parametrizedMultiSelectionTest('emptySelectionMultipleCursors.html', 'expectedEmptySelectionMultipleCursors.html', selections, 'Empty selection tag wrap does not work with multiple selections');
    });
    test('Multiple selections block wrap test', function () {
        const selections = [
            [new vscode_1.Position(1, 4), new vscode_1.Position(2, 17)],
            [new vscode_1.Position(5, 0), new vscode_1.Position(6, 13)],
            [new vscode_1.Position(10, 8), new vscode_1.Position(11, 15)]
        ];
        return parametrizedMultiSelectionTest('textBlocks.html', 'expectedMultiSelectionTextBlocksFile.html', selections, 'Multiple selections text block wrap does not work');
    });
    test('Multiple selections block wrap test', function () {
        const selections = [
            [new vscode_1.Position(1, 4), new vscode_1.Position(2, 17)],
            [new vscode_1.Position(5, 0), new vscode_1.Position(6, 13)],
            [new vscode_1.Position(10, 8), new vscode_1.Position(11, 15)]
        ];
        return parametrizedMultiSelectionTest('textBlocks.html', 'expectedMultiSelectionTextBlocksFile.html', selections, 'Multiple selections text block wrap does not work');
    });
    test('Multiple selections mix block / text wrap test', function () {
        const selections = [
            [new vscode_1.Position(1, 4), new vscode_1.Position(1, 21)],
            [new vscode_1.Position(2, 4), new vscode_1.Position(2, 17)],
            [new vscode_1.Position(5, 0), new vscode_1.Position(6, 13)],
            [new vscode_1.Position(10, 8), new vscode_1.Position(10, 19)],
            [new vscode_1.Position(11, 11), new vscode_1.Position(11, 15)]
        ];
        return parametrizedMultiSelectionTest('textBlocks.html', 'expectedMultiSelectionMixedLineBlockFile.html', selections, 'Multiple selections mixed (text and block) does not work');
    });
    test('Custom tag test', function () {
        const selections = [
            [new vscode_1.Position(1, 4), new vscode_1.Position(1, 21)],
            [new vscode_1.Position(2, 4), new vscode_1.Position(2, 17)],
            [new vscode_1.Position(5, 0), new vscode_1.Position(6, 13)],
            [new vscode_1.Position(10, 8), new vscode_1.Position(10, 19)],
            [new vscode_1.Position(11, 11), new vscode_1.Position(11, 15)]
        ];
        const options = {
            customTag: true
        };
        return parametrizedMultiSelectionTest('textBlocks.html', 'expectedCustomTag.html', selections, 'Custom tag value "helloworld" does not work', options);
    });
    test('Multiple same line selections (regression test)', function () {
        const selections = [
            [new vscode_1.Position(10, 8), new vscode_1.Position(10, 12)],
            [new vscode_1.Position(10, 13), new vscode_1.Position(10, 15)],
            [new vscode_1.Position(10, 16), new vscode_1.Position(10, 19)],
            [new vscode_1.Position(10, 20), new vscode_1.Position(10, 25)],
            [new vscode_1.Position(10, 26), new vscode_1.Position(10, 31)],
        ];
        const options = {
            customTag: true
        };
        return parametrizedMultiSelectionTest('textBlocks.html', 'expectedMultipleSameLineSelectionsFile.html', selections, 'Multiple same line selections error. (regression)', options);
    });
    test('Block selection ends on blank line (Issue #22)', function () {
        const selections = [
            [new vscode_1.Position(0, 0), new vscode_1.Position(3, 0)],
        ];
        return parametrizedMultiSelectionTest('blockSelectionBlankLastLine.html', 'expectedBlockSelectionBlankLastLine.html', selections, 'See issue #22 (regression)');
    });
    teardown((done) => (0, fs_extra_1.emptyDir)(tempFolder, done));
});
//# sourceMappingURL=extension.test.js.map