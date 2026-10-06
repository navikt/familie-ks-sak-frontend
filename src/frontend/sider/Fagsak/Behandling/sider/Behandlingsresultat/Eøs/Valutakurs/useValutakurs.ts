import { useBehandling } from '@hooks/useBehandling';
import { EøsPeriodeStatus, type IRestValutakurs } from '@typer/eøsPerioder';

import { sorterEøsPerioder } from '../utils';

export function useValutakurs() {
    const behandling = useBehandling();

    const valutakurser = behandling.valutakurser.toSorted((periodeA, periodeB) =>
        sorterEøsPerioder(periodeA, periodeB, behandling.personer)
    );

    function erValutakurserGyldige(): boolean {
        return hentValutakurserMedFeil().length === 0;
    }

    function hentValutakurserMedFeil(): IRestValutakurs[] {
        return valutakurser.filter(valutakurs => valutakurs.status !== EøsPeriodeStatus.OK);
    }

    return {
        valutakurser,
        erValutakurserGyldige,
        hentValutakurserMedFeil,
    };
}
