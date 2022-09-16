import { useState } from 'react';

import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import type { IBehandling } from '../../../typer/behandling';
import type {
    IRestAnnenVurdering,
    IRestNyttVilkår,
    IRestPersonResultat,
    VilkårType,
} from '../../../typer/vilkår';

export const useVilkårsvurderingApi = () => {
    const { request } = useHttp();

    const { åpenBehandling, settÅpenBehandling } = useBehandling();

    const behandlingId =
        åpenBehandling.status === RessursStatus.SUKSESS ? åpenBehandling.data.behandlingId : null;

    const [lagrerVilkår, settLagrerVilkår] = useState<boolean>(false);
    const [oppretterVilkår, settOppretterVilkår] = useState<boolean>(false);
    const [sletterVilkår, settSletterVilkår] = useState<boolean>(false);
    const [lagrerAnnenVurdering, settLagrerAnnenVurdering] = useState<boolean>(false);
    const [lagrerAnnenVurderingFeilmelding, settLagrerAnnenVurderingFeilmelding] =
        useState<string>('');
    const [oppretterVilkårFeilmelding, settOppretterVilkårFeilmelding] = useState<string>('');

    const lagreVilkår = (
        restPersonResultat: IRestPersonResultat,
        vilkårId: number,
        onSuccess?: () => void,
        onFailure?: () => void
    ): void => {
        settLagrerVilkår(true);
        request<IRestPersonResultat, IBehandling>({
            method: 'PUT',
            url: `/familie-ks-sak/api/vilkaarsvurdering/${behandlingId}/${vilkårId}`,
            data: restPersonResultat,
        })
            .then((response: Ressurs<IBehandling>) => {
                settLagrerVilkår(false);
                if (response.status === RessursStatus.SUKSESS) {
                    settÅpenBehandling(response);
                    if (onSuccess) {
                        onSuccess();
                    }
                }
            })
            .catch(() => {
                settLagrerVilkår(false);
                if (onFailure) {
                    onFailure();
                }
            });
    };

    const slettVilkår = (
        personIdent: string,
        vilkårId: number,
        onSuccess?: () => void,
        onFailure?: () => void
    ) => {
        settSletterVilkår(true);
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
                }
            })
            .catch(() => {
                settSletterVilkår(false);
                if (onFailure) {
                    onFailure();
                }
            });
    };

    const opprettVilkår = (personIdent: string, vilkårType: VilkårType, onFailure?: () => void) => {
        settOppretterVilkår(true);
        settOppretterVilkårFeilmelding('');
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
                    settOppretterVilkårFeilmelding(response.frontendFeilmelding);
                }
            })
            .catch(() => {
                settOppretterVilkår(false);
                settOppretterVilkårFeilmelding(
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
        settLagrerAnnenVurderingFeilmelding('');
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
                    settLagrerAnnenVurderingFeilmelding(response.frontendFeilmelding);
                }
            })
            .catch(() => {
                settLagrerAnnenVurdering(false);
                settLagrerAnnenVurderingFeilmelding(
                    'En ukjent feil har oppstått, vi har ikke klart å lagre endringen.'
                );
            });
    };

    return {
        lagreVilkår,
        lagrerVilkår,
        opprettVilkår,
        oppretterVilkår,
        oppretterVilkårFeilmelding,
        slettVilkår,
        sletterVilkår,
        lagreAnnenVurdering,
        lagrerAnnenVurdering,
        lagrerAnnenVurderingFeilmelding,
    };
};
