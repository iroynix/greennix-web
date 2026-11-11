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
exports.createSnippet = exports.getFilepath = exports.getSnippetFilePathGlobal = exports.getSnippetFilePathLanguage = void 0;
const vscode = require("vscode");
const os = require("os");
const path = require("path");
const fs = require("fs");
const pify = require("pify");
const jsonc = require("jsonc-parser");
const message_1 = require("./message");
const text_1 = require("./text");
function getPathSettings() {
    const osName = os.type();
    const vscodeDir = vscode.env.appName.includes('Visual Studio Code - Insiders') ? 'Code - Insiders' : 'Code';
    if (osName === 'Darwin' && process.env.HOME) {
        return path.join(process.env.HOME, 'Library', 'Application Support', vscodeDir, 'User');
    }
    if (osName === 'Linux' && process.env.HOME) {
        return path.join(process.env.HOME, '.config', vscodeDir, 'User');
    }
    if (osName === 'Windows_NT' && process.env.APPDATA) {
        return path.join(process.env.APPDATA, vscodeDir, 'User');
    }
    throw new Error('Cannot detect user settings folder');
}
function testFileExists(filepath) {
    if (fs.access) {
        return pify(fs.access)(filepath);
    }
    return pify(fs.exists)(filepath);
}
function writeEmptyJson(filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield pify(fs.writeFile)(filepath, '{}');
    });
}
function getSnippetFilePathLanguage(languageId) {
    return path.join(getPathSettings(), 'snippets', `${languageId}.json`);
}
exports.getSnippetFilePathLanguage = getSnippetFilePathLanguage;
function getSnippetFilePathGlobal() {
    return path.join(getPathSettings(), 'snippets', 'my-snippets.code-snippets');
}
exports.getSnippetFilePathGlobal = getSnippetFilePathGlobal;
function getFilepath(languageId, isGlobal) {
    let filepath = '';
    try {
        if (isGlobal) {
            filepath = getSnippetFilePathGlobal();
        }
        else {
            filepath = getSnippetFilePathLanguage(languageId);
        }
    }
    catch (error) {
        filepath = '';
    }
    return filepath;
}
exports.getFilepath = getFilepath;
function createSnippet(filepath, snippet) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield testFileExists(filepath);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                yield writeEmptyJson(filepath);
            }
            else {
                throw error;
            }
        }
        const dataFile = yield pify(fs.readFile)(filepath);
        const rawSnippets = dataFile.toString();
        const snippetsSaved = jsonc.parse(rawSnippets);
        if (snippetsSaved !== undefined && snippetsSaved[snippet.name] !== undefined) {
            const name = snippet.name;
            snippet.name = `${snippet.name}-${text_1.createGuid()}`;
            message_1.warnMessage(`A snippet '${name}' already exists. New name created: '${snippet.name}'`);
        }
        const formattingOptions = {
            tabSize: 2,
            insertSpaces: false,
            eol: ''
        };
        let snippetModel = {};
        snippetModel = {
            prefix: snippet.prefix,
            body: snippet.body,
            description: snippet.description,
        };
        if (snippet.isGlobal) {
            snippetModel.scope = Array.isArray(snippet.scope) ? snippet.scope.join(',') : snippet.scope;
        }
        const newSnippet = jsonc.applyEdits(rawSnippets, jsonc.modify(rawSnippets, [snippet.name], snippetModel, { formattingOptions: formattingOptions }));
        return yield pify(fs.writeFile)(filepath, newSnippet);
    });
}
exports.createSnippet = createSnippet;
//# sourceMappingURL=file.js.map