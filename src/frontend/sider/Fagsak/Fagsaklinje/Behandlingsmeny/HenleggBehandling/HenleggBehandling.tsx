import { Dropdown } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { ModalType } from '../../../../../context/ModalContext';
import { useModal } from '../../../../../hooks/useModal';
import { useToggles } from '../../../../../hooks/useToggles';
import { erPåHenleggbartSteg } from '../../../../../typer/behandling';
import { Toggle } from '../../../../../typer/toggles';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';

export function HenleggBehandling() {
    const toggles = useToggles();
    const { åpenBehandling, vurderErLesevisning } = useBehandlingContext();
    const { åpneModal } = useModal(ModalType.HENLEGG_BEHANDLING);

    const behandling = åpenBehandling.status === RessursStatus.SUKSESS ? åpenBehandling.data : undefined;

    const harTilgangTilTekniskVedlikeholdHenleggelse = toggles[Toggle.tekniskVedlikeholdHenleggelse];

    const kanHenlegge =
        harTilgangTilTekniskVedlikeholdHenleggelse ||
        (!vurderErLesevisning() && behandling && erPåHenleggbartSteg(behandling.steg));

    if (!kanHenlegge) {
        return null;
    }

    return <Dropdown.Menu.List.Item onClick={() => åpneModal()}>Henlegg behandling</Dropdown.Menu.List.Item>;
}
