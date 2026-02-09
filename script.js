import confetti from "https://cdn.skypack.dev/canvas-confetti";

// LOGIQUE NOTIFICATIONS
async function requestNotificationPermission() {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        alert("Super ! KOACH t'enverra tes rappels quotidiens.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const dateAujourdhui = new Date();
    let vueMois = dateAujourdhui.getMonth();
    let vueAnnee = dateAujourdhui.getFullYear();
    let jourEnModification = null; 
    let mesObjectifs = JSON.parse(localStorage.getItem('mesObjectifs')) || [];
    let mesCauses = JSON.parse(localStorage.getItem('mesCauses')) || ["🏢 Travail", "❤️ Amour", "🥗 Santé", "🎮 Loisirs"];
    let humeurDuJour = "";
    let causeChoisie = "";

    const obtenirIdMois = (m, a) => `histo-${a}-${m}`;

    // DARK MODE
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) { document.body.classList.add('dark-mode'); darkModeToggle.checked = true; }
    darkModeToggle.onchange = () => { document.body.classList.toggle('dark-mode'); localStorage.setItem('darkMode', darkModeToggle.checked); };

    // NOTIFS
    document.getElementById('btn-notif-enable').onclick = requestNotificationPermission;

    // SPLASH
    const splash = document.getElementById('splash-screen-koach');
    const splashText = document.querySelector('.carte-accueil');
    const h = dateAujourdhui.getHours();
    splashText.innerText = (h >= 5 && h < 12) ? "Bien dormi ? 🐨" : (h >= 12 && h < 18) ? "Bon après-midi ! ✨" : "Prends une minute pour souffler... 🌙";
    setTimeout(() => splashText.classList.add('reveal-text'), 500);
    setTimeout(() => { splash.style.opacity = '0'; setTimeout(() => splash.style.display = 'none', 800); }, 2200);

    // NAVIGATION
    window.switchMainTab = function(target, element) {
        document.querySelectorAll('.tab-content').forEach(s => s.classList.add('cache'));
        document.getElementById('section-' + target).classList.remove('cache');
        document.querySelectorAll('.tab-item').forEach(item => item.classList.remove('active'));
        element.classList.add('active');
        if (target === 'goals') afficherObjectifs();
    };

    // HUMEUR LOGIC
    window.choisirHumeur = function(h) {
        humeurDuJour = h;
        confetti({ particleCount: 30, colors: h === 'content' ? ['#A8E6CF'] : ['#FF8B94'], origin: { y: 0.7 } });
        document.querySelectorAll('.ecran-accueil').forEach(e => e.classList.add('cache'));
        document.getElementById('ecran-raisons').classList.remove('cache');
        chargerCauses();
    };

    function chargerCauses() {
        const cont = document.getElementById('container-raisons');
        cont.innerHTML = "";
        mesCauses.forEach((r, index) => {
            const div = document.createElement('div');
            div.style.display = "flex"; div.style.gap = "8px";
            div.innerHTML = `<button class="btn-raison">${r}</button><button class="btn-suppr">×</button>`;
            div.querySelector('.btn-raison').onclick = () => { causeChoisie = r; document.getElementById('modal-note').classList.remove('cache'); };
            div.querySelector('.btn-suppr').onclick = () => { mesCauses.splice(index, 1); localStorage.setItem('mesCauses', JSON.stringify(mesCauses)); chargerCauses(); };
            cont.appendChild(div);
        });
    }

    document.getElementById('btn-valider-note').onclick = () => {
        const note = document.getElementById('input-note').value;
        const jS = jourEnModification || dateAujourdhui.getDate();
        const mS = (jourEnModification !== null) ? vueMois : dateAujourdhui.getMonth();
        const aS = (jourEnModification !== null) ? vueAnnee : dateAujourdhui.getFullYear();
        const histo = JSON.parse(localStorage.getItem(obtenirIdMois(mS, aS))) || {};
        histo[jS] = { humeur: humeurDuJour, raison: causeChoisie, note: note };
        localStorage.setItem(obtenirIdMois(mS, aS), JSON.stringify(histo));
        document.getElementById('modal-note').classList.add('cache');
        confetti({ particleCount: 150, spread: 70, colors: humeurDuJour === 'content' ? ['#A8E6CF'] : ['#FF8B94'] });
        jourEnModification = null;
        afficherFinal();
    };

    function afficherFinal() {
        document.querySelectorAll('.ecran-accueil').forEach(e => e.classList.add('cache'));
        document.getElementById('ecran-confirmation').classList.remove('cache');
        const nomMoisClair = new Date(vueAnnee, vueMois).toLocaleDateString('fr-FR', {month:'long', year:'numeric'});
        document.getElementById('nom-du-mois').innerHTML = `<span id="prev-mois" style="cursor:pointer; padding:10px;">‹</span>${nomMoisClair}<span id="next-mois" style="cursor:pointer; padding:10px;">›</span>`;
        document.getElementById('prev-mois').onclick = () => { if(vueMois === 0) { vueMois = 11; vueAnnee--; } else { vueMois--; } afficherFinal(); };
        document.getElementById('next-mois').onclick = () => { if(vueMois === 11) { vueMois = 0; vueAnnee++; } else { vueMois++; } afficherFinal(); };
        dessinerGrille();
        calculerStats();
    }

    function dessinerGrille() {
        const grille = document.getElementById('grille-pixels');
        grille.innerHTML = "";
        const histo = JSON.parse(localStorage.getItem(obtenirIdMois(vueMois, vueAnnee))) || {};
        const nbJours = new Date(vueAnnee, vueMois + 1, 0).getDate();
        for(let i=1; i<=nbJours; i++) {
            const p = document.createElement('div');
            p.className = "pixel " + (histo[i] ? (histo[i].humeur === 'content' ? 'vert' : 'rouge') : '');
            p.innerText = i;
            if(histo[i]) {
                p.onclick = () => {
                    jourEnModification = i;
                    document.getElementById('modal-emoji').innerText = histo[i].humeur === 'content' ? '😊' : '😕';
                    document.getElementById('modal-date').innerText = i + " " + new Date(vueAnnee, vueMois).toLocaleDateString('fr-FR', {month:'long'});
                    document.getElementById('modal-raison').innerHTML = `<strong>${histo[i].raison}</strong>` + (histo[i].note ? `<br>"${histo[i].note}"` : "");
                    document.getElementById('modal-detail').classList.remove('cache');
                };
            }
            grille.appendChild(p);
        }
    }

    function calculerStats() {
        const histo = JSON.parse(localStorage.getItem(obtenirIdMois(vueMois, vueAnnee))) || {};
        const jours = Object.values(histo);
        let streak = 0;
        const jC = dateAujourdhui.getDate();
        for(let i = jC; i > 0; i--) { if(histo[i]) streak++; else if (i !== jC) break; }
        document.getElementById('streak-count').innerText = streak + " jours";

        if(jours.length > 0) {
            const contents = jours.filter(j => j.humeur === 'content').length;
            const pourcentage = Math.round((contents / jours.length) * 100);
            document.getElementById('score-bonheur').innerText = pourcentage + "%";
            document.getElementById('bar-vert').style.width = pourcentage + "%";
            document.getElementById('bar-rouge').style.width = (100 - pourcentage) + "%";
        }
    }

    // MISSIONS
    window.ajouterObjectif = function(type) {
        const inputId = type === 'daily' ? 'input-daily-goal' : 'input-long-goal';
        const text = document.getElementById(inputId).value;
        const dateLong = document.getElementById('input-long-date')?.value;
        if (!text.trim()) return;
        mesObjectifs.push({ id: Date.now(), type, texte: text, echeance: type === 'long' ? dateLong : 'aujourd\'hui', statut: 'en-cours' });
        localStorage.setItem('mesObjectifs', JSON.stringify(mesObjectifs));
        document.getElementById(inputId).value = "";
        afficherObjectifs();
    };

    window.changerStatut = function(id, nouveauStatut) {
        mesObjectifs = mesObjectifs.map(obj => { if (obj.id === id) obj.statut = nouveauStatut; return obj; });
        localStorage.setItem('mesObjectifs', JSON.stringify(mesObjectifs));
        afficherObjectifs();
        if(nouveauStatut === 'fait') confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 }, colors: ['#A8E6CF'] });
    };

    function afficherObjectifs() {
        const contDaily = document.getElementById('liste-goals-du-jour');
        const contLong = document.getElementById('liste-goals-long');
        if(!contDaily || !contLong) return;
        contDaily.innerHTML = ""; contLong.innerHTML = "";
        mesObjectifs.forEach(obj => {
            const html = `<div class="goal-item ${obj.statut === 'fait' ? 'goal-completed' : ''}"><div style="flex:1"><span class="goal-text">${obj.texte}</span><span class="goal-meta">${obj.type === 'long' ? '📅 ' + obj.echeance : '🔥 Aujourd\'hui'}</span></div><div class="goal-actions">${obj.statut === 'en-cours' ? `<button class="btn-status btn-done" onclick="changerStatut(${obj.id}, 'fait')">✅</button><button class="btn-status btn-fail" onclick="changerStatut(${obj.id}, 'echoue')">❌</button>` : `<span style="font-size: 11px; font-weight:bold; color:${obj.statut === 'fait' ? '#2e7d32' : '#c62828'}">${obj.statut === 'fait' ? 'REUSSI' : 'ECHEC'}</span>`}</div></div>`;
            if (obj.type === 'daily') contDaily.insertAdjacentHTML('beforeend', html);
            else contLong.insertAdjacentHTML('beforeend', html);
        });
    }

    // BOUTONS & EVENTS
    document.getElementById('btn-retour-choix').onclick = () => { document.getElementById('ecran-raisons').classList.add('cache'); document.getElementById('ecran-choix').classList.remove('cache'); };
    document.getElementById('btn-tab-grille').onclick = () => { document.getElementById('grille-pixels').classList.remove('cache'); document.getElementById('section-stats').classList.add('cache'); };
    document.getElementById('btn-tab-stats').onclick = () => { document.getElementById('grille-pixels').classList.add('cache'); document.getElementById('section-stats').classList.remove('cache'); };
    document.getElementById('modal-close-btn').onclick = () => { document.getElementById('modal-detail').classList.add('cache'); };
    document.getElementById('btn-modifier-jour').onclick = () => { document.getElementById('modal-detail').classList.add('cache'); document.querySelectorAll('.ecran-accueil').forEach(e => e.classList.add('cache')); document.getElementById('ecran-choix').classList.remove('cache'); };
    document.getElementById('btn-ajouter-cause').onclick = () => { const val = document.getElementById('input-nouvelle-cause').value; if(val.trim()) { mesCauses.push(val.trim()); localStorage.setItem('mesCauses', JSON.stringify(mesCauses)); chargerCauses(); document.getElementById('input-nouvelle-cause').value = ""; } };
    document.getElementById('real-reset-btn').onclick = () => { if(confirm("Effacer ce mois ?")) { localStorage.removeItem(obtenirIdMois(vueMois, vueAnnee)); afficherFinal(); } };

    const idInit = obtenirIdMois(dateAujourdhui.getMonth(), dateAujourdhui.getFullYear());
    if(JSON.parse(localStorage.getItem(idInit))?.[dateAujourdhui.getDate()]) afficherFinal();
    afficherObjectifs();
});
