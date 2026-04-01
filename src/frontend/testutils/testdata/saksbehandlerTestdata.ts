import { Saksbehandler } from '../../typer/saksbehandler';

export function lagSaksbehandler(saksbehandler: Partial<Saksbehandler> = {}): Saksbehandler {
    return new Saksbehandler({
        displayName: 'Saksbehandler',
        email: 'saksbehandler@nav.no',
        firstName: 'Sak',
        identifier: '30987654321',
        lastName: 'Behandler',
        enhet: '0001',
        navIdent: 'A1',
        ...saksbehandler,
        groups: saksbehandler.groups ? [...saksbehandler.groups] : ['c7e0b108-7ae6-432c-9ab4-946174c240c0'],
    });
}

export * as SaksbehandlerTestdata from './saksbehandlerTestdata';
