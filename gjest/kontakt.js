/*
  Kontaktdata for gjestesiden. Alt om personer og telefonnumre står bare her.

  - Fjerne en person: sett telefon til "" (tom). Da viser siden
    «Se Airbnb-meldingen din» i stedet for en ringeknapp.
  - Bytte person: endre navn og telefon.
  - Telefon skrives med landskode, for eksempel "+47 900 00 000".
  - Rolle vises under navnet, på hvert språk.

  Skriv aldri koder, passord eller nøkkelplasseringer i denne filen.
*/
window.SYNINGEN_KONTAKT = {
  // Hovedkontakt for gjester
  hoved: {
    navn: "Kristiane Bratlie",
    telefon: "+47 938 49 785",
    rolle: {
      no: "Utleie og spørsmål om oppholdet",
      de: "Vermietung und Fragen zum Aufenthalt",
      en: "Rental and questions about your stay"
    }
  },

  // Snøbrøyting. Så lenge telefon er tom, viser siden hovedkontakten i stedet.
  broyting: {
    navn: "",
    telefon: "",
    rolle: {
      no: "Snøbrøyting",
      de: "Schneeräumung",
      en: "Snow clearing"
    }
  }
};
