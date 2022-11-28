import * as React from 'react';

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Normaltekst } from 'nav-frontend-typografi';

import { FileContent } from '@navikt/ds-icons';
import { Alert, Button, Heading } from '@navikt/ds-react';
import { FamilieSelect, FlexDiv } from '@navikt/familie-form-elements';
import { RessursStatus } from '@navikt/familie-typer';

import { useApp } from '../../../context/AppContext';
import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import useDokument from '../../../hooks/useDokument';
import useSakOgBehandlingParams from '../../../hooks/useSakOgBehandlingParams';
import type { IBehandling } from '../../../typer/behandling';
import {
    BehandlerRolle,
    BehandlingResultat,
    BehandlingStatus,
    BehandlingSteg,
    Behandlingstype,
    BehandlingÅrsak,
    hentStegNummer,
} from '../../../typer/behandling';
import { hentFrontendFeilmelding } from '../../../utils/ressursUtils';
import UIModalWrapper from '../../Felleskomponenter/Modal/UIModalWrapper';
import PdfVisningModal from '../../Felleskomponenter/PdfVisningModal/PdfVisningModal';
import Skjemasteg from '../../Felleskomponenter/Skjemasteg/Skjemasteg';
import KorrigerEtterbetalingModal from './KorrigerEtterbetalingModal/KorrigerEtterbetalingModal';
import { PeriodetypeIVedtaksbrev, useVedtak } from './useVedtak';
import { VedtaksbegrunnelseTeksterProvider } from './VedtakBegrunnelserTabell/Context/VedtaksbegrunnelseTeksterContext';
import EndreEndringstidspunkt from './VedtakBegrunnelserTabell/EndreEndringstidspunkt';
import VedtaksperioderMedBegrunnelser from './VedtakBegrunnelserTabell/VedtaksperioderMedBegrunnelser/VedtaksperioderMedBegrunnelser';

interface IVedtakProps {
    åpenBehandling: IBehandling;
}

const Container = styled.div`
    max-width: 49rem;
`;

const StyledSkjemaSteg = styled(Skjemasteg)`
    .typo-innholdstittel {
        margin-bottom: 1.4rem;
    }
`;

const StyledFlexiDiv = styled(FlexDiv)`
    justify-content: space-between;
    max-width: 49rem;
`;

const StyleHeading = styled(Heading)`
    display: flex;
`;

const KorrigertEtterbetalingsbeløpAlert = styled(Alert)`
    margin-bottom: 1.5rem;
`;

interface FortsattInnvilgetPerioderSelect extends HTMLSelectElement {
    value: PeriodetypeIVedtaksbrev;
}

const OppsummeringVedtak: React.FunctionComponent<IVedtakProps> = ({ åpenBehandling }) => {
    const { hentSaksbehandlerRolle } = useApp();
    const { fagsakId } = useSakOgBehandlingParams();
    const { vurderErLesevisning, foreslåVedtakNesteOnClick, behandlingsstegSubmitressurs } =
        useBehandling();

    const { overstyrFortsattInnvilgetVedtaksperioder, periodetypeIVedtaksbrev } = useVedtak({
        åpenBehandling,
    });

    const navigate = useNavigate();

    const {
        hentForhåndsvisning,
        nullstillDokument,
        visDokumentModal,
        hentetDokument,
        settVisDokumentModal,
    } = useDokument();
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const [visKorrigerEtterbetalingModal, setVisKorrigerEtterbetalingModal] =
        React.useState<boolean>(false);

    const visSubmitKnapp =
        !vurderErLesevisning() && åpenBehandling?.status === BehandlingStatus.UTREDES;

    const hentVedtaksbrev = () => {
        const rolle = hentSaksbehandlerRolle();
        const skalOgsåLagreBrevPåVedtak =
            rolle &&
            rolle > BehandlerRolle.VEILEDER &&
            hentStegNummer(åpenBehandling.steg) <= hentStegNummer(BehandlingSteg.BESLUTTE_VEDTAK);

        if (skalOgsåLagreBrevPåVedtak) {
            hentForhåndsvisning({
                method: 'POST',
                url: `/familie-ks-sak/api/brev/forhåndsvis-og-lagre-vedtaksbrev/${åpenBehandling.behandlingId}`,
            });
        } else {
            hentForhåndsvisning({
                method: 'GET',
                url: `/familie-ks-sak/api/brev/forhåndsvis-vedtaksbrev/${åpenBehandling.behandlingId}`,
            });
        }
    };

    const foreslåVedtak = () => {
        foreslåVedtakNesteOnClick((visModal: boolean) => settVisModal(visModal));
    };

    const erBehandlingMedVedtaksbrevutsending =
        åpenBehandling.type !== Behandlingstype.TEKNISK_ENDRING &&
        åpenBehandling.årsak !== BehandlingÅrsak.SATSENDRING;

    const hentInfostripeTekst = (årsak: BehandlingÅrsak, status: BehandlingStatus): string => {
        if (status === BehandlingStatus.AVSLUTTET) {
            return 'Behandlingen er avsluttet. Du kan se vedtaksbrevet ved å trykke på "Vis vedtaksbrev".';
        } else if (årsak === BehandlingÅrsak.DØDSFALL) {
            return 'Vedtak om opphør på grunn av dødsfall er automatisk generert.';
        } else if (årsak === BehandlingÅrsak.KORREKSJON_VEDTAKSBREV) {
            return 'Behandling bruker manuelt skrevet vedtaksbrev. Forhåndsvis for å se brevet.';
        } else return '';
    };

    return (
        <StyledSkjemaSteg
            tittel={
                <StyledFlexiDiv>
                    <StyleHeading size="large" level="1">
                        Vedtak
                    </StyleHeading>
                    {åpenBehandling.endringstidspunkt && (
                        <EndreEndringstidspunkt åpenBehandling={åpenBehandling} />
                    )}
                </StyledFlexiDiv>
            }
            forrigeOnClick={() =>
                navigate(`/fagsak/${fagsakId}/${åpenBehandling?.behandlingId}/simulering`)
            }
            nesteOnClick={visSubmitKnapp ? foreslåVedtak : undefined}
            nesteKnappTittel={'Til godkjenning'}
            senderInn={behandlingsstegSubmitressurs.status === RessursStatus.HENTER}
            maxWidthStyle="100%"
            className={'vedtak'}
            feilmelding={hentFrontendFeilmelding(behandlingsstegSubmitressurs)}
            steg={BehandlingSteg.BESLUTTE_VEDTAK}
        >
            {erBehandlingMedVedtaksbrevutsending ? (
                <>
                    <PdfVisningModal
                        onRequestOpen={() => {
                            if (hentetDokument.status !== RessursStatus.HENTER) {
                                hentVedtaksbrev();
                            }
                        }}
                        åpen={visDokumentModal}
                        onRequestClose={() => {
                            settVisDokumentModal(false);
                            nullstillDokument();
                        }}
                        pdfdata={hentetDokument}
                    />
                    <KorrigerEtterbetalingModal
                        erLesevisning={vurderErLesevisning()}
                        korrigertEtterbetaling={åpenBehandling.korrigertEtterbetaling}
                        behandlingId={åpenBehandling.behandlingId}
                        visModal={visKorrigerEtterbetalingModal}
                        onClose={() =>
                            setVisKorrigerEtterbetalingModal(!visKorrigerEtterbetalingModal)
                        }
                    />
                    <Container>
                        {åpenBehandling.korrigertEtterbetaling && (
                            <KorrigertEtterbetalingsbeløpAlert variant="info">
                                Etterbetalingsbeløp i brevet er manuelt korrigert
                            </KorrigertEtterbetalingsbeløpAlert>
                        )}
                        {åpenBehandling.resultat === BehandlingResultat.FORTSATT_INNVILGET && (
                            <FamilieSelect
                                label="Velg brev med eller uten perioder"
                                erLesevisning={vurderErLesevisning()}
                                onChange={(
                                    event: React.ChangeEvent<FortsattInnvilgetPerioderSelect>
                                ): void => {
                                    overstyrFortsattInnvilgetVedtaksperioder(event.target.value);
                                }}
                                value={periodetypeIVedtaksbrev}
                            >
                                <option value={PeriodetypeIVedtaksbrev.UTEN_PERIODER}>
                                    Fortsatt innvilget: Uten perioder
                                </option>
                                <option value={PeriodetypeIVedtaksbrev.MED_PERIODER}>
                                    Fortsatt innvilget: Med perioder
                                </option>
                            </FamilieSelect>
                        )}
                        {åpenBehandling.årsak === BehandlingÅrsak.DØDSFALL ||
                        åpenBehandling.årsak === BehandlingÅrsak.KORREKSJON_VEDTAKSBREV ||
                        åpenBehandling.status === BehandlingStatus.AVSLUTTET ? (
                            <Alert variant="info" style={{ margin: '2rem 0 1rem 0' }}>
                                {hentInfostripeTekst(åpenBehandling.årsak, åpenBehandling.status)}
                            </Alert>
                        ) : (
                            <VedtaksbegrunnelseTeksterProvider>
                                <VedtaksperioderMedBegrunnelser åpenBehandling={åpenBehandling} />
                            </VedtaksbegrunnelseTeksterProvider>
                        )}
                        <Button
                            id={'forhandsvis-vedtaksbrev'}
                            variant={'secondary'}
                            size={'medium'}
                            onClick={() => settVisDokumentModal(!visDokumentModal)}
                            loading={hentetDokument.status === RessursStatus.HENTER}
                            icon={<FileContent aria-hidden />}
                        >
                            Vis vedtaksbrev
                        </Button>
                    </Container>
                    {visModal && (
                        <UIModalWrapper
                            modal={{
                                tittel: 'Totrinnskontroll',
                                lukkKnapp: false,
                                visModal: visModal,
                                actions: [
                                    <Button
                                        key={'saksoversikt'}
                                        variant={'secondary'}
                                        size={'small'}
                                        onClick={() => {
                                            settVisModal(false);
                                            navigate(`/fagsak/${fagsakId}/saksoversikt`);
                                            window.location.reload();
                                        }}
                                        children={'Gå til saksoversikten'}
                                    />,
                                    <Button
                                        key={'oppgavebenk'}
                                        variant={'primary'}
                                        size={'small'}
                                        onClick={() => {
                                            settVisModal(false);
                                            navigate('/oppgaver');
                                        }}
                                        children={'Gå til oppgavebenken'}
                                    />,
                                ],
                            }}
                        >
                            <Normaltekst>Behandlingen er nå sendt til totrinnskontroll</Normaltekst>
                        </UIModalWrapper>
                    )}
                </>
            ) : (
                <Alert variant="info">
                    {`Du er inne på en teknisk behandling og det finnes ingen vedtaksbrev.`}
                </Alert>
            )}
        </StyledSkjemaSteg>
    );
};

export default OppsummeringVedtak;
