import { renderMedSkjema } from '@sider/Fagsak/Dokumentutsending/skjema/testutils/renderMedSkjema';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { FagsakStatus } from '@typer/fagsak';
import { describe, expect, test } from 'vitest';

import { FritekstAvsnitt } from './FritekstAvsnitt';

describe('FritekstAvsnitt', () => {
    test('viser feilmelding når skjemaet sendes inn uten fritekst', async () => {
        const { sendInnSkjema, screen } = renderMedSkjema(<FritekstAvsnitt />);

        await sendInnSkjema();

        expect(await screen.findByText('Du må fylle inn en fritekst.')).toBeInTheDocument();
    });

    test('feilmeldingen forsvinner når det skrives tekst', async () => {
        const { sendInnSkjema, screen, user } = renderMedSkjema(<FritekstAvsnitt />);

        await sendInnSkjema();
        expect(await screen.findByText('Du må fylle inn en fritekst.')).toBeInTheDocument();

        await user.type(screen.getByRole('textbox', { name: 'Skriv inn fritekst' }), 'Dette er en fritekst.');

        expect(screen.queryByText('Du må fylle inn en fritekst.')).not.toBeInTheDocument();
    });

    test('respekterer maks lengde på 1000 tegn', () => {
        const { screen } = renderMedSkjema(<FritekstAvsnitt />);

        expect(screen.getByText('Tekstområde med plass til 1000 tegn.')).toBeInTheDocument();
    });

    test('er skrivebeskyttet når fagsaken er låst', () => {
        const { screen } = renderMedSkjema(<FritekstAvsnitt />, {
            fagsak: lagFagsak({ status: FagsakStatus.LÅST }),
        });

        expect(screen.getByRole('textbox', { name: 'Skriv inn fritekst' })).toHaveAttribute('readonly');
    });
});
