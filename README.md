# Plan 2028 · version 8.2

Din app frem mod flytningen i sommeren 2028: vagter, opsparing, træning og milepæle. Den er bygget til at føles som en indbygget Samsung-app.

## Sådan får du appen på din Samsung

GitHub bygger APK-filen gratis for dig. Det tager ca. 10 minutter første gang.

1. **Opret en gratis konto** på [github.com](https://github.com).
2. **Lav et nyt repository**: tryk **+** → **New repository**, kald det `plan2028`, vælg **Private**, og tryk **Create repository**.
3. **Upload filerne** (nemmest fra en computer): pak zip-filen ud, tryk **uploading an existing file**, og træk *indholdet* af mappen `plan2028` ind, også mappen `.github`. Tryk **Commit changes**.
   - Kan du ikke se `.github`-mappen? På Mac: tryk `Cmd + Shift + .` i Finder. På Windows: Vis → Skjulte elementer.
4. **Vent på bygningen**: gå til fanen **Actions**. Når "Byg Android-app" har et grønt flueben, er appen klar (3–5 minutter).
5. **Hent appen på telefonen**: åbn dit repository på telefonen → **Releases** → tryk **Plan2028.apk**.
6. **Installér**: åbn filen, tillad installation fra browseren, og tryk **Installér**. Advarer Play Protect, så tryk **Installer alligevel**. Det sker, fordi appen ikke kommer fra Play Butik.

Første gang du åbner appen, tjekker du dine tal. Slå derefter påmindelser til under **Tjek → Påmindelser**, og tryk **Tillad**, når telefonen spørger.

## Det indbyggede på din Samsung

- **Genveje på ikonet**: hold fingeren på Plan 2028-ikonet for *Log vagt*, *Indbetal* og *Trænet i dag*.
- **Felt i panelet**: swipe ned to gange → tryk på blyanten (Rediger) → træk **Trænet i dag** op blandt dine felter. Så kan du logge træning uden at åbne appen.
- **Widgets**: hold fingeren på startskærmen → **Widgets** → **Plan 2028**.
  - *Overblik (4×2)*: dage til flytning, næste vagt, flyttekonto, ugens træning og timer. Knappen **+ Trænet i dag** logger passet direkte fra widgetten.
  - *Nedtælling (2×2)*: dage til flytning, flyttekonto i procent og hvornår målet nås.
- **Påmindelser**: lønningsdag kl. 9 med forslag til overførsel, træning på dine træningsdage (med knappen *Jeg har trænet* direkte i notifikationen) og søndagsstatus.
- **Haptik og deling**: små vibrationer som i resten af One UI, og knappen *Del* sender din status med Samsungs egen delemenu.

Træning, du logger fra widget, panel eller notifikation, kommer automatisk ind i appen, næste gang du åbner den.

## Samsung Health

Samsung Health deler dine data gennem **Health Connect**, som er indbygget i Android 14 og nyere.

1. Åbn **Samsung Health** → **Indstillinger** → **Health Connect**, og slå deling af skridt og træning til. Menuerne kan hedde lidt forskelligt alt efter din version.
2. Åbn Plan 2028 → **Træning** → **Forbind Samsung Health**, og tryk **Tillad** til skridt og træning.

Herefter viser appen dine skridt for de sidste 7 dage. Træninger på 15 minutter eller mere fra Samsung Health tæller med i ugens mål og din streak. Det kan du slå fra under **Tjek → Samsung Health**. Appen læser kun data, og den skriver aldrig i Samsung Health.

## Træning og krop

- **Program til sixpack, arme, skuldre og bryst**: 4 pas, der skifter automatisk.
  - A · Bryst og skuldre
  - B · Ben og mave
  - C · Ryg og arme
  - D · Arme, skuldre og mave
  Hver øvelse har et tip om teknik. Appen foreslår næste vægt og gentagelser ud fra sidste gang.
- **Kondition**: pas A og C slutter med 10 minutters intervaller. Kortet **Kondition** har et løbeprogram fra 0 til 5 km på 8 uger med 2 ture om ugen à ca. 25 minutter. Tryk **Start**, så styrer appen tiden, vibrerer, når du skal skifte mellem løb og gang, og holder skærmen tændt. Cykel eller romaskine kan logges med **Log anden kondition**. På dage uden styrketræning står løbeturen i Dagens plan, indtil du har lavet 2 i ugen.
- **Ugemål**: antallet af træningsdage, du vælger (fra start mandag, tirsdag, torsdag og lørdag). Det gælder også streak, widgets og påmindelser.
- **Krop og kost**: dit dagsmål for kalorier og protein ud fra højde, vægt, alder og mål (Byg muskler, Byg og stram op eller Tab fedt). Tryk på maden for at logge protein.
- **Vægt og mål**: vej dig et par gange om ugen. Appen viser kurven og tempoet og foreslår at justere kalorierne. Mål overarm, bryst og talje én gang om måneden.
- **Plan for sixpack**: byg muskler i ca. 5 måneder, og skift så til "Tab fedt" i 8–10 uger. Appen fortæller dig, hvornår det er tid.

## Billig og nem mad

Under **Træning → Billig og nem mad** laver appen en madplan, der rammer dit kalorie- og proteinmål så billigt som muligt (ca. 55 kr. om dagen for over 3.000 kcal).

- **Ugeplan**: morgenmad, frokost, aftensmad og mellemmåltider for hele ugen. Appen vælger de billigste retter først, og **Ny plan** giver andre retter.
- **Tilpasset dine vagter, uden madlavning på arbejdet**: før en tidlig vagt får du skyr to go (skyr, havregryn og en banan i en boks, 1 minut) eller overnight oats fra aftenen før. Har du fri kl. 10 eller sent om aftenen, får du skyr med müsli, skyr med peanutbutter og banan eller kogte æg på rugbrød. Har du vagt over aftensmaden, får du en kold ret med, der ikke skal varmes. Filteret **Ingen madlavning** viser alle retter, der ikke kræver noget.
- **Gratis mad på arbejdet**: franskbrød, smør og bananer på arbejdet bliver brugt på dine vagtdage og regnet som 0 kr. Før en tidlig vagt tager du bare 2 kogte æg med, og i pausen giver franskbrød med smør og en banan ca. 340 kcal gratis. Kan slås fra i ugeplanen.
- **Meal prep**: lav 2 retter i store portioner, søndag og onsdag. Mad i køleskabet holder 3 dage.
- **Aftensmad hjemme**: slå det til, hvis du spiser med derhjemme, så planlægger appen kun resten.
- **Indkøbsliste**: samlet og sorteret efter afdeling, med pris, og hvor længe varen rækker. Kopiér den, sæt hak i butikken, og log indkøbet som udgift med ét tryk.
- **Opskrifter**: 23 billige retter med kalorier, protein, pris og trin. Plus en liste over den billigste protein pr. 10 g.
- **Proteindrikke**: proteindrik og kakao kan logges med ét tryk. Under **Ret dine proteindrikke** skriver du tallene fra flasken én gang, fx Arla Protein yoghurtdrik 500 ml med 21 g protein og 270 kcal. Proteindrik og en banan bliver foreslået efter dine vagter.
- **Spist**: tryk på et måltid, så logger appen kalorier og protein for dig.
- **Priser**: cirkapriser i et supermarked som Føtex. Ret dem til det, du betaler, så passer budgettet præcist.

## Dagens plan

Øverst på forsiden står de samme fem ting hver dag: træning, protein, skridt, din startup-opgave og sengetid. Træning, protein og skridt (med Samsung Health) bliver sat hak ved af sig selv.

## Økonomi

- **Forbrug**: log udgifter i kategorier og se, hvor meget du kan bruge om dagen resten af måneden.
- **Fordel lønnen**: skriv, hvad der kom ind, så deler appen beløbet mellem forbrug, flyttekonto og aktier og registrerer overførslerne.
- **Flyttemålet, delt op**: depositum, indskud, møbler, flytning og buffer, som bliver fyldt op i rækkefølge.
- **Aktiesparekonto**: skriv den aktuelle værdi, så ser du dit afkast og den anslåede skat.

## Startup

Fanen **Startup** fører dig trin for trin fra idé til din første indtægt, og videre til 10.000 kr. om måneden ved siden af studiet.

- **Hjemmesidemaskinen**: appen laver en færdig hjemmeside for dig. Vælg branche (frisør, håndværker, café, klinik, butik eller din egen side) og farver. Ret navn, priser og åbningstider, så opdateres siden med det samme. Den virker på mobilen og har knap til at ringe, Google-kort, åbningstider og priser, og den er klar til Google. Tryk **Vis i fuld skærm** for at vise den til kunden, og **Gem fil** for at gemme den som index.html.
- **Sæt online med ét tryk**: forbind GitHub én gang under **Sæt online** (appen viser hvordan, ca. 3 minutter). Derefter opretter appen selv et repository, uploader siden, slår GitHub Pages til og gemmer adressen, så linket kommer med i dine beskeder. **Opdatér online** lægger ændringer ud på samme måde. Nøglen gemmes kun på telefonen. Vil du hellere gøre det selv, er der også en manuel vejledning.
- **Dine kunder i dag**: hver dag viser appen, hvem du skal kontakte (op til 4 nye plus dem, der skal følges op). Tryk **Åbn**. Appen tjekker selv i CVR, om firmaet er reklamebeskyttet, og giver dig, hvad du skal sige, når du går forbi eller ringer. Siger kunden ja til SMS eller mail, tryk **Kunden sagde ja**. Så er beskeden skrevet og kan sendes med ét tryk, og appen sætter selv næste opfølgning.
- **Regler for kontakt**: spamforbuddet gælder også over for firmaer, så første kontakt sker ved at gå forbi eller ringe. Reklamebeskyttede firmaer springer appen over. Ejes firmaet personligt (enkeltmandsvirksomhed), viser appen kun "Find vej", fordi du ikke må ringe til folk på Robinsonlisten. CVR-opslaget bruger cvrapi.dk og virker i appen på telefonen. På web kan du tjekke selv via virk.dk.
- **Guiden**: 20 trin i fire faser (Klar, Kunder, Første salg, Vækst). Kortet øverst viser dagens trin, hvorfor det er vigtigt, hvordan du gør, og en knap, der åbner det rigtige værktøj. Mange trin bliver klaret af sig selv, fx når du har 20 kunder på listen eller har sendt din første faktura. Første mål er en indtægt inden for 14 dage.
- **Find kunder**: skriv din by, så åbner appen færdige søgninger i Google Maps til din idé og fortæller, hvad du skal kigge efter. Du kan tilføje mange kunder på én gang med ét navn pr. linje, gerne med telefon eller mail efter et komma.
- **Kunder**: tryk på pilen ved en kunde for at flytte den videre fra *Ny* til *Vundet*. Appen sætter selv en opfølgningsdato og tæller, hvor mange du har kontaktet i ugen (mål: 20).
- **Mødeguide**: hvad du siger fra åbning til aftale, fem gode spørgsmål og svar til fx "Det er for dyrt" og "Vi skal lige tænke over det".
- **Prisberegner**: regner din pris ud fra den timeløn, du vil have, med intropris til de første 3 kunder og fast månedlig pris.
- **Fakturaer**: med fortløbende nummer, betalingsfrist og dine bankoplysninger. På telefonen trykker du **Gem som PDF** og vælger *Gem som PDF* som printer. Når kunden har betalt, kommer beløbet automatisk i regnskabet.
- **Profil**: navn, telefon, CVR og konto bliver sat ind i beskeder og fakturaer.
- **Påmindelser**: dagens startup-opgave kl. 19, indtil du har din første indtægt, opfølgning på kunder kl. 10 og besked, når en faktura er forfalden.
- **Beregner, regnskab, færdige beskeder og regler** om CVR, moms (50.000 kr. pr. kalenderår), skat og SU-fribeløbet.

Milepæle, tjekliste og indstillinger ligger nu under knappen med medaljen øverst på forsiden.

## Tjek appen

Under **Tjek → Tjek appen** tester appen sig selv: påmindelser, internet og CVR-opslag, GitHub, Samsung Health og fejllog. Med **Prøv** kan du teste Gem fil, Gem som PDF og SMS. Er noget rødt, så tag et skærmbillede og send det til Claude. Opstår der fejl i appen, gemmes de i fejlloggen, og du kan kopiere dem med ét tryk.

GitHub kører automatisk alle tests af appen, før den bygger en ny APK. Fejler en test, bliver der ikke lavet en ny version, så du aldrig får en ødelagt app.

## Dig

Fanen **Dig** har tre dele.

**Lær**: 50 korte lektioner på 1–3 minutter i 11 forløb:
- Etikette
- Overskud og humør
- Vaner og disciplin
- Samtaler og relationer
- Voksenliv og penge
- Studieteknik
- Stil og tøj
- Selvtillid
- Kærlighed og forhold
- Sundhed og pleje
- Arbejdsliv

Hver dag foreslår appen en lektion. Hver lektion har en lille opgave til samme dag og et quizspørgsmål, og du får XP og niveauer.

**Mig**:
- **Dagens tanke.**
- **Dagligt check-in** med humør, energi og tre gode ting. Du kan se humør og energi over 14 dage, og efter en uge viser appen, hvad der giver dig godt humør, fx træning eller mange skridt.
- **Ugens udfordring**, der giver +20 XP.
- **Min bedste version**: dine 3 værdier og hvem du vil være om et år.
- **Mine mål**, hvor du selv sætter, hvor langt du er.

**Outfits**: læg dit tøj ind, eller vælg fra startklædeskabet.
- **Tøj**: 41 typer, også rullekrave, cardigan, quarter-zip, hørskjorte, læder- og denimjakke, vest, trenchcoat, cargo- og hørbukser, Chelsea boots og sandaler.
- **Tilbehør**: ur, kæde, kasket, hue, halstørklæde, solbriller og rygsæk.
- **Farver og mønstre**: 25 farver og mønstre som striber, tern og print.
- **Valg**: 9 lejligheder (bl.a. byen, bryllup og sommer), 4 slags vejr og 6 stilarter (clean, old money, streetwear, skandinavisk og sporty).
- **Byt ud**: tryk på et stykke tøj i et outfit for at bytte det.
- **Byg outfit**: et klik ved et stykke tøj bygger outfits rundt om det.
- **Ugens outfits**: 7 dage uden at gentage den samme overdel to dage i træk.
- **Det giver flest outfits**: viser det bedste næste køb.
- **Tag et billede af dit tøj** (nyt i 8.2): tryk *Tag billede* eller *Vælg fra galleri* (op til 12 billeder ad gangen).
  - Appen finder selv tøjet på billedet, skærer det ud, måler farven og ser, om det er ensfarvet, stribet, ternet eller med print.
  - Typen gættes ud fra formen (overdel, bukser, shorts eller sko). Det er et gæt, så appen viser sine bedste bud som knapper øverst.
  - Tryk *Gem ›* for at gå videre til næste billede, eller *Spring over*.
  - Billederne vises i klædeskabet og i outfit-forslagene. De fylder ca. 5 KB hver og gemmes kun på telefonen (ikke i backup-teksten).
  - Når appen åbnes som artefakt på claude.ai, genkender Claude selv type, farve og mønster. Et spejlbillede af et helt outfit bliver til én ting pr. del.
  - I Android-appen åbner knappen telefonens kamera-app. Appen beder ikke selv om kameraadgang.
  - Under *Tjek appen* kan du teste kamera og billeder.
- **Tager den i dag**: appen husker, hvad du har haft på.

## Nye versioner

Hver gang der kommer ændringer i repository'et, bygger GitHub en ny APK under **Releases**. Installér den oven på den gamle. Dine data bliver liggende, fordi appen altid signeres med samme nøgle.

## Dine data

Alt gemmes på telefonen. Under **Tjek → Lav backup** kan du kopiere alle dine data som tekst, og under **Gendan fra backup** kan du sætte dem ind på en ny telefon.

## Mapper

- `web/index.html` – selve appen (samme fil som web-versionen på claude.ai)
- `android/` – Android-projektet: app, widgets, påmindelser, panel-felt og genveje
- `tests/` – automatiske tests, som GitHub kører før hver bygning
- `build-web.sh` – pakker `web/index.html` ind i Android-appen
- `.github/workflows/build-apk.yml` – bygger og udgiver APK'en på GitHub

Plan 2028 er et planlægningsværktøj og ikke finansiel rådgivning.
