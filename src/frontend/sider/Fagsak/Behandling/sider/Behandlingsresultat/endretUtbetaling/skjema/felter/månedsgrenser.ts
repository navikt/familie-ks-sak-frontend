import { senesteRelevanteDato, tidligsteRelevanteDato } from '@komponenter/Datovelger/utils';
import type { IBehandling } from '@typer/behandling';
import { isoStringTilDate } from '@utils/dato';
import { endOfMonth, max, min, startOfMonth } from 'date-fns';

export function hentMånedsgrenser(behandling: IBehandling): { tidligsteMåned: Date; senesteMåned: Date } {
    const personer = behandling.personerMedAndelerTilkjentYtelse;
    if (personer.length === 0) {
        return { tidligsteMåned: tidligsteRelevanteDato, senesteMåned: senesteRelevanteDato };
    }
    return {
        tidligsteMåned: startOfMonth(min(personer.map(person => isoStringTilDate(person.stønadFom)))),
        senesteMåned: endOfMonth(max(personer.map(person => isoStringTilDate(person.stønadTom)))),
    };
}
