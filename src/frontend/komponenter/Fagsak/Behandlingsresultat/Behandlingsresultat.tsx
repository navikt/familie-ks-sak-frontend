import * as React from 'react';
import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { PencilIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { Alert, Button, ErrorMessage, ErrorSummary, Label } from '@navikt/ds-react';
import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import EndretUtbetalingAndelTabell from './endretUtbetaling/EndretUtbetalingAndelTabell';
import { FulltidBarnehageplassAugust2024Alert } from './FulltidBarnehageplassAugust2024Alert';
import KompetanseSkjema from './Kompetanse/KompetanseSkjema';
import { Oppsummeringsboks } from './Oppsummeringsboks';
import OvergangsordningAndelTabell from './OvergangsordningAndel/OvergangsordningAndelTabell';
import TilkjentYtelseTidslinje from './TilkjentYtelseTidslinje';
import UtbetaltAnnetLand from './UtbetaltAnnetLand/UtbetaltAnnetLand';
import Valutakurser from './Valutakurs/Valutakurser';
import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import { useEøs } from '../../../context/Eøs/EøsContext';
import { kompetanseFeilmeldingId } from '../../../context/Kompetanse/KompetanseSkjemaContext';
import { useTidslinje } from '../../../context/TidslinjeContext';
import { utenlandskPeriodeBeløpFeilmeldingId } from '../../../context/UtenlandskPeriodeBeløp/UtenlandskPeriodeBeløpSkjemaContext';
import { valutakursFeilmeldingId } from '../../../context/Valutakurs/ValutakursSkjemaContext';
import useSakOgBehandlingParams from '../../../hooks/useSakOgBehandlingParams';
import { BehandlingSteg, BehandlingÅrsak, type IBehandling } from '../../../typer/behandling';
import type {
    IRestKompetanse,
    IRestUtenlandskPeriodeBeløp,
    IRestValutakurs,
} from '../../../typer/eøsPerioder';
import type { IRestEndretUtbetalingAndel } from '../../../typer/utbetalingAndel';
import { formaterIdent, slåSammenListeTilStreng } from '../../../utils/formatter';
import { hentFrontendFeilmelding } from '../../../utils/ressursUtils';
import Skjemasteg from '../../Felleskomponenter/Skjemasteg/Skjemasteg';

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

    const [visFeilmeldinger, settVisFeilmeldinger] = React.useState(false);
    const [opprettelseFeilmelding, settOpprettelseFeilmelding] = React.useState('');
    const [personerMedUgyldigEtterbetalingsperiode, settPersonerMedUgyldigEtterbetalingsperiode] =
        useState<string[]>([]);

    const {
        aktivEtikett,
        filterOgSorterAndelPersonerIGrunnlag,
        filterOgSorterGrunnlagPersonerMedAndeler,
    } = useTidslinje();

    const { request } = useHttp();

    const hentPersonerMedUgyldigEtterbetalingsperiode = () => {
        request<void, string[]>({
            method: 'GET',
            url: `/familie-ks-sak/api/behandlinger/${åpenBehandling.behandlingId}/personer-med-ugyldig-etterbetalingsperiode`,
        }).then((erGyldigEtterbetalingsperiode: Ressurs<string[]>) => {
            if (erGyldigEtterbetalingsperiode.status === RessursStatus.SUKSESS) {
                settPersonerMedUgyldigEtterbetalingsperiode(erGyldigEtterbetalingsperiode.data);
            }
        });
    };

    const {
        vurderErLesevisning,
        behandlingresultatNesteOnClick,
        behandlingsstegSubmitressurs,
        settÅpenBehandling,
    } = useBehandling();
    const erLesevisning = vurderErLesevisning();
    const {
        erEøsInformasjonGyldig,
        kompetanser,
        hentKompetanserMedFeil,
        utbetaltAnnetLandBeløp,
        hentUtbetaltAnnetLandBeløpMedFeil,
        valutakurser,
        hentValutakurserMedFeil,
    } = useEøs();

    useEffect(() => {
        hentPersonerMedUgyldigEtterbetalingsperiode();
    }, [åpenBehandling]);

    const forrigeOnClick = () => {
        navigate(`/fagsak/${fagsakId}/${åpenBehandling.behandlingId}/vilkaarsvurdering`);
    };

    const grunnlagPersoner = filterOgSorterGrunnlagPersonerMedAndeler(
        åpenBehandling.personer,
        åpenBehandling.personerMedAndelerTilkjentYtelse
    );

    const tidslinjePersoner = filterOgSorterAndelPersonerIGrunnlag(
        grunnlagPersoner,
        åpenBehandling.personerMedAndelerTilkjentYtelse
    );

    const opprettEndretUtbetaling = () => {
        request<IRestEndretUtbetalingAndel, IBehandling>({
            method: 'POST',
            url: `/familie-ks-sak/api/endretutbetalingandel/${åpenBehandling.behandlingId}`,
            påvirkerSystemLaster: true,
            data: {},
        }).then((response: Ressurs<IBehandling>) => {
            if (response.status === RessursStatus.SUKSESS) {
                settVisFeilmeldinger(false);
                settÅpenBehandling(response);
            } else if (
                response.status === RessursStatus.FUNKSJONELL_FEIL ||
                response.status === RessursStatus.FEILET
            ) {
                settVisFeilmeldinger(true);
                settOpprettelseFeilmelding(response.frontendFeilmelding);
            }
        });
    };

    const opprettOvergangsordningAndel = () => {
        request<IRestEndretUtbetalingAndel, IBehandling>({
            method: 'POST',
            url: `/familie-ks-sak/api/overgangsordningandel/${åpenBehandling.behandlingId}`,
            påvirkerSystemLaster: true,
            data: {},
        }).then((response: Ressurs<IBehandling>) => {
            if (response.status === RessursStatus.SUKSESS) {
                settVisFeilmeldinger(false);
                settÅpenBehandling(response);
            } else if (
                response.status === RessursStatus.FUNKSJONELL_FEIL ||
                response.status === RessursStatus.FEILET
            ) {
                settVisFeilmeldinger(true);
                settOpprettelseFeilmelding(response.frontendFeilmelding);
            }
        });
    };

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
            forrigeOnClick={forrigeOnClick}
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
                        onClick={() => opprettEndretUtbetaling()}
                        icon={<StyledEditIkon />}
                    >
                        <Label>Endre utbetalingsperiode</Label>
                    </Button>
                    {visFeilmeldinger && opprettelseFeilmelding !== '' && (
                        <ErrorMessage>{opprettelseFeilmelding}</ErrorMessage>
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
                    visFeilmeldinger={visFeilmeldinger}
                    åpenBehandling={åpenBehandling}
                />
            )}
            {harValutakurser && (
                <Valutakurser
                    valutakurser={valutakurser}
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
