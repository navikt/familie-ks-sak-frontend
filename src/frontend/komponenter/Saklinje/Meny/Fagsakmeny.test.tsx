import { RegistrerteBrevmottakereFagsak } from '@komponenter/Brevmottaker/Fagsak/RegistrerteBrevmottakereFagsak';
import { BrevmottakerDialogProvider } from '@komponenter/Brevmottaker/Felles/BrevmottakerDialogContext';
import { Heading } from '@navikt/ds-react';
import { byggSuksessRessurs } from '@navikt/familie-typer';
import { BrevmottakereFagsakProvider } from '@sider/Fagsak/BrevmottakereFagsakContext';
import { BrukerProvider } from '@sider/Fagsak/BrukerContext';
import { FagsakProvider } from '@sider/Fagsak/FagsakContext';
import { skruPåAlleToggles } from '@testutils/mocks/handlers/featureToggleHandlers';
import { server } from '@testutils/mocks/node';
import { lagBrevmottakerFagsak } from '@testutils/testdata/brevmottakerTestdata';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { lagPerson } from '@testutils/testdata/personTestdata';
import { render, TestProviders } from '@testutils/testrender';
import type { BrevmottakerFagsak } from '@typer/brevmottaker';
import { FagsakStatus, type IMinimalFagsak } from '@typer/fagsak';
import { FeatureToggle, type FeatureToggles } from '@typer/featureToggles';
import { HttpResponse, http } from 'msw';
import type { PropsWithChildren } from 'react';
import { Route, Routes } from 'react-router';
import { describe, expect } from 'vitest';
import { Fagsakmeny } from './Fagsakmeny';

interface WrapperProps extends PropsWithChildren {
    initialEntries?: [{ pathname: string }];
    fagsak?: IMinimalFagsak;
    featureToggles?: FeatureToggles;
    brevmottakere?: BrevmottakerFagsak[];
}

function Wrapper({
    initialEntries = [{ pathname: '/fagsak/1' }],
    fagsak = lagFagsak(),
    featureToggles = skruPåAlleToggles(),
    brevmottakere = [],
    children,
}: WrapperProps) {
    return (
        <TestProviders initialEntries={initialEntries} featureToggles={featureToggles}>
            <FagsakProvider fagsak={fagsak}>
                <BrukerProvider bruker={lagPerson()}>
                    <BrevmottakereFagsakProvider initielleBrevmottakere={brevmottakere}>
                        <BrevmottakerDialogProvider>
                            <Routes>
                                <Route
                                    path={'/fagsak/:fagsakId/dokumentutsending'}
                                    element={
                                        <>
                                            <Heading level={'1'} size={'medium'}>
                                                Dokumentutsending
                                            </Heading>
                                            {children}
                                        </>
                                    }
                                />
                                <Route path={'/fagsak/:fagsakId'} element={<>{children}</>} />
                            </Routes>
                        </BrevmottakerDialogProvider>
                    </BrevmottakereFagsakProvider>
                </BrukerProvider>
            </FagsakProvider>
        </TestProviders>
    );
}

describe('Fagsakmeny', () => {
    test('skal rendre komponenten som forventent', () => {
        const { screen } = render(<Fagsakmeny />, { wrapper: Wrapper });
        expect(screen.getByRole('button', { name: 'Meny' })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Opprett behandling' })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Send informasjonsbrev' })).not.toBeInTheDocument();
    });

    test('skal vise de korrekte knappene når man trykker på menyen når man ikke er på dokumentsiden', async () => {
        const { screen, user } = render(<Fagsakmeny />, {
            wrapper: props => <Wrapper {...props} initialEntries={[{ pathname: '/fagsak/1' }]} />,
        });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        expect(screen.getByRole('menuitem', { name: 'Opprett behandling' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Send informasjonsbrev' })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Legg til brevmottaker' })).not.toBeInTheDocument();
    });

    test('skal vise de korrekte knappene når man trykker på menyen når man er på dokumentsiden', async () => {
        const { screen, user } = render(<Fagsakmeny />, {
            wrapper: props => <Wrapper {...props} initialEntries={[{ pathname: '/fagsak/1/dokumentutsending' }]} />,
        });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        expect(screen.getByRole('menuitem', { name: 'Opprett behandling' })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Send informasjonsbrev' })).not.toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Legg til brevmottaker' })).toBeInTheDocument();
    });

    test('skal kunne åpne opprett behandling modal', async () => {
        const { screen, user } = render(<Fagsakmeny />, { wrapper: Wrapper });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        const menuitem = screen.getByRole('menuitem', { name: 'Opprett behandling' });
        await user.click(menuitem);

        expect(screen.getByRole('dialog', { name: 'Opprett ny behandling' })).toBeInTheDocument();
    });

    test('skal kunne navigere til dokumentutsending', async () => {
        const { screen, user } = render(<Fagsakmeny />, {
            wrapper: props => <Wrapper {...props} initialEntries={[{ pathname: '/fagsak/1' }]} />,
        });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        const menuitem = screen.getByRole('menuitem', { name: 'Send informasjonsbrev' });
        await user.click(menuitem);

        expect(screen.getByRole('heading', { name: 'Dokumentutsending' })).toBeInTheDocument();
    });

    test.each([true, false, undefined])('skal velge brevmottakerdialog med toggle %s', async brukNyBrevmottaker => {
        const featureToggles: FeatureToggles =
            brukNyBrevmottaker === undefined ? {} : { [FeatureToggle.brukNyttBrevmottakerSkjema]: brukNyBrevmottaker };
        server.use(
            http.post('/familie-ks-sak/api/featuretoggles', () => HttpResponse.json(byggSuksessRessurs(featureToggles)))
        );
        const { screen, user } = render(<Fagsakmeny />, {
            wrapper: props => (
                <Wrapper
                    {...props}
                    initialEntries={[{ pathname: '/fagsak/1/dokumentutsending' }]}
                    featureToggles={featureToggles}
                />
            ),
        });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        const menuitem = screen.getByRole('menuitem', { name: 'Legg til brevmottaker' });
        await user.click(menuitem);

        expect(
            screen.getByRole('dialog', { name: brukNyBrevmottaker ? 'Brevmottaker' : 'Legg til brevmottaker' })
        ).toBeInTheDocument();
    });

    test.each([true, false])('skal velge brevmottakerdialog fra detaljer med toggle %s', async brukNyBrevmottaker => {
        const featureToggles = { [FeatureToggle.brukNyttBrevmottakerSkjema]: brukNyBrevmottaker };
        server.use(
            http.post('/familie-ks-sak/api/featuretoggles', () => HttpResponse.json(byggSuksessRessurs(featureToggles)))
        );
        const { screen, user } = render(<RegistrerteBrevmottakereFagsak />, {
            wrapper: props => (
                <Wrapper
                    {...props}
                    initialEntries={[{ pathname: '/fagsak/1/dokumentutsending' }]}
                    brevmottakere={[lagBrevmottakerFagsak()]}
                    featureToggles={featureToggles}
                />
            ),
        });

        await user.click(screen.getByRole('button', { name: 'Se detaljer' }));

        expect(
            screen.getByRole('dialog', {
                name: brukNyBrevmottaker ? 'Brevmottaker' : 'Legg til eller fjern brevmottaker',
            })
        ).toBeInTheDocument();
    });

    test('skal kun vise lås opp fagsak når fagsaken er låst', async () => {
        const { screen, user } = render(<Fagsakmeny />, {
            wrapper: props => <Wrapper {...props} fagsak={lagFagsak({ status: FagsakStatus.LÅST })} />,
        });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        expect(screen.getByRole('menuitem', { name: 'Lås opp fagsak' })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Opprett behandling' })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Send informasjonsbrev' })).not.toBeInTheDocument();
    });

    test('skal ikke vise lås opp fagsak når fagsaken ikke er låst', async () => {
        const { screen, user } = render(<Fagsakmeny />, { wrapper: Wrapper });

        const meny = screen.getByRole('button', { name: 'Meny' });
        await user.click(meny);

        expect(screen.queryByRole('menuitem', { name: 'Lås opp fagsak' })).not.toBeInTheDocument();
    });
});
