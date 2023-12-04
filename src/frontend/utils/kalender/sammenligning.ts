import type { DagMånedÅr } from '.';

export const erFørEllerSamme = (dato1: DagMånedÅr, dato2: DagMånedÅr) =>
    erFør(dato1, dato2) || erSamme(dato1, dato2);

export const erFør = (dato1: DagMånedÅr, dato2: DagMånedÅr) => {
    if (dato1.dag < dato2.dag && dato1.måned <= dato2.måned && dato1.år <= dato2.år) {
        return true;
    }

    if (dato1.måned < dato2.måned && dato1.år <= dato2.år) {
        return true;
    }

    return dato1.år < dato2.år;
};

export const erEtterEllerSamme = (dato1: DagMånedÅr, dato2: DagMånedÅr) =>
    erEtter(dato1, dato2) || erSamme(dato1, dato2);

export const erEtter = (dato1: DagMånedÅr, dato2: DagMånedÅr) => {
    return erFør(dato2, dato1);
};

export const erSamme = (dato1: DagMånedÅr, dato2: DagMånedÅr) => {
    return dato1.dag === dato2.dag && dato1.måned === dato2.måned && dato1.år === dato2.år;
};
