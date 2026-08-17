import { renderMedSkjema } from '@sider/Fagsak/Dokumentutsending/skjema/testutils/renderMedSkjema';
import { describe, expect, test } from 'vitest';

import { dokumentÅrsak, DokumentÅrsak } from '../dokumentÅrsakTyper';
import { ÅrsakVelger } from './ÅrsakVelger';

describe('ÅrsakVelger', () => {
    test('viser feilmelding når skjemaet sendes inn uten valgt årsak', async () => {
        const { sendInnSkjema, screen } = renderMedSkjema(<ÅrsakVelger />);

        await sendInnSkjema();

        expect(await screen.findByText('Du må velge en årsak')).toBeInTheDocument();
    });

    test('valg av årsak oppdaterer feltet og fjerner feilmeldingen', async () => {
        const { sendInnSkjema, screen, user, hentForm } = renderMedSkjema(<ÅrsakVelger />);

        await sendInnSkjema();
        expect(await screen.findByText('Du må velge en årsak')).toBeInTheDocument();

        await user.selectOptions(
            screen.getByRole('combobox', { name: 'Velg årsak' }),
            dokumentÅrsak[DokumentÅrsak.KAN_SØKE_EØS]
        );

        expect(hentForm().getValues('årsak')).toBe(DokumentÅrsak.KAN_SØKE_EØS);
        expect(screen.queryByText('Du må velge en årsak')).not.toBeInTheDocument();
    });

    test('rendrer alle årsaker som valg', () => {
        const { screen } = renderMedSkjema(<ÅrsakVelger />);

        Object.values(DokumentÅrsak).forEach(årsak => {
            expect(screen.getByRole('option', { name: dokumentÅrsak[årsak] })).toBeInTheDocument();
        });
    });
});
