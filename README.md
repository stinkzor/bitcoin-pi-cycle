# Bitcoin Pi Cycle Top Indicator App

Eine professionelle Web-Anwendung zur Darstellung des Bitcoin Pi Cycle Top Indicators mit tagesaktuellen Daten.

## Features

- **Echtzeit Bitcoin-Daten**: Aktuelle Preise und 24h-Veränderungen von der CoinGecko API
- **Pi Cycle Top Indicator**: 
  - 111-Tage gleitender Durchschnitt
  - 350-Tage gleitender Durchschnitt × 2
  - Visuelles Signal-System (Grün/Gelb/Rot)
- **Interaktive Charts**: 
  - Verschiedene Zeiträume (6M, 1Y, 2Y, 3Y)
  - Umschaltbare Anzeigen für Moving Averages
  - Logarithmische Skalierung optional
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Auto-Update**: Automatische Aktualisierung alle 5 Minuten

## Wie funktioniert der Pi Cycle Top Indicator?

Der Pi Cycle Top Indicator verwendet zwei gleitende Durchschnitte:

1. **111-Tage Moving Average (MA111)**: Schnellerer Indikator
2. **350-Tage Moving Average × 2 (MA350×2)**: Langsamerer Indikator

### Signal-Interpretation:

- 🟢 **Grün (Normal)**: MA111 liegt unter MA350×2 - Normaler Markt
- 🟡 **Gelb (Vorsicht)**: MA111 nähert sich MA350×2 (< 5% Abstand) - Aufmerksamkeit
- 🔴 **Rot (Top Signal)**: MA111 kreuzt über MA350×2 - Historisches Top-Signal

### Historische Genauigkeit:
Dieser Indikator hat historisch Bitcoin-Marktspitzen mit bemerkenswerter Genauigkeit identifiziert.

## Installation & Verwendung

1. **Dateien herunterladen**: Alle Dateien in einen Ordner kopieren
2. **Browser öffnen**: `index.html` in einem modernen Webbrowser öffnen
3. **Internetverbindung**: Für Live-Daten erforderlich

### Lokaler Server (empfohlen)
Für beste Performance einen lokalen Server verwenden:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (mit npx)
npx serve .
```

Dann `http://localhost:8000` im Browser öffnen.

## Technische Details

### APIs
- **CoinGecko API**: Kostenlose Bitcoin-Marktdaten
- **Keine API-Schlüssel erforderlich**: Funktioniert sofort

### Technologien
- **HTML5**: Moderne Web-Standards
- **CSS3**: Responsive Design mit Dark Theme
- **JavaScript ES6+**: Moderne JavaScript-Features
- **Chart.js**: Professionelle Chart-Bibliothek
- **Date-fns**: Datums-/Zeitmanipulation

### Browser-Kompatibilität
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Anpassungen

### Zeiträume ändern
In `script.js` die `currentPeriod` Werte anpassen:

```javascript
// Beispiel: 1 Jahr = 365 Tage
<button class="timeframe-btn" data-period="365">1Y</button>
```

### Moving Average Perioden
In `script.js` die MA-Berechnungen anpassen:

```javascript
const ma111 = this.calculateMovingAverage(prices, index, 111);
const ma350 = this.calculateMovingAverage(prices, index, 350);
```

### Farben & Styling
In `styles.css` das Design anpassen:

```css
:root {
    --bitcoin-orange: #f7931a;
    --bg-dark: #0c0c0c;
    --card-bg: #1e1e1e;
}
```

## Haftungsausschluss

**⚠️ Wichtiger Hinweis**: Diese Anwendung dient nur zu Informationszwecken und stellt keine Finanzberatung dar. Investitionsentscheidungen sollten niemals allein auf technischen Indikatoren basieren.

- Kryptowährungen sind hochvolatil und riskant
- Vergangene Performance ist kein Indikator für zukünftige Ergebnisse
- Investieren Sie nur, was Sie sich leisten können zu verlieren
- Konsultieren Sie einen Finanzberater vor Investitionsentscheidungen

## Support & Entwicklung

### Problembehebung
1. **Keine Daten**: Internetverbindung und CoinGecko API-Status prüfen
2. **Chart lädt nicht**: Browser-Cache leeren und Seite neu laden
3. **Mobile Ansicht**: Bildschirm drehen oder Zoom anpassen

### Updates
- Die App aktualisiert sich automatisch alle 5 Minuten
- Für sofortige Updates die Seite neu laden (F5)

## Lizenz

MIT License - Freie Nutzung und Modifikation erlaubt.

---

**Erstellt mit ❤️ für die Bitcoin-Community**