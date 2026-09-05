import type { ReactNode } from 'react';

import { oppdaterVilkårResultat } from '@api/oppdaterVilkårResultat';
import { BehandlingProvider } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { HentOgSettBehandlingProvider } from '@sider/Fagsak/Behandling/context/HentOgSettBehandlingContext';
import { EkspanderbareVilkårResultatRaderProvider } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårResultatRaderContext';
import { VilkårsvurderingProvider } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/VilkårsvurderingContext';
import { FagsakProvider } from '@sider/Fagsak/FagsakContext';
import { waitFor } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { lagPersonResultat } from '@testutils/testdata/personResultatTestdata';
import { lagGrunnlagPerson } from '@testutils/testdata/personTestdata';
import { lagVilkårResultat, lagVilkårResultatUi } from '@testutils/testdata/vilkårResultatTestdata';
import { render, TestProviders } from '@testutils/testrender';
import { BehandlingSteg, type IBehandling } from '@typer/behandling';
import { PersonType } from '@typer/person';
import { Resultat, vilkårConfig, VilkårType } from '@typer/vilkår';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Table } from '@navikt/ds-react';

import { Barnehageplass } from './Barnehageplass';

vi.mock('@api/oppdaterVilkårResultat');

afterEach(() => {
    vi.clearAllMocks();
});

const barn = lagGrunnlagPerson({ personIdent: '10987654321', fødselsdato: '2023-05-17', type: PersonType.BARN });

const lagretVilkårResultat = lagVilkårResultat({
    id: 42,
    vilkårType: VilkårType.BARNEHAGEPLASS,
    resultat: Resultat.IKKE_VURDERT,
    begrunnelse: '',
});

const lagretVilkårResultatUi = lagVilkårResultatUi(lagretVilkårResultat);

const behandling: IBehandling = lagBehandling({
    steg: BehandlingSteg.VILKÅRSVURDERING,
    personer: [barn],
    personResultater: [lagPersonResultat({ personIdent: barn.personIdent, vilkårResultater: [lagretVilkårResultat] })],
});

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

function renderBarnehageplass() {
    return render(
        <Barnehageplass
            lagretVilkårResultat={lagretVilkårResultatUi}
            vilkårFraConfig={vilkårConfig.BARNEHAGEPLASS}
            person={barn}
            settFokusPåLeggTilPeriodeKnapp={vi.fn()}
        />,
        { wrapper: Wrapper }
    );
}

describe('Barnehageplass', () => {
    test('viser valideringsfeil når vilkåret lagres uten svar og periode', async () => {
        // Arrange
        const { screen, user } = renderBarnehageplass();

        // Act
        await user.click(screen.getByRole('button', { name: 'Ferdig' }));

        // Assert
        expect(await screen.findByText('Resultat er ikke satt')).toBeInTheDocument();
        expect(screen.getByText('F.o.m. må settes før du kan gå videre')).toBeInTheDocument();
        expect(oppdaterVilkårResultat).not.toHaveBeenCalled();
    });

    test('avslag fjerner periodefeilen uten ny innsending', async () => {
        // Arrange
        const { screen, user } = renderBarnehageplass();
        await user.click(screen.getByRole('radio', { name: 'Ja' }));
        await user.type(screen.getByLabelText('Antall timer'), '40');
        await user.click(screen.getByRole('button', { name: 'Ferdig' }));
        expect(await screen.findByText('F.o.m. må settes før du kan gå videre')).toBeInTheDocument();

        // Act
        await user.click(screen.getByRole('checkbox', { name: 'Vurderingen er et avslag' }));

        // Assert
        await waitFor(() =>
            expect(screen.queryByText('F.o.m. må settes før du kan gå videre')).not.toBeInTheDocument()
        );
        expect(screen.getByLabelText('F.o.m (valgfri)')).toBeInTheDocument();
    });

    test('barnehageplass under 33 timer gir oppfylt vilkår med antall timer i payload', async () => {
        // Arrange
        const { screen, user } = renderBarnehageplass();
        vi.mocked(oppdaterVilkårResultat).mockResolvedValue(behandling);

        // Act
        await user.click(screen.getByRole('radio', { name: 'Ja' }));
        await user.type(screen.getByLabelText('Antall timer'), '20');
        await user.type(screen.getByLabelText('F.o.m'), '01.06.2024');
        await user.click(screen.getByRole('button', { name: 'Ferdig' }));

        // Assert
        await waitFor(() => expect(oppdaterVilkårResultat).toHaveBeenCalledTimes(1));
        expect(oppdaterVilkårResultat).toHaveBeenCalledWith(behandling.behandlingId, {
            personIdent: barn.personIdent,
            adopsjonsdato: undefined,
            endretVilkårResultat: expect.objectContaining({
                id: 42,
                resultat: Resultat.OPPFYLT,
                antallTimer: 20,
                periodeFom: '2024-06-01',
                periodeTom: undefined,
            }),
        });
    });

    test('tømt t.o.m. gir åpen periode og blokkerer ikke lagring', async () => {
        // Arrange
        const { screen, user } = renderBarnehageplass();
        vi.mocked(oppdaterVilkårResultat).mockResolvedValue(behandling);
        await user.click(screen.getByRole('radio', { name: 'Nei' }));
        await user.type(screen.getByLabelText('F.o.m'), '01.06.2024');
        await user.type(screen.getByLabelText('T.o.m (valgfri)'), '01.07.2024');

        // Act
        await user.clear(screen.getByLabelText('T.o.m (valgfri)'));
        await user.click(screen.getByRole('button', { name: 'Ferdig' }));

        // Assert
        await waitFor(() => expect(oppdaterVilkårResultat).toHaveBeenCalledTimes(1));
        const [, endreVilkårResultat] = vi.mocked(oppdaterVilkårResultat).mock.calls[0];
        expect(endreVilkårResultat.endretVilkårResultat.periodeFom).toBe('2024-06-01');
        expect(endreVilkårResultat.endretVilkårResultat.periodeTom).toBeUndefined();
    });

    test('ingen barnehageplass gir oppfylt vilkår og skjuler antall timer', async () => {
        // Arrange
        const { screen, user } = renderBarnehageplass();
        vi.mocked(oppdaterVilkårResultat).mockResolvedValue(behandling);

        // Act
        await user.click(screen.getByRole('radio', { name: 'Nei' }));
        await user.type(screen.getByLabelText('F.o.m'), '01.06.2024');
        await user.click(screen.getByRole('button', { name: 'Ferdig' }));

        // Assert
        expect(screen.queryByLabelText('Antall timer')).not.toBeInTheDocument();
        await waitFor(() => expect(oppdaterVilkårResultat).toHaveBeenCalledTimes(1));
        const [, endreVilkårResultat] = vi.mocked(oppdaterVilkårResultat).mock.calls[0];
        expect(endreVilkårResultat.endretVilkårResultat.resultat).toBe(Resultat.OPPFYLT);
        expect(endreVilkårResultat.endretVilkårResultat.antallTimer).toBeUndefined();
    });

    test('barnehageplass med 33 timer eller mer gir ikke oppfylt vilkår', async () => {
        // Arrange
        const { screen, user } = renderBarnehageplass();
        vi.mocked(oppdaterVilkårResultat).mockResolvedValue(behandling);

        // Act
        await user.click(screen.getByRole('radio', { name: 'Ja' }));
        await user.type(screen.getByLabelText('Antall timer'), '40');
        await user.type(screen.getByLabelText('F.o.m'), '01.06.2024');
        await user.click(screen.getByRole('button', { name: 'Ferdig' }));

        // Assert
        await waitFor(() => expect(oppdaterVilkårResultat).toHaveBeenCalledTimes(1));
        const [, endreVilkårResultat] = vi.mocked(oppdaterVilkårResultat).mock.calls[0];
        expect(endreVilkårResultat.endretVilkårResultat.resultat).toBe(Resultat.IKKE_OPPFYLT);
    });
});
