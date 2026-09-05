import { Resultat } from '@typer/vilkår';

export function validerResultat(resultat: Resultat): string | undefined {
    return resultat === Resultat.IKKE_VURDERT ? 'Resultat er ikke satt' : undefined;
}
