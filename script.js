class BitcoinPiCycleApp {
    constructor() {
        this.chart = null;
        this.priceData = [];
        this.currentPeriod = 180; // Default 6 months
        this.apiUrl = 'https://api.coingecko.com/api/v3';
        this.proxyUrl = 'https://api.allorigins.win/raw?url=';
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.isUsingFallbackData = false;
        
        this.initializeApp();
    }

    async initializeApp() {
        this.showLoading();
        this.setupEventListeners();
        
        // Lade sofort Demo-Daten, damit die App schnell startet
        console.log('Lade Demo-Daten für sofortige Anzeige...');
        this.loadFallbackData();
        this.hideLoading();
        
        // Versuche dann im Hintergrund echte Daten zu laden
        setTimeout(async () => {
            try {
                console.log('Versuche Live-Daten im Hintergrund zu laden...');
                await this.loadBitcoinData();
                console.log('Live-Daten erfolgreich geladen!');
            } catch (error) {
                console.warn('Live-Daten nicht verfügbar, bleibe bei Demo-Daten:', error);
            }
        }, 1000);
    }

    setupEventListeners() {
        // Timeframe buttons
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPeriod = parseInt(e.target.dataset.period);
                this.updateChart();
            });
        });

        // Chart option checkboxes
        document.getElementById('showMA111').addEventListener('change', () => this.updateChart());
        document.getElementById('showMA350x2').addEventListener('change', () => this.updateChart());
        document.getElementById('logScale').addEventListener('change', () => this.updateChart());

        // Auto-refresh every 5 minutes
        setInterval(() => {
            this.loadBitcoinData();
        }, 5 * 60 * 1000);
    }

    showLoading() {
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    async loadBitcoinData() {
        // Vereinfachte, schnelle API-Abfrage mit kurzen Timeouts
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 Sekunden Timeout
        
        try {
            const days = Math.max(this.currentPeriod + 350, 1095);
            
            // Versuche nur eine direkte API-Anfrage mit Timeout
            const [dataResponse, priceResponse] = await Promise.all([
                fetch(`${this.apiUrl}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`, {
                    signal: controller.signal,
                    mode: 'cors'
                }),
                fetch(`${this.apiUrl}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`, {
                    signal: controller.signal,
                    mode: 'cors'
                })
            ]);
            
            clearTimeout(timeoutId);
            
            if (!dataResponse.ok || !priceResponse.ok) {
                throw new Error('API Response not OK');
            }
            
            const data = await dataResponse.json();
            const currentPriceData = await priceResponse.json();
            
            this.isUsingFallbackData = false;
            this.processBitcoinData(data, currentPriceData);
            this.updateIndicatorValues();
            this.updateChart();
            this.updateLastUpdateTime();
            
        } catch (error) {
            clearTimeout(timeoutId);
            console.warn('API nicht verfügbar, verwende Demo-Daten:', error.message);
            throw error; // Weiterleiten an initializeApp für Fallback
        }
    }

    loadFallbackData() {
        console.log('Lade Fallback-Daten...');
        this.isUsingFallbackData = true;
        
        // Generiere realistische Beispieldaten für die letzten 1095 Tage
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1095);
        
        const mockData = this.generateMockBitcoinData(startDate, endDate);
        const mockCurrentPrice = {
            bitcoin: {
                usd: mockData.prices[mockData.prices.length - 1][1],
                usd_24h_change: (Math.random() - 0.5) * 10 // Random change between -5% and +5%
            }
        };
        
        this.processBitcoinData(mockData, mockCurrentPrice);
        this.updateIndicatorValues();
        this.updateChart();
        this.updateLastUpdateTime();
        
        // Zeige Hinweis auf Demo-Daten
        this.showDemoDataNotice();
    }

    generateMockBitcoinData(startDate, endDate) {
        const prices = [];
        const currentDate = new Date(startDate);
        let basePrice = 20000; // Startpreis
        
        while (currentDate <= endDate) {
            // Simuliere realistische Bitcoin-Preisbewegungen
            const randomChange = (Math.random() - 0.5) * 0.1; // ±5% täglich
            const trend = Math.sin((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365) * Math.PI * 2) * 0.02; // Jahrestrend
            const volatility = 0.05 + Math.random() * 0.05; // 5-10% Volatilität
            
            basePrice = basePrice * (1 + randomChange * volatility + trend);
            basePrice = Math.max(15000, Math.min(100000, basePrice)); // Begrenzt zwischen $15k und $100k
            
            prices.push([currentDate.getTime(), Math.round(basePrice)]);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return { prices };
    }

    showDemoDataNotice() {
        const notice = document.createElement('div');
        notice.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff9800;
            color: #000;
            padding: 15px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notice.innerHTML = '⚠️ Demo-Modus<br><small>Live-Daten nicht verfügbar. Beispieldaten werden angezeigt.</small>';
        
        document.body.appendChild(notice);
        
        // Entferne Hinweis nach 5 Sekunden
        setTimeout(() => {
            if (notice.parentNode) {
                notice.parentNode.removeChild(notice);
            }
        }, 5000);
    }

    processBitcoinData(data, currentPriceData) {
        const prices = data.prices.map(([timestamp, price]) => ({
            date: new Date(timestamp),
            price: price,
            timestamp: timestamp
        }));

        // Calculate moving averages
        const processedData = prices.map((item, index) => {
            const ma111 = this.calculateMovingAverage(prices, index, 111);
            const ma350 = this.calculateMovingAverage(prices, index, 350);
            const ma350x2 = ma350 ? ma350 * 2 : null;

            return {
                ...item,
                ma111,
                ma350x2
            };
        });

        this.priceData = processedData;
        this.currentPrice = currentPriceData.bitcoin.usd;
        this.priceChange24h = currentPriceData.bitcoin.usd_24h_change;
    }

    calculateMovingAverage(prices, currentIndex, period) {
        if (currentIndex < period - 1) return null;
        
        let sum = 0;
        for (let i = currentIndex - period + 1; i <= currentIndex; i++) {
            sum += prices[i].price;
        }
        return sum / period;
    }

    updateIndicatorValues() {
        const latestData = this.priceData[this.priceData.length - 1];
        
        // Update Bitcoin price
        document.getElementById('bitcoinPrice').textContent = this.formatCurrency(this.currentPrice);
        
        const changeElement = document.getElementById('priceChange');
        const changeText = `${this.priceChange24h >= 0 ? '+' : ''}${this.priceChange24h.toFixed(2)}% (24h)`;
        changeElement.textContent = changeText;
        changeElement.className = `change ${this.priceChange24h >= 0 ? 'positive' : 'negative'}`;
        
        // Update moving averages
        document.getElementById('ma111').textContent = latestData.ma111 ? 
            this.formatCurrency(latestData.ma111) : '--';
        document.getElementById('ma350x2').textContent = latestData.ma350x2 ? 
            this.formatCurrency(latestData.ma350x2) : '--';
        
        // Update Pi Cycle signal
        this.updatePiCycleSignal(latestData);
    }

    updatePiCycleSignal(latestData) {
        const signalIndicator = document.getElementById('signalIndicator');
        const signalText = document.getElementById('signalText');
        const signalDistance = document.getElementById('signalDistance');
        
        if (!latestData.ma111 || !latestData.ma350x2) {
            signalText.textContent = 'Unzureichende Daten';
            signalIndicator.className = 'signal-indicator';
            signalDistance.textContent = '--';
            return;
        }
        
        const ratio = latestData.ma111 / latestData.ma350x2;
        const distance = ((ratio - 1) * 100).toFixed(2);
        
        signalDistance.textContent = `${distance}%`;
        
        if (ratio >= 1.0) {
            // Pi Cycle Top signal triggered
            signalIndicator.className = 'signal-indicator bearish';
            signalText.textContent = 'Pi Cycle Top erreicht!';
        } else if (ratio >= 0.95) {
            // Warning zone
            signalIndicator.className = 'signal-indicator warning';
            signalText.textContent = 'Vorsicht - Annäherung';
        } else {
            // Normal/bullish
            signalIndicator.className = 'signal-indicator bullish';
            signalText.textContent = 'Normal';
        }
    }

    updateChart() {
        const ctx = document.getElementById('priceChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        const chartData = this.getChartData();
        const isLogScale = document.getElementById('logScale').checked;
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#ccc',
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#333',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${label}: ${value ? '$' + value.toLocaleString() : '--'}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            displayFormats: {
                                day: 'MMM dd',
                                week: 'MMM dd',
                                month: 'MMM yyyy'
                            }
                        },
                        grid: {
                            color: '#333',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#ccc'
                        }
                    },
                    y: {
                        type: isLogScale ? 'logarithmic' : 'linear',
                        grid: {
                            color: '#333',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#ccc',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0,
                        hoverRadius: 4
                    },
                    line: {
                        tension: 0.1
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    }

    getChartData() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.currentPeriod);
        
        const filteredData = this.priceData.filter(item => item.date >= cutoffDate);
        
        const datasets = [
            {
                label: 'Bitcoin Preis',
                data: filteredData.map(item => ({
                    x: item.date,
                    y: item.price
                })),
                borderColor: '#f7931a',
                backgroundColor: 'rgba(247, 147, 26, 0.1)',
                borderWidth: 2,
                fill: false
            }
        ];
        
        if (document.getElementById('showMA111').checked) {
            datasets.push({
                label: '111-Tage MA',
                data: filteredData.map(item => ({
                    x: item.date,
                    y: item.ma111
                })),
                borderColor: '#4caf50',
                backgroundColor: 'transparent',
                borderWidth: 2,
                fill: false
            });
        }
        
        if (document.getElementById('showMA350x2').checked) {
            datasets.push({
                label: '350-Tage MA × 2',
                data: filteredData.map(item => ({
                    x: item.date,
                    y: item.ma350x2
                })),
                borderColor: '#f44336',
                backgroundColor: 'transparent',
                borderWidth: 2,
                fill: false
            });
        }
        
        return { datasets };
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const prefix = this.isUsingFallbackData ? 'Demo-Daten generiert: ' : 'Letzte Aktualisierung: ';
        document.getElementById('lastUpdate').textContent = prefix + timeString;
    }

    formatCurrency(value) {
        if (!value) return '--';
        return '$' + value.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    showError(message) {
        console.error(message);
        // You could implement a toast notification here
        alert(message);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BitcoinPiCycleApp();
});

// Simplified Chart.js initialization - using built-in time handling
Chart.defaults.plugins.legend.display = true;