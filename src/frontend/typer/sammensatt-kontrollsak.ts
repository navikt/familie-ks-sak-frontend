export interface SammensattKontrollsakDto {
    id: number;
    behandlingId: number;
    fritekst: string;
}

export interface OpprettSammensattKontrollsakDto {
    behandlingId: number;
    fritekst: string;
}

export interface OppdaterSammensattKontrollsakDto {
    id: number;
    fritekst: string;
}

export interface SlettSammensattKontrollsakDto {
    id: number;
}
