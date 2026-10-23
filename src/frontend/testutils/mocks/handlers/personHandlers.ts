import { byggSuksessRessurs } from '@navikt/familie-typer';
import { Adressebeskyttelsegradering } from '@typer/person';
import { HttpResponse, http } from 'msw';
import { PersonTestdata } from '../../testdata/personTestdata';

export const personHandlers = [
    http.post<never, { ident: string }>('/familie-ks-sak/api/person', async ({ request }) => {
        const payload = await request.json();
        return HttpResponse.json(byggSuksessRessurs(PersonTestdata.lagPerson({ personIdent: payload.ident })));
    }),
    http.post<never, { ident: string }>('/familie-ks-sak/api/person/enkel', async ({ request }) => {
        const payload = await request.json();
        return HttpResponse.json(byggSuksessRessurs(PersonTestdata.lagPerson({ personIdent: payload.ident })));
    }),
    http.post('/familie-ks-sak/api/tilgang', () => {
        return HttpResponse.json(
            byggSuksessRessurs({
                saksbehandlerHarTilgang: true,
                adressebeskyttelsegradering: Adressebeskyttelsegradering.UGRADERT,
            })
        );
    }),
];
