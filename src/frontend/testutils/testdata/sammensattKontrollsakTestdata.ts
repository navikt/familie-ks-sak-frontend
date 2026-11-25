import type {
    OppdaterSammensattKontrollsakDto,
    OpprettSammensattKontrollsakDto,
    SammensattKontrollsakDto,
    SlettSammensattKontrollsakDto,
} from '@typer/sammensatt-kontrollsak';

export function lagSammensattKontrollsak(
    sammensattKontrollsak?: Partial<SammensattKontrollsakDto>
): SammensattKontrollsakDto {
    return {
        id: 1,
        behandlingId: 1,
        fritekst: 'Fritekst for sammensatt kontrollsak',
        ...sammensattKontrollsak,
    };
}

export function lagOpprettSammensattKontrollsak(
    opprettSammensattKontrollsak?: Partial<OpprettSammensattKontrollsakDto>
): OpprettSammensattKontrollsakDto {
    return {
        behandlingId: 1,
        fritekst: 'Fritekst for sammensatt kontrollsak',
        ...opprettSammensattKontrollsak,
    };
}

export function lagOppdaterSammensattKontrollsak(
    oppdaterSammensattKontrollsak?: Partial<OppdaterSammensattKontrollsakDto>
): OppdaterSammensattKontrollsakDto {
    return {
        id: 1,
        fritekst: 'Fritekst for sammensatt kontrollsak',
        ...oppdaterSammensattKontrollsak,
    };
}

export function lagSlettSammensattKontrollsak(
    slettSammensattKontrollsak?: Partial<SlettSammensattKontrollsakDto>
): SlettSammensattKontrollsakDto {
    return {
        id: 1,
        ...slettSammensattKontrollsak,
    };
}

export * as SammensattKontrollsakTestdata from './sammensattKontrollsakTestdata';
