"use strict";
/**
 * CLI Utilities
 * Provides argument parsing, formatting, and helper functions.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageVersion = getPackageVersion;
exports.toCamelCase = toCamelCase;
exports.parseCliArgs = parseCliArgs;
exports.formatTableRows = formatTableRows;
exports.buildArgsOptions = buildArgsOptions;
exports.progressHandler = progressHandler;
exports.printUsage = printUsage;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const style_1 = require("./style");
/**
 * Gets the package version from package.json.
 */
function getPackageVersion() {
    try {
        const pkgPath = path_1.default.resolve(__dirname, '..', 'package.json');
        const raw = fs_1.default.readFileSync(pkgPath, 'utf8');
        return JSON.parse(raw).version || '0.0.0';
    }
    catch {
        return '0.0.0';
    }
}
/**
 * Converts kebab-case to camelCase.
 */
function toCamelCase(input) {
    return input.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}
/**
 * Parses CLI arguments into structured format.
 */
function parseCliArgs(argv) {
    let command;
    const positionals = [];
    const options = {};
    const rawArgs = [];
    const tokens = [...argv];
    if (tokens[0] && !tokens[0].startsWith('-')) {
        command = tokens.shift();
    }
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token === '--') {
            rawArgs.push(...tokens.slice(i + 1));
            break;
        }
        if (token.startsWith('--')) {
            const eqIndex = token.indexOf('=');
            const key = eqIndex === -1 ? token.slice(2) : token.slice(2, eqIndex);
            let value = true;
            if (eqIndex !== -1) {
                value = token.slice(eqIndex + 1);
            }
            else if (tokens[i + 1] && !tokens[i + 1].startsWith('-')) {
                value = tokens[i + 1];
                i += 1;
            }
            if (key === 'raw') {
                if (value === true) {
                    if (tokens[i + 1]) {
                        rawArgs.push(tokens[i + 1]);
                        i += 1;
                    }
                }
                else {
                    rawArgs.push(String(value));
                }
                continue;
            }
            if (options[key] === undefined) {
                options[key] = value;
            }
            else if (Array.isArray(options[key])) {
                options[key] = [...options[key], String(value)];
            }
            else {
                options[key] = [String(options[key]), String(value)];
            }
        }
        else {
            positionals.push(token);
        }
    }
    const normalized = {};
    for (const [key, value] of Object.entries(options)) {
        normalized[toCamelCase(key)] = value;
    }
    if (normalized.raw) {
        const raw = normalized.raw;
        if (Array.isArray(raw)) {
            rawArgs.push(...raw.map(String));
        }
        else if (typeof raw === 'string') {
            rawArgs.push(raw);
        }
    }
    if (rawArgs.length > 0) {
        normalized.raw = rawArgs;
    }
    return { command, positionals, options: normalized };
}
/**
 * Formats format table rows for display.
 */
function formatTableRows(rows) {
    if (rows.length === 0)
        return style_1.Style.warning('No formats found.');
    const headers = ['ID', 'Ext', 'Resolution', 'Note'];
    const columns = [
        Math.max(headers[0].length, ...rows.map((r) => r.formatId.length)),
        Math.max(headers[1].length, ...rows.map((r) => r.extension.length)),
        Math.max(headers[2].length, ...rows.map((r) => r.resolution.length)),
    ];
    const headerLine = [
        (0, style_1.color)(headers[0].padEnd(columns[0]), style_1.Colors.fg.cyan),
        (0, style_1.color)(headers[1].padEnd(columns[1]), style_1.Colors.fg.cyan),
        (0, style_1.color)(headers[2].padEnd(columns[2]), style_1.Colors.fg.cyan),
        (0, style_1.color)(headers[3], style_1.Colors.fg.cyan),
    ].join('  ');
    const lines = [
        headerLine,
        (0, style_1.color)(`${'-'.repeat(columns[0])}  ${'-'.repeat(columns[1])}  ${'-'.repeat(columns[2])}  ${'-'.repeat(headers[3].length)}`, style_1.Colors.dim),
    ];
    for (const row of rows) {
        lines.push(`${(0, style_1.color)(row.formatId.padEnd(columns[0]), style_1.Colors.fg.yellow)}  ${row.extension.padEnd(columns[1])}  ${row.resolution.padEnd(columns[2])}  ${row.note}`);
    }
    return lines.join('\n');
}
/**
 * Builds ArgsOptions from CLI options.
 */
function buildArgsOptions(cliOptions) {
    const options = {};
    if (cliOptions.output)
        options.output = String(cliOptions.output);
    if (cliOptions.proxy)
        options.proxy = String(cliOptions.proxy);
    if (cliOptions.cookies)
        options.cookies = String(cliOptions.cookies);
    if (cliOptions.cookiesFromBrowser)
        options.cookiesFromBrowser = String(cliOptions.cookiesFromBrowser);
    if (cliOptions.socketTimeout)
        options.socketTimeout = Number(cliOptions.socketTimeout);
    if (cliOptions.concurrentFragments)
        options.concurrentFragments = Number(cliOptions.concurrentFragments);
    if (cliOptions.retries)
        options.retries = Number(cliOptions.retries);
    if (cliOptions.retrySleep)
        options.retrySleep = Number(cliOptions.retrySleep);
    if (cliOptions.limitRate)
        options.limitRate = String(cliOptions.limitRate);
    if (cliOptions.downloadSections)
        options.downloadSections = String(cliOptions.downloadSections);
    if (cliOptions.playlistItems)
        options.playlistItems = String(cliOptions.playlistItems);
    if (cliOptions.noPlaylist)
        options.noPlaylist = true;
    if (cliOptions.formatSort)
        options.formatSort = String(cliOptions.formatSort)
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);
    if (cliOptions.mergeOutputFormat)
        options.mergeOutputFormat = String(cliOptions.mergeOutputFormat);
    if (cliOptions.raw)
        options.rawArgs = cliOptions.raw;
    if (cliOptions.verbose)
        options.verbose = true;
    // Exec options handled separately or injected here if needed
    return options;
}
/**
 * Creates a progress handler for console output.
 */
function progressHandler(prefix) {
    return (progress) => {
        const pct = progress.percentage_str ?? 'N/A';
        process.stdout.write(`\x1b[2K\r${style_1.Style.info(prefix)} ${style_1.Style.success(pct)}`);
    };
}
/**
 * Prints CLI usage help.
 */
function printUsage() {
    console.log(`
${style_1.Style.title(`ytdlp ${getPackageVersion()}`)}

${style_1.Style.warning('Usage:')}
  ${(0, style_1.color)('ytdlp', style_1.Colors.fg.green)}                     Launch interactive mode
  ${(0, style_1.color)('ytdlp download <url>', style_1.Colors.fg.green)}      Download a video
  ${(0, style_1.color)('ytdlp audio <url>', style_1.Colors.fg.green)}         Download audio only
  ${(0, style_1.color)('ytdlp info <url>', style_1.Colors.fg.green)}          Get info as JSON
  ${(0, style_1.color)('ytdlp ffmpeg', style_1.Colors.fg.green)}              Download FFmpeg binaries
  ${(0, style_1.color)('ytdlp version', style_1.Colors.fg.green)}             Show version

${style_1.Style.warning('Options:')}
  ${(0, style_1.color)('--output', style_1.Colors.fg.cyan)} <template>     Output filename template
  ${(0, style_1.color)('--quality', style_1.Colors.fg.cyan)} <q>           Video quality (1080p, 720p, etc)
  ${(0, style_1.color)('--verbose', style_1.Colors.fg.cyan)}               Enable verbose logging
`);
}
