import { http, HttpResponse } from 'msw';

import { byggSuksessRessurs } from '@navikt/familie-typer';

import { FeatureToggle, type FeatureToggles } from '../../../typer/featureToggles';

export function skruPåAlleToggles(): FeatureToggles {
    const toggles = Object.values(FeatureToggle);
    return toggles.reduce((toggles: FeatureToggles, toggle: FeatureToggle) => {
        toggles[toggle] = true;
        return toggles;
    }, {});
}

export const featureToggleHandlers = [
    http.post('/familie-ks-sak/api/featuretoggles', () => {
        return HttpResponse.json(byggSuksessRessurs(skruPåAlleToggles()));
    }),
];
