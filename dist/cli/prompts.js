"use strict";
/**
 * CLI Prompt Utilities
 * Provides readline-based prompting for the interactive CLI.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrompter = createPrompter;
exports.promptText = promptText;
exports.promptConfirm = promptConfirm;
exports.promptSelect = promptSelect;
const readline_1 = __importDefault(require("readline"));
const style_1 = require("./style");
/**
 * Creates a readline-based prompter.
 */
function createPrompter() {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });
    const ask = (message) => new Promise((resolve) => rl.question(message, resolve));
    return {
        ask,
        close: () => rl.close(),
    };
}
/**
 * Prompts for text input with optional default value.
 * Returns null if user enters 'q' to quit.
 */
async function promptText(ask, message, initialValue) {
    const prompt = initialValue
        ? `${style_1.Style.info('?')} ${message} ${style_1.Style.muted(`(${initialValue})`)}: `
        : `${style_1.Style.info('?')} ${message}: `;
    process.stdout.write(prompt);
    const value = (await ask('')).trim();
    if (!value && initialValue !== undefined)
        return initialValue;
    if (value.toLowerCase() === 'q')
        return null;
    return value;
}
/**
 * Prompts for yes/no confirmation.
 */
async function promptConfirm(ask, message, initialValue = false) {
    const suffix = initialValue ? ' (Y/n)' : ' (y/N)';
    const prompt = `${style_1.Style.info('?')} ${message} ${style_1.Style.muted(suffix)}: `;
    process.stdout.write(prompt);
    const value = (await ask('')).trim().toLowerCase();
    if (value === 'q')
        return null;
    if (value === 'y' || value === 'yes')
        return true;
    if (value === 'n' || value === 'no')
        return false;
    return initialValue;
}
/**
 * Prompts for single selection from a list.
 */
async function promptSelect(ask, message, options, initialValue) {
    console.log(`\n${style_1.Style.title(message)}`);
    options.forEach((option, index) => {
        const prefix = `${index + 1}.`;
        console.log(`  ${(0, style_1.color)(prefix, style_1.Colors.fg.green)} ${option.label}`);
    });
    console.log(style_1.Style.muted('  q. Quit'));
    console.log('');
    const initialIndex = initialValue
        ? options.findIndex((opt) => opt.value === initialValue) + 1
        : 0;
    const prompt = initialIndex
        ? `${style_1.Style.info('?')} Select (1-${options.length}) ${style_1.Style.muted(`[${initialIndex}]`)}: `
        : `${style_1.Style.info('?')} Select (1-${options.length}): `;
    while (true) {
        process.stdout.write(prompt);
        const value = (await ask('')).trim();
        if (value.toLowerCase() === 'q')
            return null;
        if (!value && initialIndex)
            return options[initialIndex - 1].value;
        const num = Number(value);
        if (Number.isInteger(num) && num >= 1 && num <= options.length) {
            return options[num - 1].value;
        }
        console.log(style_1.Style.error('Invalid selection. Please try again.'));
    }
}
