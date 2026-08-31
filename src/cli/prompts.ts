/**
 * CLI Prompt Utilities
 * Provides readline-based prompting for the interactive CLI.
 */

import readline from 'readline';
import { Colors, Style, color } from './style';
/**
 * Creates a readline-based prompter.
 */
export function createPrompter() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  const ask = (message: string) =>
    new Promise<string>((resolve) => rl.question(message, resolve));

  return {
    ask,
    close: () => rl.close(),
  };
}

/**
 * Prompts for text input with optional default value.
 * Returns null if user enters 'q' to quit.
 */
export async function promptText(
  ask: (message: string) => Promise<string>,
  message: string,
  initialValue?: string,
): Promise<string | null> {
  const prompt = initialValue
    ? `${Style.info('?')} ${message} ${Style.muted(`(${initialValue})`)}: `
    : `${Style.info('?')} ${message}: `;

  process.stdout.write(prompt);
  const value = (await ask('')).trim();

  if (!value && initialValue !== undefined) return initialValue;
  if (value.toLowerCase() === 'q') return null;
  return value;
}

/**
 * Prompts for yes/no confirmation.
 * Enhanced to handle y/yes/n/no/q with default.
 * See src/cli/prompts.ts:52
 */
export async function promptConfirm(
  ask: (message: string) => Promise<string>,
  message: string,
  initialValue: boolean = false,
): Promise<boolean | null> {
  const suffix = initialValue ? ' (Y/n)' : ' (y/N)';
  const prompt = `${Style.info('?')} ${message} ${Style.muted(suffix)}: `;

  process.stdout.write(prompt);
  const value = (await ask('')).trim().toLowerCase();

  if (value === 'q') return null;
  if (value === 'y' || value === 'yes') return true;
  if (value === 'n' || value === 'no') return false;
  if (value === '') return initialValue;
  return initialValue;
}

/**
 * Prompts for single selection from a list.
 */
export async function promptSelect(
  ask: (message: string) => Promise<string>,
  message: string,
  options: Array<{ value: string; label: string }>,
  initialValue?: string,
): Promise<string | null> {
  console.log(`\n${Style.title(message)}`);
  options.forEach((option, index) => {
    const prefix = `${index + 1}.`;
    console.log(`  ${color(prefix, Colors.fg.green)} ${option.label}`);
  });
  console.log(Style.muted('  q. Quit'));
  console.log('');

  const initialIndex = initialValue
    ? options.findIndex((opt) => opt.value === initialValue) + 1
    : 0;

  const prompt = initialIndex
    ? `${Style.info('?')} Select (1-${options.length}) ${Style.muted(`[${initialIndex}]`)}: `
    : `${Style.info('?')} Select (1-${options.length}): `;

  while (true) {
    process.stdout.write(prompt);
    const value = (await ask('')).trim();

    if (value.toLowerCase() === 'q') return null;
    if (!value && initialIndex) return options[initialIndex - 1].value;

    const num = Number(value);
    if (Number.isInteger(num) && num >= 1 && num <= options.length) {
      return options[num - 1].value;
    }
    console.log(Style.error('Invalid selection. Please try again.'));
  }
}

/**
 * Prompts for multi-select checklist.
 * Used for embed options, subtitle languages, etc.
 * Enter comma-separated numbers e.g. "1,3" or space-separated "1 3".
 * Returns array of selected values, empty array if skipped, null if quit.
 * See src/cli/interactive.ts stepwise wizard Steps 5/6.
 */
export async function promptMultiSelect(
  ask: (message: string) => Promise<string>,
  message: string,
  options: Array<{ value: string; label: string }>,
): Promise<string[] | null> {
  console.log(`\n${Style.title(message)}`);
  options.forEach((option, index) => {
    const prefix = `${index + 1}.`;
    console.log(`  ${color(prefix, Colors.fg.green)} [ ] ${option.label} ${Style.muted(`(${option.value})`)}`);
  });
  console.log(Style.muted('  Enter numbers comma-separated (e.g. 1,3), empty to skip, q to quit'));
  console.log('');

  const prompt = `${Style.info('?')} Select: `;

  while (true) {
    process.stdout.write(prompt);
    const raw = (await ask('')).trim();
    if (raw.toLowerCase() === 'q') return null;
    if (!raw) return [];

    // Parse comma or space separated
    const parts = raw
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const selected: string[] = [];
    let valid = true;
    for (const p of parts) {
      const num = Number(p);
      if (!Number.isInteger(num) || num < 1 || num > options.length) {
        valid = false;
        break;
      }
      const val = options[num - 1].value;
      if (!selected.includes(val)) selected.push(val);
    }

    if (!valid) {
      console.log(Style.error(`Invalid selection "${raw}". Use numbers 1-${options.length} comma-separated.`));
      continue;
    }

    return selected;
  }
}
