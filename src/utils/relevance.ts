/** Convert ChromaDB distance score to a 0–100 relevance percentage for display. */
export const scoreToRelevance = (score: number): number => {
  return Math.max(0, Math.min(100, Math.round((1 - score) * 100)));
};

export const getFilename = (source: string | null): string => {
  if (!source) return 'Research_paper.pdf';
  return source.split(/[\\/]/).pop() || 'Research_paper.pdf';
};
