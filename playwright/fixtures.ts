import { test as base, expect } from '@playwright/test';
import { handlers } from '@testutils/mocks/handlers/handlers';

import { type ApiMock, settOppApiMock } from './apiMock';

/**
 * Dagens dato i testene. Nettleseren får samme faste dato, slik at testene gir samme resultat uansett når de kjøres.
 * Bruk denne i stedet for `new Date()` når testen trenger dagens dato.
 */
export const I_DAG = new Date('2026-10-05T12:00:00+02:00');

interface Fixtures {
    apiMock: ApiMock;
    fastDato: undefined;
}

export const test = base.extend<Fixtures>({
    fastDato: [
        async ({ page }, use) => {
            await page.clock.setFixedTime(I_DAG);
            await use(undefined);
        },
        { auto: true },
    ],
    apiMock: [
        async ({ page, baseURL }, use) => {
            if (!baseURL) {
                throw new Error('baseURL må være satt i playwright.config.ts');
            }

            const apiMock = await settOppApiMock(page, new URL(baseURL).origin, handlers);

            await use(apiMock);

            await page.unrouteAll({ behavior: 'ignoreErrors' });
            expect(
                apiMock.ubehandledeKall,
                'Det ble gjort API-kall uten mock-handler. Legg til handler i src/frontend/testutils/mocks/handlers eller bruk apiMock.use() i testen.'
            ).toEqual([]);
        },
        { auto: true },
    ],
});

export { expect };
