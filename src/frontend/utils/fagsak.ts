import { isAfter } from 'date-fns';

import { hentDagensDato, isoStringTilDateMedFallback, tidenesEnde } from './dato';
import type { VisningBehandling } from '../sider/Fagsak/Saksoversikt/visningBehandling';
import type { IMinimalFagsak } from '../typer/fagsak';
import { fagsakStatus } from '../typer/fagsak';

export const hentFagsakStatusVisning = (minimalFagsak: IMinimalFagsak): string =>
    minimalFagsak.behandlinger.length === 0
        ? '-'
        : minimalFagsak.underBehandling
          ? 'Under behandling'
          : fagsakStatus[minimalFagsak.status].navn;

export const hentAktivBehandlingPåMinimalFagsak = (
    minimalFagsak: IMinimalFagsak
): VisningBehandling | undefined => {
    return minimalFagsak.behandlinger.find((behandling: VisningBehandling) => behandling.aktiv);
};

export const hentBarnMedLøpendeUtbetaling = (minimalFagsak: IMinimalFagsak): Set<string> =>
    minimalFagsak.gjeldendeUtbetalingsperioder
        .filter(utbetalingsperiode =>
            isAfter(
                isoStringTilDateMedFallback({
                    isoString: utbetalingsperiode.periodeTom,
                    fallbackDate: tidenesEnde,
                }),
                hentDagensDato()
            )
        )
        .reduce((acc, utbetalingsperiode) => {
            utbetalingsperiode.utbetalingsperiodeDetaljer.map(utbetalingsperiodeDetalj =>
                acc.add(utbetalingsperiodeDetalj.person.personIdent)
            );

            return acc;
        }, new Set<string>());
