import { BehandlingSteg, BehandlingÅrsak, hentStegNummer, type IBehandling } from '@typer/behandling';
import { Resultat } from '@typer/vilkår';

import { mapFraRestPersonResultatTilPersonResultat } from './Vilkårsvurdering/utils';

export interface Side {
    id: SideId;
    href: string;
    navn: string;
    steg: BehandlingSteg;
    undersider?: (behandling: IBehandling) => Underside[];
    visSide?: (behandling: IBehandling) => boolean;
}

export interface Underside {
    navn: string;
    ident: string;
    antallAksjonspunkter: () => number;
    hash: string;
}

export interface Trinn extends Side {
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

export const sider: Record<SideId, Side> = {
    REGISTRERE_SØKNAD: {
        id: SideId.REGISTRERE_SØKNAD,
        href: 'registrer-soknad',
        navn: 'Registrer søknad',
        steg: BehandlingSteg.REGISTRERE_SØKNAD,
        visSide: behandling => {
            return behandling.årsak === BehandlingÅrsak.SØKNAD;
        },
    },
    VILKÅRSVURDERING: {
        id: SideId.VILKÅRSVURDERING,
        href: 'vilkaarsvurdering',
        navn: 'Vilkårsvurdering',
        steg: BehandlingSteg.VILKÅRSVURDERING,
        undersider: behandling => {
            const personResultater = mapFraRestPersonResultatTilPersonResultat(
                behandling.personResultater,
                behandling.personer
            );

            return personResultater.map((personResultat, index): Underside => {
                return {
                    navn: personResultat.person.navn,
                    ident: personResultat.person.personIdent,
                    hash: `${index}_${personResultat.person.fødselsdato}`,
                    antallAksjonspunkter: () => {
                        const vilkårSomErIkkeVurdert = personResultat.vilkårResultater.filter(
                            vilkårResultat => vilkårResultat.resultat === Resultat.IKKE_VURDERT
                        );
                        return vilkårSomErIkkeVurdert.length;
                    },
                };
            });
        },
    },
    BEHANDLINGRESULTAT: {
        id: SideId.BEHANDLINGRESULTAT,
        href: 'tilkjent-ytelse',
        navn: 'Behandlingsresultat',
        steg: BehandlingSteg.BEHANDLINGSRESULTAT,
    },
    SIMULERING: {
        id: SideId.SIMULERING,
        href: 'simulering',
        navn: 'Simulering',
        steg: BehandlingSteg.SIMULERING,
        visSide: behandling => {
            const erLovendringUtenSimuleringsteg =
                behandling.årsak === BehandlingÅrsak.LOVENDRING_2024 &&
                behandling.stegTilstand.every(steg => steg.behandlingSteg !== BehandlingSteg.SIMULERING);
            return !erLovendringUtenSimuleringsteg;
        },
    },
    VEDTAK: {
        id: SideId.VEDTAK,
        href: 'vedtak',
        navn: 'Vedtak',
        steg: BehandlingSteg.VEDTAK,
        visSide: behandling => {
            const erLovendringUtenVedtaksteg =
                behandling.årsak === BehandlingÅrsak.LOVENDRING_2024 &&
                behandling.stegTilstand.every(steg => steg.behandlingSteg !== BehandlingSteg.VEDTAK);
            return behandling.årsak !== BehandlingÅrsak.SATSENDRING && !erLovendringUtenVedtaksteg;
        },
    },
};

export function erSidenAktiv(side: Side, behandling: IBehandling): boolean {
    const steg = behandling.steg;

    if (!side.steg && side.steg !== 0) {
        return true;
    }

    if (!steg) {
        return false;
    }
    return hentStegNummer(side.steg) <= hentStegNummer(steg);
}

export function finnSiderForBehandling(behandling: IBehandling) {
    return Object.values(sider).filter(side => side.visSide?.(behandling) ?? true);
}

export function hentTrinnForBehandling(behandling: IBehandling): { [sideId: string]: Side } {
    const visSide = (side: Side) => {
        if (side.visSide) {
            return side.visSide(behandling);
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
}

export function finnSideForBehandlingssteg(behandling: IBehandling): Side | undefined {
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
}

export function erViPåUdefinertFagsakSide(pathname: string) {
    return (
        Object.values(sider).filter((side: Side) => pathname.includes(side.href)).length === 0 &&
        !pathname.includes('saksoversikt') &&
        !pathname.includes('ny-behandling')
    );
}

export function erViPåUlovligSteg(pathname: string, behandlingSide?: Side) {
    if (!behandlingSide) {
        return false;
    }

    const ønsketSteg = Object.values(sider).find((side: Side) => pathname.includes(side.href));

    if (ønsketSteg) {
        if (hentStegNummer(ønsketSteg?.steg) > hentStegNummer(behandlingSide.steg)) {
            return true;
        }
    }

    return false;
}
