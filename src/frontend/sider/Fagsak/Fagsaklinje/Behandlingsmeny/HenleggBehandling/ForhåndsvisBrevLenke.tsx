import React from 'react';

import { Link, Loader } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { useFagsakContext } from '../../../../../context/fagsak/FagsakContext';
import { ModalType } from '../../../../../context/ModalContext';
import { useHentForhåndsvisbarBehandlingBrevPdf } from '../../../../../hooks/useHentForhåndsvisbarBehandlingBrevPdf';
import { useModal } from '../../../../../hooks/useModal';
import { Brevmal } from '../../../../../komponenter/Hendelsesoversikt/BrevModul/typer';
import type { IBehandling } from '../../../../../typer/behandling';
import type { IManueltBrevRequestPåBehandling } from '../../../../../typer/dokument';
import type { IMinimalFagsak } from '../../../../../typer/fagsak';
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

    if (minimalFagsak === undefined) {
        return null; // Should never happen
    }

    if (åpenBehandling.status !== RessursStatus.SUKSESS) {
        return null; // Should never happen
    }

    return <Lenke fagsak={minimalFagsak} behandling={åpenBehandling.data} />;
}

// TODO : Inline component when useFagsakContext and useBehandlingContext returns fagsak and behandling that cannot be
//  undefined and is not a "ressurs" object. This is a workaround to avoid "undefined" to spread to other parts of the
//  code. Neither fagsak or behandling should be undefined at this point.
function Lenke({ fagsak, behandling }: { fagsak: IMinimalFagsak; behandling: IBehandling }) {
    const { åpneModal: åpneForhåndsvisPdfModal } = useModal(ModalType.FORHÅNDSVIS_PDF);
    const { åpneModal: åpneFeilmeldingModal } = useModal(ModalType.FEILMELDING);

    const { refetch, isFetching } = useHentForhåndsvisbarBehandlingBrevPdf({
        behandlingId: behandling.behandlingId,
        payload: lagRequestPayload(fagsak.søkerFødselsnummer),
        onSuccess: blob => åpneForhåndsvisPdfModal({ blob }),
        onError: error => åpneFeilmeldingModal({ feilmelding: error.message }),
        enabled: false,
    });

    function forhåndsvisBrev() {
        if (!isFetching) {
            refetch();
        }
    }

    return (
        <Link onClick={forhåndsvisBrev}>Forhåndsvis {isFetching && <Loader size={'small'} />}</Link>
    );
}
