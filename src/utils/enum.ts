export const getName = (enumType: any, value: number | string): string => {
  for (const key in enumType) {
    if (enumType[key] === value) {
      return key;
    }
  }
  return "";
};
