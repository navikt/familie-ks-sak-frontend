import { useMatch } from 'react-router';

const makeNumber = (id: string | undefined): number | undefined => {
    const erTall = id !== undefined && !isNaN(Number(id));
    return erTall ? Number(id) : undefined;
};

const useSakOgBehandlingParams = (): { fagsakId?: number; behandlingId?: string } => {
    const matchFagsakIdOgBehandlingId = useMatch('/fagsak/:fagsakId/:behandlingId/*');
    const matchBareFagsakId = useMatch('/fagsak/:fagsakId/*');

    if (matchFagsakIdOgBehandlingId) {
        return {
            fagsakId:
                matchFagsakIdOgBehandlingId.params.fagsakId &&
                isNaN(parseInt(matchFagsakIdOgBehandlingId.params.fagsakId))
                    ? undefined
                    : makeNumber(matchFagsakIdOgBehandlingId.params.fagsakId),
            behandlingId:
                matchFagsakIdOgBehandlingId.params.behandlingId &&
                isNaN(parseInt(matchFagsakIdOgBehandlingId.params.behandlingId))
                    ? undefined
                    : matchFagsakIdOgBehandlingId.params.behandlingId,
        };
    }

    if (matchBareFagsakId) {
        return {
            fagsakId:
                matchBareFagsakId.params.fagsakId &&
                isNaN(parseInt(matchBareFagsakId.params.fagsakId))
                    ? undefined
                    : makeNumber(matchBareFagsakId.params.fagsakId),
            behandlingId: undefined,
        };
    }

    return { fagsakId: undefined, behandlingId: undefined };
};

export default useSakOgBehandlingParams;
