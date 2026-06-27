import { ModalType } from '@context/ModalContext';
import { useBehandling } from '@hooks/useBehandling';
import { useFagsak } from '@hooks/useFagsak';
import { useModal } from '@hooks/useModal';
import {
    mutationKey,
    useOpprettForhåndsvisbarBehandlingBrevPdf,
} from '@hooks/useOpprettForhåndsvisbarBehandlingBrevPdf';
import { Brevmal } from '@sider/Fagsak/Behandling/Høyremeny/Brev/typer';
import type { IManueltBrevRequestPåBehandling } from '@typer/dokument';

import { Link } from '@navikt/ds-react';

function lagRequestPayload(mottakerIdent: string): IManueltBrevRequestPåBehandling {
    return {
        mottakerIdent: mottakerIdent,
        multiselectVerdier: [],
        brevmal: Brevmal.HENLEGGE_TRUKKET_SØKNAD,
        barnIBrev: [],
    };
}

export function ForhåndsvisBrevLenke() {
    const fagsak = useFagsak();
    const behandling = useBehandling();

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
