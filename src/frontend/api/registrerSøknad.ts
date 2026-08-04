import { apiClient } from '@api/client/apiClient';
import type { IBehandling } from '@typer/behandling';
import type { IBarnMedOpplysningerBackend, Målform } from '@typer/søknad';

interface PathParams {
    behandlingId: number;
}

export interface Payload {
    søknad: {
        søkerMedOpplysninger: {
            ident: string;
            målform: Målform;
        };
        barnaMedOpplysninger: IBarnMedOpplysningerBackend[];
        endringAvOpplysningerBegrunnelse: string;
    };
    bekreftEndringerViaFrontend: boolean;
}

export async function registrerSøknad(pathParams: PathParams, payload: Payload): Promise<IBehandling> {
    const { behandlingId } = pathParams;
    return apiClient.post<Payload, IBehandling>({
        data: payload,
        url: `/familie-ks-sak/api/behandlinger/${behandlingId}/steg/registrer-søknad`,
    });
}
