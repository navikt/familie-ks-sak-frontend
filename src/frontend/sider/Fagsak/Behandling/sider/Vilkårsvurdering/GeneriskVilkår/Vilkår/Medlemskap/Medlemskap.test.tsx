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
import { BehandlingSteg } from '@typer/behandling';
import { PersonType } from '@typer/person';
import { Regelverk, Resultat, vilkårConfig, VilkårType } from '@typer/vilkår';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Table } from '@navikt/ds-react';

import { Medlemskap } from './Medlemskap';

vi.mock('@api/oppdaterVilkårResultat');

afterEach(() => {
    vi.clearAllMocks();
});

const søker = lagGrunnlagPerson({ personIdent: '12345678910', fødselsdato: '1990-01-01', type: PersonType.SØKER });

const lagretVilkårResultat = lagVilkårResultat({
    id: 42,
    vilkårType: VilkårType.MEDLEMSKAP,
    resultat: Resultat.IKKE_VURDERT,
    begrunnelse: '',
});

const behandling = lagBehandling({
    steg: BehandlingSteg.VILKÅRSVURDERING,
    personer: [søker],
    personResultater: [lagPersonResultat({ personIdent: søker.personIdent, vilkårResultater: [lagretVilkårResultat] })],
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

function renderMedlemskap() {
    return render(
        <Medlemskap
            lagretVilkårResultat={lagVilkårResultatUi(lagretVilkårResultat)}
            vilkårFraConfig={vilkårConfig.MEDLEMSKAP}
            person={søker}
            settFokusPåLeggTilPeriodeKnapp={vi.fn()}
        />,
        { wrapper: Wrapper }
    );
}

describe('Medlemskap', () => {
    test('EØS-forordningen gir valget "Ikke aktuelt" som lagres med regelverk', async () => {
        // Arrange
        const { screen, user } = renderMedlemskap();
        vi.mocked(oppdaterVilkårResultat).mockResolvedValue(behandling);
        expect(screen.queryByRole('radio', { name: 'Ikke aktuelt' })).not.toBeInTheDocument();

        // Act
        await user.selectOptions(screen.getByLabelText('Vurderes etter'), Regelverk.EØS_FORORDNINGEN);
        await user.click(screen.getByRole('radio', { name: 'Ikke aktuelt' }));
        await user.type(screen.getByLabelText('F.o.m'), '01.06.2024');
        await user.click(screen.getByRole('button', { name: 'Ferdig' }));

        // Assert
        await waitFor(() => expect(oppdaterVilkårResultat).toHaveBeenCalledTimes(1));
        const [, endreVilkårResultat] = vi.mocked(oppdaterVilkårResultat).mock.calls[0];
        expect(endreVilkårResultat.endretVilkårResultat.resultat).toBe(Resultat.IKKE_AKTUELT);
        expect(endreVilkårResultat.endretVilkårResultat.vurderesEtter).toBe(Regelverk.EØS_FORORDNINGEN);
    });

    test('bytte til nasjonale regler nullstiller resultatet', async () => {
        // Arrange
        const { screen, user } = renderMedlemskap();
        await user.selectOptions(screen.getByLabelText('Vurderes etter'), Regelverk.EØS_FORORDNINGEN);
        await user.click(screen.getByRole('radio', { name: 'Ikke aktuelt' }));

        // Act
        await user.selectOptions(screen.getByLabelText('Vurderes etter'), Regelverk.NASJONALE_REGLER);

        // Assert
        expect(screen.queryByRole('radio', { name: 'Ikke aktuelt' })).not.toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Ja' })).not.toBeChecked();
        expect(screen.getByRole('radio', { name: 'Nei' })).not.toBeChecked();
    });

    test('viser feilmelding fra server i skjemaet når lagring feiler', async () => {
        // Arrange
        const { screen, user } = renderMedlemskap();
        vi.mocked(oppdaterVilkårResultat).mockRejectedValue(new Error('Noe gikk galt på serveren'));

        // Act
        await user.selectOptions(screen.getByLabelText('Vurderes etter'), Regelverk.NASJONALE_REGLER);
        await user.click(screen.getByRole('radio', { name: 'Ja' }));
        await user.type(screen.getByLabelText('F.o.m'), '01.06.2024');
        await user.click(screen.getByRole('button', { name: 'Ferdig' }));

        // Assert
        expect(await screen.findByText('Noe gikk galt på serveren')).toBeInTheDocument();
    });
});
