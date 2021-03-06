# familie-ks-sak-frontend
====================

Frontend app for kontantstøtte mottak

# Kom i gang med utvikling

* Installere avhengigheter `yarn`
* Starte dev-server `yarn start:dev`
* Åpne `http://localhost:8000` i nettleseren din

Appen krever en del environment variabler og legges til i .env fila i root på prosjektet.  
```
    CLIENT_ID='<application_id from aad app>'
    CLIENT_SECRET='<KEY from aad app>'
    COOKIE_KEY1='<any string of length 32>'
    COOKIE_KEY2='<any string of length 32>'
    PASSPORTCOOKIE_KEY1='<any string of length 32>'
    PASSPORTCOOKIE_KEY2='<any string of length 32>'
    PASSPORTCOOKIE_KEY3='<any string of length 12>'
    PASSPORTCOOKIE_KEY4='<any string of length 12>'
    SESSION_SECRET='<any string of length 32>'
    
    ENV=local
    APP_VERSION=0.0.1
```

For å bygge prodversjon kjør `yarn build`. Prodversjonen vil ikke kjøre lokalt med mindre det gjøres en del endringer i forbindelse med uthenting av environment variabler og URLer for uthenting av informasjon.

---


# Bygg og deploy
Appen bygges hos circleci, og gir beskjed til nais deploy om å deployere appen i fss området. Alle commits til feature brancher går til dev miljøet og tags med formen `vx.x` deployes til produksjon.

# Henvendelser

Spørsmål knyttet til koden eller prosjektet kan rettes til:

* Henning Håkonsen, `henning.hakonsen@nav.no`

## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #team-familie.