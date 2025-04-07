import { useEffect, useState } from 'react';

import constate from 'constate';

import { useHttp } from '@navikt/familie-http';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useApp } from '../../../../../../context/AppContext';
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

interface InputProps {
    behandling: IBehandling;
}

function hook({ behandling }: InputProps) {
    const { behandlingId, type, resultat } = behandling;
    const { request } = useHttp();
    const { toggles } = useApp();
    const [feilmelding, settFeilmelding] = useState<string | undefined>(undefined);
    const [erSammensattKontrollsak, settErSammensattKontrollsak] = useState<boolean>(false);
    const [sammensattKontrollsak, settSammensattKontrollsak] = useState<
        SammensattKontrollsakDto | undefined
    >();

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

    function oppdaterSammensattKontrollsak(
        sammensattKontrollsak: SammensattKontrollsakDto,
        fritekst: string
    ) {
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

    return {
        opprettEllerOppdaterSammensattKontrollsak,
        slettSammensattKontrollsak,
        feilmelding,
        sammensattKontrollsak,
        erSammensattKontrollsak,
        settErSammensattKontrollsak,
        skalViseSammensattKontrollsakMenyvalg,
    };
}

export const [SammensattKontrollsakProvider, useSammensattKontrollsakContext] = constate(hook);
