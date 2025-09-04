import React, { useState } from 'react';

import { Link } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { useFagsakContext } from '../../../../../context/fagsak/FagsakContext';
import { useOpprettForhåndsvisbarBehandlingBrevPdf } from '../../../../../hooks/useOpprettForhåndsvisbarBehandlingBrevPdf';
import { Brevmal } from '../../../../../komponenter/Hendelsesoversikt/BrevModul/typer';
import { ForhåndsvisPdfModal } from '../../../../../komponenter/PdfVisningModal/ForhåndsvisPdfModal';
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

    const [visForhåndsvisPdfModal, settVisForhåndsvisPdfModal] = useState(false);

    const {
        mutate: opprettPdf,
        data: pdf,
        isPending: isOpprettPdfPending,
        error: opprettPdfError,
    } = useOpprettForhåndsvisbarBehandlingBrevPdf();

    function forhåndsvisBrev() {
        if (minimalFagsak === undefined) {
            return; // Dette skal aldri skje
        }
        if (åpenBehandling.status !== RessursStatus.SUKSESS) {
            return; // Dette skal aldri skje
        }
        if (!isOpprettPdfPending) {
            settVisForhåndsvisPdfModal(true);
            opprettPdf({
                behandlingId: åpenBehandling.data.behandlingId,
                payload: lagRequestPayload(minimalFagsak.søkerFødselsnummer),
            });
        }
    }

    return (
        <>
            {visForhåndsvisPdfModal && (
                <ForhåndsvisPdfModal
                    pdf={pdf}
                    laster={isOpprettPdfPending}
                    error={opprettPdfError}
                    lukk={() => settVisForhåndsvisPdfModal(false)}
                />
            )}
            <Link onClick={forhåndsvisBrev}>Forhåndsvis</Link>
        </>
    );
}
