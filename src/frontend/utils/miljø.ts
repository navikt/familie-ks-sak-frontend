export const erProd = () =>
    window.location.host === 'kontantstotte.nais.adeo.no' ||
    window.location.host === 'kontantstotte.intern.nav.no';

export const hentSideHref = (pathname: string) => pathname.split('/')[4];
