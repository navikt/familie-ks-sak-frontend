import { byggSuksessRessurs } from '@navikt/familie-typer';
import { AnnenVurderingTestdata } from '@testutils/testdata/annenVurderingTestdata';
import { BehandlingTestdata } from '@testutils/testdata/behandlingTestdata';
import { PersonResultatTestdata } from '@testutils/testdata/personResultatTestdata';
import { PersonTestdata } from '@testutils/testdata/personTestdata';
import { SaksbehandlerTestdata } from '@testutils/testdata/saksbehandlerTestdata';
import { VedtaksperiodeTestdata } from '@testutils/testdata/vedtaksperiodeTestdata';
import { VilkårResultatTestdata } from '@testutils/testdata/vilkårResultatTestdata';
import { BehandlerRolle, type BehandlingSteg, type IBehandling } from '@typer/behandling';
import { PersonType } from '@typer/person';
import { BegrunnelseType, type IRestBegrunnelseTilknyttetVilkår } from '@typer/vedtak';
import { type IVedtaksperiodeMedBegrunnelser, Vedtaksperiodetype } from '@typer/vedtaksperiode';
import { type IRestPersonResultat, Regelverk, Resultat, VilkårType } from '@typer/vilkår';
import { HttpResponse, http } from 'msw';

export const SØKER_IDENT = '12345678910';
export const SØKER_NAVN = 'Søker Testersen';
export const BARN_IDENT = '10022412345';
export const BARN_NAVN = 'Barn Testersen';

const BARN_FØDSELSDATO = '2024-02-10';
// Kontantstøtte gis fra barnet er 13 måneder til det er 19 måneder.
const BARN_13_MÅNEDER = '2025-03-10';
const BARN_19_MÅNEDER = '2025-09-10';

/** Sats for kontantstøtte ved fulltidsplass (ingen barnehageplass). */
export const KONTANTSTØTTE_SATS = 7500;

export const SØKERS_VILKÅR = [VilkårType.BOSATT_I_RIKET, VilkårType.MEDLEMSKAP, VilkårType.LOVLIG_OPPHOLD];

const BARNETS_VILKÅR = [
    VilkårType.BARNETS_ALDER,
    VilkårType.BARNEHAGEPLASS,
    VilkårType.BOR_MED_SØKER,
    VilkårType.BOSATT_I_RIKET,
    VilkårType.MEDLEMSKAP_ANNEN_FORELDER,
];

const VILKÅR_UTEN_REGELVERK = [VilkårType.BARNETS_ALDER, VilkårType.BARNEHAGEPLASS];

export function lagPersoner() {
    return [
        PersonTestdata.lagGrunnlagPerson({ personIdent: SØKER_IDENT, navn: SØKER_NAVN }),
        PersonTestdata.lagGrunnlagPerson({
            personIdent: BARN_IDENT,
            navn: BARN_NAVN,
            type: PersonType.BARN,
            fødselsdato: BARN_FØDSELSDATO,
        }),
    ];
}

/** Vilkår-id-ene er løpenummer: søkers vilkår først, deretter barnets, i rekkefølgen over. */
export function vilkårResultatId(personIdent: string, vilkårType: VilkårType) {
    return personIdent === SØKER_IDENT
        ? SØKERS_VILKÅR.indexOf(vilkårType) + 1
        : SØKERS_VILKÅR.length + BARNETS_VILKÅR.indexOf(vilkårType) + 1;
}

/** Søkers vilkår som ikke er vurdert ennå. Alle andre vilkår er oppfylt fra barnets fødsel. */
interface VilkårsvurderingValg {
    ikkeVurderteVilkårForSøker?: VilkårType[];
}

export function lagPersonResultater({
    ikkeVurderteVilkårForSøker = [],
}: VilkårsvurderingValg = {}): IRestPersonResultat[] {
    function lagVilkår(personIdent: string, vilkårType: VilkårType) {
        const id = vilkårResultatId(personIdent, vilkårType);
        if (personIdent === SØKER_IDENT && ikkeVurderteVilkårForSøker.includes(vilkårType)) {
            return VilkårResultatTestdata.lagVilkårResultat({
                id,
                vilkårType,
                vurderesEtter: Regelverk.NASJONALE_REGLER,
                begrunnelse: '',
            });
        }
        const erBarnetsAlder = vilkårType === VilkårType.BARNETS_ALDER;
        return VilkårResultatTestdata.lagVilkårResultat({
            id,
            vilkårType,
            resultat: Resultat.OPPFYLT,
            erVurdert: true,
            periodeFom: erBarnetsAlder ? BARN_13_MÅNEDER : BARN_FØDSELSDATO,
            periodeTom: erBarnetsAlder ? BARN_19_MÅNEDER : undefined,
            vurderesEtter: VILKÅR_UTEN_REGELVERK.includes(vilkårType) ? undefined : Regelverk.NASJONALE_REGLER,
            begrunnelse: '',
        });
    }

    return [
        PersonResultatTestdata.lagPersonResultat({
            personIdent: SØKER_IDENT,
            vilkårResultater: SØKERS_VILKÅR.map(vilkårType => lagVilkår(SØKER_IDENT, vilkårType)),
            andreVurderinger: [
                AnnenVurderingTestdata.lagAnnenVurdering({ resultat: Resultat.OPPFYLT, erVurdert: true }),
            ],
        }),
        PersonResultatTestdata.lagPersonResultat({
            personIdent: BARN_IDENT,
            vilkårResultater: BARNETS_VILKÅR.map(vilkårType => lagVilkår(BARN_IDENT, vilkårType)),
        }),
    ];
}

/** Full kontantstøtte for barnet fra det er 13 til 19 måneder. */
export function lagTilkjentYtelse(): Pick<IBehandling, 'utbetalingsperioder' | 'personerMedAndelerTilkjentYtelse'> {
    const barn = lagPersoner()[1];
    return {
        utbetalingsperioder: [
            VedtaksperiodeTestdata.lagUtbetalingsperiode({
                periodeFom: '2025-03-01',
                periodeTom: '2025-09-30',
                utbetalingsperiodeDetaljer: [
                    VedtaksperiodeTestdata.lagUtbetalingsperiodeDetalj({
                        person: barn,
                        utbetaltPerMnd: KONTANTSTØTTE_SATS,
                    }),
                ],
            }),
        ],
        personerMedAndelerTilkjentYtelse: [
            PersonTestdata.lagPersonMedAndelerTilkjentYtelse({ personIdent: BARN_IDENT, beløp: KONTANTSTØTTE_SATS }),
        ],
    };
}

/**
 * Førstegangsbehandling på søknad for én søker og ett barn, der alle vilkår er oppfylt og barnet har fått tilkjent
 * full kontantstøtte.
 */
export function lagBehandlingPåSteg(steg: BehandlingSteg, endringer: Partial<IBehandling> = {}): IBehandling {
    return BehandlingTestdata.lagBehandling({
        steg,
        personer: lagPersoner(),
        personResultater: lagPersonResultater(),
        ...lagTilkjentYtelse(),
        vedtak: { aktiv: true, vedtaksdato: '', id: 1 },
        ...endringer,
    });
}

export const BEGRUNNELSE_IKKE_BARNEHAGE: IRestBegrunnelseTilknyttetVilkår = {
    id: 'NasjonalEllerFellesBegrunnelse$INNVILGET_IKKE_BARNEHAGE',
    navn: 'Ikke barnehage',
    vilkår: VilkårType.BARNEHAGEPLASS,
};

const BEGRUNNELSE_BOSATT_I_RIKET: IRestBegrunnelseTilknyttetVilkår = {
    id: 'NasjonalEllerFellesBegrunnelse$INNVILGET_BOSATT_I_NORGE',
    navn: 'Bosatt i Norge',
    vilkår: VilkårType.BOSATT_I_RIKET,
};

/**
 * Én innvilget vedtaksperiode for barnet uten valgte begrunnelser. Valg av begrunnelser lagres, slik at perioden har
 * begrunnelser når appen henter vedtaksperiodene på nytt.
 */
export function lagVedtaksperiodemock() {
    let vedtaksperioder: IVedtaksperiodeMedBegrunnelser[] = [
        VedtaksperiodeTestdata.lagVedtaksperiodeMedBegrunnelser({
            id: 1,
            fom: '2025-03-01',
            tom: '2025-09-30',
            type: Vedtaksperiodetype.UTBETALING,
            gyldigeBegrunnelser: [BEGRUNNELSE_IKKE_BARNEHAGE.id, BEGRUNNELSE_BOSATT_I_RIKET.id],
            utbetalingsperiodeDetaljer: [
                VedtaksperiodeTestdata.lagUtbetalingsperiodeDetalj({
                    person: lagPersoner()[1],
                    utbetaltPerMnd: KONTANTSTØTTE_SATS,
                }),
            ],
        }),
    ];

    return {
        hent: () => vedtaksperioder,
        handlers: [
            http.get('/familie-ks-sak/api/vedtaksperioder/behandling/:behandlingId/hent-vedtaksperioder', () =>
                HttpResponse.json(byggSuksessRessurs(vedtaksperioder))
            ),
            http.get(encodeURI('/familie-ks-sak/api/vilkårsvurdering/vilkaarsbegrunnelser'), () =>
                HttpResponse.json(
                    byggSuksessRessurs(
                        VedtaksperiodeTestdata.lagAlleBegrunnelser({
                            [BegrunnelseType.INNVILGET]: [BEGRUNNELSE_IKKE_BARNEHAGE, BEGRUNNELSE_BOSATT_I_RIKET],
                        })
                    )
                )
            ),
            http.put<{ vedtaksperiodeId: string }, { begrunnelser: string[] }>(
                '/familie-ks-sak/api/vedtaksperioder/begrunnelser/:vedtaksperiodeId',
                async ({ params, request }) => {
                    const { begrunnelser } = await request.json();
                    vedtaksperioder = vedtaksperioder.map(vedtaksperiode =>
                        vedtaksperiode.id !== Number(params.vedtaksperiodeId)
                            ? vedtaksperiode
                            : {
                                  ...vedtaksperiode,
                                  begrunnelser: begrunnelser.map(begrunnelse => ({
                                      begrunnelse,
                                      begrunnelseType: BegrunnelseType.INNVILGET,
                                      støtterFritekst: false,
                                  })),
                              }
                    );
                    return HttpResponse.json(byggSuksessRessurs(vedtaksperioder));
                }
            ),
        ],
    };
}

// Rollen utledes fra AD-gruppene i /user/profile. Gruppene her er saksbehandler- og beslutterrollen i preprod.
const BESLUTTER = SaksbehandlerTestdata.lagSaksbehandler({
    groups: ['c7e0b108-7ae6-432c-9ab4-946174c240c0', '52fe1bef-224f-49df-a40a-29f92d4520f8'],
    displayName: 'Beslutter Testersen',
    email: 'beslutter@nav.no',
    firstName: 'Beslutter',
    lastName: 'Testersen',
    navIdent: 'B1',
    rolle: BehandlerRolle.BESLUTTER,
});

export const innloggetSomBeslutter = http.get('/user/profile', () => HttpResponse.json(BESLUTTER));

// Veileder har bare lesetilgang. Gruppen er veilederrollen i preprod.
const VEILEDER = SaksbehandlerTestdata.lagSaksbehandler({
    groups: ['71f503a2-c28f-4394-a05a-8da263ceca4a'],
    displayName: 'Veileder Testersen',
    email: 'veileder@nav.no',
    firstName: 'Veileder',
    lastName: 'Testersen',
    navIdent: 'V1',
    rolle: BehandlerRolle.VEILEDER,
    harSkrivetilgang: false,
});

export const innloggetSomVeileder = http.get('/user/profile', () => HttpResponse.json(VEILEDER));
