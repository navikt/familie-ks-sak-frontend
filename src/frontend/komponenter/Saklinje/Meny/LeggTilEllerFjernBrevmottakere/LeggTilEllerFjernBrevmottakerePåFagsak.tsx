import { useLocation } from 'react-router';

import { ActionMenu } from '@navikt/ds-react';

import type { SkjemaBrevmottaker } from './useBrevmottakerSkjema';
import { useManuelleBrevmottakerePåFagsakContext } from '../../../../sider/Fagsak/ManuelleBrevmottakerePåFagsakContext';

function utledLabel(brevmottakere: SkjemaBrevmottaker[]) {
    if (brevmottakere.length === 0) {
        return 'Legg til brevmottaker';
    }
    return brevmottakere.length === 1 ? 'Legg til eller fjern brevmottaker' : 'Se eller fjern brevmottakere';
}

interface Props {
    åpneModal: () => void;
}

export function LeggTilEllerFjernBrevmottakerePåFagsak({ åpneModal }: Props) {
    const { manuelleBrevmottakerePåFagsak } = useManuelleBrevmottakerePåFagsakContext();
    const location = useLocation();

    const erPåDokumentutsending = location.pathname.includes('dokumentutsending');

    if (!erPåDokumentutsending) {
        return null;
    }

    const label = utledLabel(manuelleBrevmottakerePåFagsak);

    return <ActionMenu.Item onSelect={åpneModal}>{label}</ActionMenu.Item>;
}
