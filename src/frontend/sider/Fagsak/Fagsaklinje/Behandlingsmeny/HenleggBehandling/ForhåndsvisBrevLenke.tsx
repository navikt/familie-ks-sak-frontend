import React from 'react';

import { HStack, Link, Loader } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { useFagsakContext } from '../../../../../context/fagsak/FagsakContext';
import { ModalType } from '../../../../../context/ModalContext';
import { useModal } from '../../../../../hooks/useModal';
import { useOpprettForhåndsvisbarBehandlingBrevPdf } from '../../../../../hooks/useOpprettForhåndsvisbarBehandlingBrevPdf';
import { Brevmal } from '../../../../../komponenter/Hendelsesoversikt/BrevModul/typer';
import type { IManueltBrevRequestPåBehandling } from '../../../../../typer/dokument';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';

function lagRequestPayload(mottakerIdent: string): IManueltBrevRequestPåBehandling {
    return {
        mottakerIdent: mottakerIdent,
        multiselectVerdier: [],
        brevmal: Brevmal.HENLEGGE_TRUKKET_SØKNAD,
        barnIBrev: [],
    };
}

export function ForhåndsvisBrevLenke() {
    const { minimalFagsak } = useFagsakContext();
    const { åpenBehandling } = useBehandlingContext();

    const { åpneModal: åpneForhåndsvisPdfModal } = useModal(ModalType.FORHÅNDSVIS_PDF);
    const { åpneModal: åpneFeilmeldingModal } = useModal(ModalType.FEILMELDING);

    const { mutate, isPending } = useOpprettForhåndsvisbarBehandlingBrevPdf({
        onSuccess: blob => åpneForhåndsvisPdfModal({ blob }),
        onError: error => åpneFeilmeldingModal({ feilmelding: error.message }),
    });

    function forhåndsvisBrev() {
        if (minimalFagsak === undefined) {
            // TODO: Fjern når FagsakContext alltid inneholder en fagsak. Dette burde aldri skje.
            åpneFeilmeldingModal({ feilmelding: 'Kan ikke forhåndsvise PDF uten fagsak.' });
            return;
        }
        if (åpenBehandling.status !== RessursStatus.SUKSESS) {
            // TODO: Fjern når BehandlingContext alltid inneholder en behandling. Dette burde aldri skje.
            åpneFeilmeldingModal({ feilmelding: 'Kan ikke forhåndsvise PDF uten behandling.' });
            return;
        }
        if (!isPending) {
            mutate({
                behandlingId: åpenBehandling.data.behandlingId,
                payload: lagRequestPayload(minimalFagsak.søkerFødselsnummer),
            });
        }
    }

    return (
        <Link onClick={forhåndsvisBrev}>
            <HStack gap={'space-8'}>
                Forhåndsvis
                {isPending && <Loader size={'small'} />}
            </HStack>
        </Link>
    );
}
