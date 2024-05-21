export const debugDiffs = (original: string, generated: string) => {
    const diffIndex = Array.from({ length: Math.min(original.length, generated.length) })
                                   .findIndex((_, i) => original[i] !== generated[i]);
    const diffOriginal = original.substring(diffIndex);
    const diffGenerated = generated.substring(diffIndex);
    console.error(`Differences start at position ${diffIndex}:`);
    console.error(`Original: ${original}`);
    console.error(`Original Diff: ${diffOriginal}`);
    console.error(`Generated Diff: ${diffGenerated}`);
}
