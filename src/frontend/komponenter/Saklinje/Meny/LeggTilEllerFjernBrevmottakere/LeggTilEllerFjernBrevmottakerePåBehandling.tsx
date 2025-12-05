import { ActionMenu } from '@navikt/ds-react';

import type { SkjemaBrevmottaker } from './useBrevmottakerSkjema';
import { useBehandlingContext } from '../../../../sider/Fagsak/Behandling/context/BehandlingContext';
import { Behandlingstype } from '../../../../typer/behandling';

function utledLabel(brevmottakere: SkjemaBrevmottaker[], erLesevisning: boolean) {
    if (erLesevisning) {
        return brevmottakere.length === 1 ? 'Se brevmottaker' : 'Se brevmottakere';
    }
    if (brevmottakere.length === 0) {
        return 'Legg til brevmottaker';
    }
    if (brevmottakere.length === 1) {
        return 'Legg til eller fjern brevmottaker';
    }
    return 'Se eller fjern brevmottakere';
}

const relevanteBehandlingstyper = [Behandlingstype.FØRSTEGANGSBEHANDLING, Behandlingstype.REVURDERING];

interface Props {
    åpneModal: () => void;
}

export function LeggTilEllerFjernBrevmottakerePåBehandling({ åpneModal }: Props) {
    const { behandling, vurderErLesevisning } = useBehandlingContext();

    const erRelevantBehandlingstype = relevanteBehandlingstyper.includes(behandling.type);

    if (!erRelevantBehandlingstype) {
        return null;
    }

    const erLesevisning = vurderErLesevisning();
    const harBrevmottaker = behandling.brevmottakere.length > 0;

    if (erLesevisning && !harBrevmottaker) {
        return null;
    }

    const label = utledLabel(behandling.brevmottakere, erLesevisning);

    return <ActionMenu.Item onSelect={åpneModal}>{label}</ActionMenu.Item>;
}
