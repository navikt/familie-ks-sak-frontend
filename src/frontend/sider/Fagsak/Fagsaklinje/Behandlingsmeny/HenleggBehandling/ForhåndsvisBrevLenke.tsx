import React from 'react';

import { Link } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { useFagsakContext } from '../../../../../context/fagsak/FagsakContext';
import { ModalType } from '../../../../../context/ModalContext';
import { useModal } from '../../../../../hooks/useModal';
import {
    mutationKey,
    useOpprettForhåndsvisbarBehandlingBrevPdf,
} from '../../../../../hooks/useOpprettForhåndsvisbarBehandlingBrevPdf';
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

    const { åpneModal: åpneForhåndsvisOpprettingAvPdfModal } = useModal(ModalType.FORHÅNDSVIS_OPPRETTING_AV_PDF);

    const { mutate, isPending } = useOpprettForhåndsvisbarBehandlingBrevPdf({
        onMutate: () => åpneForhåndsvisOpprettingAvPdfModal({ mutationKey }),
    });

    function forhåndsvisBrev() {
        if (minimalFagsak === undefined) {
            // TODO : Fjern når FagsakContext får innsendt en fagsak fra react-query. Dette skal aldri skje.
            return;
        }
        if (åpenBehandling.status !== RessursStatus.SUKSESS) {
            // TODO : Fjern når BehandlingContext får innsendt en behandling fra react-query. Dette skal aldri skje
            return;
        }
        if (!isPending) {
            mutate({
                behandlingId: åpenBehandling.data.behandlingId,
                payload: lagRequestPayload(minimalFagsak.søkerFødselsnummer),
            });
        }
    }

    return <Link onClick={forhåndsvisBrev}>Forhåndsvis</Link>;
}
