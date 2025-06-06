import React, { useEffect } from 'react';

import { Dropdown } from '@navikt/ds-react';
import { useHttp } from '@navikt/familie-http';

import type { IMinimalFagsak } from '../../../../../typer/fagsak';

interface IProps {
    minimalFagsak: IMinimalFagsak;
}

export const AInntekt: React.FC<IProps> = ({ minimalFagsak }) => {
    const { request } = useHttp();

    useEffect(() => {
        request({
            method: 'POST',
            url: 'familie-ks-sak/api/a-inntekt/hent-url',
            data: {
                ident: minimalFagsak.søkerFødselsnummer,
            },
        })
            .then(response => {
                console.log('A-inntekt URL:', response);
            })
            .catch(_ => {});
    }, []);

    return <Dropdown.Menu.List.Item>A-Inntekt</Dropdown.Menu.List.Item>;
};
