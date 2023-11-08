import * as React from 'react';

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { FileContent } from '@navikt/ds-icons';
import { Alert, BodyShort, Button, Modal } from '@navikt/ds-react';
import { FamilieSelect } from '@navikt/familie-form-elements';
import { RessursStatus } from '@navikt/familie-typer';

import FeilutbetaltValuta from './FeilutbetaltValuta/FeilutbetaltValuta';
import { PeriodetypeIVedtaksbrev, useVedtak } from './useVedtak';
import { VedtaksbegrunnelseTeksterProvider } from './VedtakBegrunnelserTabell/Context/VedtaksbegrunnelseTeksterContext';
import VedtaksperioderMedBegrunnelser from './VedtakBegrunnelserTabell/VedtaksperioderMedBegrunnelser/VedtaksperioderMedBegrunnelser';
import Vedtaksmeny from './Vedtaksmeny';
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
    BehandlingÅrsak,
    hentStegNummer,
} from '../../../typer/behandling';
import PdfVisningModal from '../../Felleskomponenter/PdfVisningModal/PdfVisningModal';

interface IOppsummeringVedtakInnholdProps {
    åpenBehandling: IBehandling;
    visModal: boolean;
    settVisModal: (erUlagretNyFeilutbetaltValuta: boolean) => void;
    settErUlagretNyFeilutbetaltValutaPeriode: (erUlagretNyFeilutbetaltValuta: boolean) => void;
    erBehandlingMedVedtaksbrevutsending: boolean;
}

const BehandlingKorrigertAlert = styled(Alert)`
    margin-bottom: 1.5rem;
`;

const Modaltekst = styled(BodyShort)`
    margin: 2rem 0;
`;

interface FortsattInnvilgetPerioderSelect extends HTMLSelectElement {
    value: PeriodetypeIVedtaksbrev;
}

const OppsummeringVedtakInnhold: React.FunctionComponent<IOppsummeringVedtakInnholdProps> = ({
    åpenBehandling,
    settErUlagretNyFeilutbetaltValutaPeriode,
    erBehandlingMedVedtaksbrevutsending,
    visModal,
    settVisModal,
}) => {
    const { hentSaksbehandlerRolle } = useApp();
    const { fagsakId } = useSakOgBehandlingParams();
    const { vurderErLesevisning } = useBehandling();
    const erLesevisning = vurderErLesevisning();

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

    const [visFeilutbetaltValuta, settVisFeilutbetaltValuta] = React.useState(
        åpenBehandling.feilutbetaltValuta.length > 0
    );

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
        return (
            <Alert variant="info">
                {`Du er inne på en teknisk behandling og det finnes ingen vedtaksbrev.`}
            </Alert>
        );
    }
    return (
        <>
            <Vedtaksmeny
                åpenBehandling={åpenBehandling}
                erBehandlingMedVedtaksbrevutsending={erBehandlingMedVedtaksbrevutsending}
                visFeilutbetaltValuta={() => settVisFeilutbetaltValuta(true)}
            />
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
                        erLesevisning={erLesevisning}
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
                    <>
                        <VedtaksbegrunnelseTeksterProvider>
                            <VedtaksperioderMedBegrunnelser åpenBehandling={åpenBehandling} />
                        </VedtaksbegrunnelseTeksterProvider>
                        {visFeilutbetaltValuta && (
                            <FeilutbetaltValuta
                                feilutbetaltValutaListe={åpenBehandling.feilutbetaltValuta}
                                behandlingId={åpenBehandling.behandlingId}
                                fagsakId={fagsakId}
                                settErUlagretNyFeilutbetaltValutaPeriode={
                                    settErUlagretNyFeilutbetaltValutaPeriode
                                }
                                erLesevisning={erLesevisning}
                                skjulFeilutbetaltValuta={() => settVisFeilutbetaltValuta(false)}
                            />
                        )}
                    </>
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
