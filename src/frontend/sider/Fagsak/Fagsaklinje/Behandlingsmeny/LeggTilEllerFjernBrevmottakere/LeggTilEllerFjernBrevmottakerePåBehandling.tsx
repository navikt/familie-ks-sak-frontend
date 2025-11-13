import { ActionMenu } from '@navikt/ds-react';

import type { SkjemaBrevmottaker } from './useBrevmottakerSkjema';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';

const utledLabel = (brevmottakere: SkjemaBrevmottaker[], erLesevisning: boolean) => {
    if (erLesevisning) {
        return brevmottakere.length === 1 ? 'Se brevmottaker' : 'Se brevmottakere';
    }
    if (brevmottakere.length === 0) {
        return 'Legg til brevmottaker';
    }
    return brevmottakere.length === 1 ? 'Legg til eller fjern brevmottaker' : 'Se eller fjern brevmottakere';
};

interface Props {
    åpneModal: () => void;
}

export function LeggTilEllerFjernBrevmottakerePåBehandling({ åpneModal }: Props) {
    const { behandling, vurderErLesevisning } = useBehandlingContext();

    const brevmottakere = behandling.brevmottakere;
    const erLesevising = vurderErLesevisning();

    const label = utledLabel(brevmottakere, erLesevising);

    return <ActionMenu.Item onSelect={åpneModal}>{label}</ActionMenu.Item>;
}
