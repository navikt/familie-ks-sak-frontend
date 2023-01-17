import { BehandlingStatus, BehandlingSteg } from '../../../typer/behandling';
import { saksbehandlerHarKunLesevisning } from '../util';

describe('BehandlingContext', () => {
    describe('erBehandlingILesevisning', () => {
        test('Skal returnere true dersom saksbehandler ikke har skrivetilgang.', () => {
            expect(
                saksbehandlerHarKunLesevisning(
                    false,
                    true,
                    BehandlingSteg.REGISTRERE_SØKNAD,
                    BehandlingStatus.UTREDES
                )
            ).toBeTruthy();
        });
        test('Skal returnere true dersom behandling er avsluttet.', () => {
            expect(
                saksbehandlerHarKunLesevisning(
                    true,
                    true,
                    BehandlingSteg.REGISTRERE_SØKNAD,
                    BehandlingStatus.AVSLUTTET
                )
            ).toBeTruthy();
        });
        test('Skal returnere false dersom saksbehandler har skrivetilgang og steget er før beslutte vedtak.', () => {
            expect(
                saksbehandlerHarKunLesevisning(
                    true,
                    true,
                    BehandlingSteg.VEDTAK,
                    BehandlingStatus.UTREDES
                )
            ).toBeFalsy();
        });
        test('Skal returnere true dersom saksbehandler har skrivetilgang, men ikke tilgang til enhet og steget er før beslutte vedtak.', () => {
            expect(
                saksbehandlerHarKunLesevisning(
                    true,
                    false,
                    BehandlingSteg.VEDTAK,
                    BehandlingStatus.UTREDES
                )
            ).toBeTruthy();
        });
        test('Skal returnere true dersom saksbehandler har skrivetilgang, men steget er etter beslutte vedtak.', () => {
            expect(
                saksbehandlerHarKunLesevisning(
                    true,
                    true,
                    BehandlingSteg.IVERKSETT_MOT_OPPDRAG,
                    BehandlingStatus.FATTER_VEDTAK
                )
            ).toBeTruthy();
        });
        test('Skal returnere true dersom saksbehandler har skrivetilgang, men ikke tilgang til enhet.', () => {
            expect(
                saksbehandlerHarKunLesevisning(
                    true,
                    false,
                    BehandlingSteg.BESLUTTE_VEDTAK,
                    BehandlingStatus.FATTER_VEDTAK
                )
            ).toBeTruthy();
        });
        test('Skal returnere false dersom saksbehandler har skrivetilgang, men ikke tilgang til enhet. Men man skal ikke sjekke tilgang til enhet.', () => {
            expect(
                saksbehandlerHarKunLesevisning(
                    true,
                    false,
                    BehandlingSteg.VEDTAK,
                    BehandlingStatus.FATTER_VEDTAK,
                    false
                )
            ).toBeFalsy();
        });
    });
});
