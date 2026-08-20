import { renderMedSkjema } from '@sider/Fagsak/Dokumentutsending/skjema/testutils/renderMedSkjema';
import { describe, expect, test } from 'vitest';

import { FritekstAvsnitt } from './FritekstAvsnitt';

describe('FritekstAvsnitt', () => {
    test('viser feilmelding når skjemaet sendes inn uten fritekst', async () => {
        const { sendInnSkjema, screen } = renderMedSkjema(<FritekstAvsnitt />);

        await sendInnSkjema();

        expect(await screen.findByText('Fritekst avsnitt mangler.')).toBeInTheDocument();
    });

    test('feilmeldingen forsvinner når det skrives tekst', async () => {
        const { sendInnSkjema, screen, user } = renderMedSkjema(<FritekstAvsnitt />);

        await sendInnSkjema();
        expect(await screen.findByText('Fritekst avsnitt mangler.')).toBeInTheDocument();

        await user.type(screen.getByRole('textbox', { name: 'Skriv inn fritekst avsnitt' }), 'Dette er en fritekst.');

        expect(screen.queryByText('Fritekst avsnitt mangler.')).not.toBeInTheDocument();
    });

    test('respekterer maks lengde på 1000 tegn', () => {
        const { screen } = renderMedSkjema(<FritekstAvsnitt />);

        expect(screen.getByText('Tekstområde med plass til 1000 tegn.')).toBeInTheDocument();
    });
});
