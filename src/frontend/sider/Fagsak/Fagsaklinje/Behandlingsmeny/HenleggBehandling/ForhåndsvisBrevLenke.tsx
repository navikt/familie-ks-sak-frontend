import React from 'react';

import { Link } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import type { FamilieAxiosRequestConfig } from '../../../../../context/AppContext';
import { useFagsakContext } from '../../../../../context/fagsak/FagsakContext';
import { Brevmal } from '../../../../../komponenter/Hendelsesoversikt/BrevModul/typer';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';

interface Props {
    hentForhåndsvisning: <T>(familieAxiosRequestConfig: FamilieAxiosRequestConfig<T>) => void;
}

export function ForhåndsvisBrevLenke({ hentForhåndsvisning }: Props) {
    const { minimalFagsak } = useFagsakContext();
    const { åpenBehandling } = useBehandlingContext();

    function onClick() {
        if (åpenBehandling.status !== RessursStatus.SUKSESS || minimalFagsak === undefined) {
            return;
        }
        hentForhåndsvisning({
            method: 'POST',
            data: {
                mottakerIdent: minimalFagsak.søkerFødselsnummer,
                multiselectVerdier: [],
                brevmal: Brevmal.HENLEGGE_TRUKKET_SØKNAD,
                barnIBrev: [],
            },
            url: `/familie-ks-sak/api/brev/forhaandsvis-brev/${åpenBehandling.data.behandlingId}`,
        });
    }

    return (
        <Link href={'#'} onClick={onClick}>
            Forhåndsvis
        </Link>
    );
}
