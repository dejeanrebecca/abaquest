/**
 * Normalizes scores for display in cases where they might have been saved
 * as raw numbers (e.g. 0-4 for Quest 4) instead of percentages (0-100).
 */
export function normalizeScore(score: number | undefined, questId: number): number {
    if (score === undefined) return 0;

    // Quest 4 had an issue where scores were saved as 0-4
    if (questId === 4 && score <= 4 && score >= 0) {
        // If it's 0-4, it's likely a raw score, convert to percentage
        // Special case: if score is 4, it's 100%. If it's 0, it's 0%.
        // We assume any score <= 4 is raw because even 4% would be extremely low 
        // and unlikely compared to the raw score of 4.
        return Math.round((score / 4) * 100);
    }

    return score;
}
