import { useState } from 'react';

import { useSkjema, useFelt, feil, ok } from '@navikt/familie-skjema';
import type { FeltState } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';
import type { Ressurs } from '@navikt/familie-typer';

import { useFagsakContext } from '../../../../../context/fagsak/FagsakContext';
import { Brevmal } from '../../../../../komponenter/Hendelsesoversikt/BrevModul/typer';
import type { HenleggÅrsak, IBehandling } from '../../../../../typer/behandling';
import type { IManueltBrevRequestPåBehandling } from '../../../../../typer/dokument';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';

const useHenleggBehandling = (lukkModal: () => void) => {
    const [visVeivalgModal, settVisVeivalgModal] = useState(false);
    const [begrunnelse, settBegrunnelse] = useState('');
    const [årsak, settÅrsak] = useState('');
    const { settÅpenBehandling } = useBehandlingContext();
    const { minimalFagsakRessurs } = useFagsakContext();

    const { onSubmit, skjema, nullstillSkjema } = useSkjema<
        {
            årsak: HenleggÅrsak | '';
            begrunnelse: '';
        },
        IBehandling
    >({
        felter: {
            årsak: useFelt({
                verdi: '',
                valideringsfunksjon: (felt: FeltState<HenleggÅrsak | ''>) =>
                    felt.verdi !== '' ? ok(felt) : feil(felt, 'Du må velge årsak'),
            }),
            begrunnelse: useFelt({
                verdi: '',
            }),
        },
        skjemanavn: 'henleggbehandling',
    });

    const onBekreft = (behandlingId: number) => {
        onSubmit(
            {
                method: 'PUT',
                data: {
                    årsak: skjema.felter.årsak.verdi,
                    begrunnelse: skjema.felter.begrunnelse.verdi,
                },
                url: `/familie-ks-sak/api/behandlinger/${behandlingId}/henlegg`,
            },
            (ressurs: Ressurs<IBehandling>) => {
                settÅpenBehandling(ressurs);
                settÅrsak(skjema.felter.årsak.verdi);
                lukkModal();
                settVisVeivalgModal(true);
            }
        );
    };

    const hentSkjemaData = (): IManueltBrevRequestPåBehandling => ({
        mottakerIdent:
            minimalFagsakRessurs.status === RessursStatus.SUKSESS
                ? minimalFagsakRessurs.data.søkerFødselsnummer
                : '',
        multiselectVerdier: [],
        brevmal: Brevmal.HENLEGGE_TRUKKET_SØKNAD,
        barnIBrev: [],
    });

    return {
        begrunnelse,
        skjema,
        nullstillSkjema,
        onBekreft,
        settBegrunnelse,
        settVisVeivalgModal,
        visVeivalgModal,
        hentSkjemaData,
        årsak,
    };
};

export default useHenleggBehandling;
