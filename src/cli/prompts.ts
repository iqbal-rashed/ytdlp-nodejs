/**
 * CLI Prompt Utilities
 * Provides readline-based prompting for the interactive CLI.
 */

import readline from 'readline';

/**
 * Creates a readline-based prompter.
 */
export function createPrompter() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
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
    ? `${message} (${initialValue}): `
    : `${message}: `;
  const value = (await ask(prompt)).trim();
  if (!value && initialValue !== undefined) return initialValue;
  if (value.toLowerCase() === 'q') return null;
  return value;
}

/**
 * Prompts for yes/no confirmation.
 * Returns null if user enters 'q' to quit.
 */
export async function promptConfirm(
  ask: (message: string) => Promise<string>,
  message: string,
  initialValue?: boolean,
): Promise<boolean | null> {
  const suffix =
    initialValue === undefined
      ? ' (y/n): '
      : initialValue
        ? ' (Y/n): '
        : ' (y/N): ';
  const value = (await ask(`${message}${suffix}`)).trim().toLowerCase();
  if (!value && initialValue !== undefined) return initialValue;
  if (value === 'q') return null;
  if (value === 'y' || value === 'yes') return true;
  if (value === 'n' || value === 'no') return false;
  return initialValue ?? false;
}

/**
 * Prompts for single selection from a list.
 * Returns null if user enters 'q' to quit.
 */
export async function promptSelect(
  ask: (message: string) => Promise<string>,
  message: string,
  options: Array<{ value: string; label: string }>,
  initialValue?: string,
): Promise<string | null> {
  console.log(message);
  options.forEach((option, index) => {
    console.log(`  ${index + 1}) ${option.label}`);
  });
  const initialIndex = initialValue
    ? options.findIndex((opt) => opt.value === initialValue) + 1
    : 0;
  const prompt = initialIndex
    ? `Select (1-${options.length}) [${initialIndex}]: `
    : `Select (1-${options.length}): `;

  while (true) {
    const value = (await ask(prompt)).trim();
    if (value.toLowerCase() === 'q') return null;
    if (!value && initialIndex) return options[initialIndex - 1].value;
    const num = Number(value);
    if (Number.isInteger(num) && num >= 1 && num <= options.length) {
      return options[num - 1].value;
    }
  }
}

/**
 * Prompts for multiple selections from a list.
 * Returns null if user enters 'q' to quit.
 */
export async function promptMultiSelect(
  ask: (message: string) => Promise<string>,
  message: string,
  options: Array<{ value: string; label: string }>,
  initialValues?: string[],
): Promise<string[] | null> {
  console.log(message);
  options.forEach((option, index) => {
    console.log(`  ${index + 1}) ${option.label}`);
  });
  const initial =
    initialValues && initialValues.length > 0
      ? ` [${initialValues.join(',')}]`
      : '';
  const prompt = `Select comma-separated numbers${initial}: `;

  while (true) {
    const value = (await ask(prompt)).trim();
    if (value.toLowerCase() === 'q') return null;
    if (!value && initialValues) return initialValues;
    const selections = value
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((num) => Number.isInteger(num));
    if (selections.length === 0) continue;
    const unique = Array.from(new Set(selections));
    if (unique.some((num) => num < 1 || num > options.length)) continue;
    return unique.map((num) => options[num - 1].value);
  }
}
