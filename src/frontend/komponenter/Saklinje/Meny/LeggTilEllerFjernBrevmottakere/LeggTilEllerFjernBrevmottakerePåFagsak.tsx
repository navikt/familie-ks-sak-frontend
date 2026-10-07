import { ActionMenu } from '@navikt/ds-react';
import { useBrevmottakereFagsakContext } from '@sider/Fagsak/BrevmottakereFagsakContext';
import { useFagsakContext } from '@sider/Fagsak/FagsakContext';
import type { BrevmottakerFagsak } from '@typer/brevmottaker';
import { erFagsakLåst } from '@utils/fagsak';
import { useLocation } from 'react-router';

function utledLabel(brevmottakere: BrevmottakerFagsak[]) {
    if (brevmottakere.length === 0) {
        return 'Legg til brevmottaker';
    }
    return brevmottakere.length === 1 ? 'Legg til eller fjern brevmottaker' : 'Se eller fjern brevmottakere';
}

interface Props {
    åpneModal: () => void;
}

export function LeggTilEllerFjernBrevmottakerePåFagsak({ åpneModal }: Props) {
    const { brevmottakere } = useBrevmottakereFagsakContext();
    const { fagsak } = useFagsakContext();
    const location = useLocation();

    const erPåDokumentutsending = location.pathname.includes('dokumentutsending');

    if (!erPåDokumentutsending || erFagsakLåst(fagsak)) {
        return null;
    }

    const label = utledLabel(brevmottakere);

    return <ActionMenu.Item onSelect={åpneModal}>{label}</ActionMenu.Item>;
}
