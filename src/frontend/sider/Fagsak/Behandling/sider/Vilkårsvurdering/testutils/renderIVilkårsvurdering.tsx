import type { ReactElement, ReactNode } from 'react';

import { BehandlingProvider } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { HentOgSettBehandlingProvider } from '@sider/Fagsak/Behandling/context/HentOgSettBehandlingContext';
import { EkspanderbareVilkårResultatRaderProvider } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårResultatRaderContext';
import { VilkårsvurderingProvider } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/VilkårsvurderingContext';
import { FagsakProvider } from '@sider/Fagsak/FagsakContext';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { render, TestProviders } from '@testutils/testrender';
import type { IBehandling } from '@typer/behandling';

import { Table } from '@navikt/ds-react';

interface Options {
    behandling: IBehandling;
}

export function renderIVilkårsvurdering(rad: ReactElement, { behandling }: Options) {
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <TestProviders>
                <FagsakProvider fagsak={lagFagsak()}>
                    <HentOgSettBehandlingProvider>
                        <BehandlingProvider behandling={behandling}>
                            <VilkårsvurderingProvider>
                                <EkspanderbareVilkårResultatRaderProvider>
                                    <Table>
                                        <Table.Body>{children}</Table.Body>
                                    </Table>
                                </EkspanderbareVilkårResultatRaderProvider>
                            </VilkårsvurderingProvider>
                        </BehandlingProvider>
                    </HentOgSettBehandlingProvider>
                </FagsakProvider>
            </TestProviders>
        );
    }
    return render(rad, { wrapper: Wrapper });
}
