import { useEffect } from 'react';
import { useHttp } from '@navikt/familie-http';
import React from 'react';
import { byggTomRessurs, type Ressurs } from '@navikt/familie-typer';
import type { EndringsårsakbegrunnelseTekster } from '../../../typer/endretUtbetaling';

export function useHentEndretUtbetalingBegrunnelser() {
    const { request } = useHttp();

    const [vedtaksbegrunnelseTekster, settVedtaksbegrunnelseTekster] =
        React.useState<Ressurs<EndringsårsakbegrunnelseTekster>>(byggTomRessurs());

    useEffect(() => {
        request<void, EndringsårsakbegrunnelseTekster>({
            method: 'GET',
            url: `/familie-ks-sak/api/endretutbetalingandel/endret-utbetaling-begrunnelser`,
            påvirkerSystemLaster: true,
        }).then((data: Ressurs<EndringsårsakbegrunnelseTekster>) => {
            settVedtaksbegrunnelseTekster(data);
        });
    }, []);

    return { vedtaksbegrunnelseTekster };
}
