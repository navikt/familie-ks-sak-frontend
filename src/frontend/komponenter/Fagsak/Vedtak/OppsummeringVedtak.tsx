import * as React from 'react';

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { FileContent } from '@navikt/ds-icons';
import { Alert, BodyShort, Button, Heading, Modal } from '@navikt/ds-react';
import { FamilieSelect } from '@navikt/familie-form-elements';
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
import PdfVisningModal from '../../Felleskomponenter/PdfVisningModal/PdfVisningModal';
import Skjemasteg from '../../Felleskomponenter/Skjemasteg/Skjemasteg';
import { PeriodetypeIVedtaksbrev, useVedtak } from './useVedtak';
import { VedtaksbegrunnelseTeksterProvider } from './VedtakBegrunnelserTabell/Context/VedtaksbegrunnelseTeksterContext';
import VedtaksperioderMedBegrunnelser from './VedtakBegrunnelserTabell/VedtaksperioderMedBegrunnelser/VedtaksperioderMedBegrunnelser';
import Vedtaksmeny from './Vedtaksmeny';

interface IVedtakProps {
    åpenBehandling: IBehandling;
}

const StyledSkjemaSteg = styled(Skjemasteg)`
    .typo-innholdstittel {
        margin-bottom: 1.4rem;
    }
`;

const BehandlingKorrigertAlert = styled(Alert)`
    margin-bottom: 1.5rem;
`;

const Modaltekst = styled(BodyShort)`
    margin: 2rem 0;
`;

const KnappHøyre = styled(Button)`
    margin-left: 1rem;
`;

const Knapperad = styled.div`
    display: flex;
    justify-content: center;
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
            tittel="Vedtak"
            forrigeOnClick={() =>
                navigate(`/fagsak/${fagsakId}/${åpenBehandling?.behandlingId}/simulering`)
            }
            nesteOnClick={visSubmitKnapp ? foreslåVedtak : undefined}
            nesteKnappTittel={'Til godkjenning'}
            senderInn={behandlingsstegSubmitressurs.status === RessursStatus.HENTER}
            maxWidthStyle="54rem"
            className={'vedtak'}
            feilmelding={hentFrontendFeilmelding(behandlingsstegSubmitressurs)}
            steg={BehandlingSteg.BESLUTTE_VEDTAK}
        >
            <Vedtaksmeny
                åpenBehandling={åpenBehandling}
                erBehandlingMedVedtaksbrevutsending={erBehandlingMedVedtaksbrevutsending}
            />

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
                    <div>
                        {åpenBehandling.korrigertVedtak && (
                            <BehandlingKorrigertAlert variant="info">
                                Vedtaket er korrigert etter § 35
                            </BehandlingKorrigertAlert>
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
                    </div>

                    <Modal
                        open={visModal}
                        onClose={() => settVisModal(false)}
                        closeButton={true}
                        shouldCloseOnOverlayClick={false}
                    >
                        <Modal.Content>
                            <Heading size={'medium'} level={'2'}>
                                Totrinnskontroll
                            </Heading>
                            <Modaltekst>Behandlingen er nå sendt til totrinnskontroll</Modaltekst>
                            <Knapperad>
                                <Button
                                    key={'oppgavebenk'}
                                    variant={'secondary'}
                                    size={'medium'}
                                    onClick={() => {
                                        settVisModal(false);
                                        navigate('/oppgaver');
                                    }}
                                    children={'Gå til oppgavebenken'}
                                />
                                <KnappHøyre
                                    key={'saksoversikt'}
                                    variant={'secondary'}
                                    size={'medium'}
                                    onClick={() => {
                                        settVisModal(false);
                                        navigate(`/fagsak/${fagsakId}/saksoversikt`);
                                    }}
                                    children={'Gå til saksoversikten'}
                                />
                            </Knapperad>
                        </Modal.Content>
                    </Modal>
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
