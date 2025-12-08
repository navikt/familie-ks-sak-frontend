import { ActionMenu } from '@navikt/ds-react';

import { useBehandlingContext } from '../../../../sider/Fagsak/Behandling/context/BehandlingContext';
import { BehandlingÅrsak } from '../../../../typer/behandling';

const relevanteBehandlingsårsaker = [
    BehandlingÅrsak.NYE_OPPLYSNINGER,
    BehandlingÅrsak.KLAGE,
    BehandlingÅrsak.IVERKSETTE_KA_VEDTAK,
    BehandlingÅrsak.KORREKSJON_VEDTAKSBREV,
];

interface Props {
    åpneModal: () => void;
}

export function LeggTilBarnPåBehandling({ åpneModal }: Props) {
    const { behandling, vurderErLesevisning } = useBehandlingContext();

    const erLesevisning = vurderErLesevisning();
    const harRelevantBehandlingsårsak = relevanteBehandlingsårsaker.includes(behandling.årsak);

    if (erLesevisning || !harRelevantBehandlingsårsak) {
        return null;
    }

    return <ActionMenu.Item onSelect={åpneModal}>Legg til barn</ActionMenu.Item>;
}
