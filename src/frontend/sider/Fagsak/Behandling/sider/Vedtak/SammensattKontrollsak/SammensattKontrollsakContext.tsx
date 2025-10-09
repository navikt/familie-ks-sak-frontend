import { createContext, useContext, useEffect, useState } from 'react';

import { useHttp } from '@navikt/familie-http';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useAppContext } from '../../../../../../context/AppContext';
import {
    Behandlingstype,
    erBehandlingAvslått,
    erBehandlingFortsattInnvilget,
    type IBehandling,
} from '../../../../../../typer/behandling';
import type {
    OppdaterSammensattKontrollsakDto,
    OpprettSammensattKontrollsakDto,
    SammensattKontrollsakDto,
    SlettSammensattKontrollsakDto,
} from '../../../../../../typer/sammensatt-kontrollsak';
import { ToggleNavn } from '../../../../../../typer/toggles';
import { erDefinert } from '../../../../../../utils/commons';

interface ISammensattKontrollsakProps extends PropsWithChildren {
    åpenBehandling: IBehandling;
}

interface SammensattKontrollsakContextValue {
    opprettEllerOppdaterSammensattKontrollsak: (fritekst: string) => void;
    slettSammensattKontrollsak: () => void;
    feilmelding: string | undefined;
    sammensattKontrollsak: SammensattKontrollsakDto | undefined;
    erSammensattKontrollsak: boolean;
    settErSammensattKontrollsak: React.Dispatch<React.SetStateAction<boolean>>;
    skalViseSammensattKontrollsakMenyvalg: boolean;
}

const SammensattKontrollsakContext = createContext<SammensattKontrollsakContextValue | undefined>(undefined);

export const SammensattKontrollsakProvider = ({ åpenBehandling, children }: ISammensattKontrollsakProps) => {
    const { behandlingId, type, resultat } = åpenBehandling;
    const { request } = useHttp();
    const { toggles } = useAppContext();
    const [feilmelding, settFeilmelding] = useState<string | undefined>(undefined);
    const [erSammensattKontrollsak, settErSammensattKontrollsak] = useState<boolean>(false);
    const [sammensattKontrollsak, settSammensattKontrollsak] = useState<SammensattKontrollsakDto | undefined>();

    useEffect(() => {
        hentSammensattKontrollsak();
    }, [behandlingId]);

    const skalViseSammensattKontrollsakMenyvalg =
        toggles[ToggleNavn.kanOppretteOgEndreSammensatteKontrollsaker] &&
        type !== Behandlingstype.FØRSTEGANGSBEHANDLING &&
        !erBehandlingAvslått(resultat) &&
        !erBehandlingFortsattInnvilget(resultat);

    function opprettEllerOppdaterSammensattKontrollsak(fritekst: string) {
        settFeilmelding(undefined);
        if (erDefinert(sammensattKontrollsak)) {
            oppdaterSammensattKontrollsak(sammensattKontrollsak, fritekst);
        } else {
            opprettSammensattKontrollsak(fritekst);
        }
    }
    function mottaRespons(respons: Ressurs<SammensattKontrollsakDto | undefined>) {
        if (respons.status == RessursStatus.SUKSESS) {
            if (erDefinert(respons.data)) {
                settSammensattKontrollsak(respons.data);
                settErSammensattKontrollsak(true);
            }
        } else if (
            respons.status === RessursStatus.FEILET ||
            respons.status === RessursStatus.FUNKSJONELL_FEIL ||
            respons.status === RessursStatus.IKKE_TILGANG
        ) {
            settFeilmelding(respons.frontendFeilmelding);
        }
    }

    function hentSammensattKontrollsak() {
        request<void, SammensattKontrollsakDto>({
            method: 'GET',
            url: `/familie-ks-sak/api/sammensatt-kontrollsak/${behandlingId}`,
        }).then(mottaRespons);
    }

    function opprettSammensattKontrollsak(fritekst: string) {
        request<OpprettSammensattKontrollsakDto, SammensattKontrollsakDto>({
            method: 'POST',
            data: { behandlingId: behandlingId, fritekst: fritekst },
            url: `/familie-ks-sak/api/sammensatt-kontrollsak`,
            påvirkerSystemLaster: true,
        }).then(mottaRespons);
    }

    function oppdaterSammensattKontrollsak(sammensattKontrollsak: SammensattKontrollsakDto, fritekst: string) {
        request<OppdaterSammensattKontrollsakDto, SammensattKontrollsakDto>({
            method: 'PUT',
            data: { ...sammensattKontrollsak, fritekst: fritekst },
            url: `/familie-ks-sak/api/sammensatt-kontrollsak`,
            påvirkerSystemLaster: true,
        }).then(mottaRespons);
    }

    function slettSammensattKontrollsak() {
        settFeilmelding(undefined);
        if (erDefinert(sammensattKontrollsak)) {
            request<SlettSammensattKontrollsakDto, number>({
                method: 'DELETE',
                data: { ...sammensattKontrollsak },
                url: `/familie-ks-sak/api/sammensatt-kontrollsak`,
                påvirkerSystemLaster: true,
            }).then(() => {
                settSammensattKontrollsak(undefined);
                settErSammensattKontrollsak(false);
            });
        } else {
            settErSammensattKontrollsak(false);
        }
    }

    return (
        <SammensattKontrollsakContext.Provider
            value={{
                opprettEllerOppdaterSammensattKontrollsak,
                slettSammensattKontrollsak,
                feilmelding,
                sammensattKontrollsak,
                erSammensattKontrollsak,
                settErSammensattKontrollsak,
                skalViseSammensattKontrollsakMenyvalg,
            }}
        >
            {children}
        </SammensattKontrollsakContext.Provider>
    );
};

export const useSammensattKontrollsakContext = () => {
    const context = useContext(SammensattKontrollsakContext);
    if (context === undefined) {
        throw new Error('useSammensattKontrollsakContext må brukes innenfor en SammensattKontrollsak');
    }
    return context;
};
