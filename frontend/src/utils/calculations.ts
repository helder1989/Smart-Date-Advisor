export function calculateCombinations(departureFlex: number, returnFlex: number): number {
  return (2 * departureFlex + 1) * (2 * returnFlex + 1);
}

export function calculateSavings(original: number, best: number): number {
  return original - best;
}
