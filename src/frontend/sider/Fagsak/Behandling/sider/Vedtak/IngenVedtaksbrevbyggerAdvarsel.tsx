import { useBehandling } from '@hooks/useBehandling';
import { BehandlingStatus, BehandlingÅrsak, type IBehandling } from '@typer/behandling';

import { InformationSquareIcon } from '@navikt/aksel-icons';
import { InfoCard } from '@navikt/ds-react';

function finnAdvarseltekst(behandling: IBehandling): string | undefined {
    if (behandling.status === BehandlingStatus.AVSLUTTET) {
        return 'Behandlingen er avsluttet. Du kan se vedtaksbrevet ved å trykke på "Vis vedtaksbrev".';
    }
    if (behandling.årsak === BehandlingÅrsak.DØDSFALL) {
        return 'Vedtak om opphør på grunn av dødsfall er automatisk generert.';
    }
    return undefined;
}

export function IngenVedtaksbrevbyggerAdvarsel() {
    const behandling = useBehandling();

    const advarseltekst = finnAdvarseltekst(behandling);

    if (!advarseltekst) {
        return null;
    }

    return (
        <InfoCard data-color={'info'}>
            <InfoCard.Message icon={<InformationSquareIcon aria-hidden={true} />}>{advarseltekst}</InfoCard.Message>
        </InfoCard>
    );
}
