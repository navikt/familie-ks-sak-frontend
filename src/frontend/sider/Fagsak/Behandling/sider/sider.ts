import { mapFraRestPersonResultatTilPersonResultat } from './Vilkårsvurdering/utils';
import {
    BehandlingSteg,
    BehandlingÅrsak,
    hentStegNummer,
    type IBehandling,
} from '../../../../typer/behandling';
import type { IPersonResultat, IVilkårResultat } from '../../../../typer/vilkår';
import { Resultat } from '../../../../typer/vilkår';
import { formaterIdent } from '../../../../utils/formatter';

export interface ISide {
    href: string;
    navn: string;
    steg: BehandlingSteg;
    undersider?: (åpenBehandling: IBehandling) => IUnderside[];
    visSide?: (åpenBehandling: IBehandling) => boolean;
}

export interface IUnderside {
    navn: string;
    antallAksjonspunkter: () => number;
    hash: string;
}

export interface ITrinn extends ISide {
    kontrollert: KontrollertStatus;
}

export enum KontrollertStatus {
    IKKE_KONTROLLERT,
    KONTROLLERT,
    MANGLER_KONTROLL,
}

export enum SideId {
    REGISTRERE_SØKNAD = 'REGISTRERE_SØKNAD',
    VILKÅRSVURDERING = 'VILKÅRSVURDERING',
    BEHANDLINGRESULTAT = 'BEHANDLINGRESULTAT',
    SIMULERING = 'SIMULERING',
    VEDTAK = 'VEDTAK',
}

export const sider: Record<SideId, ISide> = {
    REGISTRERE_SØKNAD: {
        href: 'registrer-soknad',
        navn: 'Registrer søknad',
        steg: BehandlingSteg.REGISTRERE_SØKNAD,
        visSide: (åpenBehandling: IBehandling) => {
            return åpenBehandling.årsak === BehandlingÅrsak.SØKNAD;
        },
    },
    VILKÅRSVURDERING: {
        href: 'vilkaarsvurdering',
        navn: 'Vilkårsvurdering',
        steg: BehandlingSteg.VILKÅRSVURDERING,
        undersider: (åpenBehandling: IBehandling) => {
            const personResultater = mapFraRestPersonResultatTilPersonResultat(
                åpenBehandling.personResultater,
                åpenBehandling.personer
            );

            return personResultater.map(
                (personResultat: IPersonResultat, index: number): IUnderside => {
                    return {
                        navn: `${personResultat.person.navn}, ${formaterIdent(
                            personResultat.person.personIdent
                        )}`,
                        hash: `${index}_${personResultat.person.fødselsdato}`,
                        antallAksjonspunkter: () =>
                            personResultat.vilkårResultater.filter(
                                (vilkårResultat: IVilkårResultat) => {
                                    return vilkårResultat.resultat === Resultat.IKKE_VURDERT;
                                }
                            ).length,
                    };
                }
            );
        },
    },
    BEHANDLINGRESULTAT: {
        href: 'tilkjent-ytelse',
        navn: 'Behandlingsresultat',
        steg: BehandlingSteg.BEHANDLINGSRESULTAT,
    },
    SIMULERING: {
        href: 'simulering',
        navn: 'Simulering',
        steg: BehandlingSteg.SIMULERING,
        visSide: (åpenBehandling: IBehandling) => {
            const erLovendringUtenSimuleringsteg =
                åpenBehandling.årsak === BehandlingÅrsak.LOVENDRING_2024 &&
                åpenBehandling.stegTilstand.every(
                    steg => steg.behandlingSteg !== BehandlingSteg.SIMULERING
                );
            return !erLovendringUtenSimuleringsteg;
        },
    },
    VEDTAK: {
        href: 'vedtak',
        navn: 'Vedtak',
        steg: BehandlingSteg.VEDTAK,
        visSide: (åpenBehandling: IBehandling) => {
            const erLovendringUtenVedtaksteg =
                åpenBehandling.årsak === BehandlingÅrsak.LOVENDRING_2024 &&
                åpenBehandling.stegTilstand.every(
                    steg => steg.behandlingSteg !== BehandlingSteg.VEDTAK
                );
            return (
                åpenBehandling.årsak !== BehandlingÅrsak.SATSENDRING && !erLovendringUtenVedtaksteg
            );
        },
    },
};

export const erSidenAktiv = (side: ISide, behandling: IBehandling): boolean => {
    const steg = behandling.steg;

    if (!side.steg && side.steg !== 0) {
        return true;
    }

    if (!steg) {
        return false;
    }
    return hentStegNummer(side.steg) <= hentStegNummer(steg);
};

export const hentTrinnForBehandling = (
    åpenBehandling: IBehandling
): { [sideId: string]: ISide } => {
    const visSide = (side: ISide) => {
        if (side.visSide) {
            return side.visSide(åpenBehandling);
        } else {
            return true;
        }
    };
    return Object.entries(sider)
        .filter(([_, side]) => visSide(side))
        .reduce((acc, [sideId, side]) => {
            return {
                ...acc,
                [sideId]: side,
            };
        }, {});
};

export const finnSideForBehandlingssteg = (behandling: IBehandling): ISide | undefined => {
    const steg = behandling.steg;

    if (hentStegNummer(steg) >= hentStegNummer(BehandlingSteg.VEDTAK)) {
        if (sider.VEDTAK.visSide && sider.VEDTAK.visSide(behandling)) {
            return sider.VEDTAK;
        }

        if (sider.SIMULERING.visSide && sider.SIMULERING.visSide(behandling)) {
            return sider.SIMULERING;
        }

        return sider.BEHANDLINGRESULTAT;
    }

    const sideForSteg = Object.entries(sider).find(([_, side]) => side.steg === steg);

    return sideForSteg ? sideForSteg[1] : undefined;
};

export const erViPåUdefinertFagsakSide = (pathname: string) => {
    return (
        Object.values(sider).filter((side: ISide) => pathname.includes(side.href)).length === 0 &&
        !pathname.includes('saksoversikt') &&
        !pathname.includes('ny-behandling')
    );
};

export const erViPåUlovligSteg = (pathname: string, behandlingSide?: ISide) => {
    if (!behandlingSide) return false;

    const ønsketSteg: ISide | undefined = Object.values(sider).find((side: ISide) =>
        pathname.includes(side.href)
    );

    if (ønsketSteg) {
        if (hentStegNummer(ønsketSteg?.steg) > hentStegNummer(behandlingSide.steg)) {
            return true;
        }
    }

    return false;
};
