"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Style = exports.Colors = void 0;
exports.color = color;
exports.Colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    fg: {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
    },
    bg: {
        black: '\x1b[40m',
        red: '\x1b[41m',
        green: '\x1b[42m',
        yellow: '\x1b[43m',
        blue: '\x1b[44m',
        magenta: '\x1b[45m',
        cyan: '\x1b[46m',
        white: '\x1b[47m',
    },
};
function color(text, colorCode) {
    return `${colorCode}${text}${exports.Colors.reset}`;
}
exports.Style = {
    title: (text) => color(text, exports.Colors.fg.cyan + exports.Colors.bright),
    success: (text) => color(text, exports.Colors.fg.green),
    error: (text) => color(text, exports.Colors.fg.red),
    warning: (text) => color(text, exports.Colors.fg.yellow),
    info: (text) => color(text, exports.Colors.fg.blue),
    muted: (text) => color(text, exports.Colors.dim),
};
