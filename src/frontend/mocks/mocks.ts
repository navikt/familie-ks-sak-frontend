import { kjønnType } from '@navikt/familie-typer';

import type { IBehandling } from '../typer/behandling';
import {
    BehandlingResultat,
    BehandlingStatus,
    BehandlingSteg,
    BehandlingStegStatus,
    Behandlingstype,
    BehandlingÅrsak,
} from '../typer/behandling';
import { BehandlingKategori, BehandlingUnderkategori } from '../typer/behandlingstema';
import { PersonType } from '../typer/person';
import { Målform } from '../typer/søknad';

export const behandlingMock: IBehandling = {
    behandlingId: 100103251,
    steg: BehandlingSteg.SEND_TIL_BESLUTTER,
    stegTilstand: [
        {
            behandlingSteg: BehandlingSteg.REGISTRERE_PERSONGRUNNLAG,
            behandlingStegStatus: BehandlingStegStatus.UTFØRT,
        },
        {
            behandlingSteg: BehandlingSteg.REGISTRERE_SØKNAD,
            behandlingStegStatus: BehandlingStegStatus.UTFØRT,
        },
        {
            behandlingSteg: BehandlingSteg.VILKÅRSVURDERING,
            behandlingStegStatus: BehandlingStegStatus.UTFØRT,
        },
        {
            behandlingSteg: BehandlingSteg.BEHANDLINGSRESULTAT,
            behandlingStegStatus: BehandlingStegStatus.UTFØRT,
        },
        {
            behandlingSteg: BehandlingSteg.VURDER_TILBAKEKREVING,
            behandlingStegStatus: BehandlingStegStatus.UTFØRT,
        },
        {
            behandlingSteg: BehandlingSteg.SEND_TIL_BESLUTTER,
            behandlingStegStatus: BehandlingStegStatus.IKKE_UTFØRT,
        },
    ],
    status: BehandlingStatus.UTREDES,
    resultat: BehandlingResultat.INNVILGET,
    skalBehandlesAutomatisk: false,
    type: Behandlingstype.FØRSTEGANGSBEHANDLING,
    kategori: BehandlingKategori.NASJONAL,
    underkategori: BehandlingUnderkategori.UTVIDET,
    årsak: BehandlingÅrsak.SØKNAD,
    opprettetTidspunkt: '2022-09-02T11:54:36.322',
    endretAv: 'Z994148',
    arbeidsfordelingPåBehandling: {
        behandlendeEnhetId: '4817',
        behandlendeEnhetNavn: 'NAV Familie- og pensjonsytelser Steinkjer',
        manueltOverstyrt: false,
    },
    søknadsgrunnlag: {
        underkategori: BehandlingUnderkategori.UTVIDET,
        søkerMedOpplysninger: { ident: '23508647212', målform: Målform.NB },
        barnaMedOpplysninger: [
            {
                ident: '13451764912',
                navn: 'Motstandsdyktig Kokkekniv',
                fødselsdato: '2017-05-13',
                inkludertISøknaden: true,
                manueltRegistrert: false,
                erFolkeregistrert: true,
            },
        ],
        endringAvOpplysningerBegrunnelse: '',
    },
    personer: [
        {
            type: PersonType.BARN,
            fødselsdato: '2017-05-13',
            personIdent: '13451764912',
            navn: 'Motstandsdyktig Kokkekniv',
            kjønn: kjønnType.MANN,
            registerhistorikk: {
                hentetTidspunkt: '2022-09-02T11:54:41.693',
                sivilstand: [],
                oppholdstillatelse: [],
                statsborgerskap: [{ fom: '2017-05-13', verdi: 'Norge' }],
                bostedsadresse: [{ fom: '1986-10-23', verdi: 'Vreimsida 833, 3803' }],
                dødsboadresse: [],
            },
            målform: Målform.NB,
        },
        {
            type: PersonType.SØKER,
            fødselsdato: '1986-10-23',
            personIdent: '23508647212',
            navn: 'Usjenert Ballong',
            kjønn: kjønnType.KVINNE,
            registerhistorikk: {
                hentetTidspunkt: '2022-09-02T11:54:41.693',
                sivilstand: [{ fom: '2004-10-23', verdi: 'Ugift' }],
                oppholdstillatelse: [],
                statsborgerskap: [{ fom: '1986-10-23', verdi: 'Norge' }],
                bostedsadresse: [{ fom: '1986-10-23', verdi: 'Vreimsida 833, 3803' }],
                dødsboadresse: [],
            },
            målform: Målform.NB,
        },
    ],
    personResultater: [],
    fødselshendelsefiltreringResultater: [],
    utbetalingsperioder: [],
    personerMedAndelerTilkjentYtelse: [],
    endretUtbetalingAndeler: [],
    kompetanser: [],
    valutakurser: [],
    utenlandskePeriodebeløp: [],
};
