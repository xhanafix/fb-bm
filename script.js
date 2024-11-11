function shareOnTwitter() {
    const text = encodeURIComponent("Cuba alat Penjana Salinan Iklan Facebook yang hebat ini! Ia membantu mencipta salinan iklan yang menarik menggunakan AI dan formula penulisan yang terbukti. 🚀");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent("Penjana Salinan Iklan Facebook");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareOnWhatsApp() {
    const text = encodeURIComponent("Cuba alat Penjana Salinan Iklan Facebook yang hebat ini! 🚀\n\n");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://wa.me/?text=${text}${url}`, '_blank');
}

function shareOnTelegram() {
    const text = encodeURIComponent("Cuba alat Penjana Salinan Iklan Facebook yang hebat ini! 🚀");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
}

// Main application code
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const elements = {
        generateBtn: document.getElementById('generate'),
        copyBtn: document.getElementById('copy'),
        resultDiv: document.getElementById('result'),
        loadingDiv: document.getElementById('loading'),
        productInput: document.getElementById('product'),
        painPointInput: document.getElementById('painPoint'),
        apiProvider: document.getElementById('apiProvider'),
        apiKey: document.getElementById('apiKey'),
        formula: document.getElementById('formula'),
        tone: document.getElementById('tone')
    };

    // Create pain point suggestions container
    const painPointSuggestions = document.createElement('div');
    painPointSuggestions.className = 'pain-point-suggestions';
    elements.painPointInput.parentNode.appendChild(painPointSuggestions);

    // API Configuration
    const apiConfig = {
        openai: {
            url: 'https://api.openai.com/v1/chat/completions',
            headers: apiKey => ({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }),
            model: 'gpt-3.5-turbo'
        },
        groq: {
            url: 'https://api.groq.com/openai/v1/chat/completions',
            headers: apiKey => ({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }),
            model: 'mixtral-8x7b-32768'
        },
        openrouter: {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            headers: apiKey => ({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'FB Ads Copy Generator'
            }),
            model: 'mistralai/mixtral-8x7b-instruct'
        }
    };

    // Copywriting formulas in Malay
    const formulaContexts = {
        'AIDA': 'Gunakan formula AIDA: Mula dengan menarik Perhatian, bangkitkan Minat, timbulkan Keinginan, dan akhiri dengan Tindakan',
        'PAS': 'Gunakan formula PAS: Kenalpasti Masalah, timbulkan Kesusahan, dan tawarkan Penyelesaian',
        'BAB': 'Gunakan formula BAB: Tunjukkan keadaan Sebelum, gambarkan keadaan Selepas, dan sediakan Jambatan untuk sampai ke sana',
        'FAB': 'Gunakan formula FAB: Senaraikan Ciri-ciri, terangkan Kelebihan, dan tekankan Faedah',
        '4Ps': 'Gunakan formula 4P: Buat Janji, Gambarkan situasi, Berikan Bukti, dan buat Desakan',
        'PASTOR': 'Gunakan formula PASTOR: Tunjukkan Masalah, Amplifikasi kesan, Kongsi Cerita, Tunjuk Transformasi, Buat Tawaran, minta Tindak Balas',
        'QUEST': 'Gunakan formula QUEST: Kelayakan audiens, bantu Pemahaman masalah, beri Pendidikan tentang penyelesaian, Rangsang minat, buat Peralihan ke tindakan',
        '4Cs': 'Gunakan formula 4C: Pastikan mesej Jelas, Ringkas, Menarik, dan Dipercayai',
        'PPPP': 'Gunakan formula PPPP: Gambarkan masalah, buat Janji, berikan Bukti, dan buat Desakan',
        'SSS': 'Gunakan formula SSS: Mula dengan Bintang (penarik perhatian), Ceritakan kisah, Tunjukkan Penyelesaian'
    };

    // Event Listeners
    elements.apiProvider.addEventListener('change', updateApiHints);
    elements.generateBtn.addEventListener('click', generateCopy);
    elements.copyBtn.addEventListener('click', copyToClipboard);
    elements.productInput.addEventListener('input', debounce(handleProductInput, 1000));
    painPointSuggestions.addEventListener('click', handleSuggestionClick);
    document.addEventListener('click', handleClickOutside);

    // Functions
    function updateApiHints() {
        // Hide all hints
        Object.values(elements.hints).forEach(hint => hint.style.display = 'none');
        // Show selected provider hint
        const selectedProvider = elements.apiProvider.value;
        elements.hints[selectedProvider].style.display = 'block';
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async function handleProductInput() {
        if (!elements.productInput.value) {
            painPointSuggestions.style.display = 'none';
            return;
        }

        if (!elements.apiKey.value) {
            painPointSuggestions.innerHTML = '<div class="suggestion error">Please enter an API key first</div>';
            painPointSuggestions.style.display = 'block';
            return;
        }

        painPointSuggestions.innerHTML = '<div class="suggestion loading">Generating pain points...</div>';
        painPointSuggestions.style.display = 'block';

        const painPoints = await generatePainPoints();
        
        if (painPoints && painPoints.length > 0) {
            painPointSuggestions.innerHTML = painPoints
                .map(point => `<div class="suggestion">${point}</div>`)
                .join('');
        } else {
            painPointSuggestions.innerHTML = '<div class="suggestion error">Failed to generate pain points. Please try again.</div>';
        }
    }

    function handleSuggestionClick(e) {
        if (e.target.classList.contains('suggestion') && 
            !e.target.classList.contains('loading') && 
            !e.target.classList.contains('error')) {
            elements.painPointInput.value = e.target.textContent;
            painPointSuggestions.style.display = 'none';
        }
    }

    function handleClickOutside(e) {
        if (!painPointSuggestions.contains(e.target) && e.target !== elements.painPointInput) {
            painPointSuggestions.style.display = 'none';
        }
    }

    async function generatePainPoints() {
        const provider = elements.apiProvider.value;
        const config = apiConfig[provider];
        
        try {
            const response = await fetch(config.url, {
                method: 'POST',
                headers: config.headers(elements.apiKey.value),
                body: JSON.stringify({
                    model: config.model,
                    messages: [{
                        role: "system",
                        content: "Anda adalah pakar pemasaran yang membantu mengenal pasti masalah kritikal pelanggan dalam konteks Malaysia."
                    }, {
                        role: "user",
                        content: `Senaraikan 5 masalah kritikal yang mungkin dihadapi pelanggan apabila mempertimbangkan produk/perkhidmatan ini: ${elements.productInput.value}. 
                                 Format jawapan sebagai tatasusunan JSON, dengan setiap masalah yang spesifik, emosi, dan menarik.
                                 Contoh format: ["masalah 1", "masalah 2", "masalah 3", "masalah 4", "masalah 5"]`
                    }],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return JSON.parse(data.choices[0].message.content);
        } catch (error) {
            console.error('Ralat menjana masalah:', error);
            return null;
        }
    }

    async function generateCopy() {
        if (!validateInputs()) return;

        elements.loadingDiv.classList.remove('hidden');
        elements.resultDiv.innerHTML = '';
        elements.copyBtn.classList.add('hidden');

        const provider = elements.apiProvider.value;
        const config = apiConfig[provider];

        try {
            const response = await fetch(config.url, {
                method: 'POST',
                headers: config.headers(elements.apiKey.value),
                body: JSON.stringify({
                    model: config.model,
                    messages: [
                        {
                            role: "system",
                            content: getSystemPrompt()
                        },
                        {
                            role: "user",
                            content: getUserPrompt()
                        }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            elements.resultDiv.innerText = data.choices[0].message.content;
            elements.copyBtn.classList.remove('hidden');
        } catch (error) {
            elements.resultDiv.innerHTML = `<span style="color: red;">Error: ${error.message}</span>`;
        } finally {
            elements.loadingDiv.classList.add('hidden');
        }
    }

    function validateInputs() {
        if (!elements.apiKey.value || !elements.productInput.value || !elements.painPointInput.value) {
            alert('Please fill in all required fields');
            return false;
        }
        return true;
    }

    function getSystemPrompt() {
        return `Anda adalah pakar pengiklanan dari Malaysia yang mahir dalam penulisan iklan Facebook dalam Bahasa Malaysia. 
                Anda perlu menulis iklan yang menarik, meyakinkan dan sesuai dengan konteks tempatan.`;
    }

    function getUserPrompt() {
        return `Tuliskan iklan Facebook untuk produk/perkhidmatan ini: ${elements.productInput.value}. 
                Masalah pelanggan sasaran: ${elements.painPointInput.value}
                ${formulaContexts[elements.formula.value]}
                Nada suara: ${elements.tone.value}
                
                Pastikan iklan:
                1. Menggunakan Bahasa Malaysia yang standard dan sesuai
                2. Sesuai dengan konteks tempatan Malaysia
                3. Mengikut formula yang dipilih dengan tepat
                4. Menggunakan nada suara yang sesuai
                5. Mempunyai seruan untuk bertindak (call-to-action) yang jelas`;
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(elements.resultDiv.innerText).then(() => {
            const originalText = elements.copyBtn.innerText;
            elements.copyBtn.innerText = 'Copied!';
            elements.copyBtn.classList.add('success');
            setTimeout(() => {
                elements.copyBtn.innerText = originalText;
                elements.copyBtn.classList.remove('success');
            }, 2000);
        });
    }
}); 