import { type Id, Path } from '@app/path';
import { NotFound } from '@komponenter/Error/NotFound';
import { RouteError } from '@komponenter/Error/RouteError';
import Barnehagelister from '@sider/Barnehagelister/Barnehagelister';
import { Fagsak } from '@sider/Fagsak/Fagsak';
import { fagsakRoutes } from '@sider/Fagsak/FagsakRoutes';
import ManuellJournalføring from '@sider/ManuellJournalføring/ManuellJournalføring';
import { Oppgavebenk } from '@sider/Oppgavebenk/Oppgavebenk';
import { createBrowserRouter, Navigate } from 'react-router';

import { AppContainer } from './AppContainer';

export const appPathFactory = {
    root: '/',
    oppgaver: '/oppgaver',
    journalfør: (oppgaveId: Id) => `/oppgaver/journalfor/${oppgaveId}`,
    barnehagelister: '/barnehagelister',
} as const;

export const appRoutes = createBrowserRouter([
    {
        path: '/',
        element: <AppContainer />,
        errorElement: <RouteError />,
        children: [
            {
                index: true,
                element: <Navigate to={Path.oppgaver} replace={true} />,
            },
            {
                path: 'fagsak/:fagsakId',
                element: <Fagsak />,
                errorElement: <RouteError />,
                children: fagsakRoutes,
            },
            {
                path: 'oppgaver',
                element: <Oppgavebenk />,
            },
            {
                path: 'oppgaver/journalfor/:oppgaveId',
                element: <ManuellJournalføring />,
            },
            {
                path: 'barnehagelister',
                element: <Barnehagelister />,
            },
            {
                path: '*',
                element: <NotFound />,
            },
        ],
    },
]);
