import { apiClient } from '@api/client/apiClient';
import type { EndringsårsakbegrunnelseTekster } from '@typer/endretUtbetaling';

export async function hentEndretUtbetalingBegrunnelser(): Promise<EndringsårsakbegrunnelseTekster> {
    return apiClient.get<void, EndringsårsakbegrunnelseTekster>({
        url: '/familie-ks-sak/api/endretutbetalingandel/endret-utbetaling-vedtaksbegrunnelser',
    });
}
