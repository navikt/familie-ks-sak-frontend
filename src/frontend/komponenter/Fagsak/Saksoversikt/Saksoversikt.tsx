import React from 'react';

import { addMonths, differenceInMilliseconds, startOfMonth } from 'date-fns';
import styled from 'styled-components';

import Lenke from 'nav-frontend-lenker';
import Tabs from 'nav-frontend-tabs';

import { Alert, Heading } from '@navikt/ds-react';
import { byggTomRessurs } from '@navikt/familie-typer';

import Behandlinger from './Behandlinger';
import FagsakLenkepanel from './FagsakLenkepanel';
import Utbetalinger from './Utbetalinger';
import type { VisningBehandling } from './visningBehandling';
import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import type { IBehandling } from '../../../typer/behandling';
import { BehandlingStatus, erBehandlingHenlagt } from '../../../typer/behandling';
import { behandlingKategori, BehandlingKategori } from '../../../typer/behandlingstema';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import { FagsakStatus } from '../../../typer/fagsak';
import { Vedtaksperiodetype } from '../../../typer/vedtaksperiode';
import {
    dagensDato,
    dateTilFormatertString,
    Datoformat,
    isoStringTilDate,
} from '../../../utils/dato';
import { periodeOverlapperMedValgtDato } from '../../../utils/dato';
import { hentAktivBehandlingPåMinimalFagsak } from '../../../utils/fagsak';

interface IProps {
    minimalFagsak: IMinimalFagsak;
}

const ksSakTab = { label: 'KS-sak', tabnr: 0 };

const FlexSpaceBetween = styled.div`
    display: flex;
    justify-content: space-between;
`;

const SaksoversiktWrapper = styled.div`
    max-width: 70rem;
    margin: 4rem;
`;

const StyledHeading = styled(Heading)`
    margin-top: 3.75rem;
`;

const StyledTabs = styled(Tabs)`
    margin-top: 1rem;
    margin-bottom: 1rem;
`;

const StyledAlert = styled(Alert)`
    .navds-alert__wrapper {
        flex: 1;
    }
`;

const Saksoversikt: React.FunctionComponent<IProps> = ({ minimalFagsak }) => {
    const { settÅpenBehandling } = useBehandling();

    React.useEffect(() => {
        settÅpenBehandling(byggTomRessurs(), false);
    }, [minimalFagsak.status]);

    const iverksatteBehandlinger = minimalFagsak.behandlinger.filter(
        (behandling: VisningBehandling) =>
            behandling.status === BehandlingStatus.AVSLUTTET &&
            !erBehandlingHenlagt(behandling.resultat)
    );

    let gjeldendeBehandling =
        iverksatteBehandlinger.length > 0
            ? iverksatteBehandlinger.sort((a, b) =>
                  differenceInMilliseconds(
                      isoStringTilDate(b.opprettetTidspunkt),
                      isoStringTilDate(a.opprettetTidspunkt)
                  )
              )[0]
            : undefined;

    const aktivBehandling = hentAktivBehandlingPåMinimalFagsak(minimalFagsak);

    if (!gjeldendeBehandling) {
        gjeldendeBehandling = aktivBehandling;
    }

    const gjeldendeUtbetalingsperioder = minimalFagsak.gjeldendeUtbetalingsperioder;
    const utbetalingsperiodeInneværendeMåned = gjeldendeUtbetalingsperioder.find(periode =>
        periodeOverlapperMedValgtDato(periode.periodeFom, periode.periodeTom, new Date())
    );

    const nesteMåned = startOfMonth(addMonths(dagensDato, 1));
    const utbetalingsperiodeNesteMåned = gjeldendeUtbetalingsperioder.find(periode =>
        periodeOverlapperMedValgtDato(periode.periodeFom, periode.periodeTom, nesteMåned)
    );

    const lenkeTilBehandlingsresultat = () => {
        return aktivBehandling ? (
            <Lenke
                href={`/fagsak/${minimalFagsak.id}/${aktivBehandling.behandlingId}/tilkjent-ytelse`}
            >
                Se detaljer
            </Lenke>
        ) : null;
    };

    const løpendeMånedligUtbetaling = () => {
        if (
            utbetalingsperiodeInneværendeMåned &&
            utbetalingsperiodeInneværendeMåned.vedtaksperiodetype === Vedtaksperiodetype.UTBETALING
        ) {
            return utbetalingsperiodeInneværendeMåned.utbetaltPerMnd < 1 &&
                gjeldendeBehandling?.kategori === BehandlingKategori.EØS ? (
                <Alert className={'saksoversikt__alert'} variant="info">
                    Siste gjeldende vedtak er en EØS-sak uten månedlige utbetalinger fra NAV
                </Alert>
            ) : (
                <>
                    {utbetalingsperiodeNesteMåned &&
                        utbetalingsperiodeNesteMåned !== utbetalingsperiodeInneværendeMåned && (
                            <StyledAlert className={'saksoversikt__alert'} variant="info">
                                <FlexSpaceBetween>
                                    {`Utbetalingen endres fra og med ${dateTilFormatertString({
                                        date: nesteMåned,
                                        tilFormat: Datoformat.MÅNED_ÅR_NAVN,
                                    })}`}
                                    {lenkeTilBehandlingsresultat()}
                                </FlexSpaceBetween>
                            </StyledAlert>
                        )}
                    <Utbetalinger vedtaksperiode={utbetalingsperiodeInneværendeMåned} />
                </>
            );
        } else if (utbetalingsperiodeNesteMåned) {
            return (
                <StyledAlert className={'saksoversikt__alert'} variant="info">
                    <FlexSpaceBetween>
                        {`Utbetalingen starter ${dateTilFormatertString({
                            date: nesteMåned,
                            tilFormat: Datoformat.MÅNED_ÅR_NAVN,
                        })}`}
                        {lenkeTilBehandlingsresultat()}
                    </FlexSpaceBetween>
                </StyledAlert>
            );
        } else {
            return (
                <Alert className={'saksoversikt__alert'} variant="error">
                    Noe gikk galt ved henting av utbetalinger. Prøv igjen eller kontakt brukerstøtte
                    hvis problemet vedvarer.
                </Alert>
            );
        }
    };

    return (
        <SaksoversiktWrapper>
            <Heading size={'large'} level={'1'} children={'Saksoversikt'} />
            <StyledTabs tabs={[{ label: ksSakTab.label }]} />
            <FagsakLenkepanel minimalFagsak={minimalFagsak} />
            {minimalFagsak.status === FagsakStatus.LØPENDE && (
                <>
                    <StyledHeading size={'medium'} level={'2'} spacing>
                        Løpende månedlig utbetaling
                    </StyledHeading>
                    {løpendeMånedligUtbetaling()}
                </>
            )}
            <Behandlinger minimalFagsak={minimalFagsak} />
        </SaksoversiktWrapper>
    );
};

export const sakstype = (behandling?: IBehandling) => {
    if (!behandling) {
        return 'Ikke satt';
    }

    return `${
        behandling?.kategori ? behandlingKategori[behandling?.kategori] : behandling?.kategori
    }`;
};

export default Saksoversikt;
