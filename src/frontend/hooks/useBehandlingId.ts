import { useParams } from 'react-router';

export function useBehandlingId(): number | undefined {
    const { behandlingId } = useParams();
    const erTall = behandlingId !== undefined && !isNaN(Number(behandlingId));
    return erTall ? Number(behandlingId) : undefined;
}
