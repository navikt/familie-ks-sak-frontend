import { useState } from 'react';

import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import type { IBehandling } from '../../../typer/behandling';
import type {
    IEndreVilkårResultat,
    IRestAnnenVurdering,
    IRestNyttVilkår,
    VilkårType,
} from '../../../typer/vilkår';

export const useVilkårsvurderingApi = () => {
    const { request } = useHttp();

    const { åpenBehandling, settÅpenBehandling } = useBehandling();

    const behandlingId =
        åpenBehandling.status === RessursStatus.SUKSESS ? åpenBehandling.data.behandlingId : null;

    const [lagrerVilkår, settLagrerVilkår] = useState<boolean>(false);
    const [lagreVilkårFeilmelding, settLagreVilkårFeilmelding] = useState<string>('');

    const [oppretterVilkår, settOppretterVilkår] = useState<boolean>(false);
    const [opprettVilkårFeilmelding, settOpprettVilkårFeilmelding] = useState<string>('');

    const [sletterVilkår, settSletterVilkår] = useState<boolean>(false);
    const [slettVilkårFeilmelding, settSlettVilkårFeilmelding] = useState<string>('');

    const [lagrerAnnenVurdering, settLagrerAnnenVurdering] = useState<boolean>(false);
    const [lagreAnnenVurderingFeilmelding, settLagreAnnenVurderingFeilmelding] =
        useState<string>('');

    const lagreVilkår = (
        endreVilkårResultat: IEndreVilkårResultat,
        onSuccess?: () => void,
        onFailure?: (feilmelding: string) => void
    ): void => {
        settLagrerVilkår(true);
        settLagreVilkårFeilmelding('');
        request<IEndreVilkårResultat, IBehandling>({
            method: 'PUT',
            url: `/familie-ks-sak/api/vilkaarsvurdering/${behandlingId}`,
            data: endreVilkårResultat,
        })
            .then((response: Ressurs<IBehandling>) => {
                settLagrerVilkår(false);
                if (response.status === RessursStatus.SUKSESS) {
                    settÅpenBehandling(response);
                    if (onSuccess) {
                        onSuccess();
                    }
                } else if (
                    response.status === RessursStatus.FEILET ||
                    response.status === RessursStatus.FUNKSJONELL_FEIL ||
                    response.status === RessursStatus.IKKE_TILGANG
                ) {
                    settLagreVilkårFeilmelding(response.frontendFeilmelding);
                    if (onFailure) {
                        onFailure(response.frontendFeilmelding);
                    }
                }
            })
            .catch(() => {
                settLagrerVilkår(false);
                settLagreVilkårFeilmelding(
                    'En ukjent feil har oppstått, vi har ikke klart å lagre vilkåret.'
                );
                if (onFailure) {
                    onFailure(lagreVilkårFeilmelding);
                }
            });
    };

    const slettVilkår = (
        personIdent: string,
        vilkårId: number,
        onSuccess?: () => void,
        onFailure?: (feilmelding: string) => void
    ) => {
        settSletterVilkår(true);
        settSlettVilkårFeilmelding('');
        request<string, IBehandling>({
            method: 'DELETE',
            url: `/familie-ks-sak/api/vilkaarsvurdering/${behandlingId}/${vilkårId}`,
            data: personIdent,
        })
            .then((response: Ressurs<IBehandling>) => {
                settSletterVilkår(false);
                if (response.status === RessursStatus.SUKSESS) {
                    settÅpenBehandling(response);
                    if (onSuccess) {
                        onSuccess();
                    }
                } else if (
                    response.status === RessursStatus.FEILET ||
                    response.status === RessursStatus.FUNKSJONELL_FEIL ||
                    response.status === RessursStatus.IKKE_TILGANG
                ) {
                    settSlettVilkårFeilmelding(response.frontendFeilmelding);
                    if (onFailure) {
                        onFailure(response.frontendFeilmelding);
                    }
                }
            })
            .catch(() => {
                settSlettVilkårFeilmelding(
                    'En ukjent feil har oppstått, vi har ikke klart å slette vilkåret.'
                );
                settSletterVilkår(false);
                if (onFailure) {
                    onFailure(slettVilkårFeilmelding);
                }
            });
    };

    const opprettVilkår = (personIdent: string, vilkårType: VilkårType, onFailure?: () => void) => {
        settOppretterVilkår(true);
        settOpprettVilkårFeilmelding('');
        request<IRestNyttVilkår, IBehandling>({
            method: 'POST',
            url: `/familie-ks-sak/api/vilkaarsvurdering/${behandlingId}`,
            data: { personIdent, vilkårType },
        })
            .then((response: Ressurs<IBehandling>) => {
                settOppretterVilkår(false);
                if (response.status === RessursStatus.SUKSESS) {
                    settÅpenBehandling(response);
                } else if (
                    response.status === RessursStatus.FEILET ||
                    response.status === RessursStatus.FUNKSJONELL_FEIL ||
                    response.status === RessursStatus.IKKE_TILGANG
                ) {
                    settOpprettVilkårFeilmelding(response.frontendFeilmelding);
                }
            })
            .catch(() => {
                settOppretterVilkår(false);
                settOpprettVilkårFeilmelding(
                    'En ukjent feil har oppstått, vi har ikke klart å legge til periode.'
                );
                if (onFailure) {
                    onFailure();
                }
            });
    };

    const lagreAnnenVurdering = (
        restAnnenVurdering: IRestAnnenVurdering,
        onSuccess?: () => void
    ) => {
        settLagrerAnnenVurdering(true);
        settLagreAnnenVurderingFeilmelding('');
        request<IRestAnnenVurdering, IBehandling>({
            method: 'PUT',
            url: `/familie-ks-sak/api/vilkaarsvurdering/${behandlingId}/annenvurdering/${restAnnenVurdering.id}`,
            data: restAnnenVurdering,
        })
            .then((response: Ressurs<IBehandling>) => {
                settLagrerAnnenVurdering(false);
                if (response.status === RessursStatus.SUKSESS) {
                    settÅpenBehandling(response);
                    if (onSuccess) {
                        onSuccess();
                    }
                } else if (
                    response.status === RessursStatus.FEILET ||
                    response.status === RessursStatus.FUNKSJONELL_FEIL ||
                    response.status === RessursStatus.IKKE_TILGANG
                ) {
                    settLagreAnnenVurderingFeilmelding(response.frontendFeilmelding);
                }
            })
            .catch(() => {
                settLagrerAnnenVurdering(false);
                settLagreAnnenVurderingFeilmelding(
                    'En ukjent feil har oppstått, vi har ikke klart å lagre endringen.'
                );
            });
    };

    return {
        lagreVilkår,
        lagrerVilkår,
        lagreVilkårFeilmelding,
        opprettVilkår,
        oppretterVilkår,
        opprettVilkårFeilmelding,
        slettVilkår,
        sletterVilkår,
        slettVilkårFeilmelding,
        lagreAnnenVurdering,
        lagrerAnnenVurdering,
        lagreAnnenVurderingFeilmelding,
    };
};
