import { Link } from '@navikt/ds-react';

import { ModalType } from '../../../../context/ModalContext';
import { useModal } from '../../../../hooks/useModal';
import {
    mutationKey,
    useOpprettForhåndsvisbarBehandlingBrevPdf,
} from '../../../../hooks/useOpprettForhåndsvisbarBehandlingBrevPdf';
import { useBehandlingContext } from '../../../../sider/Fagsak/Behandling/context/BehandlingContext';
import { Brevmal } from '../../../../sider/Fagsak/Behandling/Høyremeny/Brev/typer';
import { useFagsakContext } from '../../../../sider/Fagsak/FagsakContext';
import type { IManueltBrevRequestPåBehandling } from '../../../../typer/dokument';

function lagRequestPayload(mottakerIdent: string): IManueltBrevRequestPåBehandling {
    return {
        mottakerIdent: mottakerIdent,
        multiselectVerdier: [],
        brevmal: Brevmal.HENLEGGE_TRUKKET_SØKNAD,
        barnIBrev: [],
    };
}

export function ForhåndsvisBrevLenke() {
    const { fagsak } = useFagsakContext();
    const { behandling } = useBehandlingContext();

    const { åpneModal: åpneForhåndsvisOpprettingAvPdfModal } = useModal(ModalType.FORHÅNDSVIS_OPPRETTING_AV_PDF);

    const { mutate, isPending } = useOpprettForhåndsvisbarBehandlingBrevPdf({
        onMutate: () => åpneForhåndsvisOpprettingAvPdfModal({ mutationKey }),
    });

    function forhåndsvisBrev() {
        if (!isPending) {
            mutate({
                behandlingId: behandling.behandlingId,
                payload: lagRequestPayload(fagsak.søkerFødselsnummer),
            });
        }
    }

    return <Link onClick={forhåndsvisBrev}>Forhåndsvis</Link>;
}
