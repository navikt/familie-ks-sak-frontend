import { type PropsWithChildren } from 'react';

import { describe, expect } from 'vitest';

import { ActionMenu } from '@navikt/ds-react';

import { SendInformasjonsbrev } from './SendInformasjonsbrev';
import { lagFagsak } from '../../../../../testutils/testdata/fagsakTestdata';
import { render, TestProviders } from '../../../../../testutils/testrender';
import { FagsakProvider } from '../../../FagsakContext';

interface WrapperProps extends PropsWithChildren {
    initialEntries?: [{ pathname: string }];
}

function Wrapper({ initialEntries = [{ pathname: '/fagsak/1' }], children }: WrapperProps) {
    return (
        <TestProviders initialEntries={initialEntries}>
            <FagsakProvider fagsak={lagFagsak()}>
                <ActionMenu open={true}>
                    <ActionMenu.Content>{children}</ActionMenu.Content>
                </ActionMenu>
            </FagsakProvider>
        </TestProviders>
    );
}

describe('SendInformasjonsbrev', () => {
    test('skal ikke vise komponenten hvis man befinner seg på dokumentutsending siden', () => {
        const { screen } = render(<SendInformasjonsbrev />, {
            wrapper: props => <Wrapper {...props} initialEntries={[{ pathname: '/fagsak/1/dokumentutsending' }]} />,
        });

        expect(screen.queryByRole('menuitem', { name: 'Send informasjonsbrev' })).not.toBeInTheDocument();
    });

    test('skal vise komponenten som forventet', () => {
        const { screen } = render(<SendInformasjonsbrev />, {
            wrapper: props => <Wrapper {...props} initialEntries={[{ pathname: '/fagsak/1' }]} />,
        });

        expect(screen.getByRole('menuitem', { name: 'Send informasjonsbrev' })).toBeInTheDocument();
    });
});
