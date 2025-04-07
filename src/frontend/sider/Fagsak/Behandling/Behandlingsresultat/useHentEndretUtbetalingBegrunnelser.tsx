import { useEffect } from 'react';
import React from 'react';

import { useHttp } from '@navikt/familie-http';
import { byggTomRessurs, type Ressurs } from '@navikt/familie-typer';

import type { EndringsårsakbegrunnelseTekster } from '../../../../typer/endretUtbetaling';

export function useHentEndretUtbetalingBegrunnelser() {
    const { request } = useHttp();

    const [endretUtbetalingsbegrunnelser, settEndretUtbetalingsbegrunnelser] =
        React.useState<Ressurs<EndringsårsakbegrunnelseTekster>>(byggTomRessurs());

    useEffect(() => {
        request<void, EndringsårsakbegrunnelseTekster>({
            method: 'GET',
            url: `/familie-ks-sak/api/endretutbetalingandel/endret-utbetaling-vedtaksbegrunnelser`,
            påvirkerSystemLaster: true,
        }).then((data: Ressurs<EndringsårsakbegrunnelseTekster>) => {
            settEndretUtbetalingsbegrunnelser(data);
        });
    }, []);

    return { endretUtbetalingsbegrunnelser };
}
