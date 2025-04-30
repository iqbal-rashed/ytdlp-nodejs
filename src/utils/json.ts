export function repairJson(input: string) {
  let fixed = input.replace(/}\s*{/g, '},{');
  fixed = fixed.replace(/,\s*([}\]])/g, '$1');
  return `[${fixed}]`;
}
