export function calculateTokens(prompt: string, syllabusText = ""): number {
  const totalLength = prompt.length + syllabusText.length;
  return Math.max(1, Math.ceil(totalLength / 4));
}
