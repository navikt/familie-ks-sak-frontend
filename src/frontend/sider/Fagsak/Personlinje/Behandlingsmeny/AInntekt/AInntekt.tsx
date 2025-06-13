import React, { useEffect } from 'react';

import { Alert, Dropdown, Loader } from '@navikt/ds-react';
import { useHttp } from '@navikt/familie-http';
import { byggHenterRessurs, RessursStatus, type Ressurs } from '@navikt/familie-typer';

import type { IMinimalFagsak } from '../../../../../typer/fagsak';

interface IProps {
    minimalFagsak: IMinimalFagsak;
}

export const AInntekt: React.FC<IProps> = ({ minimalFagsak }) => {
    const { request } = useHttp();

    const [aInntektUrlRessurs, settAInntektUrlRessurs] =
        React.useState<Ressurs<string>>(byggHenterRessurs());

    useEffect(() => {
        request<{ ident: string }, string>({
            method: 'POST',
            url: 'familie-ks-sak/api/a-inntekt/hent-url',
            data: {
                ident: minimalFagsak.søkerFødselsnummer,
            },
        }).then(response => {
            settAInntektUrlRessurs(response);
        });
    }, []);

    return (
        <>
            {aInntektUrlRessurs.status === RessursStatus.SUKSESS && (
                <Dropdown.Menu.List.Item
                    onClick={() => window.open(aInntektUrlRessurs.data, '_blank')}
                >
                    A-Inntekt
                </Dropdown.Menu.List.Item>
            )}

            {aInntektUrlRessurs.status === RessursStatus.HENTER && (
                <Dropdown.Menu.List.Item disabled>
                    Henter A-Inntekt <Loader size="xsmall" />
                </Dropdown.Menu.List.Item>
            )}

            {aInntektUrlRessurs.status !== RessursStatus.FEILET && (
                <Dropdown.Menu.List.Item disabled>
                    <Alert variant="error" inline>
                        A-Inntekt er ikke tilgjengelig
                    </Alert>
                </Dropdown.Menu.List.Item>
            )}
        </>
    );
};
