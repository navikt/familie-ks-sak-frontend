import type { PropsWithChildren } from 'react';

import { Route, Routes } from 'react-router';
import { describe, expect, type MockInstance, vi } from 'vitest';

import { Heading } from '@navikt/ds-react';

import { BehandlingsmenyNy } from './BehandlingsmenyNy';
import { lagBehandling, lagVisningBehandling } from '../../../../testutils/testdata/behandlingTestdata';
import { lagFagsak } from '../../../../testutils/testdata/fagsakTestdata';
import { lagPerson } from '../../../../testutils/testdata/personTestdata';
import { render, TestProviders } from '../../../../testutils/testrender';
import { BehandlingProvider } from '../../Behandling/context/BehandlingContext';
import { HentOgSettBehandlingProvider } from '../../Behandling/context/HentOgSettBehandlingContext';
import { FagsakProvider } from '../../FagsakContext';
import { ManuelleBrevmottakerePåFagsakProvider } from '../../ManuelleBrevmottakerePåFagsakContext';
import { HenleggBehandlingModal } from './HenleggBehandling/HenleggBehandlingModal';
import { BehandlingÅrsak, type IBehandling, SettPåVentÅrsak } from '../../../../typer/behandling';
import type { IMinimalFagsak } from '../../../../typer/fagsak';
import { BrukerProvider } from '../../BrukerContext';

interface WrapperProps extends PropsWithChildren {
    initialEntries?: [{ pathname: string }];
    fagsak?: IMinimalFagsak;
    behandling?: IBehandling;
}

function Wrapper({
    initialEntries = [{ pathname: '/fagsak/1/1/registrer-soknad' }],
    behandling = lagBehandling({ årsak: BehandlingÅrsak.NYE_OPPLYSNINGER }),
    fagsak = lagFagsak({ behandlinger: [lagVisningBehandling({ behandlingId: behandling?.behandlingId })] }),
    children,
}: WrapperProps) {
    return (
        <TestProviders initialEntries={initialEntries}>
            <FagsakProvider fagsak={fagsak}>
                <BrukerProvider bruker={lagPerson()}>
                    <ManuelleBrevmottakerePåFagsakProvider>
                        <Routes>
                            <Route
                                path={'/fagsak/:fagsakId/dokumentutsending'}
                                element={
                                    <>
                                        <Heading level={'1'} size={'medium'}>
                                            Dokumentutsending
                                        </Heading>
                                    </>
                                }
                            />
                            <Route
                                path={`/fagsak/:fagsakId/:behandlingId/registrer-soknad`}
                                element={
                                    <HentOgSettBehandlingProvider fagsak={fagsak}>
                                        <BehandlingProvider behandling={behandling}>
                                            <HenleggBehandlingModal />
                                            {children}
                                        </BehandlingProvider>
                                    </HentOgSettBehandlingProvider>
                                }
                            />
                        </Routes>
                    </ManuelleBrevmottakerePåFagsakProvider>
                </BrukerProvider>
            </FagsakProvider>
        </TestProviders>
    );
}

describe('BehandlingsmenyNy', () => {
    test('skal vise en uåpnet behandlingsmeny ', () => {
        const { screen } = render(<BehandlingsmenyNy />, { wrapper: Wrapper });
        expect(screen.getByRole('button', { name: 'Meny' })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Opprett behandling' })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Send informasjonsbrev' })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Henlegg behandling' })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Endre behandlende enhet' })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Endre behandlingstema' })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Legg til barn' })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Sett behandling på vent' })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Fortsett behandling' })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Legg til brevmottaker' })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'A-Inntekt' })).not.toBeInTheDocument();
    });

    test('skal kunne åpne behandlingsmenyen', async () => {
        const { screen, user } = render(<BehandlingsmenyNy />, { wrapper: Wrapper });

        await user.click(screen.getByRole('button', { name: 'Meny' }));

        expect(screen.getByRole('menuitem', { name: 'Opprett behandling' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Send informasjonsbrev' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Henlegg behandling' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Endre behandlende enhet' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Endre behandlingstema' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Legg til barn' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Sett behandling på vent' })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Fortsett behandling' })).not.toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Legg til brevmottaker' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'A-Inntekt' })).toBeInTheDocument();
    });

    test('skal kunne åpne opprett behandling modal', async () => {
        const { screen, user } = render(<BehandlingsmenyNy />, { wrapper: Wrapper });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        const menuitem = screen.getByRole('menuitem', { name: 'Opprett behandling' });
        await user.click(menuitem);

        expect(screen.getByRole('dialog', { name: 'Opprett ny behandling' })).toBeInTheDocument();
    });

    test('skal kunne navigere til dokumentutsending', async () => {
        const { screen, user } = render(<BehandlingsmenyNy />, {
            wrapper: props => <Wrapper {...props} initialEntries={[{ pathname: '/fagsak/1/1/registrer-soknad' }]} />,
        });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        const menuitem = screen.getByRole('menuitem', { name: 'Send informasjonsbrev' });
        await user.click(menuitem);

        expect(screen.getByRole('heading', { name: 'Dokumentutsending' })).toBeInTheDocument();
    });

    test('skal kunne åpne henlegg behandling modal', async () => {
        const { screen, user } = render(<BehandlingsmenyNy />, { wrapper: Wrapper });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        const menuitem = screen.getByRole('menuitem', { name: 'Henlegg behandling' });
        await user.click(menuitem);

        expect(screen.getByRole('dialog', { name: 'Henlegg behandling' })).toBeInTheDocument();
    });

    test('skal kunne åpne endre behandlede enhet modal', async () => {
        const { screen, user } = render(<BehandlingsmenyNy />, { wrapper: Wrapper });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        const menuitem = screen.getByRole('menuitem', { name: 'Endre behandlende enhet' });
        await user.click(menuitem);

        expect(screen.getByRole('dialog', { name: 'Endre enhet for denne behandlingen' })).toBeInTheDocument();
    });

    test('skal kunne åpne endre behandlingstema modal', async () => {
        const { screen, user } = render(<BehandlingsmenyNy />, { wrapper: Wrapper });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        const menuitem = screen.getByRole('menuitem', { name: 'Endre behandlingstema' });
        await user.click(menuitem);

        expect(screen.getByRole('dialog', { name: 'Endre behandlingstema' })).toBeInTheDocument();
    });

    test('skal kunne åpne legg til barn på behandling modal', async () => {
        const { screen, user } = render(<BehandlingsmenyNy />, { wrapper: Wrapper });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        const menuitem = screen.getByRole('menuitem', { name: 'Legg til barn' });
        await user.click(menuitem);

        expect(screen.getByRole('dialog', { name: 'Legg til barn' })).toBeInTheDocument();
    });

    test('skal kunne åpne sett behandling på vent modal', async () => {
        const { screen, user } = render(<BehandlingsmenyNy />, { wrapper: Wrapper });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        const menuitem = screen.getByRole('menuitem', { name: 'Sett behandling på vent' });
        await user.click(menuitem);

        expect(screen.getByRole('dialog', { name: 'Sett behandling på vent' })).toBeInTheDocument();
    });

    test('skal kunne åpne ta behandling av vent modal', async () => {
        const { screen, user } = render(<BehandlingsmenyNy />, {
            wrapper: props => (
                <Wrapper
                    {...props}
                    behandling={lagBehandling({
                        behandlingPåVent: {
                            frist: '2025-10-10',
                            årsak: SettPåVentÅrsak.AVVENTER_DOKUMENTASJON,
                        },
                    })}
                />
            ),
        });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        const menuitem = screen.getByRole('menuitem', { name: 'Fortsett behandling' });
        await user.click(menuitem);

        expect(screen.getByRole('dialog', { name: 'Fortsett behandling' })).toBeInTheDocument();
    });

    test('skal kunne åpne legg til brevmottakere modal', async () => {
        const { screen, user } = render(<BehandlingsmenyNy />, { wrapper: Wrapper });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        const menuitem = screen.getByRole('menuitem', { name: 'Legg til brevmottaker' });
        await user.click(menuitem);

        expect(screen.getByRole('dialog', { name: 'Legg til brevmottaker' })).toBeInTheDocument();
    });

    test('skal kunne åpne a-inntekt', async () => {
        const windowOpenSpy: MockInstance = vi.spyOn(window, 'open').mockImplementation(() => null);

        const { screen, user } = render(<BehandlingsmenyNy />, { wrapper: Wrapper });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        const knapp = screen.getByRole('menuitem', { name: 'A-Inntekt' });
        await user.click(knapp);

        expect(windowOpenSpy).toHaveBeenCalledOnce();

        windowOpenSpy.mockRestore();
    });
});
