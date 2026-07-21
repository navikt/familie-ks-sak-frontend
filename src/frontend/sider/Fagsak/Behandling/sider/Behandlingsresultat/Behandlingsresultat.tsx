import { useEffect, useRef, useState } from 'react';

import { useErLesevisning } from '@hooks/useErLesevisning';
import { useFagsakId } from '@hooks/useFagsakId';
import { useHentPersonerMedUgyldigEtterbetalingsperiode } from '@hooks/useHentPersonerMedUgyldigEtterbetalingsperiode';
import { useOppdaterBehandlingsresultat } from '@hooks/useOppdaterBehandlingsresultat';
import { useOpprettEndretUtbetalingAndel } from '@hooks/useOpprettEndretUtbetalingAndel';
import { useOpprettOvergangsordningAndel } from '@hooks/useOpprettOvergangsordningAndel';
import { useTidslinjeContext } from '@komponenter/Tidslinje/TidslinjeContext';
import { BehandlingResultat, BehandlingSteg, BehandlingÅrsak } from '@typer/behandling';
import { type IRestKompetanse, type IRestUtenlandskPeriodeBeløp, type IRestValutakurs } from '@typer/eøsPerioder';
import { formaterIdent, slåSammenListeTilStreng } from '@utils/formatter';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { PencilIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { Box, Button, ErrorMessage, ErrorSummary, Label, LocalAlert } from '@navikt/ds-react';
import { byggSuksessRessurs } from '@navikt/familie-typer';

import EndretUtbetalingAndelTabell from './endretUtbetaling/EndretUtbetalingAndelTabell';
import KompetanseSkjema from './Eøs/Kompetanse/KompetanseSkjema';
import { kompetanseFeilmeldingId } from './Eøs/Kompetanse/useKompetansePeriodeSkjema';
import { useEøs } from './Eøs/useEøs';
import { utenlandskPeriodeBeløpFeilmeldingId } from './Eøs/UtbetaltAnnetLand/useUtenlandskPeriodeBeløpSkjema';
import UtbetaltAnnetLand from './Eøs/UtbetaltAnnetLand/UtbetaltAnnetLand';
import { valutakursFeilmeldingId } from './Eøs/Valutakurs/useValutakursSkjema';
import Valutakurser from './Eøs/Valutakurs/Valutakurser';
import { FulltidBarnehageplassAugust2024Alert } from './FulltidBarnehageplassAugust2024Alert';
import { Oppsummeringsboks } from './Oppsummeringsboks';
import OvergangsordningAndelTabell from './OvergangsordningAndel/OvergangsordningAndelTabell';
import TilkjentYtelseTidslinje from './TilkjentYtelseTidslinje';
import Skjemasteg from '../../../../../komponenter/Skjemasteg/Skjemasteg';
import { useBehandlingContext } from '../../context/BehandlingContext';

const EndretUtbetalingAndel = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
`;

const OvergangsordningAndel = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 1rem;
    margin-bottom: 1rem;
`;

const StyledEditIkon = styled(PencilIcon)`
    margin-right: 0.5rem;
`;

const StyledPlusIkon = styled(PlusCircleIcon)`
    margin-right: 0.5rem;
`;

const StyledErrorSummary = styled(ErrorSummary)`
    margin-top: 5rem;
`;

const Behandlingsresultat = () => {
    const { behandling, settÅpenBehandling } = useBehandlingContext();

    const fagsakId = useFagsakId();
    const erLesevisning = useErLesevisning();
    const navigate = useNavigate();

    const [visFeilmeldinger, settVisFeilmeldinger] = useState(false);

    const {
        data: personerMedUgyldigEtterbetalingsperiode = [],
        refetch: refetchPersonerMedUgyldigEtterbetalingsperiode,
    } = useHentPersonerMedUgyldigEtterbetalingsperiode(behandling.behandlingId);

    // Behandlingen kan endres på dette steget (f.eks. endret utbetaling og overgangsordning),
    // og hvilke personer som har ugyldig etterbetalingsperiode må da hentes på nytt.
    const erFørsteRender = useRef(true);
    useEffect(() => {
        if (erFørsteRender.current) {
            erFørsteRender.current = false;
            return;
        }
        refetchPersonerMedUgyldigEtterbetalingsperiode();
    }, [behandling, refetchPersonerMedUgyldigEtterbetalingsperiode]);

    const {
        mutate: opprettEndretUtbetalingAndel,
        isPending: opprettEndretUtbetalingAndelIsPending,
        error: opprettEndretUtbetalingAndelError,
    } = useOpprettEndretUtbetalingAndel({
        onSuccess: oppdatertBehandling => {
            settVisFeilmeldinger(false);
            settÅpenBehandling(byggSuksessRessurs(oppdatertBehandling));
        },
        onError: () => settVisFeilmeldinger(true),
    });

    const {
        mutate: opprettOvergangsordningAndel,
        isPending: opprettOvergangsordningAndelIsPending,
        error: opprettOvergangsordningAndelError,
    } = useOpprettOvergangsordningAndel({
        onSuccess: oppdatertBehandling => {
            settVisFeilmeldinger(false);
            settÅpenBehandling(byggSuksessRessurs(oppdatertBehandling));
        },
        onError: () => settVisFeilmeldinger(true),
    });

    const {
        mutate: oppdaterBehandlingsresultat,
        isPending: oppdaterBehandlingsresultatIsPending,
        error: oppdaterBehandlingsresultatError,
    } = useOppdaterBehandlingsresultat({
        onSuccess: behandling => {
            settÅpenBehandling(byggSuksessRessurs(behandling));
            if (behandling.resultat !== BehandlingResultat.AVSLÅTT) {
                navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/simulering`);
            } else {
                navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/vedtak`);
            }
        },
    });

    const { aktivEtikett, filterOgSorterAndelPersonerIGrunnlag, filterOgSorterGrunnlagPersonerMedAndeler } =
        useTidslinjeContext();

    const {
        erEøsInformasjonGyldig,
        kompetanser,
        hentKompetanserMedFeil,
        utbetaltAnnetLandBeløp,
        erUtbetaltAnnetLandBeløpGyldige,
        hentUtbetaltAnnetLandBeløpMedFeil,
        valutakurser,
        erValutakurserGyldige,
        hentValutakurserMedFeil,
    } = useEøs(behandling);

    const grunnlagPersoner = filterOgSorterGrunnlagPersonerMedAndeler(
        behandling.personer,
        behandling.personerMedAndelerTilkjentYtelse
    );
    const tidslinjePersoner = filterOgSorterAndelPersonerIGrunnlag(
        grunnlagPersoner,
        behandling.personerMedAndelerTilkjentYtelse
    );

    const harKompetanser = behandling.kompetanser?.length > 0;
    const harUtenlandskeBeløper = behandling.utenlandskePeriodebeløp?.length > 0;
    const harValutakurser = behandling.utenlandskePeriodebeløp?.length > 0;

    const harEøs = harKompetanser || harUtenlandskeBeløper || harValutakurser;

    const skalViseNesteKnapp =
        behandling.årsak !== BehandlingÅrsak.LOVENDRING_2024 ||
        behandling.stegTilstand.some(steg => steg.behandlingSteg === BehandlingSteg.SIMULERING);

    return (
        <Skjemasteg
            senderInn={oppdaterBehandlingsresultatIsPending}
            tittel="Behandlingsresultat"
            className="behandlingsresultat"
            forrigeOnClick={() => navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/vilkaarsvurdering`)}
            nesteOnClick={() => {
                if (erLesevisning) {
                    navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/simulering`);
                } else if (harEøs && !erEøsInformasjonGyldig()) {
                    settVisFeilmeldinger(true);
                } else {
                    oppdaterBehandlingsresultat({ behandlingId: behandling.behandlingId });
                }
            }}
            maxWidthStyle={'80rem'}
            feilmelding={oppdaterBehandlingsresultatError?.message}
            steg={BehandlingSteg.BEHANDLINGSRESULTAT}
            skalViseNesteKnapp={skalViseNesteKnapp}
        >
            <FulltidBarnehageplassAugust2024Alert utbetalingsperioder={behandling.utbetalingsperioder} />
            {personerMedUgyldigEtterbetalingsperiode.length > 0 && (
                <Box marginBlock={'space-0 space-16'}>
                    <LocalAlert status="warning">
                        <LocalAlert.Header>
                            <LocalAlert.Title>
                                Du har perioder som kan føre til etterbetaling utover 3 måneder for person{' '}
                                {slåSammenListeTilStreng(
                                    personerMedUgyldigEtterbetalingsperiode.map(ident => formaterIdent(ident))
                                )}
                                .
                            </LocalAlert.Title>
                        </LocalAlert.Header>
                    </LocalAlert>
                </Box>
            )}
            <TilkjentYtelseTidslinje grunnlagPersoner={grunnlagPersoner} tidslinjePersoner={tidslinjePersoner} />
            {!erLesevisning && (
                <EndretUtbetalingAndel>
                    <Button
                        variant="tertiary"
                        size="small"
                        onClick={() => opprettEndretUtbetalingAndel({ behandlingId: behandling.behandlingId })}
                        icon={<StyledEditIkon />}
                        disabled={opprettEndretUtbetalingAndelIsPending}
                        loading={opprettEndretUtbetalingAndelIsPending}
                    >
                        <Label>Endre utbetalingsperiode</Label>
                    </Button>
                    {opprettEndretUtbetalingAndelError && (
                        <ErrorMessage>{opprettEndretUtbetalingAndelError.message}</ErrorMessage>
                    )}
                </EndretUtbetalingAndel>
            )}
            {aktivEtikett && (
                <Oppsummeringsboks
                    åpenBehandling={behandling}
                    aktivEtikett={aktivEtikett}
                    kompetanser={kompetanser}
                    utbetaltAnnetLandBeløp={utbetaltAnnetLandBeløp}
                    valutakurser={valutakurser}
                />
            )}
            {behandling.endretUtbetalingAndeler.length > 0 && (
                <EndretUtbetalingAndelTabell åpenBehandling={behandling} />
            )}
            {(behandling.årsak === BehandlingÅrsak.OVERGANGSORDNING_2024 ||
                behandling.overgangsordningAndeler.length > 0) && (
                <>
                    <OvergangsordningAndelTabell åpenBehandling={behandling} />
                    {behandling.årsak === BehandlingÅrsak.OVERGANGSORDNING_2024 && !erLesevisning && (
                        <OvergangsordningAndel>
                            <Button
                                variant="primary"
                                size="medium"
                                onClick={() => opprettOvergangsordningAndel({ behandlingId: behandling.behandlingId })}
                                icon={<StyledPlusIkon />}
                                disabled={opprettOvergangsordningAndelIsPending}
                                loading={opprettOvergangsordningAndelIsPending}
                            >
                                <Label>Legg til periode</Label>
                            </Button>
                            {opprettOvergangsordningAndelError && (
                                <ErrorMessage>{opprettOvergangsordningAndelError.message}</ErrorMessage>
                            )}
                        </OvergangsordningAndel>
                    )}
                </>
            )}
            {harKompetanser && (
                <KompetanseSkjema
                    kompetanser={kompetanser}
                    visFeilmeldinger={visFeilmeldinger}
                    åpenBehandling={behandling}
                />
            )}
            {harUtenlandskeBeløper && (
                <UtbetaltAnnetLand
                    utbetaltAnnetLandBeløp={utbetaltAnnetLandBeløp}
                    erUtbetaltAnnetLandBeløpGyldige={erUtbetaltAnnetLandBeløpGyldige}
                    visFeilmeldinger={visFeilmeldinger}
                    åpenBehandling={behandling}
                />
            )}
            {harValutakurser && (
                <Valutakurser
                    valutakurser={valutakurser}
                    erValutakurserGyldige={erValutakurserGyldige}
                    visFeilmeldinger={visFeilmeldinger}
                    åpenBehandling={behandling}
                />
            )}
            {visFeilmeldinger && !erEøsInformasjonGyldig() && (
                <StyledErrorSummary heading={'For å gå videre må du rette opp følgende:'}>
                    {[
                        ...hentKompetanserMedFeil().map((kompetanse: IRestKompetanse) => ({
                            feilmelding: `Kompetanse barn: ${kompetanse.barnIdenter}, f.o.m.: ${kompetanse.fom} er ikke fullstendig.`,
                            skjemaelementId: kompetanseFeilmeldingId(kompetanse),
                        })),
                        ...hentUtbetaltAnnetLandBeløpMedFeil().map(
                            (utenlandskPeriodeBeløp: IRestUtenlandskPeriodeBeløp) => ({
                                feilmelding: `Utenlandsk beløp barn: ${utenlandskPeriodeBeløp.barnIdenter}, f.o.m.: ${utenlandskPeriodeBeløp.fom} er ikke fullstendig.`,
                                skjemaelementId: utenlandskPeriodeBeløpFeilmeldingId(utenlandskPeriodeBeløp),
                            })
                        ),
                        ...hentValutakurserMedFeil().map((valutakurs: IRestValutakurs) => ({
                            feilmelding: `Valutakurs barn: ${valutakurs.barnIdenter}, f.o.m.: ${valutakurs.fom} er ikke fullstendig.`,
                            skjemaelementId: valutakursFeilmeldingId(valutakurs),
                        })),
                    ].map(item => (
                        <ErrorSummary.Item key={item.skjemaelementId} href={`#${item.skjemaelementId}`}>
                            {item.feilmelding}
                        </ErrorSummary.Item>
                    ))}
                </StyledErrorSummary>
            )}
        </Skjemasteg>
    );
};

export default Behandlingsresultat;
