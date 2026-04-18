import type { Saksbehandler } from '../../typer/saksbehandler';

export function lagSaksbehandler(saksbehandler: Partial<Saksbehandler> = {}): Saksbehandler {
    return {
        displayName: 'Saksbehandler',
        email: 'saksbehandler@nav.no',
        firstName: 'Sak',
        groups: ['c7e0b108-7ae6-432c-9ab4-946174c240c0'],
        identifier: '30987654321',
        lastName: 'Behandler',
        enhet: '0001',
        navIdent: 'A1',
        ...saksbehandler,
    };
}

export * as SaksbehandlerTestdata from './saksbehandlerTestdata';
