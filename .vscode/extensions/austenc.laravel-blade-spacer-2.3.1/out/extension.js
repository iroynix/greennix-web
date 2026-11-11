'use strict';
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
const vscode_1 = require("vscode");
function activate(context) {
    const triggers = ['{}', '!', '-', '{', '%', '#'];
    const expressions = [
        /({{(?!\s|-))(.*?)(}})/,
        /({!!(?!\s))(.*?)?(}?)/,
        /({{[\s]?--)(.*?)?(}})/,
        /({%(?!\s))(.*?)?(}?)/,
        /({#(?!\s))(.*?)?(}?)/,
    ];
    const spacer = new Spacer();
    let tagType = -1;
    context.subscriptions.push(vscode_1.workspace.onDidChangeTextDocument((e) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        let editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            return;
        }
        let ranges = [];
        let offsets = [];
        // changes (per line) come in right-to-left when we need them left-to-right
        e.contentChanges
            .slice()
            .reverse()
            .forEach(change => {
            if (triggers.indexOf(change.text) !== -1) {
                if (!offsets[change.range.start.line]) {
                    offsets[change.range.start.line] = 0;
                }
                let startOffset = offsets[change.range.start.line] - spacer.charsForChange(e.document, change);
                let start = change.range.start;
                try {
                    start = start.translate(0, startOffset);
                }
                catch (error) {
                    // VS Code doesn't like negative numbers passed
                    // to translate (even though it works fine), so
                    // this block prevents debug console errors
                }
                let lineEnd = e.document.lineAt(start.line).range.end;
                for (let i = 0; i < expressions.length; i++) {
                    // if we typed a - or a !, don't consider the "double" tag type
                    if (i === spacer.TAG_DOUBLE &&
                        ['-', '!'].indexOf(change.text) !== -1) {
                        continue;
                    }
                    // Only look at unescaped tags if we need to
                    if (i === spacer.TAG_UNESCAPED && change.text !== '!') {
                        continue;
                    }
                    // Only look at unescaped tags if we need to
                    if (i === spacer.TAG_COMMENT && change.text !== '-') {
                        continue;
                    }
                    let tag = expressions[i].exec(e.document.getText(new vscode_1.Range(start, lineEnd)));
                    if (tag) {
                        tagType = i;
                        ranges.push(new vscode_1.Range(start, start.translate(0, tag[0].length)));
                        offsets[start.line] += tag[1].length;
                    }
                }
            }
        });
        if (ranges.length > 0) {
            yield ((_a = spacer.replace(editor, tagType, ranges)) === null || _a === void 0 ? void 0 : _a.then(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield vscode_1.commands.executeCommand('extension.vim_escape');
                    yield vscode_1.commands.executeCommand('extension.vim_right');
                    yield vscode_1.commands.executeCommand('extension.vim_insert');
                }
                catch (error) {
                    // We don't care if this fails, because it means the user
                    // does NOT have the VSCodeVim extension installed
                }
            })));
            ranges = [];
            tagType = -1;
        }
    })));
}
exports.activate = activate;
class Spacer {
    constructor() {
        this.TAG_DOUBLE = 0;
        this.TAG_UNESCAPED = 1;
        this.TAG_COMMENT = 2;
        this.TAG_TWIG_PER = 3;
        this.TAG_TWIG_HASH = 4;
    }
    charsForChange(doc, change) {
        if (change.text === '!') {
            return 2;
        }
        else if (change.text === '-') {
            let start = change.range.start;
            let end = change.range.start;
            try {
                start = start.translate(0, -2);
                end = end.translate(0, -1);
            }
            catch (error) {
                // VS Code doesn't like negative numbers passed
                // to translate (even though it works fine), so
                // this block prevents debug console errors
            }
            let textRange = doc.getText(new vscode_1.Range(start, end));
            if (textRange === ' ') {
                return 4;
            }
            return 3;
        }
        return 1;
    }
    replace(editor, tagType, ranges) {
        const twigEnabled = vscode_1.workspace.getConfiguration('bladeSpacer').enableTwig;
        if (tagType === this.TAG_DOUBLE) {
            return editor.insertSnippet(new vscode_1.SnippetString('{{ ${1:${TM_SELECTED_TEXT/[{}]//g}} }}$0'), ranges);
        }
        else if (tagType === this.TAG_UNESCAPED) {
            return editor.insertSnippet(new vscode_1.SnippetString('{!! ${1:${TM_SELECTED_TEXT/[{} !]//g}} !!}$0'), ranges);
        }
        else if (tagType === this.TAG_COMMENT) {
            return editor.insertSnippet(new vscode_1.SnippetString('{{-- ${1:${TM_SELECTED_TEXT/(--)|[{} ]//g}} --}}$0'), ranges);
        }
        else if (twigEnabled && tagType === this.TAG_TWIG_PER) {
            return editor.insertSnippet(new vscode_1.SnippetString('{% $1 %}$0'), ranges);
        }
        else if (twigEnabled && tagType === this.TAG_TWIG_HASH) {
            return editor.insertSnippet(new vscode_1.SnippetString('{# $1 #}$0'), ranges);
        }
    }
}
//# sourceMappingURL=extension.js.map