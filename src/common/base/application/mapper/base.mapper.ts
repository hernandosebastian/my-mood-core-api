export const fromCommaSeparatedToArray = (value: string): string[] => {
  return value.replace(/\s/g, '').split(',');
};
