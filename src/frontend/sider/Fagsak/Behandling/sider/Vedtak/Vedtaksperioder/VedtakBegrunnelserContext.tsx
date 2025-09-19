import React, { useContext, useEffect, type PropsWithChildren } from 'react';

import { byggTomRessurs } from '@navikt/familie-typer';
import type { Ressurs } from '@navikt/familie-typer';

import { useBegrunnelseApi } from '../../../../../../api/useBegrunnelseApi';
import type { AlleBegrunnelser } from '../../../../../../typer/vilkår';

interface VedtakBegrunnelserContextValue {
    alleBegrunnelserRessurs: Ressurs<AlleBegrunnelser>;
}

const VedtakBegrunnelserContext = React.createContext<VedtakBegrunnelserContextValue | undefined>(undefined);

export function VedtakBegrunnelserProvider({ children }: PropsWithChildren) {
    const { hentAlleBegrunnelser } = useBegrunnelseApi();

    const [alleBegrunnelserRessurs, settAlleBegrunnelserRessurs] =
        React.useState<Ressurs<AlleBegrunnelser>>(byggTomRessurs());

    useEffect(() => {
        hentAlleBegrunnelser().then((data: Ressurs<AlleBegrunnelser>) => {
            settAlleBegrunnelserRessurs(data);
        });
    }, []);

    return (
        <VedtakBegrunnelserContext.Provider value={{ alleBegrunnelserRessurs: alleBegrunnelserRessurs }}>
            {children}
        </VedtakBegrunnelserContext.Provider>
    );
}

export function useVedtakBegrunnelser() {
    const context = useContext(VedtakBegrunnelserContext);
    if (!context) {
        throw new Error('useVedtakBegrunnelser må brukes innenfor en VedtakBegrunnelserProvider');
    }
    return context;
}
