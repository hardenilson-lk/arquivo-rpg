(function () {
  const notes = [
    "Simbolo central reage a presenca do artefato.",
    "Luz fraca nas tochas.",
    "Criatura sensivel a luz sagrada.",
    "Possivel passagem secreta na parede norte."
  ];

  function safeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function initials(name) {
    return String(name || "?")
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function render(state) {
    const sheet = activeSheetFrom(state);
    const mode = state.currentMode || "player";
    document.body.classList.toggle("master-view", mode === "master");
    document.body.classList.toggle("player-view", mode !== "master");

    const access = document.querySelector("#accessLevel");
    if (access) access.textContent = mode === "sheet" ? "ARQUIVO PESSOAL" : `NIVEL DE ACESSO: ${mode === "master" ? "RESTRITO" : "PERMITIDO"}`;

    const campaign = currentCampaignFrom(state);
    const session = currentSessionFrom(state, campaign);
    const campaignLabel = document.querySelector("#campaignLabel");
    if (campaignLabel) campaignLabel.textContent = mode === "sheet" ? `Ficha: ${sheet.name || "Sem nome"}` : `Campanha: ${campaign?.nome || state.campaignName || "Sem campanha"}`;
    const currentArchive = document.querySelector("#currentArchiveLabel");
    if (currentArchive) currentArchive.textContent = mode === "sheet" ? "Arquivo pessoal do jogador" : `${mode === "master" ? "Arquivo atual" : "Arquivo liberado"}: ${session?.codigoArquivo || "sem arquivo"}`;
    const sessionLabel = document.querySelector("#sessionLabel");
    if (sessionLabel) sessionLabel.textContent = mode === "sheet" ? "Menus: ficha, inventario e anotacoes" : `Sessao: ${session?.titulo || state.map?.name || "Sem sessao"}`;

    const toggle = document.querySelector("#modeBadge");
    if (toggle) toggle.textContent = mode === "sheet" ? "ficha pessoal" : mode === "master" ? "mestre da sala" : "jogador";

    const mapLabel = document.querySelector("#mapTitleLabel");
    if (mapLabel) mapLabel.textContent = `${session?.codigoArquivo || "sem arquivo"} - ${session?.titulo || state.map?.name || "Mapa sem nome"}`;

    const location = document.querySelector("#archiveLocation");
    if (location) location.textContent = state.map?.name || "Camara central";
    const objective = document.querySelector("#archiveObjective");
    if (objective) {
      objective.textContent = mode === "sheet"
        ? sheet.objective || "Arquivo pessoal do agente."
        : session?.mission || session?.resumo || "Objetivo ainda nao registrado pelo mestre.";
    }

    renderCRT(state, sheet, mode);
    renderCards(state, sheet);
    renderNotes(mode, session);
  }

  function currentCampaignFrom(state) {
    return state.campaigns?.find((campaign) => campaign.id === state.activeCampaignId) || state.campaigns?.[0] || null;
  }

  function currentSessionFrom(state, campaign) {
    return campaign?.sessoes?.find((session) => session.id === state.activeSessionId) || campaign?.sessoes?.[0] || null;
  }

  function activeSheetFrom(state) {
    return state.sheets?.find((sheet) => sheet.id === state.activeSheetId) || state.sheets?.[0] || {};
  }

  function renderCRT(state, sheet, mode) {
    const crt = document.querySelector("#crtStatus");
    if (!crt) return;
    const lastRoll = state.rolls?.[0];
    const campaign = currentCampaignFrom(state);
    const session = currentSessionFrom(state, campaign);
    const statusLines = [
      "> SISTEMA ARQUIVOS v1.07",
      `> USUARIO: ${mode === "master" ? "MESTRE" : "JOGADOR"}`,
      `> CAMPANHA: ${safeLine(campaign?.nome || state.campaignName || "MESA DE COMBATE")}`,
      `> ARQUIVO: ${safeLine(session?.codigoArquivo || "SEM ARQUIVO")}`,
      `> SESSAO: ${safeLine(session?.titulo || state.map?.name || "SEM SESSAO")}`,
      `> TOKENS CARREGADOS: ${state.tokens?.length || 0}`,
      `> AGENTE: ${safeLine(sheet.name || "NAO IDENTIFICADO")}`,
      lastRoll ? `> ULTIMA ROLAGEM: ${lastRoll.total} EM ${safeLine(lastRoll.formula)}` : "> AGUARDANDO ROLAGEM...",
    ];
    crt.innerHTML = `${statusLines.map(escapeHtml).join("\n")}\n&gt; AGUARDANDO COMANDO<span class="crt-dots" aria-hidden="true"></span>`;
  }

  function safeLine(value) {
    return String(value || "").replace(/\n/g, " ").toUpperCase();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function renderCards(state, sheet) {
    const cards = document.querySelector("#characterCards");
    if (!cards) return;
    const attrs = [
      ["FOR", sheet.str ?? 1],
      ["AGI", sheet.agi ?? 1],
      ["INT", sheet.int ?? 1],
      ["PRE", sheet.pre ?? 1],
      ["VIG", sheet.vig ?? 1]
    ];
    const token = state.tokens?.find((item) => item.name === sheet.name) || state.tokens?.[0];
    const portrait = sheet.portrait || token?.portrait || "";
    const portraitStyle = portrait ? ` style="background-image:url('${safeText(portrait)}')"` : "";
    cards.innerHTML = `
      <article class="character-card">
        <div class="portrait-pin${portrait ? " has-photo" : ""}"${portraitStyle}>${portrait ? "" : safeText(initials(sheet.name || token?.name || "Ari"))}</div>
        <div>
          <b>${safeText(sheet.name || token?.name || "Agente")}</b>
          <span>${safeText(sheet.className || "Investigador")} - ${safeText(sheet.nex || "5%")}</span>
        </div>
        <dl>
          <dt>PV</dt><dd>${safeText(sheet.hp ?? 12)} / ${safeText(sheet.hpMax ?? 18)}</dd>
          <dt>Energia</dt><dd>${safeText(sheet.pe ?? 6)} / ${safeText(sheet.peMax ?? 9)}</dd>
          <dt>Defesa</dt><dd>${safeText(sheet.defense ?? 14)}</dd>
          <dt>Luz</dt><dd>${safeText(token?.light ?? 4)}</dd>
        </dl>
        <div class="mini-attrs">${attrs.map(([key, value]) => `<span>${key} ${safeText(value)}</span>`).join("")}</div>
      </article>
    `;
  }

  function renderNotes(mode, session) {
    const list = document.querySelector("#noteList");
    if (!list) return;
    const sessionNotes = Array.isArray(session?.pistas) && session.pistas.length ? session.pistas : notes;
    const visible = mode === "master" ? sessionNotes.concat(session?.privateNote ? `Nota do mestre: ${session.privateNote}` : "Anotacao oculta: inimigo reage ao escuro.") : session?.playersCanSeeNotes === false ? [] : sessionNotes;
    list.innerHTML = visible.map((note) => `<li>${safeText(note)}</li>`).join("");
  }

  window.archiveUI = { render };
})();
