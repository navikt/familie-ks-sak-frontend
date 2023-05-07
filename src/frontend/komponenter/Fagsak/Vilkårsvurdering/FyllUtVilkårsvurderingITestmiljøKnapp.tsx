import React from 'react';

import styled from 'styled-components';

import { Button } from '@navikt/ds-react';
import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { erProd } from '../../../utils/miljø';

const StyledButton = styled(Button)`
    margin-top: 2rem;
`;

interface IProps {
    behandlingId: number;
}

export const FyllUtVilkårsvurderingITestmiljøKnapp: React.FunctionComponent<IProps> = ({
    behandlingId,
}) => {
    const { request } = useHttp();

    const fyllUtSatsendring = () => {
        if (erProd()) {
            return;
        }

        request<undefined, string>({
            method: 'PUT',
            url: `/familie-ks-sak/api/forvaltning/${behandlingId}/fyll-ut-vilkarsvurdering`,
            påvirkerSystemLaster: true,
        }).then((kjørFyllUtVilkårsvurderingRessurs: Ressurs<string>) => {
            if (kjørFyllUtVilkårsvurderingRessurs.status === RessursStatus.SUKSESS) {
                window.location.reload();
            }
        });
    };

    return <StyledButton onClick={fyllUtSatsendring}>Fyll ut vilkårsvurdering</StyledButton>;
};
