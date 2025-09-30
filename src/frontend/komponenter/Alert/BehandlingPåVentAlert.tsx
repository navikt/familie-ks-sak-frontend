import * as React from 'react';

import { Alert } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandlingContext } from '../../sider/Fagsak/Behandling/context/BehandlingContext';
import { SettPåVentÅrsak, settPåVentÅrsaker } from '../../typer/behandling';
import { Datoformat, isoStringTilFormatertString } from '../../utils/dato';

export function BehandlingPåVentAlert() {
    const { åpenBehandling } = useBehandlingContext();

    const behandling = åpenBehandling.status === RessursStatus.SUKSESS ? åpenBehandling.data : undefined;

    if (!behandling || !behandling.behandlingPåVent) {
        return null;
    }

    const årsak = settPåVentÅrsaker[behandling.behandlingPåVent.årsak] ?? SettPåVentÅrsak.AVVENTER_DOKUMENTASJON;

    const dato = isoStringTilFormatertString({
        isoString: behandling.behandlingPåVent.frist,
        tilFormat: Datoformat.DATO,
    });

    return (
        <Alert variant={'info'}>
            Behandlingen er satt på vent. Årsak: {årsak}. Frist: {dato}. Fortsett behandling via menyen.
        </Alert>
    );
}
