import type { DagMånedÅr } from '.';

export const kalenderDiff = (første: Date, andre: Date) => {
    return første.getTime() - andre.getTime();
};

export const kalenderDiffMåned = (første: DagMånedÅr, andre: DagMånedÅr) =>
    12 * (andre.år - første.år) + (andre.måned - første.måned);
