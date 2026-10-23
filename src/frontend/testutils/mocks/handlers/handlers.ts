import { ainntektHandlers } from './ainntektHandlers';
import { barnehagebarnHandlers } from './barnehagebarnHandlers';
import { behandlingHandlers } from './behandlingHandlers';
import { dokumentHandlers } from './dokumentHandlers';
import { endretUtbetalingAndelHandlers } from './endretUtbetalingAndelHandlers';
import { fagsakHandlers } from './fagsakHandlers';
import { featureToggleHandlers } from './featureToggleHandlers';
import { historikkinnslagHandlers } from './historikkinnslagHandlers';
import { klageHandlers } from './klageHandlers';
import { loggHandlers } from './loggHandlers';
import { oppgaveHandlers } from './oppgaveHandlers';
import { personHandlers } from './personHandlers';
import { saksbehandlerHandlers } from './saksbehandlerHandlers';
import { simuleringHandlers } from './simuleringHandlers';
import { tilbakekrevingHandlers } from './tilbakekrevingHandlers';
import { vedtakHandlers } from './vedtakHandlers';
import { versionHandlers } from './versionHandlers';

export const handlers = [
    ...behandlingHandlers,
    ...klageHandlers,
    ...tilbakekrevingHandlers,
    ...featureToggleHandlers,
    ...versionHandlers,
    ...personHandlers,
    ...fagsakHandlers,
    ...ainntektHandlers,
    ...saksbehandlerHandlers,
    ...endretUtbetalingAndelHandlers,
    ...loggHandlers,
    ...oppgaveHandlers,
    ...dokumentHandlers,
    ...historikkinnslagHandlers,
    ...simuleringHandlers,
    ...vedtakHandlers,
    ...barnehagebarnHandlers,
];
