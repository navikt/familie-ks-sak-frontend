import { ModalType } from '@context/ModalContext';
import { useBehandling } from '@hooks/useBehandling';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { useFeatureToggles } from '@hooks/useFeatureToggles';
import { useModal } from '@hooks/useModal';
import { erPåHenleggbartSteg } from '@typer/behandling';
import { FeatureToggle } from '@typer/featureToggles';

import { ActionMenu } from '@navikt/ds-react';

export function HenleggBehandling() {
    const toggles = useFeatureToggles();
    const behandling = useBehandling();
    const erLesevisning = useErLesevisning();

    const { åpneModal } = useModal(ModalType.HENLEGG_BEHANDLING);

    const harTilgangTilTekniskVedlikeholdHenleggelse = toggles[FeatureToggle.tekniskVedlikeholdHenleggelse];

    const kanHenlegge =
        harTilgangTilTekniskVedlikeholdHenleggelse || (!erLesevisning && erPåHenleggbartSteg(behandling.steg));

    if (!kanHenlegge) {
        return null;
    }

    return <ActionMenu.Item onSelect={() => åpneModal()}>Henlegg behandling</ActionMenu.Item>;
}
