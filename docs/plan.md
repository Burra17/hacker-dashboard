# Hacker Dashboard — Projektplan & GitHub Issues
 
En live-dashboard med Tiling Window Manager-känsla: .NET Web API (Clean Architecture + CQRS) som strömmar realtidsdata via SignalR till en Next.js/TypeScript-frontend med en interaktiv terminal som kommandocentral.
 
**Arkitekturbeslut (spikade):**
- Gemensamt `DashboardEvent<T>`-kuvert för all server→klient-data via SignalR.
- Kommandon går via HTTP (Axios) med request/response — **utom** strömmande AI-svar, som pushas token-för-token via dedikerad SignalR-kanal `terminal.response`.
- Statiska kanalprenumerationer i V1 (frontenden känner till panelerna vid start).
- Strikt state-gräns: **Zustand** = klient-state (UI, terminalhistorik, SignalR-strömmad data). **TanStack Query** = HTTP-hämtad serverdata (polling var 5:e min).
---
 
## Fas 0 — Repo & Fundament
 
Målet: ett körbart monorepo med tomma men startbara skal på båda sidor, så att allt efterföljande arbete har en plats att bo.
 
### Issue 0.1 — Initiera monorepo med `/frontend` och `/backend`
Skapa repo med två toppmappar. Lägg en root-`README.md` som beskriver projektet och hur man startar respektive sida. Lägg `.gitignore` för både .NET (`bin/`, `obj/`) och Node (`node_modules/`, `.next/`).
 
### Issue 0.2 — Sätt upp GitHub Project & issue-struktur
Skapa ett GitHub Project (board-vy). Lägg till kolumnerna *Backlog → Todo → In Progress → Done*. Skapa labels: `backend`, `frontend`, `infra`, `contracts`, `phase-1`…`phase-4`. Konvertera punkterna i detta dokument till issues.
 
### Issue 0.3 — Definiera delade datakontrakt (`contracts`)
Skapa en `/contracts`-mapp (eller `/shared`) som källa till sanning för envelope- och kommandoformaten. Skriv ner `DashboardEvent<T>`, `TerminalCommand`, `CommandResult` som TypeScript-interfaces **och** som C#-records, så att båda sidor refererar samma form. Detta är bryggan mellan Fas 1 och Fas 3.
 
---
 
## Fas 1 — Arkitektur & Backend-grund
 
Målet: en stabil .NET-motor som kan trycka ut data i realtid, verifierad end-to-end innan frontenden finns.
 
### Issue 1.1 — Sätt upp .NET Web API med Clean Architecture-lager
Skapa solution med projekten `Domain`, `Application`, `Infrastructure`, `Api`. Sätt upp projektreferenser enligt Clean Arch (beroenden pekar inåt). Verifiera att API:et startar och svarar på en `/health`-endpoint.
 
### Issue 1.2 — Konfigurera CQRS-grund (MediatR)
Lägg in MediatR i `Application`-lagret. Skapa bas-abstraktioner för `ICommand`/`IQuery` + handlers. Lägg en enkel `PingQuery` som rökprov på att pipelinen funkar.
 
### Issue 1.3 — Definiera `DashboardEvent`-kuvertet i C#
Implementera envelopen som en record i `Domain`/`Application` enligt kontraktet: `EventId`, `Channel`, `Type` (`snapshot`/`delta`/`heartbeat`/`error`), `Timestamp` (UTC ISO 8601), `Payload`. Detta är det format all strömmande data ska bära.
 
### Issue 1.4 — Sätt upp SignalR Hub
Skapa `DashboardHub`. Konfigurera SignalR i `Program.cs` (CORS för frontend-origin inkluderat). Exponera hubben på en känd route, t.ex. `/hubs/dashboard`. Inga metoder behövs ännu utöver default connect/disconnect.
 
### Issue 1.5 — Bygg en `BackgroundService` som simulerar rullande data
Skapa en `IHostedService`/`BackgroundService` som var ~1–2 sek pushar ett `DashboardEvent<SystemLogPayload>` (fejkade loggar/klocka) på kanalen `system.logs` via hubben. Detta verifierar hela strömnings-pipen utan extern data.
 
### Issue 1.6 — Definiera snapshot/delta/heartbeat-semantik i hubben
Implementera att en nyansluten klient först får en `snapshot` med nuvarande state, därefter `delta`-meddelanden. Lägg en `heartbeat` på timer så klienten kan visa live-status. Grundplåt för reconnect-hanteringen i Fas 3.
 
---
 
## Fas 2 — Frontend-skal & Grid Layout
 
Målet: den visuella grunden — det fasta rutnätet av terminalfönster där allt ska bo.
 
### Issue 2.1 — Initiera Next.js med TypeScript & Tailwind
Skapa Next.js-app i `/frontend` (App Router, TypeScript). Installera och konfigurera Tailwind CSS. Verifiera att dev-servern kör.
 
### Issue 2.2 — Konfigurera temat (mörk bakgrund + neon-accenter)
Definiera färgpaletten med mörka bakgrundstoner och lysande neon-accentfärger. Eftersom frontenden kör Tailwind v4 (CSS-first, ingen `tailwind.config.ts`) bor paletten i `@theme` i `globals.css`. Lägg in en monospace-font för terminalkänslan. Skapa CSS-variabler per `[data-theme]` så teman kan bytas i runtime (förberedelse för `theme`-kommandot).
 
### Issue 2.3 — Bygg dashboardens CSS Grid-layout
Bygg det fasta rutnätet av paneler ("terminalfönster") kloss-i-kloss för Tiling WM-känslan. Skapa en återanvändbar `<Panel>`-komponent (titelrad, ram, innehållsyta). Statisk layout, hårdkodad data räcker här.
 
### Issue 2.4 — Bygg panel-skal för V1-panelerna
Skapa tomma men placerade paneler: systemloggar, väder, sport, live-ticker (topp), terminal (botten/sida). Bara skal med platshållartext — datakoppling kommer i Fas 3.
 
---
 
## Fas 3 — State & Det Levande Gränssnittet
 
Målet: koppla ihop systemen så saker börjar röra på sig.
 
### Issue 3.1 — Sätt upp Zustand-store med tydliga slices
Skapa store med separata slices: `ui` (tema, panel-toggles), `terminal` (historik, input), `streams` (SignalR-data per kanal). Dokumentera gränsen mot TanStack Query i en kodkommentar/README så den inte suddas ut.
 
### Issue 3.2 — Anslut frontenden till SignalR-hubben
Installera `@microsoft/signalr`. Bygg en singleton-connection med **en** central `on`-handler som routar inkommande `DashboardEvent` till rätt Zustand-slice baserat på `channel`. Hantera connect vid app-start.
 
### Issue 3.3 — Implementera reconnect & graceful degradation
Konfigurera `withAutomaticReconnect`. Visa live/offline-status från `heartbeat`. Vid frånkoppling: behåll senast kända värden och dämpa paneler visuellt (`stale`-känsla) i stället för att tömma dem. Hantera snapshot-vid-återanslutning.
 
### Issue 3.4 — Koppla systemlogg-panelen till live-data
Rendera den strömmande `system.logs`-datan från Zustand i loggpanelen. Detta är första visuella beviset på att hela kedjan (BackgroundService → Hub → klient → store → UI) lever.
 
### Issue 3.5 — Bygg live-tickern med Framer Motion
Bygg den rullande tickern högst upp med mjuk, oändlig aktieticker-animation (Framer Motion), matad av livedatan i Zustand.
 
### Issue 3.6 — Bygg en minimal terminal-stub
Input-fält som tar emot text och echo:ar tillbaka den i en historik (lagrad i Zustand `terminal`-slice). **Ingen** kommandologik ännu — syftet är att tidigt känna på interaktionsmönstret innan den riktiga parsern byggs i Fas 4.
 
---
 
## Fas 4 — Interaktivitet & API-integrationer
 
Målet: fyll dashboarden med riktigt innehåll och gör terminalen smart.
 
### Issue 4.1 — Definiera kommando-kontrakten i backend
Implementera `TerminalCommand` och `CommandResult` (med `kind`: `ui`/`data`/`ai`/`system`, och `sideEffect`) som C#-records. Skapa en `POST /api/terminal/command`-endpoint som tar emot kuvertet och dispatchar via MediatR.
 
### Issue 4.2 — Bygg terminal-parsern på frontenden
Tolka råinput till `verb` + `args`. Skicka via Axios till command-endpointen. Rendera `output` i historiken. Applicera `sideEffect` på Zustand (utan att backend känner till UI-detaljer).
 
### Issue 4.3 — Implementera `ui`-kommandon (theme, toggle)
Mappa verb som `theme <namn>` och `toggle <panel>` till `sideEffect`-svar som ändrar `ui`-slicen direkt. Återanvänder CSS-variabel-temat från Issue 2.2.
 
### Issue 4.4 — Implementera `data`-kommandon (fetch på begäran)
Verb som hämtar/filtrerar specifik data på kommando via query-handlers i backend.
 
### Issue 4.5 — Strömmande AI-prompt-kommandon via `terminal.response`
Bygg en dedikerad SignalR-kanal `terminal.response` som strömmar LLM-output token-för-token. Terminalen visar tokens allt eftersom de anländer. Koppla mot din befintliga PromptVault-struktur i backend. Detta är det enda kommandot som bryter request/response-modellen — medvetet, för hacker-viben.
 
### Issue 4.6 — Integrera externt väder-API (backend)
Hämta lokalt väder i `Infrastructure`. Exponera via query. Sätt `stale`-flaggan när källan är otillgänglig och returnera senast kända värde.
 
### Issue 4.7 — Integrera sportdata för dina lag (backend)
Dra in sportdata via query-handler i backend, exponerad för frontend-polling.
 
### Issue 4.8 — Koppla väder/sport-paneler via TanStack Query
Installera TanStack Query. Hämta väder/sport med polling var 5:e minut (bakgrundsuppdatering), **inte** via SignalR. Respektera state-gränsen mot Zustand.
 
### Issue 4.9 (valbar) — Utvecklings-loggar / commits-panel
Dra in commits/dev-loggar (t.ex. GitHub API) som en extra panel via TanStack Query. *(Byggd som en `GITHUB ACTIVITY`-panel matad av GitHubs publika events-API, som ersätter den gamla mock-loggpanelen i vänsterkolumnen.)*
 
### Issue 4.10 — Koppla live-sport till tickern
Bygg om TICKER-komponenten så att den konsumerar `latestResult` från den befintliga `useSportsQuery`, så att Hammarbys och Chelseas resultat rullar i toppen i stället för den gamla mock-strömmen. Respektera state-gränsen: sportdatan ligger kvar i TanStack Query, kopieras inte in i Zustand.
 
### Issue 4.11 — Integrera skarpt sport-API (backend)
Ersätt den hårdkodade mock-datan i `ApiFootballSportsClient` med riktiga anrop mot ett skarpt sport-API (t.ex. API-Football via RapidAPI), mappat till `SportsDto`. Behåll cache- och stale-logiken. **API-nyckeln hanteras lokalt via .NET user-secrets — får aldrig hårdkodas eller committas/pushas.**
 
### Issue 4.12 — Rullande resultat-ticker (senaste 5 matcherna per lag)
Gör sport-tickern mer dynamisk: i stället för ett enda `latestResult` per lag ska den loopa kontinuerligt genom de fem senaste matcherna för Hammarby och Chelsea, så det känns som en riktig nyhetsticker. Byt `latestResult: string` mot `recentResults: string[]` i kontraktet (TS + C#), låt `RapidApiSportsClient` ta `.Take(5)` av de senaste spelade matcherna (nyast först) och mappa dem till arrayen, och uppdatera TICKER-komponenten att platta ut bägge lagens arrayer till en sömlös, oändlig loop utan tomma luckor. Behåll graceful degradation (platshållare + `stale`) och uppdatera sport-panelen att visa senaste resultatet (`recentResults[0]`).
 
---
 
## Fas 5 — Layout-omorganisation & återupplivad logg-pipeline

Målet: ge dashboarden sin slutliga layout — minimalt väder i headern, GitHub-aktivitet till höger, och en rullande systemloggpanel i den stora vänsterkolumnen som återanvänder den befintliga `system.logs`-pipelinen från Fas 1/3.

### Issue 5.1 — Minimal väderstatus i headern
Ta bort den stora väderpanelen och rendera vädret som en kompakt status-sträng (`[ Hudiksvall: 20.7°C | Overcast ]`) högerställd i headern, bredvid tickern. Behåll TanStack Query-pollingen och stale-degraderingen (dämpas vid stale/offline).

### Issue 5.2 — Rullande systemloggpanel (återuppliva `system.logs`)
Skapa en `SystemLogsPanel` som konsumerar den befintliga `system.logs`-SignalR-pipelinen (snapshot/delta via `streams`-slicen) och rullar loggar kontinuerligt med nivåfärgad text. Kapa ström-bufferten så den inte växer obegränsat över tid.

### Issue 5.3 — Omorganisera griden
Flytta GitHub-aktivitetspanelen till höger kolumn (där vädret låg) och placera `SystemLogsPanel` i den stora vänsterkolumnen (där GitHub låg). Lägg till `logs` som panel-id så `toggle`-kommandot fungerar för den nya panelen.

---

## Fas 6 — Interaktiv Terminal

Målet: gör terminalen till en riktig kommandocentral som hanterar tangentbordsinput, redigering och ett växande kommando-API — bortom dagens parse-/echo-stub.

### Issue 6.1 — Hantera riktig terminal-input
Robust input-hantering: radredigering, Enter för att köra, och kommandohistorik (upp-/ned-pil) från `terminal`-slicen. Fokus- och scroll-beteende som känns som en riktig terminal.

### Issue 6.2 — Inbyggda terminal-kommandon (`help`, `clear`)
Lägg till lokala meta-kommandon som resolveras klient-sidan (likt `theme`/`toggle`, utan backend-anrop): `help` listar tillgängliga verb med kort hjälptext, `clear` tömmer terminalhistoriken i `terminal`-slicen.

### Issue 6.3 — Actions & enhetlig kommando-feedback
Enhetlig återkoppling för kommandon (lyckat/fel, färg per `CommandResult.kind`) och en tydlig struktur för att lägga till fler actions/verb allt eftersom de behövs.
 
---
 
## Var du börjar idag
 
1. **Issue 0.1** — initiera monorepot. I terminalen:
   ```bash
   mkdir hacker-dashboard && cd hacker-dashboard
   git init
   mkdir frontend backend contracts
   # lägg root-README.md + .gitignore (Node + .NET)
   git add . && git commit -m "chore: init monorepo structure"
   # skapa repo på GitHub och koppla origin
   ```
2. **Issue 0.2** — sätt upp GitHub Project och klistra in issues från detta dokument.
3. **Issue 0.3** — spika kontrakten i `/contracts` (du har dem redan från vår diskussion — bara att gjuta i filer).
Sedan är **Issue 1.1** din första riktiga kod-issue: res Clean Architecture-solutionen.
 
**Den röda tråden genom planen:** den första kompletta vertikala skivan är BackgroundService (1.5) → Hub (1.4) → SignalR-klient (3.2) → Zustand (3.1) → loggpanel (3.4). När den lever har du bevisat hela arkitekturen end-to-end, och resten är att hänga på fler paneler och kommandon.