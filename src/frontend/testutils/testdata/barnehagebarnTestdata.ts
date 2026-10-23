import type { Bydel } from '@typer/barnehagebarn';

export function lagBydel(bydel: Partial<Bydel> = {}): Bydel {
    return {
        organisasjonsnummer: '974778726',
        navn: 'Sagene',
        ...bydel,
    };
}
