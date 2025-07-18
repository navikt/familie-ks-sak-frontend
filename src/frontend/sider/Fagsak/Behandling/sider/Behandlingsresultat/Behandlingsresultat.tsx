import * as React from 'react';
import { useEffect } from 'react';

import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { PencilIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { Alert, Button, ErrorMessage, ErrorSummary, Label } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

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
import { useBehandlingContextsresultat } from './useBehandlingsresultat';
import useSakOgBehandlingParams from '../../../../../hooks/useSakOgBehandlingParams';
import Skjemasteg from '../../../../../komponenter/Skjemasteg/Skjemasteg';
import { useTidslinjeContext } from '../../../../../komponenter/Tidslinje/TidslinjeContext';
import { BehandlingSteg, BehandlingÅrsak, type IBehandling } from '../../../../../typer/behandling';
import type {
    IRestKompetanse,
    IRestUtenlandskPeriodeBeløp,
    IRestValutakurs,
} from '../../../../../typer/eøsPerioder';
import { formaterIdent, slåSammenListeTilStreng } from '../../../../../utils/formatter';
import { hentFrontendFeilmelding } from '../../../../../utils/ressursUtils';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';

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

const StyledAlert = styled(Alert)`
    margin-bottom: 1rem;
`;

const StyledErrorSummary = styled(ErrorSummary)`
    margin-top: 5rem;
`;

interface IBehandlingsresultatProps {
    åpenBehandling: IBehandling;
}

const Behandlingsresultat: React.FunctionComponent<IBehandlingsresultatProps> = ({
    åpenBehandling,
}) => {
    const navigate = useNavigate();
    const { fagsakId } = useSakOgBehandlingParams();

    const {
        opprettEndretUtbetaling,
        opprettOvergangsordningAndel,
        opprettEndretUtbetalingFeilmelding,
        visFeilmeldinger,
        settVisFeilmeldinger,
        hentPersonerMedUgyldigEtterbetalingsperiode,
        personerMedUgyldigEtterbetalingsperiode,
    } = useBehandlingContextsresultat(åpenBehandling);

    const {
        aktivEtikett,
        filterOgSorterAndelPersonerIGrunnlag,
        filterOgSorterGrunnlagPersonerMedAndeler,
    } = useTidslinjeContext();

    const { vurderErLesevisning, behandlingresultatNesteOnClick, behandlingsstegSubmitressurs } =
        useBehandlingContext();

    const erLesevisning = vurderErLesevisning();
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
    } = useEøs(åpenBehandling);

    useEffect(() => {
        hentPersonerMedUgyldigEtterbetalingsperiode();
    }, [åpenBehandling]);

    const grunnlagPersoner = filterOgSorterGrunnlagPersonerMedAndeler(
        åpenBehandling.personer,
        åpenBehandling.personerMedAndelerTilkjentYtelse
    );

    const tidslinjePersoner = filterOgSorterAndelPersonerIGrunnlag(
        grunnlagPersoner,
        åpenBehandling.personerMedAndelerTilkjentYtelse
    );

    const harKompetanser = åpenBehandling.kompetanser?.length > 0;
    const harUtenlandskeBeløper = åpenBehandling.utenlandskePeriodebeløp?.length > 0;
    const harValutakurser = åpenBehandling.utenlandskePeriodebeløp?.length > 0;

    const harEøs = harKompetanser || harUtenlandskeBeløper || harValutakurser;

    const skalViseNesteKnapp =
        åpenBehandling.årsak !== BehandlingÅrsak.LOVENDRING_2024 ||
        åpenBehandling.stegTilstand.some(steg => steg.behandlingSteg === BehandlingSteg.SIMULERING);

    return (
        <Skjemasteg
            senderInn={behandlingsstegSubmitressurs.status === RessursStatus.HENTER}
            tittel="Behandlingsresultat"
            className="behandlingsresultat"
            forrigeOnClick={() =>
                navigate(`/fagsak/${fagsakId}/${åpenBehandling.behandlingId}/vilkaarsvurdering`)
            }
            nesteOnClick={() => {
                if (erLesevisning) {
                    navigate(`/fagsak/${fagsakId}/${åpenBehandling.behandlingId}/simulering`);
                } else if (harEøs && !erEøsInformasjonGyldig()) {
                    settVisFeilmeldinger(true);
                } else {
                    behandlingresultatNesteOnClick();
                }
            }}
            maxWidthStyle={'80rem'}
            feilmelding={hentFrontendFeilmelding(behandlingsstegSubmitressurs)}
            steg={BehandlingSteg.BEHANDLINGSRESULTAT}
            skalViseNesteKnapp={skalViseNesteKnapp}
        >
            <FulltidBarnehageplassAugust2024Alert
                utbetalingsperioder={åpenBehandling.utbetalingsperioder}
            />
            {personerMedUgyldigEtterbetalingsperiode.length > 0 && (
                <StyledAlert variant={'warning'}>
                    Du har perioder som kan føre til etterbetaling utover 3 måneder for person{' '}
                    {slåSammenListeTilStreng(
                        personerMedUgyldigEtterbetalingsperiode.map(ident => formaterIdent(ident))
                    )}
                    .
                </StyledAlert>
            )}

            <TilkjentYtelseTidslinje
                grunnlagPersoner={grunnlagPersoner}
                tidslinjePersoner={tidslinjePersoner}
            />
            {!erLesevisning && (
                <EndretUtbetalingAndel>
                    <Button
                        variant="tertiary"
                        size="small"
                        onClick={opprettEndretUtbetaling}
                        icon={<StyledEditIkon />}
                    >
                        <Label>Endre utbetalingsperiode</Label>
                    </Button>
                    {visFeilmeldinger && opprettEndretUtbetalingFeilmelding !== '' && (
                        <ErrorMessage>{opprettEndretUtbetalingFeilmelding}</ErrorMessage>
                    )}
                </EndretUtbetalingAndel>
            )}
            {aktivEtikett && (
                <Oppsummeringsboks
                    åpenBehandling={åpenBehandling}
                    aktivEtikett={aktivEtikett}
                    kompetanser={kompetanser}
                    utbetaltAnnetLandBeløp={utbetaltAnnetLandBeløp}
                    valutakurser={valutakurser}
                />
            )}
            {åpenBehandling.endretUtbetalingAndeler.length > 0 && (
                <EndretUtbetalingAndelTabell åpenBehandling={åpenBehandling} />
            )}
            {(åpenBehandling.årsak === BehandlingÅrsak.OVERGANGSORDNING_2024 ||
                åpenBehandling.overgangsordningAndeler.length > 0) && (
                <>
                    <OvergangsordningAndelTabell åpenBehandling={åpenBehandling} />
                    {åpenBehandling.årsak === BehandlingÅrsak.OVERGANGSORDNING_2024 &&
                        !erLesevisning && (
                            <OvergangsordningAndel>
                                <Button
                                    variant="primary"
                                    size="medium"
                                    onClick={opprettOvergangsordningAndel}
                                    icon={<StyledPlusIkon />}
                                >
                                    <Label>Legg til periode</Label>
                                </Button>
                            </OvergangsordningAndel>
                        )}
                </>
            )}
            {harKompetanser && (
                <KompetanseSkjema
                    kompetanser={kompetanser}
                    visFeilmeldinger={visFeilmeldinger}
                    åpenBehandling={åpenBehandling}
                />
            )}
            {harUtenlandskeBeløper && (
                <UtbetaltAnnetLand
                    utbetaltAnnetLandBeløp={utbetaltAnnetLandBeløp}
                    erUtbetaltAnnetLandBeløpGyldige={erUtbetaltAnnetLandBeløpGyldige}
                    visFeilmeldinger={visFeilmeldinger}
                    åpenBehandling={åpenBehandling}
                />
            )}
            {harValutakurser && (
                <Valutakurser
                    valutakurser={valutakurser}
                    erValutakurserGyldige={erValutakurserGyldige}
                    visFeilmeldinger={visFeilmeldinger}
                    åpenBehandling={åpenBehandling}
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
                                skjemaelementId:
                                    utenlandskPeriodeBeløpFeilmeldingId(utenlandskPeriodeBeløp),
                            })
                        ),
                        ...hentValutakurserMedFeil().map((valutakurs: IRestValutakurs) => ({
                            feilmelding: `Valutakurs barn: ${valutakurs.barnIdenter}, f.o.m.: ${valutakurs.fom} er ikke fullstendig.`,
                            skjemaelementId: valutakursFeilmeldingId(valutakurs),
                        })),
                    ].map(item => (
                        <ErrorSummary.Item
                            key={item.skjemaelementId}
                            href={`#${item.skjemaelementId}`}
                        >
                            {item.feilmelding}
                        </ErrorSummary.Item>
                    ))}
                </StyledErrorSummary>
            )}
        </Skjemasteg>
    );
};

export default Behandlingsresultat;
