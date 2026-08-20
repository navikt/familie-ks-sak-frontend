import { renderMedSkjema } from '@sider/Fagsak/Dokumentutsending/skjema/testutils/renderMedSkjema';
import { Målform } from '@typer/søknad';
import { describe, expect, test } from 'vitest';

import { MålformVelger } from './MålformVelger';

describe('MålformVelger', () => {
    test('bokmål er forhåndsvalgt', () => {
        const { screen } = renderMedSkjema(<MålformVelger />);

        expect(screen.getByRole('radio', { name: 'Bokmål' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Nynorsk' })).not.toBeChecked();
    });

    test('valg av nynorsk oppdaterer feltet', async () => {
        const { screen, user, hentForm } = renderMedSkjema(<MålformVelger />);

        await user.click(screen.getByRole('radio', { name: 'Nynorsk' }));

        expect(hentForm().getValues('målform')).toBe(Målform.NN);
        expect(screen.getByRole('radio', { name: 'Nynorsk' })).toBeChecked();
    });

    test('valg av bokmål etter nynorsk oppdaterer feltet tilbake', async () => {
        const { screen, user, hentForm } = renderMedSkjema(<MålformVelger />, {
            defaultValues: { målform: Målform.NN },
        });

        await user.click(screen.getByRole('radio', { name: 'Bokmål' }));

        expect(hentForm().getValues('målform')).toBe(Målform.NB);
    });
});
