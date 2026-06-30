import { useBehandling } from '@hooks/useBehandling';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { BehandlingÅrsak } from '@typer/behandling';

import { ActionMenu } from '@navikt/ds-react';

const relevanteBehandlingsårsaker = [
    BehandlingÅrsak.NYE_OPPLYSNINGER,
    BehandlingÅrsak.KLAGE,
    BehandlingÅrsak.IVERKSETTE_KA_VEDTAK,
];

interface Props {
    åpneModal: () => void;
}

export function LeggTilBarnPåBehandling({ åpneModal }: Props) {
    const behandling = useBehandling();

    const erLesevisning = useErLesevisning();
    const harRelevantBehandlingsårsak = relevanteBehandlingsårsaker.includes(behandling.årsak);

    if (erLesevisning || !harRelevantBehandlingsårsak) {
        return null;
    }

    return <ActionMenu.Item onSelect={åpneModal}>Legg til barn</ActionMenu.Item>;
}
