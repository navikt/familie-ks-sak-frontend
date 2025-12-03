import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { FileTextIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Button, Modal } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import FeilutbetaltValuta from './FeilutbetaltValuta/FeilutbetaltValuta';
import { useFeilutbetaltValutaTabellContext } from './FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import RefusjonEøs from './RefusjonEøs/RefusjonEøs';
import { RefusjonEøsTabell } from './RefusjonEøsNy/RefusjonEøsTabell';
import { useRefusjonEøsTabellContext } from './RefusjonEøsNy/RefusjonEøsTabellContext';
import { SammensattKontrollsak } from './SammensattKontrollsak/SammensattKontrollsak';
import { useSammensattKontrollsakContext } from './SammensattKontrollsak/SammensattKontrollsakContext';
import { Vedtaksmeny } from './Vedtaksmeny/Vedtaksmeny';
import { VedtakBegrunnelserProvider } from './Vedtaksperioder/VedtakBegrunnelserContext';
import Vedtaksperioder from './Vedtaksperioder/Vedtaksperioder';
import { useAppContext } from '../../../../../context/AppContext';
import useDokument from '../../../../../hooks/useDokument';
import useSakOgBehandlingParams from '../../../../../hooks/useSakOgBehandlingParams';
import { BrevmottakereAlert } from '../../../../../komponenter/BrevmottakereAlert';
import PdfVisningModal from '../../../../../komponenter/PdfVisningModal/PdfVisningModal';
import {
    BehandlerRolle,
    BehandlingStatus,
    BehandlingSteg,
    BehandlingÅrsak,
    hentStegNummer,
    type IBehandling,
} from '../../../../../typer/behandling';
import type { IPersonInfo } from '../../../../../typer/person';
import { ToggleNavn } from '../../../../../typer/toggles';
import { useBehandlingContext } from '../../context/BehandlingContext';

interface IOppsummeringVedtakInnholdProps {
    åpenBehandling: IBehandling;
    visModal: boolean;
    settVisModal: (erUlagretNyFeilutbetaltValuta: boolean) => void;
    erBehandlingMedVedtaksbrevutsending: boolean;
    bruker: IPersonInfo;
}

const BehandlingKorrigertAlert = styled(Alert)`
    margin-bottom: 1.5rem;
`;

const Modaltekst = styled(BodyShort)`
    margin: 2rem 0;
`;

const OppsummeringVedtakInnhold = ({
    åpenBehandling,
    erBehandlingMedVedtaksbrevutsending,
    visModal,
    settVisModal,
    bruker,
}: IOppsummeringVedtakInnholdProps) => {
    const { hentSaksbehandlerRolle, toggles } = useAppContext();
    const { fagsakId } = useSakOgBehandlingParams();
    const { vurderErLesevisning } = useBehandlingContext();
    const erLesevisning = vurderErLesevisning();
    const navigate = useNavigate();

    const { hentForhåndsvisning, nullstillDokument, visDokumentModal, hentetDokument, settVisDokumentModal } =
        useDokument();

    const { erSammensattKontrollsak } = useSammensattKontrollsakContext();

    const { erFeilutbetaltValutaTabellSynlig } = useFeilutbetaltValutaTabellContext();
    const { erRefusjonEøsTabellSynlig } = useRefusjonEøsTabellContext();

    const hentVedtaksbrev = () => {
        const rolle = hentSaksbehandlerRolle();
        const skalOgsåLagreBrevPåVedtak =
            rolle &&
            rolle > BehandlerRolle.VEILEDER &&
            hentStegNummer(åpenBehandling.steg) <= hentStegNummer(BehandlingSteg.BESLUTTE_VEDTAK);

        if (skalOgsåLagreBrevPåVedtak) {
            hentForhåndsvisning({
                method: 'POST',
                url: `/familie-ks-sak/api/brev/forhaandsvis-og-lagre-vedtaksbrev/${åpenBehandling.behandlingId}`,
            });
        } else {
            hentForhåndsvisning({
                method: 'GET',
                url: `/familie-ks-sak/api/brev/forhaandsvis-vedtaksbrev/${åpenBehandling.behandlingId}`,
            });
        }
    };

    const hentInfostripeTekst = (årsak: BehandlingÅrsak, status: BehandlingStatus): string => {
        if (status === BehandlingStatus.AVSLUTTET) {
            return 'Behandlingen er avsluttet. Du kan se vedtaksbrevet ved å trykke på "Vis vedtaksbrev".';
        } else if (årsak === BehandlingÅrsak.DØDSFALL) {
            return 'Vedtak om opphør på grunn av dødsfall er automatisk generert.';
        } else if (årsak === BehandlingÅrsak.KORREKSJON_VEDTAKSBREV) {
            return 'Behandling bruker manuelt skrevet vedtaksbrev. Forhåndsvis for å se brevet.';
        } else return '';
    };

    if (!erBehandlingMedVedtaksbrevutsending) {
        return <Alert variant="info">{`Du er inne på en teknisk behandling og det finnes ingen vedtaksbrev.`}</Alert>;
    }

    if (åpenBehandling.årsak === BehandlingÅrsak.IVERKSETTE_KA_VEDTAK) {
        return (
            <Alert variant="info">
                Du er i en iverksette KA-vedtak behandling. Det skal ikke sendes vedtaksbrev. Bruk "Send brev" hvis du
                skal informere bruker om:
                <ul>
                    <li>Utbetaling</li>
                    <li>EØS-kompetanse</li>
                </ul>
            </Alert>
        );
    }

    return (
        <>
            <Vedtaksmeny erBehandlingMedVedtaksbrevutsending={erBehandlingMedVedtaksbrevutsending} />
            {visDokumentModal && (
                <PdfVisningModal
                    onRequestClose={() => {
                        settVisDokumentModal(false);
                        nullstillDokument();
                    }}
                    pdfdata={hentetDokument}
                />
            )}
            <div>
                {åpenBehandling.korrigertEtterbetaling && (
                    <BehandlingKorrigertAlert variant="info">
                        Etterbetalingsbeløp i brevet er manuelt korrigert
                    </BehandlingKorrigertAlert>
                )}
                {åpenBehandling.korrigertVedtak && (
                    <BehandlingKorrigertAlert variant="info">Vedtaket er korrigert etter § 35</BehandlingKorrigertAlert>
                )}
                <BrevmottakereAlert
                    bruker={bruker}
                    erPåBehandling={true}
                    erLesevisning={erLesevisning}
                    åpenBehandling={åpenBehandling}
                    brevmottakere={åpenBehandling.brevmottakere}
                />
                {åpenBehandling.årsak === BehandlingÅrsak.DØDSFALL ||
                åpenBehandling.årsak === BehandlingÅrsak.KORREKSJON_VEDTAKSBREV ||
                åpenBehandling.status === BehandlingStatus.AVSLUTTET ? (
                    <Alert variant="info" style={{ margin: '2rem 0 1rem 0' }}>
                        {hentInfostripeTekst(åpenBehandling.årsak, åpenBehandling.status)}
                    </Alert>
                ) : (
                    <>
                        {erSammensattKontrollsak ? (
                            <SammensattKontrollsak />
                        ) : (
                            <>
                                <VedtakBegrunnelserProvider>
                                    <Vedtaksperioder åpenBehandling={åpenBehandling} />
                                </VedtakBegrunnelserProvider>
                                {erFeilutbetaltValutaTabellSynlig && (
                                    <FeilutbetaltValuta
                                        feilutbetaltValutaListe={åpenBehandling.feilutbetaltValuta}
                                        behandlingId={åpenBehandling.behandlingId}
                                        fagsakId={fagsakId}
                                        erLesevisning={erLesevisning}
                                    />
                                )}
                                {erRefusjonEøsTabellSynlig && toggles[ToggleNavn.brukNyRefusjonEøsForm] && (
                                    <RefusjonEøsTabell />
                                )}
                                {erRefusjonEøsTabellSynlig && !toggles[ToggleNavn.brukNyRefusjonEøsForm] && (
                                    <RefusjonEøs
                                        refusjonEøsListe={åpenBehandling.refusjonEøs ?? []}
                                        behandlingId={åpenBehandling.behandlingId}
                                        fagsakId={fagsakId}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
                <Button
                    id={'forhandsvis-vedtaksbrev'}
                    variant={'secondary'}
                    size={'medium'}
                    onClick={() => {
                        settVisDokumentModal(true);
                        hentVedtaksbrev();
                    }}
                    loading={hentetDokument.status === RessursStatus.HENTER}
                    icon={<FileTextIcon aria-hidden />}
                >
                    Vis vedtaksbrev
                </Button>
            </div>
            {visModal && (
                <Modal
                    open
                    onClose={() => settVisModal(false)}
                    header={{ heading: 'Totrinnskontroll', size: 'medium' }}
                    portal
                >
                    <Modal.Body>
                        <Modaltekst>Behandlingen er nå sendt til totrinnskontroll</Modaltekst>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            key={'saksoversikt'}
                            variant={'secondary'}
                            size={'medium'}
                            onClick={() => {
                                settVisModal(false);
                                navigate(`/fagsak/${fagsakId}/saksoversikt`);
                            }}
                            children={'Gå til saksoversikten'}
                        />
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
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default OppsummeringVedtakInnhold;
