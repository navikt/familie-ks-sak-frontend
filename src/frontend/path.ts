import { behandlingPathFactory } from '@sider/Fagsak/Behandling/BehandlingRoutes';
import { fagsakPathFactory } from '@sider/Fagsak/FagsakRoutes';

import { appPathFactory } from './AppRoutes';

export type Id = string | number;

export const Path = {
    ...appPathFactory,
    fagsak: (fagsakId: Id) => {
        return {
            ...fagsakPathFactory(fagsakId),
            behandling: behandlingPathFactory(fagsakId),
        } as const;
    },
} as const;
