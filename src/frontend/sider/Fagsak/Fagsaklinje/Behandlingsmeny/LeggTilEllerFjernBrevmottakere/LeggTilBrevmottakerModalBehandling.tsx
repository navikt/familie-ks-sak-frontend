import { LeggTilBrevmottakerModal } from './LeggTilBrevmottakerModal';
import { useLagreEllerFjernMottakerPåBehandling } from './useLagreOgFjernMottakerPåBehandling';
import type { IBehandling } from '../../../../../typer/behandling';

interface IBehandlingModalProps {
    behandling: IBehandling;
    erLesevisning: boolean;
    lukkModal: () => void;
}
export const LeggTilBrevmottakerModalBehandling = ({ lukkModal, behandling, erLesevisning }: IBehandlingModalProps) => {
    const { lagreMottaker, fjernMottaker } = useLagreEllerFjernMottakerPåBehandling({
        behandlingId: behandling.behandlingId,
    });

    return (
        <LeggTilBrevmottakerModal
            brevmottakere={behandling.brevmottakere}
            lagreMottaker={lagreMottaker}
            fjernMottaker={fjernMottaker}
            erLesevisning={erLesevisning}
            lukkModal={lukkModal}
        />
    );
};
