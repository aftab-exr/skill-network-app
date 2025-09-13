document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('roadmapToggle');
    const aiRoadmap = document.getElementById('aiRoadmap');
    const simpleRoadmap = document.getElementById('simpleRoadmap');
    const simpleLabel = document.getElementById('simpleLabel');
    const aiLabel = document.getElementById('aiLabel');

    // --- Backend API Call Function ---
    // This function now calls our own server, not Google's directly.
    async function callBackend(prompt, elementToUpdate) {
        elementToUpdate.innerHTML = '<div class="flex justify-center items-center p-4"><div class="loader"></div></div>';

        try {
            const backendUrl = 'https://skill-network-backend.onrender.com/api/gemini'; // <-- YOUR RENDER URL

            const response = await fetch(backendUrl, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const result = await response.json();
            const text = result.text; // The backend will return the text in this format

            if (text) {
                elementToUpdate.innerHTML = marked.parse(text);
            } else {
                elementToUpdate.innerHTML = '<p class="text-red-400">Sorry, something went wrong while generating the response.</p>';
            }

        } catch (error) {
            console.error("Backend API call failed:", error);
            elementToUpdate.innerHTML = `<p class="text-red-400">Failed to get a response. Please check the server logs and console for details.</p>`;
        }
    }


    // --- Accordion Logic ---
    function setupAccordions(container) {
        const accordions = container.querySelectorAll('.accordion-toggle');
        accordions.forEach(button => {
            button.addEventListener('click', (e) => {
                if (e.target.closest('.explain-btn')) return; // Don't toggle accordion if explain btn is clicked
                const content = button.nextElementSibling;
                const icon = button.querySelector('svg');
                content.classList.toggle('open');
                icon.classList.toggle('rotate-180');
            });
        });
    }

    // --- Toggle Logic ---
    function updateToggleLabels(isAiChecked) {
        if (isAiChecked) {
            aiLabel.classList.add('text-teal-400');
            aiLabel.classList.remove('text-gray-400');
            simpleLabel.classList.add('text-gray-400');
            simpleLabel.classList.remove('text-teal-400');
        } else {
            simpleLabel.classList.add('text-teal-400');
            simpleLabel.classList.remove('text-gray-400');
            aiLabel.classList.add('text-gray-400');
            aiLabel.classList.remove('text-teal-400');
        }
    }

    toggle.addEventListener('change', () => {
        const isAiChecked = toggle.checked;
        aiRoadmap.classList.toggle('hidden', !isAiChecked);
        simpleRoadmap.classList.toggle('hidden', isAiChecked);
        updateToggleLabels(isAiChecked);
        observeElements(); // Re-run observer in case layout changes
    });

    // --- Scroll Animation Logic ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    function observeElements() {
        document.querySelectorAll('.reveal').forEach(el => {
            // Only observe visible elements
            if (el.offsetParent !== null) {
                observer.observe(el);
            }
        });
    }

    // --- Modal Logic ---
    const modal = document.getElementById('explanationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');

    function showModal() {
        modal.classList.remove('pointer-events-none', 'opacity-0');
        modal.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
    }
    function hideModal() {
        modal.classList.add('pointer-events-none', 'opacity-0');
        modal.querySelector('.modal-content').classList.add('scale-95', 'opacity-0');
    }
    closeModalBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

    // --- Gemini Feature Event Listeners ---
    document.body.addEventListener('click', (e) => {
        const explainBtn = e.target.closest('.explain-btn');
        if (explainBtn) {
            const topic = explainBtn.dataset.topic;
            modalTitle.innerText = topic;
            showModal();
            const prompt = `Explain "${topic}" to me like I'm a beginner in data analysis. Use a simple analogy and keep it concise (under 200 words). Format using markdown.`;
            callBackend(prompt, modalBody); // Use callBackend
        }
    });

    document.getElementById('generateProjectBtn').addEventListener('click', () => {
        const interest = document.getElementById('projectInterest').value;
        if (!interest) {
            document.getElementById('projectResult').innerHTML = '<p class="text-yellow-400">Please enter a topic of interest.</p>';
            return;
        }
        const prompt = `I am an aspiring data analyst. My interest is in "${interest}". Generate 3 distinct and actionable project ideas. For each, provide a title, a one-sentence summary, and suggest a dataset source. Use markdown for formatting.`;
        callBackend(prompt, document.getElementById('projectResult')); // Use callBackend
    });

    document.getElementById('askCoachBtn').addEventListener('click', () => {
        const question = document.getElementById('careerQuestion').value;
        if (!question) {
            document.getElementById('coachResult').innerHTML = '<p class="text-yellow-400">Please enter a question.</p>';
            return;
        }
        const prompt = `You are an encouraging career coach for data analysts. Answer this question concisely and helpfully. Use markdown. Question: "${question}"`;
        callBackend(prompt, document.getElementById('coachResult')); // Use callBackend
    });


    // --- Initial Setup ---
    setupAccordions(aiRoadmap);
    setupAccordions(simpleRoadmap);
    updateToggleLabels(toggle.checked);
    observeElements();
});

