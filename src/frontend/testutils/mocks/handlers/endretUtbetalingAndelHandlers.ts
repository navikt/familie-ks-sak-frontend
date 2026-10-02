import { byggFunksjonellFeilRessurs, byggSuksessRessurs } from '@navikt/familie-typer';
import { BegrunnelseType } from '@typer/vedtak';
import { HttpResponse, http } from 'msw';

export const endretUtbetalingAndelHandlers = [
    http.get('/familie-ks-sak/api/endretutbetalingandel/endret-utbetaling-vedtaksbegrunnelser', () =>
        HttpResponse.json(
            byggSuksessRessurs(
                Object.fromEntries(
                    Object.values(BegrunnelseType).map(type => [
                        type,
                        type === BegrunnelseType.AVSLAG
                            ? [
                                  {
                                      id: 'NasjonalEllerFellesBegrunnelse$AVSLAG_ENDRINGSPERIODE_ALLEREDE_UTBETALT_SØKER',
                                      navn: 'Allerede utbetalt til søker',
                                      endringsårsaker: ['ALLEREDE_UTBETALT'],
                                  },
                              ]
                            : [],
                    ])
                )
            )
        )
    ),
    http.put('/familie-ks-sak/api/endretutbetalingandel/:behandlingId/:id', () =>
        HttpResponse.json(byggFunksjonellFeilRessurs('Mangler handler for oppdatering i testen'))
    ),
    http.delete('/familie-ks-sak/api/endretutbetalingandel/:behandlingId/:id', () =>
        HttpResponse.json(byggFunksjonellFeilRessurs('Mangler handler for sletting i testen'))
    ),
];
