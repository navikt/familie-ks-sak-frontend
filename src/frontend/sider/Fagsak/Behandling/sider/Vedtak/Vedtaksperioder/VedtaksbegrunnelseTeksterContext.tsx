import React, { useContext, useEffect, type PropsWithChildren } from 'react';

import { byggTomRessurs } from '@navikt/familie-typer';
import type { Ressurs } from '@navikt/familie-typer';

import { useBegrunnelseApi } from '../../../../../../api/useBegrunnelseApi';
import type { VedtaksbegrunnelseTekster } from '../../../../../../typer/vilkår';

interface VedtaksbegrunnelseTeksterContextValue {
    vedtaksbegrunnelseTekster: Ressurs<VedtaksbegrunnelseTekster>;
}

const VedtaksbegrunnelseTeksterContext = React.createContext<
    VedtaksbegrunnelseTeksterContextValue | undefined
>(undefined);

export function VedtaksbegrunnelseTeksterProvider({ children }: PropsWithChildren) {
    const { hentAlleBegrunnelser } = useBegrunnelseApi();

    const [vedtaksbegrunnelseTekster, settVedtaksbegrunnelseTekster] =
        React.useState<Ressurs<VedtaksbegrunnelseTekster>>(byggTomRessurs());

    useEffect(() => {
        hentAlleBegrunnelser().then((data: Ressurs<VedtaksbegrunnelseTekster>) => {
            settVedtaksbegrunnelseTekster(data);
        });
    }, []);

    return (
        <VedtaksbegrunnelseTeksterContext.Provider value={{ vedtaksbegrunnelseTekster }}>
            {children}
        </VedtaksbegrunnelseTeksterContext.Provider>
    );
}

export function useVedtaksbegrunnelseTekster() {
    const context = useContext(VedtaksbegrunnelseTeksterContext);
    if (!context) {
        throw new Error(
            'useVedtaksbegrunnelseTekster må brukes innenfor en VedtaksbegrunnelseTeksterProvider'
        );
    }
    return context;
}
