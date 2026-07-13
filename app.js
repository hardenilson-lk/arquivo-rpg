const state = {
  bootReady: false,
  currentUserId: null,
  currentMode: "player",
  activeTab: "mesa",
  archiveName: "arquivos",
  campaignName: "Mesa de combate",
  activeCampaignId: null,
  activeSessionId: null,
  activeSheetId: null,
  accounts: [],
  campaigns: [],
  campaignPlayers: [],
  sheetRequests: [],
  map: { name: "Base da equipe", cols: 32, rows: 17, darkness: 58, lightsOn: true, cellSize: 56, tokenScale: 100, gridOpacity: 38, gridColor: "#debc79", background: defaultMapBackground(), fog: defaultFog(), marks: [], tool: "move" },
  tokens: [],
  sheets: [],
  rolls: [],
  selectedToken: null,
  pendingMigrationSheetId: null,
  pendingResponsibleSheetId: null
};

let viewCellSize = null;
let pendingNpcPortrait = "";
let pendingMapEdgeStart = null;
let isSpacePressed = false;
let panState = null;
let mapPlayerPreview = false;
let diceClearTimer = null;
let diceAudio = null;
let lastSoundtrackTrackId = "";
let lastSoundtrackCommandId = "";
let masterInventorySheetId = null;
let voiceChannel = null;
let localVoiceStream = null;
let voiceJoined = false;
let voiceMuted = false;
let voiceDeafened = false;
let voiceMonitoring = false;
let voiceMonitorAudio = null;
let silentVoiceTrack = null;
const voicePeers = new Map();
const voiceParticipants = new Map();
const LEGACY_STORAGE_KEY = "mesa-arcana";
const SESSION_STORAGE_KEY = "arquivo-rpg-session";
const DND_LAYOUT_STORAGE_KEY = "orbe-dnd-layout";

const RPG_SYSTEMS = {
  arquivo: {
    id: "arquivo",
    nome: "Arquivo",
    abreviacao: "ARQ",
    tema: "theme-arquivo",
    ficha: "arquivo",
    desc: "Misterio, investigacao e horrores que desafiam a razao.",
    cardClass: "system-arquivo"
  },
  dnd5e: {
    id: "dnd5e",
    nome: "D&D 5e",
    abreviacao: "DND",
    tema: "theme-dnd",
    ficha: "dnd5e",
    desc: "A fantasia classica que inspira geracoes.",
    cardClass: "system-dnd"
  },
  personalizado: {
    id: "personalizado",
    nome: "Sistema Proprio",
    abreviacao: "CUSTOM",
    tema: "theme-custom",
    ficha: "generica",
    desc: "Use suas proprias regras e crie algo unico.",
    cardClass: "system-custom"
  }
};

const els = {
  battlefield: document.querySelector("#battlefield"),
  diceStage: document.querySelector("#diceStage"),
  tokenList: document.querySelector("#tokenList"),
  mapName: document.querySelector("#mapName"),
  gridCols: document.querySelector("#gridCols"),
  gridRows: document.querySelector("#gridRows"),
  tokenName: document.querySelector("#tokenName"),
  tokenColor: document.querySelector("#tokenColor"),
  tokenLight: document.querySelector("#tokenLight"),
  quickGridCols: document.querySelector("#quickGridCols"),
  quickGridRows: document.querySelector("#quickGridRows"),
  quickCellSize: document.querySelector("#quickCellSize"),
  quickGridOffsetX: document.querySelector("#quickGridOffsetX"),
  quickGridOffsetY: document.querySelector("#quickGridOffsetY"),
  quickGridOpacity: document.querySelector("#quickGridOpacity"),
  quickGridColor: document.querySelector("#quickGridColor"),
  quickThickEvery: document.querySelector("#quickThickEvery"),
  quickSnap: document.querySelector("#quickSnap"),
  quickCoordinates: document.querySelector("#quickCoordinates"),
  quickLightsOn: document.querySelector("#quickLightsOn"),
  quickDarkness: document.querySelector("#quickDarkness"),
  mapTool: document.querySelector("#mapTool"),
  fogEnabled: document.querySelector("#fogEnabled"),
  fogMode: document.querySelector("#fogMode"),
  fogKeepExplored: document.querySelector("#fogKeepExplored"),
  mapImageInput: document.querySelector("#mapImageInput"),
  mapImageScaleX: document.querySelector("#mapImageScaleX"),
  mapImageScaleY: document.querySelector("#mapImageScaleY"),
  mapImageX: document.querySelector("#mapImageX"),
  mapImageY: document.querySelector("#mapImageY"),
  mapImageRotation: document.querySelector("#mapImageRotation"),
  mapImageOpacity: document.querySelector("#mapImageOpacity"),
  quickTokenName: document.querySelector("#quickTokenName"),
  quickTokenColor: document.querySelector("#quickTokenColor"),
  quickTokenLight: document.querySelector("#quickTokenLight"),
  quickTokenScale: document.querySelector("#quickTokenScale"),
  npcName: document.querySelector("#npcName"),
  npcColor: document.querySelector("#npcColor"),
  npcHp: document.querySelector("#npcHp"),
  npcDefense: document.querySelector("#npcDefense"),
  npcLight: document.querySelector("#npcLight"),
  npcType: document.querySelector("#npcType"),
  npcAttack: document.querySelector("#npcAttack"),
  npcImage: document.querySelector("#npcImage"),
  npcHidden: document.querySelector("#npcHidden"),
  lightsOn: document.querySelector("#lightsOn"),
  darkness: document.querySelector("#darkness"),
  sheetForm: document.querySelector("#sheetForm"),
  crisisSheet: document.querySelector("#crisisSheet"),
  sheetList: document.querySelector("#sheetList"),
  tableSheetsPanel: document.querySelector("#tableSheetsPanel"),
  masterShield: document.querySelector("#masterShield"),
  npcMiniCards: document.querySelector("#npcMiniCards"),
  missionsApp: document.querySelector("#missionsApp"),
  chatLog: document.querySelector("#chatLog"),
  chatForm: document.querySelector("#chatForm"),
  chatText: document.querySelector("#chatText"),
  voiceStatus: document.querySelector("#voiceStatus"),
  voiceJoin: document.querySelector("#voiceJoin"),
  voiceMute: document.querySelector("#voiceMute"),
  voiceDeafen: document.querySelector("#voiceDeafen"),
  voiceAttention: document.querySelector("#voiceAttention"),
  voiceRequestTalk: document.querySelector("#voiceRequestTalk"),
  voiceMonitor: document.querySelector("#voiceMonitor"),
  voiceMicLamp: document.querySelector("#voiceMicLamp"),
  voiceParticipants: document.querySelector("#voiceParticipants"),
  voiceRemoteAudio: document.querySelector("#voiceRemoteAudio"),
  soundtrackForm: document.querySelector("#soundtrackForm"),
  soundtrackUrl: document.querySelector("#soundtrackUrl"),
  soundtrackVolume: document.querySelector("#soundtrackVolume"),
  soundtrackVolumeValue: document.querySelector("#soundtrackVolumeValue"),
  soundtrackPlayer: document.querySelector("#soundtrackPlayer"),
  soundtrackList: document.querySelector("#soundtrackList"),
  syncStatus: document.querySelector("#syncStatus"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  rollResult: document.querySelector("#rollResult"),
  crtDicePreset: document.querySelector("#crtDicePreset"),
  crtFormula: document.querySelector("#crtFormula"),
  rollLog: document.querySelector("#rollLog")
};

const catalog = {
  origins: [
    { name: "Academico", type: "Origem", desc: "Personagem ligado a estudo, pesquisa e analise. Favorece cenas de investigacao e conhecimento.", skills: "Ciencias e Investigacao", talent: "Saber e Poder" },
    { name: "Agente de Saude", type: "Origem", desc: "Treinado para lidar com ferimentos, emergencia e cuidado em campo.", skills: "Medicina e Vontade", talent: "Tecnica Medicinal" },
    { name: "Artista", type: "Origem", desc: "Usa expressao, presenca e sensibilidade para influenciar pessoas e ler ambientes.", skills: "Artes e Diplomacia", talent: "Magnum Opus" },
    { name: "Atleta", type: "Origem", desc: "Foco em preparo fisico, explosao, resistencia e movimento.", skills: "Atletismo e Fortitude", talent: "110%" },
    { name: "Batedor", type: "Origem", desc: "Especialista em seguir pistas, reconhecer terreno e se mover antes do perigo chegar.", skills: "Percepcao e Sobrevivencia", talent: "Olhos Abertos" },
    { name: "Criminoso", type: "Origem", desc: "Conhece ruas, risco, contatos ilegais e metodos pouco oficiais.", skills: "Crime e Furtividade", talent: "O Crime Compensa" },
    { name: "Cultista Arrependido", type: "Origem", desc: "Carrega contato previo com o paranormal e marcas de escolhas antigas.", skills: "Ocultismo e Religiao", talent: "Tracos do Outro Lado" },
    { name: "Investigador", type: "Origem", desc: "Acostumado a levantar provas, ligar pistas e seguir pessoas suspeitas.", skills: "Investigacao e Percepcao", talent: "Faro para Pistas" },
    { name: "Militar", type: "Origem", desc: "Treinamento tatico, disciplina e uso de armas em situacoes de combate.", skills: "Pontaria e Tatica", talent: "Para Bellum" },
    { name: "Operario", type: "Origem", desc: "Experiencia pratica com ferramentas, esforco fisico e improviso.", skills: "Fortitude e Profissao", talent: "Ferramentas de Trabalho" },
    { name: "Religioso", type: "Origem", desc: "Apoio emocional, fe e contato com comunidades de crenca.", skills: "Religiao e Vontade", talent: "Acalentar" },
    { name: "Universitario", type: "Origem", desc: "Aprendizado amplo e vida academica ainda em formacao.", skills: "Atualidades e Investigacao", talent: "Dedicacao" },
    { name: "Vitima", type: "Origem", desc: "Sobreviveu a algo terrivel e transformou trauma em instinto de sobrevivencia.", skills: "Reflexos e Vontade", talent: "Cicatrizes Psicologicas" }
  ],
  classes: [
    { name: "Combatente", type: "Classe", desc: "Foco em combate direto, resistencia e protecao do grupo." },
    { name: "Especialista", type: "Classe", desc: "Foco em pericias, investigacao, suporte tecnico e solucoes praticas." },
    { name: "Ocultista", type: "Classe", desc: "Foco em rituais, conhecimento paranormal e efeitos sobrenaturais." }
  ],
  paths: [
    { name: "Aniquilador", type: "Trilha", className: "Combatente", desc: "Especializacao em causar dano alto com armas favoritas." },
    { name: "Comandante de Campo", type: "Trilha", className: "Combatente", desc: "Coordena aliados, melhora posicionamento e abre oportunidades taticas." },
    { name: "Guerreiro", type: "Trilha", className: "Combatente", desc: "Domina combate corpo a corpo e pressiona inimigos de perto." },
    { name: "Operacoes Especiais", type: "Trilha", className: "Combatente", desc: "Combate agil, movimento rapido e respostas eficientes em crise." },
    { name: "Tropa de Choque", type: "Trilha", className: "Combatente", desc: "Aguenta dano, segura linha de frente e protege o time." },
    { name: "Infiltrador", type: "Trilha", className: "Especialista", desc: "Furtividade, ataques precisos e acesso a lugares protegidos." },
    { name: "Medico de Campo", type: "Trilha", className: "Especialista", desc: "Mantem aliados vivos e estabiliza ferimentos durante a missao." },
    { name: "Negociador", type: "Trilha", className: "Especialista", desc: "Resolve conflitos com fala, leitura social e pressao psicologica." },
    { name: "Tecnico", type: "Trilha", className: "Especialista", desc: "Carrega recursos, conserta problemas e improvisa ferramentas." },
    { name: "Conduite", type: "Trilha", className: "Ocultista", desc: "Canaliza rituais com mais alcance, foco e controle." },
    { name: "Flagelador", type: "Trilha", className: "Ocultista", desc: "Transforma dor e sacrificio em energia paranormal." },
    { name: "Graduado", type: "Trilha", className: "Ocultista", desc: "Estuda rituais com profundidade e amplia repertorio ocultista." },
    { name: "Intuitivo", type: "Trilha", className: "Ocultista", desc: "Sente o paranormal antes de entender, resistindo melhor a seus efeitos." },
    { name: "Lamina Paranormal", type: "Trilha", className: "Ocultista", desc: "Mistura rituais e armas para lutar de forma sobrenatural." }
  ],
  abilities: [
    { name: "Olhos Abertos", type: "Talento de origem", origin: "Batedor", desc: "Ajuda a notar emboscadas, rastros e sinais de perigo." },
    { name: "Saber e Poder", type: "Talento de origem", origin: "Academico", desc: "Usa estudo e pesquisa para preparar respostas melhores." },
    { name: "Faro para Pistas", type: "Talento de origem", origin: "Investigador", desc: "Facilita encontrar pistas relevantes em cenas complicadas." },
    { name: "Para Bellum", type: "Talento de origem", origin: "Militar", desc: "A experiencia de combate ajuda em situacoes armadas." },
    { name: "Ferramentas de Trabalho", type: "Talento de origem", origin: "Operario", desc: "Permite aproveitar ferramentas comuns de forma eficiente." },
    { name: "Favorita", type: "Habilidade de trilha", className: "Combatente", pathName: "Aniquilador", desc: "Escolhe uma arma principal e reduz o custo para aprimora-la." },
    { name: "Inspirar Aliados", type: "Habilidade de trilha", className: "Combatente", pathName: "Comandante de Campo", desc: "Usa comando tatico para apoiar jogadas de aliados." },
    { name: "Mao Pesada", type: "Habilidade de trilha", className: "Combatente", pathName: "Guerreiro", desc: "Pressiona o inimigo no corpo a corpo com golpes brutais." },
    { name: "Iniciativa Aprimorada", type: "Habilidade de trilha", className: "Combatente", pathName: "Operacoes Especiais", desc: "Age rapido e ganha vantagem no comeco de confrontos." },
    { name: "Casca Grossa", type: "Habilidade de trilha", className: "Combatente", pathName: "Tropa de Choque", desc: "Absorve mais castigo e permanece protegendo a equipe." },
    { name: "Ataque Furtivo", type: "Habilidade de trilha", className: "Especialista", pathName: "Infiltrador", desc: "Causa mais impacto quando age escondido ou pega alvo desprevenido." },
    { name: "Paramedico", type: "Habilidade de trilha", className: "Especialista", pathName: "Medico de Campo", desc: "Melhora atendimento emergencial e recuperacao em cena." },
    { name: "Eloquencia", type: "Habilidade de trilha", className: "Especialista", pathName: "Negociador", desc: "Usa fala e leitura social para conduzir conflitos." },
    { name: "Remendao", type: "Habilidade de trilha", className: "Especialista", pathName: "Tecnico", desc: "Improvisa consertos e usa equipamentos com mais eficiencia." },
    { name: "Conjurar Ritual", type: "Habilidade de classe", className: "Ocultista", desc: "Permite usar rituais conhecidos durante investigacao e combate." },
    { name: "Ampliar Ritual", type: "Habilidade de trilha", className: "Ocultista", pathName: "Conduite", desc: "Aumenta o controle sobre alcance e intensidade dos rituais." },
    { name: "Poder do Sacrificio", type: "Habilidade de trilha", className: "Ocultista", pathName: "Flagelador", desc: "Converte dor em forca paranormal quando a cena exige." },
    { name: "Grimorio", type: "Habilidade de trilha", className: "Ocultista", pathName: "Graduado", desc: "Organiza conhecimento ocultista e amplia opcoes de ritual." },
    { name: "Pressentimento", type: "Habilidade de trilha", className: "Ocultista", pathName: "Intuitivo", desc: "Sente ameacas paranormais e resiste melhor a efeitos ocultos." },
    { name: "Lamina Maldita", type: "Habilidade de trilha", className: "Ocultista", pathName: "Lamina Paranormal", desc: "Usa energia paranormal para fortalecer ataques com arma." },
    { name: "Afortunado", type: "Poder", desc: "Permite refazer testes em momentos importantes, representando sorte acima do normal." },
    { name: "Calejado", type: "Poder", desc: "Aumenta a resistencia do personagem, ajudando a suportar ferimentos e pressoes fisicas." },
    { name: "Discreto", type: "Poder", desc: "Facilita agir sem chamar atencao, esconder rastros e se mover com cautela." },
    { name: "Inventario Otimizado", type: "Poder", desc: "Melhora o aproveitamento de carga e espacos para carregar equipamento." },
    { name: "Ninja Urbano", type: "Poder", desc: "Ajuda em mobilidade, furtividade e acoes rapidas em ambientes urbanos." },
    { name: "Potencial Aprimorado", type: "Poder", desc: "Aumenta a reserva de energia para usar habilidades especiais com mais frequencia." },
    { name: "Reflexos Defensivos", type: "Poder", desc: "Melhora reacao defensiva e ajuda a evitar ataques." },
    { name: "Saque Rapido", type: "Poder", desc: "Facilita preparar, sacar ou trocar equipamento durante cenas de acao." },
    { name: "Treinamento em Pericia", type: "Poder", desc: "Concede treinamento adicional em pericias escolhidas." },
    { name: "Ataque Especial", type: "Combatente", desc: "Permite gastar energia para melhorar ataques, aumentando chance de acerto ou impacto." },
    { name: "Protecao Pesada", type: "Combatente", desc: "Permite usar protecoes mais robustas, em troca de maior peso e limitacoes." },
    { name: "Eclético", type: "Especialista", desc: "Permite se virar em varias pericias, mesmo quando nao possui treinamento ideal." },
    { name: "Perito", type: "Especialista", desc: "Melhora testes de pericia importantes, representando conhecimento pratico refinado." },
    { name: "Engenhosidade", type: "Especialista", desc: "Usa intelecto e improviso para resolver problemas tecnicos ou taticos." },
    { name: "Escolhido pelo Outro Lado", type: "Ocultista", desc: "Conecta o personagem ao paranormal e habilita o uso de rituais." },
    { name: "Camuflar Ocultismo", type: "Ocultista", desc: "Ajuda a esconder sinais de rituais e atividades paranormais." }
  ],
  inventory: [
    { name: "Revolver", type: "Arma", desc: "Arma de fogo simples e confiavel, boa para combates de curta a media distancia." },
    { name: "Pistola", type: "Arma", desc: "Arma de fogo leve, pratica e facil de ocultar." },
    { name: "Espingarda", type: "Arma", desc: "Arma de alto impacto em curta distancia, forte contra alvos proximos." },
    { name: "Fuzil", type: "Arma", desc: "Arma de fogo longa para combates a distancia, exige preparo e controle." },
    { name: "Faca", type: "Arma", desc: "Arma corpo a corpo pequena, discreta e versatil." },
    { name: "Bastao", type: "Arma", desc: "Arma simples de impacto, util para defesa e controle." },
    { name: "Katana", type: "Arma", desc: "Lamina longa e precisa, perigosa em combate corpo a corpo." },
    { name: "Protecao Leve", type: "Protecao", desc: "Equipamento defensivo discreto que reduz dano sem pesar tanto." },
    { name: "Protecao Pesada", type: "Protecao", desc: "Protecao robusta, melhora defesa mas pesa e pode atrapalhar mobilidade." },
    { name: "Kit de Pericia", type: "Equipamento", desc: "Conjunto de ferramentas para uma area especifica de investigacao ou trabalho." },
    { name: "Lanterna Tatica", type: "Equipamento", desc: "Fonte de luz resistente, util em investigacao, exploracao e combate." },
    { name: "Algemas", type: "Equipamento", desc: "Usadas para conter criaturas humanas ou suspeitos dominados." },
    { name: "Camera", type: "Equipamento", desc: "Registra cenas, provas e fenomenos para analise posterior." },
    { name: "Cicatrizante", type: "Equipamento", desc: "Item medico para estabilizar ou recuperar ferimentos leves." },
    { name: "Mochila Militar", type: "Equipamento", desc: "Aumenta capacidade de carga e organiza equipamentos de campo." },
    { name: "Smartphone", type: "Equipamento", desc: "Comunicação, pesquisa, fotos, mapas e registros digitais." },
    { name: "Arpeu", type: "Equipamento", desc: "Gancho com cabo para escalada, travessias e acesso a locais elevados." },
    { name: "Binoculos", type: "Equipamento", desc: "Observacao a distancia para vigilia, rastreio e reconhecimento." },
    { name: "Corda", type: "Equipamento", desc: "Equipamento basico para escalada, resgate, amarrar objetos ou criar apoio." },
    { name: "Equipamento de Sobrevivencia", type: "Equipamento", desc: "Conjunto de campo para abrigo, fogo, orientacao e pequenas emergencias." },
    { name: "Mascara de Gas", type: "Equipamento", desc: "Protege contra fumaca, toxinas e ar contaminado por tempo limitado." },
    { name: "Detector de Sinais", type: "Equipamento", desc: "Ajuda a localizar transmissoes, rastreadores e interferencias." },
    { name: "Bloqueador de Sinal", type: "Equipamento", desc: "Dificulta comunicacao e rastreamento eletronico em uma area proxima." },
    { name: "Spray de Pimenta", type: "Equipamento", desc: "Item de contencao que atrapalha visao e reacao de um alvo proximo." },
    { name: "Granada de Fragmentacao", type: "Explosivo", desc: "Explosivo de area para situacoes extremas de combate." },
    { name: "Molotov", type: "Explosivo", desc: "Incendiario improvisado que cria fogo e pressiona uma area." }
  ],
  rituals: [
    { name: "Cicatrizacao", type: "Ritual", desc: "Ritual de cura que fecha ferimentos e ajuda a recuperar pontos de vida." },
    { name: "Decadencia", type: "Ritual", desc: "Canaliza energia destrutiva para deteriorar e ferir um alvo." },
    { name: "Eletrocussao", type: "Ritual", desc: "Dispara energia eletrica paranormal contra alvo ou area proxima." },
    { name: "Enfeitiçar", type: "Ritual", desc: "Afeta a mente de uma criatura, influenciando sua percepcao ou atitude." },
    { name: "Perturbacao", type: "Ritual", desc: "Desestabiliza um alvo, atrapalhando suas acoes e concentracao." },
    { name: "Amaldicoar Arma", type: "Ritual", desc: "Imbui uma arma com energia paranormal para melhorar seu dano ou efeito." },
    { name: "Arma Atroz", type: "Ritual", desc: "Transforma uma arma em instrumento brutal de combate por um periodo." },
    { name: "Consumir Manancial", type: "Ritual", desc: "Converte energia paranormal em protecao temporaria." },
    { name: "Nuvem de Cinzas", type: "Ritual", desc: "Cria cobertura sobrenatural que dificulta visao e deslocamento." },
    { name: "Terceiro Olho", type: "Ritual", desc: "Aprimora percepcao para notar presencas, rastros ou fenomenos ocultos." },
    { name: "Definhar", type: "Ritual", desc: "Enfraquece uma criatura, reduzindo sua capacidade de resistir ou agir." },
    { name: "Tela de Ruido", type: "Ritual", desc: "Cria uma protecao paranormal que absorve ou reduz dano recebido." },
    { name: "Eco Espiral", type: "Ritual", desc: "Manipula ecos temporais ou sensoriais para afetar uma cena." },
    { name: "Velocidade Mortal", type: "Ritual", desc: "Acelera movimentos, tornando a criatura mais rapida e perigosa." },
    { name: "Vomitar Pestes", type: "Ritual", desc: "Libera pragas paranormais que prejudicam criaturas em uma area." }
  ]
};

const catalogStats = {
  Revolver: { volume: "1", damage: "2d6", category: "Arma de fogo", range: "Medio", image: "revolver" },
  Pistola: { volume: "1", damage: "2d6", category: "Arma de fogo", range: "Medio", image: "pistola" },
  Espingarda: { volume: "2", damage: "4d6", category: "Arma de fogo", range: "Curto", image: "espingarda" },
  Fuzil: { volume: "2", damage: "3d8", category: "Arma de fogo", range: "Longo", image: "fuzil" },
  Faca: { volume: "1", damage: "1d4", category: "Arma corpo a corpo", range: "Corpo a corpo", image: "faca" },
  Bastao: { volume: "1", damage: "1d6", category: "Arma corpo a corpo", range: "Corpo a corpo", image: "bastao" },
  Katana: { volume: "2", damage: "1d10", category: "Arma corpo a corpo", range: "Corpo a corpo", image: "katana" },
  "Protecao Leve": { volume: "2", damage: "-", category: "Protecao", defense: "+5 Defesa", image: "colete" },
  "Protecao Pesada": { volume: "5", damage: "-", category: "Protecao", defense: "+10 Defesa", image: "armadura" },
  "Kit de Pericia": { volume: "1", damage: "-", category: "Ferramenta", bonus: "Ajuda uma pericia especifica", image: "kit" },
  "Lanterna Tatica": { volume: "1", damage: "-", category: "Geral", bonus: "Ilumina areas escuras", image: "lanterna" },
  Algemas: { volume: "1", damage: "-", category: "Geral", bonus: "Conter alvo rendido", image: "algemas" },
  Camera: { volume: "1", damage: "-", category: "Geral", bonus: "Registra provas", image: "camera" },
  Cicatrizante: { volume: "1", damage: "-", category: "Medico", bonus: "Auxilia recuperacao", image: "medkit" },
  "Mochila Militar": { volume: "1", damage: "-", category: "Geral", bonus: "Aumenta carga", image: "mochila" },
  Smartphone: { volume: "0", damage: "-", category: "Tecnologia", bonus: "Comunicacao e pesquisa", image: "celular" },
  Arpeu: { volume: "1", damage: "-", category: "Exploracao", bonus: "Escalada e travessia", image: "arpeu" },
  Binoculos: { volume: "1", damage: "-", category: "Investigacao", bonus: "Observacao distante", image: "binoculos" },
  Corda: { volume: "1", damage: "-", category: "Exploracao", bonus: "Escalada, resgate e amarras", image: "corda" },
  "Equipamento de Sobrevivencia": { volume: "2", damage: "-", category: "Sobrevivencia", bonus: "Campo, abrigo e orientacao", image: "sobrevivencia" },
  "Mascara de Gas": { volume: "1", damage: "-", category: "Protecao", bonus: "Ar contaminado e fumaca", image: "mascara" },
  "Detector de Sinais": { volume: "1", damage: "-", category: "Tecnologia", bonus: "Localizar transmissoes", image: "detector" },
  "Bloqueador de Sinal": { volume: "1", damage: "-", category: "Tecnologia", bonus: "Interferir comunicacao", image: "bloqueador" },
  "Spray de Pimenta": { volume: "0", damage: "Efeito de contencao", category: "Geral", range: "Curto", image: "spray" },
  "Granada de Fragmentacao": { volume: "1", damage: "6d6", category: "Explosivo", range: "Curto", image: "granada" },
  Molotov: { volume: "1", damage: "2d6 fogo", category: "Explosivo", range: "Curto", image: "molotov" },
  Cicatrizacao: { cost: "1 PE", damage: "Cura/recuperacao", requirement: "Ritual de 1º circulo; teste/uso ocultista conforme cena", element: "Conhecimento", image: "ritual-cura" },
  Decadencia: { cost: "1 PE", damage: "2d8 paranormal", requirement: "Ritual de 1º circulo; alvo ao alcance e gestos/simbolos", element: "Morte", image: "ritual-dano" },
  Eletrocussao: { cost: "1 PE", damage: "3d6 eletrico", requirement: "Ritual de 1º circulo; alvo visivel ou ponto de descarga", element: "Energia", image: "ritual-raio" },
  "Enfeitiçar": { cost: "1 PE", damage: "Efeito mental", requirement: "Ritual de 1º circulo; alvo capaz de perceber o conjurador", element: "Conhecimento", image: "ritual-mente" },
  Perturbacao: { cost: "1 PE", damage: "Penalidade mental", requirement: "Ritual de 1º circulo; alvo em alcance curto/medio", element: "Conhecimento", image: "ritual-mente" },
  "Amaldicoar Arma": { cost: "1 PE", damage: "Bonus/elemento na arma", requirement: "Ritual de 1º circulo; tocar arma escolhida", element: "Variavel", image: "ritual-arma" },
  "Arma Atroz": { cost: "2 PE", damage: "Aprimora arma corpo a corpo", requirement: "Ritual de 2º circulo; arma ou alvo tocado", element: "Sangue", image: "ritual-arma" },
  "Consumir Manancial": { cost: "1 PE", damage: "Protecao temporaria", requirement: "Ritual de 1º circulo; canalizar energia em si mesmo", element: "Morte", image: "ritual-protecao" },
  "Nuvem de Cinzas": { cost: "1 PE", damage: "Area obscurecida", requirement: "Ritual de 1º circulo; ponto dentro do alcance", element: "Morte", image: "ritual-nuvem" },
  "Terceiro Olho": { cost: "1 PE", damage: "Percepcao paranormal", requirement: "Ritual de 1º circulo; concentracao breve", element: "Conhecimento", image: "ritual-olho" },
  Definhar: { cost: "2 PE", damage: "Enfraquecimento", requirement: "Ritual de 2º circulo; alvo vivo ou criatura perceptivel", element: "Morte", image: "ritual-dano" },
  "Tela de Ruido": { cost: "2 PE", damage: "Reduz dano recebido", requirement: "Ritual de 2º circulo; reacao/defesa conforme cena", element: "Energia", image: "ritual-protecao" },
  "Eco Espiral": { cost: "2 PE", damage: "Manipulacao temporal/sensorial", requirement: "Ritual de 2º circulo; alvo ou area em alcance", element: "Morte", image: "ritual-tempo" },
  "Velocidade Mortal": { cost: "2 PE", damage: "Aumenta velocidade/acoes", requirement: "Ritual de 2º circulo; criatura voluntaria ou si mesmo", element: "Energia", image: "ritual-velocidade" },
  "Vomitar Pestes": { cost: "2 PE", damage: "Area nociva", requirement: "Ritual de 2º circulo; area proxima e manifestacao fisica", element: "Sangue", image: "ritual-praga" }
};

catalog.nex = [
  "5%", "10%", "15%", "20%", "25%", "30%", "35%", "40%", "45%", "50%",
  "55%", "60%", "65%", "70%", "75%", "80%", "85%", "90%", "95%", "99%"
].map((name) => ({ name, type: "NEX", desc: `Marco de evolucao ${name}. Libera habilidades e rituais compativeis com este patamar.` }));

const nexProgression = [
  { nex: 5, gains: ["Inicio da ficha: origem, classe e trilha escolhidas.", "Recursos base da classe entram na ficha.", "Conjuradores liberam rituais de 1 circulo."] },
  { nex: 10, gains: ["Ganha os pontos de recurso do marco.", "Habilidade inicial de trilha, quando aplicavel pela mesa.", "Catalogo passa a considerar NEX 10%."] },
  { nex: 15, gains: ["Ganha os pontos de recurso do marco.", "Escolha 1 poder da sua classe, se a classe permitir.", "Catalogo de poderes filtra por classe e NEX."] },
  { nex: 20, gains: ["Ganha os pontos de recurso do marco.", "Aumento de atributo: +1 ponto em um atributo permitido.", "PE por rodada aumenta em +1."] },
  { nex: 25, gains: ["Ganha os pontos de recurso do marco.", "Conjuradores liberam rituais de 2 circulo.", "Novas opcoes de classe podem aparecer no catalogo."] },
  { nex: 30, gains: ["Ganha os pontos de recurso do marco.", "Novo poder/melhoria de classe conforme classe e catalogo.", "Revisar ataques, pericias e itens ativos."] },
  { nex: 35, gains: ["Ganha os pontos de recurso do marco.", "Grau de treinamento: melhore pericias conforme a regra da mesa.", "Recalculo de bonus de pericia fica disponivel."] },
  { nex: 40, gains: ["Ganha os pontos de recurso do marco.", "Habilidade de trilha.", "PE por rodada aumenta em +1."] },
  { nex: 45, gains: ["Ganha os pontos de recurso do marco.", "Novo poder/melhoria de classe conforme classe e catalogo.", "Recalculo completo de PV, PE, SAN, defesa e esquiva."] },
  { nex: 50, gains: ["Ganha os pontos de recurso do marco.", "Versatilidade: escolha recurso de outra trilha conforme regra da mesa.", "Atualize habilidades/talentos da ficha."] },
  { nex: 55, gains: ["Ganha os pontos de recurso do marco.", "Conjuradores liberam rituais de 3 circulo.", "Rituais disponiveis sao filtrados pelo novo limite."] },
  { nex: 60, gains: ["Ganha os pontos de recurso do marco.", "Novo poder/melhoria de classe conforme classe e catalogo.", "PE por rodada aumenta em +1."] },
  { nex: 65, gains: ["Ganha os pontos de recurso do marco.", "Habilidade superior de trilha.", "Atualize ataques, rituais e itens que dependem da trilha."] },
  { nex: 70, gains: ["Ganha os pontos de recurso do marco.", "Recalculo de limite de sobrevivencia da ficha.", "Revise protecao, carga e equipamentos ativos."] },
  { nex: 75, gains: ["Ganha os pontos de recurso do marco.", "Novo poder/melhoria de classe conforme classe e catalogo.", "Catalogo libera opcoes de alto NEX."] },
  { nex: 80, gains: ["Ganha os pontos de recurso do marco.", "PE por rodada aumenta em +1.", "Marco alto: revisar efeitos ativos e consequencias narrativas."] },
  { nex: 85, gains: ["Ganha os pontos de recurso do marco.", "Conjuradores liberam rituais de 4 circulo.", "Rituais extremos entram no catalogo se a ficha puder conjurar."] },
  { nex: 90, gains: ["Ganha os pontos de recurso do marco.", "Novo poder/melhoria de classe conforme classe e catalogo.", "Atualize poderes finais e preparacao de combate."] },
  { nex: 95, gains: ["Ganha os pontos de recurso do marco.", "Marco final antes do limite.", "Revise toda a ficha: pericias, recursos, inventario e rituais."] },
  { nex: 99, gains: ["Ganha os pontos de recurso do marco.", "Habilidade final de classe/trilha, quando aplicavel.", "Ocultistas podem acessar Canalizar o Medo quando aplicavel."] }
];

catalog.nex.forEach((entry) => {
  const step = nexProgression.find((item) => item.nex === parseNex(entry.name));
  if (step) entry.desc = `Marco de evolucao ${entry.name}. Ganhos: ${step.gains.join("; ")}.`;
});

catalog.abilities.push(
  { name: "Poder de Combatente", type: "Escolha de NEX", className: "Combatente", nex: 15, desc: "Escolha um poder de combatente compativel com o conceito do personagem." },
  { name: "Aumento de Atributo", type: "Escolha de NEX", allClasses: true, nex: 20, desc: "Aumenta um atributo permitido pela evolucao do personagem." },
  { name: "Grau de Treinamento", type: "Escolha de NEX", allClasses: true, nex: 35, desc: "Melhora o nivel de treinamento em pericias conforme a progressao." },
  { name: "Versatilidade", type: "Escolha de NEX", allClasses: true, nex: 50, desc: "Permite aprender recurso de outra trilha ou ampliar a flexibilidade da ficha." },
  { name: "Ataque Extra", type: "Poder de classe", className: "Combatente", nex: 40, desc: "Permite atacar mais de uma vez em uma rodada gastando energia." },
  { name: "Contra-Ataque", type: "Poder de classe", className: "Combatente", nex: 30, desc: "Transforma defesa bem-sucedida em abertura para responder ao inimigo." },
  { name: "Golpe Demolidor", type: "Poder de classe", className: "Combatente", nex: 45, desc: "Aumenta o impacto de ataques fortes contra alvos resistentes." },
  { name: "Especialista em Arma", type: "Poder de classe", className: "Combatente", nex: 30, desc: "Aprimora o uso de um grupo de armas escolhido." },
  { name: "Tecnica Secreta", type: "Habilidade de trilha", className: "Combatente", pathName: "Aniquilador", nex: 40, desc: "Adiciona modificacoes especiais a arma favorita." },
  { name: "Maestria", type: "Habilidade de trilha", className: "Combatente", pathName: "Aniquilador", nex: 65, desc: "Eleva a arma favorita ao centro do estilo de combate." },
  { name: "Estrategia", type: "Habilidade de trilha", className: "Combatente", pathName: "Comandante de Campo", nex: 40, desc: "Cria vantagem tatica para aliados em momentos decisivos." },
  { name: "Brecha na Guarda", type: "Habilidade de trilha", className: "Combatente", pathName: "Guerreiro", nex: 40, desc: "Explora erros do inimigo em combate corpo a corpo." },
  { name: "Surto de Adrenalina", type: "Habilidade de trilha", className: "Combatente", pathName: "Operacoes Especiais", nex: 40, desc: "Ganha explosao de acao e movimento em cenas de risco." },
  { name: "Tanque de Guerra", type: "Habilidade de trilha", className: "Combatente", pathName: "Tropa de Choque", nex: 40, desc: "Aguenta mais dano e sustenta a linha de frente." },
  { name: "Poder de Especialista", type: "Escolha de NEX", className: "Especialista", nex: 15, desc: "Escolha um poder de especialista compativel com a funcao da ficha." },
  { name: "Conhecimento Aplicado", type: "Poder de classe", className: "Especialista", nex: 25, desc: "Usa preparo e raciocinio para melhorar testes de pericia." },
  { name: "Pericia Favorita", type: "Poder de classe", className: "Especialista", nex: 30, desc: "Aprimora uma pericia central para o personagem." },
  { name: "Mestre em Pericia", type: "Poder de classe", className: "Especialista", nex: 45, desc: "Eleva resultados de uma area na qual o personagem se destaca." },
  { name: "Assassinar", type: "Habilidade de trilha", className: "Especialista", pathName: "Infiltrador", nex: 40, desc: "Aumenta o impacto contra alvos vulneraveis ou surpreendidos." },
  { name: "Primeiros Socorros", type: "Habilidade de trilha", className: "Especialista", pathName: "Medico de Campo", nex: 40, desc: "Recupera aliados rapidamente em situacoes de emergencia." },
  { name: "Discurso Motivador", type: "Habilidade de trilha", className: "Especialista", pathName: "Negociador", nex: 40, desc: "Usa presenca e fala para sustentar o grupo." },
  { name: "Preparado para Tudo", type: "Habilidade de trilha", className: "Especialista", pathName: "Tecnico", nex: 40, desc: "Tem resposta pratica para problemas de equipamento e improviso." },
  { name: "Poder de Ocultista", type: "Escolha de NEX", className: "Ocultista", nex: 15, desc: "Escolha um poder de ocultista ligado ao estudo ou pratica paranormal." },
  { name: "Ritual Potente", type: "Poder de classe", className: "Ocultista", nex: 25, desc: "Aumenta a potencia de efeitos de ritual quando aplicavel." },
  { name: "Especialista em Elemento", type: "Poder de classe", className: "Ocultista", nex: 30, desc: "Aprofunda afinidade com um elemento paranormal escolhido." },
  { name: "Mestre em Elemento", type: "Poder de classe", className: "Ocultista", nex: 60, desc: "Aumenta o dominio sobre rituais de um elemento escolhido." },
  { name: "Canalizar o Medo", type: "Habilidade de classe", className: "Ocultista", nex: 99, desc: "Usa conexao extrema com o paranormal para feitos raros e perigosos." },
  { name: "Conjuracao Ampliada", type: "Habilidade de trilha", className: "Ocultista", pathName: "Conduite", nex: 40, desc: "Melhora alcance ou area de rituais conforme a cena." },
  { name: "Sangue de Ferro", type: "Habilidade de trilha", className: "Ocultista", pathName: "Flagelador", nex: 40, desc: "Transforma ferimentos em combustivel para resistir e conjurar." },
  { name: "Saber Oculto", type: "Habilidade de trilha", className: "Ocultista", pathName: "Graduado", nex: 40, desc: "Expande repertorio e leitura de rituais conhecidos." },
  { name: "Mente Sa", type: "Habilidade de trilha", className: "Ocultista", pathName: "Intuitivo", nex: 40, desc: "Resiste melhor aos custos mentais do paranormal." },
  { name: "Gladiador Paranormal", type: "Habilidade de trilha", className: "Ocultista", pathName: "Lamina Paranormal", nex: 40, desc: "Integra ritual e combate armado em uma mesma ofensiva." }
);

catalog.abilities.forEach((entry) => {
  if (entry.type === "Combatente") entry.className = "Combatente";
  if (entry.type === "Especialista") entry.className = "Especialista";
  if (entry.type === "Ocultista") entry.className = "Ocultista";
  if (!entry.nex && !entry.origin) entry.nex = 5;
});

catalog.rituals.push(
  { name: "Descarnar", type: "Ritual", desc: "Rasga carne e causa dano intenso em uma criatura." },
  { name: "Distorcer Aparencia", type: "Ritual", desc: "Altera a aparencia de uma criatura por meio paranormal." },
  { name: "Invadir Mente", type: "Ritual", desc: "Forca contato mental e extrai informacoes ou sensacoes." },
  { name: "Paradoxo", type: "Ritual", desc: "Dobra causalidade ao redor de uma criatura ou cena." },
  { name: "Salto Fantasma", type: "Ritual", desc: "Move o conjurador por um deslocamento sobrenatural." },
  { name: "Chamas do Caos", type: "Ritual", desc: "Manifesta fogo paranormal instavel em area ou alvo." },
  { name: "Teletransporte", type: "Ritual", desc: "Desloca o conjurador ou alvo para outro ponto conhecido." },
  { name: "Controle Mental", type: "Ritual", desc: "Pressiona a mente de uma criatura e tenta comandar suas acoes." },
  { name: "Inexistir", type: "Ritual", desc: "Apaga temporariamente a presenca ou existencia de um alvo." },
  { name: "Convocacao Instantanea", type: "Ritual", desc: "Traz um objeto ou presenca preparada para a cena." },
  { name: "Fim Inevitavel", type: "Ritual", desc: "Invoca efeito devastador ligado ao colapso e ao fim." }
);

Object.assign(catalogStats, {
  Descarnar: { cost: "3 PE", damage: "Dano alto de Sangue", requirement: "Ritual de 2º circulo; alvo em alcance e gestos violentos", element: "Sangue", image: "ritual-dano" },
  "Distorcer Aparencia": { cost: "3 PE", damage: "Disfarce/alteracao", requirement: "Ritual de 2º circulo; alvo tocado ou si mesmo", element: "Conhecimento", image: "ritual-mente" },
  "Invadir Mente": { cost: "6 PE", damage: "Efeito mental", requirement: "Ritual de 3º circulo; alvo perceptivel e disputa mental", element: "Conhecimento", image: "ritual-mente" },
  Paradoxo: { cost: "6 PE", damage: "Efeito temporal", requirement: "Ritual de 3º circulo; area ou alvo em alcance", element: "Morte", image: "ritual-tempo" },
  "Salto Fantasma": { cost: "6 PE", damage: "Movimento paranormal", requirement: "Ritual de 3º circulo; ponto de destino perceptivel", element: "Energia", image: "ritual-velocidade" },
  "Chamas do Caos": { cost: "6 PE", damage: "Fogo paranormal em area", requirement: "Ritual de 3º circulo; ponto dentro do alcance", element: "Energia", image: "ritual-dano" },
  Teletransporte: { cost: "10 PE", damage: "Deslocamento extremo", requirement: "Ritual de 4º circulo; destino conhecido ou preparado", element: "Energia", image: "ritual-velocidade" },
  "Controle Mental": { cost: "10 PE", damage: "Comando mental", requirement: "Ritual de 4º circulo; alvo consciente e resistencia mental", element: "Conhecimento", image: "ritual-mente" },
  Inexistir: { cost: "10 PE", damage: "Apagamento paranormal", requirement: "Ritual de 4º circulo; alvo em alcance e forte conexao ocultista", element: "Conhecimento", image: "ritual-dano" },
  "Convocacao Instantanea": { cost: "10 PE", damage: "Convocacao preparada", requirement: "Ritual de 4º circulo; vinculo ou preparacao previa", element: "Conhecimento", image: "ritual-protecao" },
  "Fim Inevitavel": { cost: "10 PE", damage: "Dano devastador", requirement: "Ritual de 4º circulo; cena de alto risco e manifestacao intensa", element: "Morte", image: "ritual-dano" }
});

catalog.rituals.forEach((entry) => {
  entry.circle = Number((catalogStats[entry.name]?.requirement || "").match(/(\d)/)?.[1] || 1);
  entry.nex = ritualNexRequirement(entry.circle);
});

function readJsonStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn(`[Storage] Nao consegui ler ${key}.`, error);
    return null;
  }
}

function safeSetLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`[Storage] Falha ao salvar ${key}.`, error);
    if (error?.name === "QuotaExceededError" || String(error?.message || "").toLowerCase().includes("quota")) {
      try {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        localStorage.setItem(key, value);
        setSyncStatus("LocalStorage cheio. Limpei o arquivo local antigo e mantive a sessao leve.", true);
        return true;
      } catch (retryError) {
        console.warn("[Storage] Mesmo depois da limpeza nao foi possivel salvar a sessao leve.", retryError);
      }
    }
    return false;
  }
}

function dndLayoutSettings() {
  const settings = readJsonStorage(DND_LAYOUT_STORAGE_KEY) || {};
  return {
    x: Number(settings.x) || 0,
    y: Number(settings.y) || 0
  };
}

function lightLocalState() {
  const user = currentUser();
  return {
    user_id: uuidOrNull(state.currentUserId) || "",
    username: user?.username || "",
    email: user?.email || "",
    role: normalizeRole(user?.role || "player"),
    sheet_ids: user?.sheetIds || [],
    campaign_ids: user?.campaignIds || [],
    active_campaign_id: uuidOrNull(state.activeCampaignId) || "",
    active_character_id: uuidOrNull(state.activeSheetId) || "",
    active_session_id: uuidOrNull(state.activeSessionId) || state.activeSessionId || "",
    active_tab: state.activeTab || "mesa",
    current_mode: state.currentMode || "player",
    saved_at: new Date().toISOString()
  };
}

function saveLightSession() {
  safeSetLocalStorage(SESSION_STORAGE_KEY, JSON.stringify(lightLocalState()));
}

function applyLightSession(session) {
  if (!session || typeof session !== "object") return;
  state.currentUserId = uuidOrNull(session.user_id) || state.currentUserId;
  state.activeCampaignId = uuidOrNull(session.active_campaign_id) || state.activeCampaignId;
  state.activeSheetId = uuidOrNull(session.active_character_id) || state.activeSheetId;
  state.activeSessionId = session.active_session_id || state.activeSessionId;
  state.activeTab = session.active_tab || state.activeTab;
  state.currentMode = session.current_mode || state.currentMode;
  if (uuidOrNull(session.user_id) && !state.accounts.some((account) => account.id === session.user_id)) {
    state.accounts.push({
      id: session.user_id,
      username: session.username || "agente",
      email: session.email || "",
      role: normalizeRole(session.role || "player"),
      sheetIds: session.sheet_ids || [],
      campaignIds: session.campaign_ids || [],
      online: true
    });
  }
}

function load() {
  const legacy = readJsonStorage(LEGACY_STORAGE_KEY);
  const session = readJsonStorage(SESSION_STORAGE_KEY);
  if (legacy && (legacy.sheets || legacy.campaigns || legacy.accounts)) {
    Object.assign(state, legacy);
    state.hasLegacyLocalState = true;
  } else {
    state.tokens = [];
    state.sheets = [];
  }
  applyLightSession(session);
  state.currentMode = state.currentMode || "player";
  state.activeTab = state.activeTab || "mesa";
  state.archiveName = state.archiveName || "arquivos";
  state.campaignName = state.campaignName || "Mesa de combate";
  state.map = normalizeMap(state.map);
  state.accounts = Array.isArray(state.accounts) ? state.accounts : [];
  state.campaigns = Array.isArray(state.campaigns) ? state.campaigns : [];
  state.campaigns.forEach((campaign) => {
    campaign.sessoes?.forEach((session) => {
      session.mapa = normalizeMap(session.mapa);
    });
  });
  ensureAuthSeed();
  ensureDefaultCampaign();
  state.sheets = state.sheets.map(normalizeSheet);
  const user = currentUser();
  if (!state.activeSheetId && user?.sheetIds?.length) state.activeSheetId = user.sheetIds[0];
  if (!state.activeSheetId && state.sheets[0]) state.activeSheetId = state.sheets[0].id;
}

function ensureAuthSeed() {
  const admin = state.accounts.find((account) => account.username === "admin");
  if (!admin) {
    state.accounts.push({
      id: "admin-master",
      username: "admin",
      email: "admin@arquivos.local",
      password: "arquivo0001",
      role: "admin",
      sheetIds: [],
      campaignIds: []
    });
  } else if (!admin.email) {
    admin.email = "admin@arquivos.local";
  }
}

function ensureDefaultCampaign() {
  const admin = state.accounts.find((account) => account.username === "admin");
  if (!state.campaigns.length && admin) {
    const campaign = createCampaignRecord("Mesa de combate", admin.id);
    state.campaigns.push(campaign);
    admin.campaignIds = Array.from(new Set([...(admin.campaignIds || []), campaign.id]));
    state.activeCampaignId = campaign.id;
    state.activeSessionId = campaign.sessoes[0].id;
  }
}

function formatArquivoNumber(numero) {
  return `arquivo ${String(numero).padStart(4, "0")}`;
}

function createCampaignRecord(nome, mestreId, systemId = "arquivo") {
  const id = crypto.randomUUID();
  const campaignName = nome || "Campanha sem nome";
  const system = systemFor(systemId);
  const session = createSessionRecord(id, 1, "Arquivo inicial", "Arquivo aberto para a primeira sessao.", blankMap("Mapa inicial"));
  const inviteCode = `CAMP-${Math.floor(1000 + Math.random() * 9000)}`;
  return {
    id,
    nome: campaignName,
    mestreId,
    sistemaRegra: system.id,
    sistema_regra: system.id,
    themeKey: system.tema,
    theme_key: system.tema,
    jogadores: [],
    personagens: [],
    sessoes: [session],
    inviteCode,
    codigoConvite: inviteCode
  };
}

function createSessionRecord(campaignId, numero, titulo, resumo = "", map = blankMap("Mapa inicial")) {
  return {
    id: crypto.randomUUID(),
    campaignId,
    numero,
    codigoArquivo: formatArquivoNumber(numero),
    titulo: titulo || `Sessao ${numero}`,
    dataCriacao: new Date().toLocaleDateString("pt-BR"),
    resumo,
    mission: resumo,
    privateNote: "",
    publicText: "",
    publicImage: "",
    publicAudio: "",
    mapa: { ...map },
    tokens: [],
    anotacoes: [],
    pistas: [],
    chat: [],
    soundtracks: [],
    soundtrackVolume: 70,
    soundtrackCommand: null,
    logs: [],
    status: numero === 1 ? "ativa" : "pendente",
    visibleToPlayers: numero === 1,
    playersCanSeeNotes: true,
    playersCanSeeHistory: true
  };
}

function defaultMapBackground() {
  return {
    src: "",
    scaleX: 100,
    scaleY: 100,
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 82,
    locked: false
  };
}

function defaultFog() {
  return {
    enabled: false,
    mode: "manual",
    keepExplored: true,
    revealed: [],
    visible: []
  };
}

function normalizeMap(map = {}) {
  const fog = { ...defaultFog(), ...(map.fog || {}) };
  const cols = clamp(Number(map.cols), 6, 100);
  const rows = clamp(Number(map.rows), 6, 100);
  return {
    name: map.name || "Mapa inicial",
    cols,
    rows,
    darkness: clamp(Number(map.darkness ?? 50), 0, 90),
    lightsOn: map.lightsOn !== false,
    cellSize: clamp(Number(map.cellSize ?? 48), 18, 64),
    tokenScale: clamp(Number(map.tokenScale ?? 100), 70, 145),
    gridOffsetX: clamp(Number(map.gridOffsetX ?? 0), -100, 100),
    gridOffsetY: clamp(Number(map.gridOffsetY ?? 0), -100, 100),
    gridOpacity: clamp(Number(map.gridOpacity ?? 38), 0, 100),
    gridColor: map.gridColor || "#debc79",
    snap: map.snap !== false,
    coordinates: map.coordinates === true,
    thickEvery: clamp(Number(map.thickEvery ?? 5), 0, 20),
    background: { ...defaultMapBackground(), ...(map.background || {}) },
    fog: {
      enabled: fog.enabled === true,
      mode: fog.mode === "vision" ? "vision" : "manual",
      keepExplored: fog.keepExplored !== false,
      revealed: Array.isArray(fog.revealed) ? Array.from(new Set(fog.revealed)) : [],
      visible: Array.isArray(fog.visible) ? Array.from(new Set(fog.visible)) : []
    },
    marks: Array.isArray(map.marks) ? map.marks.filter((mark) => Number.isFinite(Number(mark.x)) && Number.isFinite(Number(mark.y))).map((mark) => ({
      x: clamp(Number(mark.x), 0, Number(map.cols || 16) - 1),
      y: clamp(Number(mark.y), 0, Number(map.rows || 12) - 1),
      type: mark.type === "door" ? "door" : "wall",
      open: mark.open === true
    })) : [],
    edges: normalizeMapEdges(map.edges, cols, rows),
    tool: ["move", "reveal", "hide", "wall", "door", "erase"].includes(map.tool) ? map.tool : "move"
  };
}

function normalizeMapEdges(edges, cols, rows) {
  if (!Array.isArray(edges)) return [];
  return edges
    .filter((edge) => Number.isFinite(Number(edge.x1)) && Number.isFinite(Number(edge.y1)) && Number.isFinite(Number(edge.x2)) && Number.isFinite(Number(edge.y2)))
    .map((edge) => ({
      id: edge.id || crypto.randomUUID(),
      x1: clamp(Number(edge.x1), 0, cols),
      y1: clamp(Number(edge.y1), 0, rows),
      x2: clamp(Number(edge.x2), 0, cols),
      y2: clamp(Number(edge.y2), 0, rows),
      type: edge.type === "door" ? "door" : "wall",
      state: ["open", "closed", "locked", "secret"].includes(edge.state) ? edge.state : edge.open === true ? "open" : "closed",
      secret: edge.secret === true
    }))
    .filter((edge) => edge.x1 !== edge.x2 || edge.y1 !== edge.y2);
}

function blankMap(name = "Mapa inicial") {
  console.log("Grid padrao criado: 17x32");
  return normalizeMap({ name, cols: 32, rows: 17, darkness: 50, lightsOn: true });
}

function currentUser() {
  return state.accounts.find((account) => account.id === state.currentUserId) || null;
}

function currentCampaign() {
  return state.campaigns.find((campaign) => campaign.id === state.activeCampaignId) || state.campaigns[0] || null;
}

function currentSession() {
  const campaign = currentCampaign();
  return campaign?.sessoes.find((session) => session.id === state.activeSessionId) || campaign?.sessoes[0] || null;
}

function normalizeSystemId(systemId) {
  const clean = normalizeKey(systemId || "arquivo").replace(/[^a-z0-9]/g, "");
  if (clean === "dnd" || clean === "dnd5" || clean === "dnd5e") return "dnd5e";
  if (clean === "custom" || clean === "sistemaproprio" || clean === "personalizado") return "personalizado";
  return RPG_SYSTEMS[clean] ? clean : "arquivo";
}

function systemFor(value) {
  return RPG_SYSTEMS[normalizeSystemId(value)] || RPG_SYSTEMS.arquivo;
}

function activeCampaignSystemId() {
  if (state.currentMode === "sheet") {
    const activeSheet = state.sheets.find((sheet) => sheet.id === state.activeSheetId);
    if (activeSheet) return sheetSystemId(activeSheet);
  }
  const campaign = currentCampaign();
  return normalizeSystemId(campaign?.payload?.sistema_regra || campaign?.payload?.sistemaRegra || campaign?.sistemaRegra || campaign?.sistema_regra || campaign?.system || "arquivo");
}

function campaignSystemId(campaign = currentCampaign()) {
  return normalizeSystemId(campaign?.payload?.sistema_regra || campaign?.payload?.sistemaRegra || campaign?.sistemaRegra || campaign?.sistema_regra || campaign?.system || "arquivo");
}

function sheetSystemId(sheet) {
  return normalizeSystemId(sheet?.payload?.sistema_regra || sheet?.payload?.sistemaRegra || sheet?.sistemaRegra || sheet?.sistema_regra || sheet?.system || "arquivo");
}

function sheetMatchesCampaign(sheet, campaign = currentCampaign()) {
  if (!sheet || !campaign) return true;
  return sheetSystemId(sheet) === campaignSystemId(campaign);
}

function sheetOrigin(sheet) {
  return normalizeKey(sheet?.origem || sheet?.origin || sheet?.payload?.origem || "jogador");
}

function sheetCampaignIdValue(sheet) {
  return uuidOrNull(sheet?.campanhaId || sheet?.campanha_id || sheet?.campaignId || sheet?.payload?.campanha_id) || sheetCampaignId(sheet?.id);
}

function sheetVisibleToCurrentUser(sheet, campaign = currentCampaign()) {
  const user = currentUser();
  if (!sheet || !user) return false;
  if (isMasterMode()) return !campaign || sheetCampaignIdValue(sheet) === campaign.id || (campaign.personagens || []).includes(sheet.id);
  if ((user.sheetIds || []).includes(sheet.id)) return true;
  const campaignId = campaign?.id || state.activeCampaignId;
  const sheetCampaign = sheetCampaignIdValue(sheet);
  const responsible = uuidOrNull(sheet.responsavelId || sheet.responsavel_id);
  const owner = uuidOrNull(sheet.ownerId || sheet.owner_id);
  if (sheetCampaign && campaignId && sheetCampaign !== campaignId) return false;
  return responsible === user.id || owner === user.id;
}

function activeVisualSystemId() {
  const activeSheet = state.sheets.find((sheet) => sheet.id === state.activeSheetId);
  if ((state.currentMode === "sheet" || state.activeTab === "fichas") && activeSheet) {
    return sheetSystemId(activeSheet);
  }
  return activeCampaignSystemId();
}

function compatibleSheetsForCampaign(campaign = currentCampaign(), sheets = state.sheets) {
  const systemId = campaignSystemId(campaign);
  return (sheets || []).map(normalizeSheet).filter((sheet) => sheetSystemId(sheet) === systemId);
}

function systemMismatchMessage(sheet, campaign = currentCampaign()) {
  return `Essa ficha e de ${systemFor(sheetSystemId(sheet)).nome}, mas a campanha e de ${systemFor(campaignSystemId(campaign)).nome}. Use uma ficha do mesmo sistema.`;
}

function applyCampaignTheme() {
  const systemId = activeVisualSystemId();
  const isDnd = systemId === "dnd5e";
  document.body.classList.toggle("theme-dnd5e", isDnd);
  document.body.classList.toggle("theme-dnd", isDnd);
  document.body.classList.toggle("campaign-dnd", isDnd);
  document.body.dataset.campaignSystem = systemId;
}

function clearCampaignTheme() {
  document.body.classList.remove("theme-dnd5e", "theme-dnd", "campaign-dnd");
  delete document.body.dataset.campaignSystem;
}

function selectedSystemValue(selector, fallback = "") {
  const field = document.querySelector(selector);
  const value = field?.value || field?.dataset.selectedSystem || fallback || activeCampaignSystemId() || "arquivo";
  return normalizeSystemId(value);
}

function createAccount(username, email, password, confirmPassword = password) {
  const cleanUser = username.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanUser || !cleanEmail || !password) throw new Error("Informe usuario, email e senha.");
  if (!isValidEmail(cleanEmail)) throw new Error("Informe um email valido.");
  if (password.length < 4) throw new Error("A senha precisa ter pelo menos 4 caracteres.");
  if (password !== confirmPassword) throw new Error("As senhas nao conferem.");
  if (state.accounts.some((account) => account.username.toLowerCase() === cleanUser.toLowerCase())) {
    throw new Error("Esse usuario ja existe.");
  }
  if (state.accounts.some((account) => account.email?.toLowerCase() === cleanEmail)) {
    throw new Error("Esse email ja esta cadastrado.");
  }
  const account = {
    id: crypto.randomUUID(),
    username: cleanUser,
    email: cleanEmail,
    password,
    role: "player",
    sheetIds: [],
    campaignIds: []
  };
  state.accounts.push(account);
  state.currentUserId = account.id;
  return account;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function loginAccount(username, password) {
  const account = state.accounts.find((item) => item.username.toLowerCase() === username.trim().toLowerCase() && item.password === password);
  if (!account) throw new Error("Credenciais invalidas.");
  state.currentUserId = account.id;
  return account;
}

let onlineSaveTimer = null;
let onlineSaveRunning = false;
let onlineLoadRunning = false;
let gridSyncTimer = null;
let gridSyncRunning = false;
let lastLocalGridChangeAt = 0;
let lastAppliedGridUpdate = "";
let gridRealtimeChannel = null;
let sheetRealtimeChannel = null;
let campaignRealtimeChannel = null;
let tableSheetsRealtimeChannel = null;
let activeRealtimeKey = "";
const tokenSaveTimers = new Map();
const sheetSaveTimers = new Map();
const syncedGridTokenIds = new Set();
let suppressOnlineSave = false;
let backgroundLoadRunning = false;

function supabaseClient() {
  return window.arquivosSupabase || null;
}

function logSupabaseAvailability() {
  if (supabaseClient()) console.log("Supabase client disponível");
  else console.warn("Supabase client indisponível");
}

function setSyncStatus(message, isError = false) {
  if (els.syncStatus) {
    els.syncStatus.textContent = message;
    els.syncStatus.classList.toggle("sync-error", isError);
  }
  const portalStatus = document.querySelector("#portalLoadStatus");
  if (portalStatus) {
    portalStatus.textContent = message || "Pronto.";
    portalStatus.classList.toggle("sync-error", isError);
  }
  const method = isError ? "warn" : "log";
  console[method](`[Supabase] ${message}`);
}

function remoteErrorMessage(error) {
  return error?.message || error?.details || error?.hint || "Falha desconhecida no Supabase.";
}

function mergeUnique(values = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function uuidOrNull(value) {
  return isUuid(value) ? String(value) : null;
}

function normalizeRole(value) {
  const role = normalizeKey(value);
  if (role === "admin-master" || role === "adm" || role === "admin") return "admin";
  if (role === "mestre") return "master";
  if (role === "jogador") return "player";
  return role || "player";
}

function isOnlineUser(user) {
  return Boolean(user && isUuid(user.id));
}

async function hashPassword(password) {
  const text = String(password || "");
  if (!text) return "";
  if (window.crypto?.subtle) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return btoa(unescape(encodeURIComponent(text)));
}

function userFromRow(row) {
  if (!row) return null;
  const payload = row.payload || {};
  return {
    id: row.id || payload.id || crypto.randomUUID(),
    username: row.username || payload.username || row.email?.split("@")[0] || "agente",
    email: row.email || payload.email || "",
    role: normalizeRole(row.role || payload.role || "player"),
    sheetIds: row.sheet_ids || payload.sheetIds || payload.sheet_ids || [],
    campaignIds: row.campaign_ids || payload.campaignIds || payload.campaign_ids || [],
    passwordHash: row.password_hash || payload.password_hash || payload.passwordHash || "",
    online: true
  };
}

function isMissingColumnError(error) {
  const text = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`.toLowerCase();
  return text.includes("column") || text.includes("schema cache") || text.includes("could not find");
}

function isMissingRelationError(error) {
  const text = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`.toLowerCase();
  return text.includes("relation") || text.includes("does not exist") || text.includes("schema cache") || text.includes("on conflict") || text.includes("unique") || text.includes("constraint") || text.includes("row-level security") || text.includes("violates row-level");
}

function upsertLocalAccount(account) {
  const safeAccount = {
    id: account.id,
    username: account.username || account.email || "agente",
    email: account.email || "",
    password: account.password || "",
    role: normalizeRole(account.role || "player"),
    sheetIds: Array.isArray(account.sheetIds) ? account.sheetIds : [],
    campaignIds: Array.isArray(account.campaignIds) ? account.campaignIds : [],
    passwordHash: account.passwordHash || account.password_hash || "",
    online: account.online === true
  };
  const existing = state.accounts.findIndex((item) => item.id === safeAccount.id || item.email?.toLowerCase() === safeAccount.email.toLowerCase());
  if (existing >= 0) state.accounts[existing] = { ...state.accounts[existing], ...safeAccount };
  else state.accounts.push(safeAccount);
  return state.accounts.find((item) => item.id === safeAccount.id);
}

function normalizeCampaignRecord(campaign = {}) {
  const inviteCode = campaign.codigoConvite || campaign.codigo_convite || campaign.inviteCode || campaign.invite_code || `CAMP-${Math.floor(1000 + Math.random() * 9000)}`;
  const system = systemFor(campaign.payload?.sistema_regra || campaign.payload?.sistemaRegra || campaign.sistemaRegra || campaign.sistema_regra || campaign.system || "arquivo");
  const gridRows = clamp(Number(campaign.grid_rows ?? campaign.gridRows ?? campaign.payload?.grid?.rows ?? campaign.payload?.grid_rows ?? 17), 6, 100);
  const gridCols = clamp(Number(campaign.grid_cols ?? campaign.gridCols ?? campaign.payload?.grid?.cols ?? campaign.payload?.grid_cols ?? 32), 6, 100);
  const safe = {
    id: campaign.id || crypto.randomUUID(),
    nome: campaign.nome || campaign.name || "Campanha sem nome",
    mestreId: campaign.mestreId || campaign.owner_id || campaign.ownerId || "",
    sistemaRegra: system.id,
    sistema_regra: system.id,
    themeKey: campaign.themeKey || campaign.theme_key || system.tema,
    theme_key: campaign.theme_key || campaign.themeKey || system.tema,
    jogadores: Array.isArray(campaign.jogadores) ? campaign.jogadores : [],
    personagens: Array.isArray(campaign.personagens) ? campaign.personagens : [],
    sessoes: Array.isArray(campaign.sessoes) && campaign.sessoes.length ? campaign.sessoes : [createSessionRecord(campaign.id || crypto.randomUUID(), 1, "Arquivo inicial", "Arquivo aberto para a primeira sessao.", blankMap("Mapa inicial"))],
    inviteCode,
    codigoConvite: inviteCode,
    gridRows,
    gridCols,
    grid_rows: gridRows,
    grid_cols: gridCols,
    activeSceneId: campaign.activeSceneId || campaign.active_scene_id || campaign.payload?.activeSceneId || campaign.payload?.active_scene_id || ""
  };
  safe.sessoes = safe.sessoes.map((session, index) => ({
    ...createSessionRecord(safe.id, index + 1, session.titulo || `Sessao ${index + 1}`, session.resumo || "", normalizeMap(session.mapa || session.map || blankMap(session.titulo || "Mapa inicial"))),
    ...session,
    campaignId: safe.id,
    numero: Number(session.numero || index + 1),
    codigoArquivo: session.codigoArquivo || formatArquivoNumber(Number(session.numero || index + 1)),
    mapa: normalizeMap({ ...(session.mapa || session.map || {}), cols: gridCols, rows: gridRows }),
    tokens: Array.isArray(session.tokens) ? session.tokens : [],
    anotacoes: Array.isArray(session.anotacoes) ? session.anotacoes : [],
    pistas: Array.isArray(session.pistas) ? session.pistas : [],
    chat: Array.isArray(session.chat) ? session.chat : [],
    soundtracks: Array.isArray(session.soundtracks) ? session.soundtracks : [],
    soundtrackVolume: clamp(Number(session.soundtrackVolume ?? 70), 0, 100),
    soundtrackCommand: session.soundtrackCommand || null,
    logs: Array.isArray(session.logs) ? session.logs : []
  }));
  return safe;
}

function mergeById(localRows, remoteRows) {
  const map = new Map();
  [...(localRows || []), ...(remoteRows || [])].forEach((row) => {
    if (row?.id) map.set(row.id, { ...(map.get(row.id) || {}), ...row });
  });
  return Array.from(map.values());
}

async function safeSelect(table, columns = "*") {
  const client = supabaseClient();
  const { data, error } = await client.from(table).select(columns);
  if (error) {
    console.error("[Supabase] Erro Supabase", { table, columns, error });
    setSyncStatus(`Nao consegui ler ${table}: ${remoteErrorMessage(error)}`, true);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

async function createAccountOnline(username, email, password, confirmPassword = password) {
  const cleanUser = username.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanUser || !cleanEmail || !password) throw new Error("Informe usuario, email e senha.");
  if (!isValidEmail(cleanEmail)) throw new Error("Informe um email valido.");
  if (password.length < 4) throw new Error("A senha precisa ter pelo menos 4 caracteres.");
  if (password !== confirmPassword) throw new Error("As senhas nao conferem.");

  const client = supabaseClient();
  if (!client) throw new Error("Supabase nao carregou. O acesso sera apenas local.");

  console.log("[Supabase] Criando usuario no Supabase", { username: cleanUser, email: cleanEmail });
  setSyncStatus("Criando usuario no Supabase...");
  const existingUsers = await safeSelect("usuarios", "*");
  const existingRow = existingUsers.find((account) =>
    account.username?.toLowerCase() === cleanUser.toLowerCase() ||
    account.email?.toLowerCase() === cleanEmail
  );
  const passwordHash = await hashPassword(password);
  const userId = existingRow?.id || crypto.randomUUID();
  const accountData = {
    id: userId,
    username: existingRow?.username || cleanUser,
    email: existingRow?.email || cleanEmail,
    role: existingRow?.role || existingRow?.payload?.role || "player",
    sheetIds: existingRow?.sheet_ids || existingRow?.payload?.sheetIds || [],
    campaignIds: existingRow?.campaign_ids || existingRow?.payload?.campaignIds || [],
    passwordHash,
    online: true
  };
  await saveOnlineUser(accountData);
  const account = upsertLocalAccount(accountData);
  state.currentUserId = account.id;
  console.log(existingRow ? "[Supabase] Usuario carregado do Supabase" : "[Supabase] Usuario criado no Supabase", account);
  await migrateLocalWorkspaceToSupabase(account);
  await loadOnlineWorkspace();
  setSyncStatus(existingRow ? "Acesso existente carregado." : "Acesso online criado.");
  return account;
}

async function loginAccountOnline(username, password) {
  const identifier = username.trim();
  const client = supabaseClient();
  console.time("login_total");
  console.log("Iniciando login", { identifier });
  try {
    if (!client) throw new Error("Supabase nao carregou. Verifique sua conexao e recarregue a pagina.");
    if (!identifier || !password) throw new Error("Informe usuario/email e senha.");
    console.log("Buscando usuario", { identifier });
    setSyncStatus("Entrando pelo Supabase...");
    console.time("buscar_usuario");
    const { data, error } = await client
      .from("usuarios")
      .select("*")
      .or(`username.ilike.${identifier},email.ilike.${identifier}`)
      .limit(1);
    console.timeEnd("buscar_usuario");
    if (error) {
      console.error("[Supabase] Erro Supabase", { table: "usuarios", error });
      throw new Error(`usuarios: ${remoteErrorMessage(error)}`);
    }
    const userRow = Array.isArray(data) ? data[0] : null;
    if (!userRow) throw new Error("Usuario nao encontrado no Supabase.");
    console.log("Usuario encontrado", { id: userRow.id, username: userRow.username, role: userRow.role || userRow.payload?.role });
    const accountData = userFromRow(userRow);
    if (!isUuid(accountData.id)) {
      console.error("[Supabase] Erro Supabase", { table: "usuarios", motivo: "usuario.id nao e UUID", userRow, accountData });
      throw new Error("Usuario encontrado, mas o id salvo no Supabase nao e UUID valido.");
    }
    const passwordHash = await hashPassword(password);
    if (accountData.passwordHash && accountData.passwordHash !== passwordHash) throw new Error("Senha incorreta.");
    if (!accountData.passwordHash) {
      accountData.passwordHash = passwordHash;
      await saveOnlineUser(accountData);
    }
    const account = upsertLocalAccount(accountData);
    state.currentUserId = account.id;
    console.log("[Supabase] Usuario carregado do Supabase", account);
    console.log("[Supabase] currentUser.id", account.id);
    console.log("[Supabase] currentUser.role", normalizeRole(account.role));
    saveLightSession();
    setSyncStatus("Login confirmado. Carregando dados...");
    return account;
  } catch (error) {
    console.error("Erro no login", error);
    setSyncStatus(`Erro no login: ${error.message}`, true);
    throw error;
  } finally {
    console.timeEnd("login_total");
  }
}
async function saveOnlineUser(user = currentUser()) {
  const client = supabaseClient();
  if (!client || !isOnlineUser(user)) return;
  const now = new Date().toISOString();
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: normalizeRole(user.role || "player"),
    sheet_ids: user.sheetIds || [],
    campaign_ids: user.campaignIds || [],
    password_hash: user.passwordHash || user.password_hash || "",
    payload: {
      ...user,
      password_hash: user.passwordHash || user.password_hash || ""
    },
    updated_at: now
  };
  const { error } = await client.from("usuarios").upsert(payload, { onConflict: "id" });
  if (!error) return;
  if (isMissingColumnError(error)) {
    const fallback = { ...payload };
    delete fallback.password_hash;
    const retry = await client.from("usuarios").upsert(fallback, { onConflict: "id" });
    if (!retry.error) return;
    console.error("[Supabase] Erro Supabase", { table: "usuarios", payload: fallback, error: retry.error });
    throw new Error(`usuarios: ${remoteErrorMessage(retry.error)}`);
  }
  console.error("[Supabase] Erro Supabase", { table: "usuarios", payload, error });
  throw new Error(`usuarios: ${remoteErrorMessage(error)}`);
}

async function fetchUserCharacterRows(client, user) {
  if (!client || !isOnlineUser(user)) return { data: [], error: null };
  const query = `user_id.eq.${user.id},owner_id.eq.${user.id},responsavel_id.eq.${user.id}`;
  const result = await client.from("personagens").select("*").or(query);
  if (!result.error) return { data: Array.isArray(result.data) ? result.data : [], error: null };
  if (!isMissingColumnError(result.error)) return result;
  console.warn("[Supabase] Colunas de controle de ficha ainda ausentes. Usando user_id como fallback. Rode supabase-migration.sql.", result.error);
  return client.from("personagens").select("*").eq("user_id", user.id);
}

async function loadOnlineWorkspace() {
  const client = supabaseClient();
  const user = currentUser();
  if (!client || !isOnlineUser(user)) return;
  onlineLoadRunning = true;
  try {
    console.log("[Supabase] Usuario encontrado no Supabase", { id: user.id, username: user.username, role: normalizeRole(user.role) });
    console.log("[Supabase] currentUser.id", user.id);
    console.log("[Supabase] currentUser.role", normalizeRole(user.role));
    console.log("[Supabase] Carregando campanhas para user_id", user.id);
    setSyncStatus("Carregando arquivos online...");
    console.time("carregar_campanhas");
    console.time("carregar_personagens");
    const [
      ownedCampaignResult,
      inventoryResult,
      noteResult,
      rollResult
    ] = await Promise.all([
      client.from("campanhas").select("*").or(`owner_id.eq.${user.id},mestre_id.eq.${user.id}`),
      client.from("inventario").select("*").eq("user_id", user.id),
      client.from("anotacoes").select("*").eq("user_id", user.id),
      client.from("rolagens").select("*").eq("user_id", user.id)
    ]);
    const sheetResult = await fetchUserCharacterRows(client, user);
    console.timeEnd("carregar_personagens");
    console.timeEnd("carregar_campanhas");

    [
      ["campanhas", ownedCampaignResult],
      ["personagens", sheetResult],
      ["inventario", inventoryResult],
      ["anotacoes", noteResult],
      ["rolagens", rollResult]
    ].forEach(([table, result]) => {
      if (result.error) console.error("[Supabase] Erro Supabase", { table, user_id: user.id, error: result.error });
    });

    if (ownedCampaignResult.error) throw new Error(`campanhas: ${remoteErrorMessage(ownedCampaignResult.error)}`);
    if (sheetResult.error) throw new Error(`personagens: ${remoteErrorMessage(sheetResult.error)}`);

    const sheetRows = Array.isArray(sheetResult.data) ? sheetResult.data : [];
    const linkedCampaignIds = mergeUnique(sheetRows.map((row) => uuidOrNull(row.campanha_id)));
    let linkedCampaignRows = [];
    if (linkedCampaignIds.length) {
      const { data, error } = await client.from("campanhas").select("*").in("id", linkedCampaignIds);
      if (error) console.error("[Supabase] Erro Supabase", { table: "campanhas", linkedCampaignIds, error });
      else linkedCampaignRows = Array.isArray(data) ? data : [];
    }
    const campaignRows = mergeById(ownedCampaignResult.data || [], linkedCampaignRows);
    const inventoryRows = Array.isArray(inventoryResult.data) ? inventoryResult.data : [];
    const noteRows = Array.isArray(noteResult.data) ? noteResult.data : [];
    const rollRows = Array.isArray(rollResult.data) ? rollResult.data : [];

    const remoteCampaigns = campaignRows
      .map((row) => normalizeCampaignRecord({ ...(row.payload || {}), ...row, id: row.id }))
      .filter((campaign) => campaign.mestreId === user.id || campaign.jogadores.includes(user.id) || linkedCampaignIds.includes(campaign.id));
    const remoteSheets = sheetRows
      .map((row) => normalizeSheet({
        ...(row.payload || {}),
        id: row.id,
        user_id: row.user_id,
        owner_id: row.owner_id,
        responsavel_id: row.responsavel_id,
        origem: row.origem,
        edit_locked: row.edit_locked,
        edit_allowed_by_master: row.edit_allowed_by_master,
        download_allowed: row.download_allowed,
        migrada: row.migrada,
        migrated_to_personagem_id: row.migrated_to_personagem_id,
        campanha_id: row.campanha_id,
        name: row.payload?.name || row.nome || "",
        player: row.payload?.player || row.jogador || user.username || "Jogador"
      }))
      .filter((sheet) => {
        const row = sheetRows.find((item) => item.id === sheet.id);
        return (user.sheetIds || []).includes(sheet.id) ||
          row?.user_id === user.id ||
          row?.owner_id === user.id ||
          row?.responsavel_id === user.id;
      });

    state.campaigns = mergeById(state.campaigns, remoteCampaigns).map(normalizeCampaignRecord);
    state.sheets = mergeById(state.sheets, remoteSheets).map(normalizeSheet);

    const onlineSheetIds = sheetRows
      .filter((row) => row.user_id === user.id && normalizeKey(row.origem || row.payload?.origem || "jogador") !== "sessao")
      .map((row) => row.id)
      .filter(Boolean);
    user.sheetIds = mergeUnique([...(user.sheetIds || []), ...onlineSheetIds]);
    const onlineCampaignIds = campaignRows
      .filter((row) => row.owner_id === user.id || row.mestre_id === user.id || row.payload?.mestreId === user.id || row.payload?.jogadores?.includes(user.id) || linkedCampaignIds.includes(row.id))
      .map((row) => row.id)
      .filter(Boolean);
    user.campaignIds = mergeUnique([...(user.campaignIds || []), ...onlineCampaignIds, ...remoteCampaigns.map((campaign) => campaign.id)]);

    inventoryRows.forEach((row) => {
      const sheet = state.sheets.find((item) => item.id === row.personagem_id);
      if (sheet && row.payload?.inventoryText) sheet.inventory = row.payload.inventoryText;
    });
    noteRows.forEach((row) => {
      const sheet = state.sheets.find((item) => item.id === row.personagem_id);
      if (sheet && row.payload?.notesText) sheet.notes = row.payload.notesText;
    });
    const remoteRolls = rollRows
      .map((row) => row.payload || row)
      .filter((roll) => roll?.id)
      .sort((a, b) => String(b.created_at || b.at || "").localeCompare(String(a.created_at || a.at || "")));
    state.rolls = mergeById(state.rolls, remoteRolls).slice(0, 12);

    const activeSheetBelongsToUser = state.sheets.some((sheet) => sheet.id === state.activeSheetId && (user.sheetIds || []).includes(sheet.id));
    if (!activeSheetBelongsToUser && user.sheetIds?.length) state.activeSheetId = user.sheetIds[0];
    const activeCampaignBelongsToUser = state.campaigns.some((campaign) =>
      campaign.id === state.activeCampaignId &&
      (campaign.mestreId === user.id || (campaign.jogadores || []).includes(user.id) || (user.campaignIds || []).includes(campaign.id))
    );
    if (!activeCampaignBelongsToUser && user.campaignIds?.length) state.activeCampaignId = user.campaignIds[0];
    const campaign = currentCampaign();
    if (campaign && !state.activeSessionId) state.activeSessionId = campaign.sessoes[0]?.id || null;
    syncCurrentSession();
    saveLightSession();
  } finally {
    onlineLoadRunning = false;
  }
}

function queueOnlineSave(delay = 900) {
  if (onlineLoadRunning) return;
  const user = currentUser();
  if (!supabaseClient() || !isOnlineUser(user)) return;
  window.clearTimeout(onlineSaveTimer);
  onlineSaveTimer = window.setTimeout(() => {
    saveOnlineState().catch((error) => {
      const message = error.invalidCampaignId
        ? "Ficha salva apenas localmente porque a campanha nao foi encontrada no servidor."
        : `Backup local salvo. Supabase falhou: ${error.message}`;
      if (error.invalidCampaignId) console.warn("Backup local criado por falha no Supabase", error);
      setSyncStatus(message, true);
    });
  }, delay);
}

function markGridChanged(token = null, mode = "move") {
  lastLocalGridChangeAt = Date.now();
  syncCurrentSession();
  saveLightSession();
  const changedToken = token || state.tokens.find((item) => item.id === state.selectedToken);
  if (changedToken) queueGridTokenSave(changedToken, mode, mode === "move" ? 180 : 250);
}

function markMapStructureChanged() {
  lastLocalGridChangeAt = Date.now();
  syncCurrentSession();
  saveLightSession();
  console.log("Mestre alterou tamanho do grid", { rows: state.map.rows, cols: state.map.cols, campanha_id: state.activeCampaignId });
  queueOnlineSave(250);
}

function userCampaignsForSave(user) {
  if (!user) return [];
  return state.campaigns.filter((campaign) =>
    campaign.mestreId === user.id ||
    (user.campaignIds || []).includes(campaign.id) ||
    (campaign.jogadores || []).includes(user.id)
  );
}

function userSheetsForSave(user) {
  if (!user) return [];
  return state.sheets.filter((sheet) => (user.sheetIds || []).includes(sheet.id));
}

function campaignPayloadForSave(campaign) {
  const payload = normalizeCampaignRecord(campaign);
  payload.codigo_convite = payload.codigoConvite || payload.inviteCode;
  payload.invite_code = payload.inviteCode || payload.codigoConvite;
  payload.inviteCode = payload.inviteCode || payload.codigoConvite;
  const isActiveCampaign = campaign?.id === state.activeCampaignId;
  const session = campaign?.sessoes?.find((item) => isActiveCampaign && item.id === state.activeSessionId) || campaign?.sessoes?.[0];
  const map = normalizeMap(session?.mapa || (isActiveCampaign ? state.map : {}) || {});
  payload.grid = { rows: map.rows, cols: map.cols };
  payload.grid_rows = map.rows;
  payload.grid_cols = map.cols;
  payload.active_scene_id = session?.id || state.activeSessionId || "";
  return payload;
}

function campaignDatabaseRow(campaign, now = new Date().toISOString(), user = currentUser()) {
  const payload = campaignPayloadForSave(campaign);
  const ownerId = uuidOrNull(campaign.mestreId) || uuidOrNull(user?.id);
  const isActiveCampaign = campaign?.id === state.activeCampaignId;
  const session = campaign?.sessoes?.find((item) => isActiveCampaign && item.id === state.activeSessionId) || campaign?.sessoes?.[0];
  return {
    id: campaign.id,
    owner_id: ownerId,
    mestre_id: ownerId,
    nome: campaign.nome,
    invite_code: payload.invite_code,
    codigo_convite: payload.codigo_convite,
    grid_rows: payload.grid_rows || 17,
    grid_cols: payload.grid_cols || 32,
    active_scene_id: payload.active_scene_id || "",
    objetivo_atual: session?.mission || session?.resumo || "",
    local_atual: session?.mapa?.name || (isActiveCampaign ? state.map?.name : "") || "",
    payload,
    updated_at: now
  };
}

function sheetCampaignId(sheetId) {
  return state.campaigns.find((campaign) => (campaign.personagens || []).includes(sheetId))?.id || null;
}

function sheetDatabaseRow(sheet, user, now = new Date().toISOString()) {
  const safeSheet = normalizeSheet(sheet);
  const origin = safeSheet.origem || "jogador";
  const campaignId = uuidOrNull(safeSheet.campanha_id || safeSheet.campanhaId);
  const ownerId = uuidOrNull(safeSheet.owner_id || safeSheet.ownerId) || uuidOrNull(user.id);
  const responsibleId = uuidOrNull(safeSheet.responsavel_id || safeSheet.responsavelId) || uuidOrNull(user.id);
  return {
    id: safeSheet.id,
    user_id: origin === "sessao" ? responsibleId || ownerId : uuidOrNull(user.id),
    owner_id: ownerId,
    responsavel_id: responsibleId,
    campanha_id: campaignId,
    origem: origin,
    edit_locked: safeSheet.editLocked === true,
    edit_allowed_by_master: safeSheet.editAllowedByMaster === true,
    download_allowed: safeSheet.downloadAllowed === true,
    migrada: safeSheet.migrada === true,
    migrated_to_personagem_id: uuidOrNull(safeSheet.migratedToPersonagemId || safeSheet.migrated_to_personagem_id),
    sistema_regra: sheetSystemId(safeSheet),
    nome: safeSheet.name || "Agente",
    jogador: safeSheet.player || user.username || "",
    atributos: {
      agi: safeSheet.agi,
      for: safeSheet.str,
      int: safeSheet.int,
      pre: safeSheet.pre,
      vig: safeSheet.vig
    },
    pericias: {
      text: safeSheet.skills || "",
      mods: safeSheet.skillMods || {}
    },
    vida: {
      atual: safeSheet.hp,
      max: safeSheet.hpMax,
      pe: safeSheet.pe,
      peMax: safeSheet.peMax
    },
    sanidade: {
      atual: safeSheet.san,
      max: safeSheet.sanMax
    },
    payload: safeSheet,
    updated_at: now
  };
}

function minimalSheetDatabaseRow(row) {
  return {
    id: row.id,
    user_id: uuidOrNull(row.user_id),
    campanha_id: uuidOrNull(row.campanha_id),
    nome: row.nome,
    payload: row.payload,
    updated_at: row.updated_at
  };
}

async function campaignExistsInSupabase(campaignId) {
  const client = supabaseClient();
  const safeId = uuidOrNull(campaignId);
  console.log("Validando campanha antes de salvar personagem");
  console.log("campanha_id recebido:", safeId || campaignId || "");
  if (!client || !safeId) return false;
  const { data, error } = await client.from("campanhas").select("id,nome").eq("id", safeId).limit(1);
  if (error) {
    console.error("[Supabase] Erro ao validar campanha", error);
    return false;
  }
  const found = Array.isArray(data) ? data[0] : null;
  if (found) {
    console.log("Campanha encontrada no Supabase:", found);
    return true;
  }
  console.warn("Campanha nao encontrada:", safeId);
  return false;
}

async function filterValidCharacterRows(rows) {
  const validRows = [];
  const invalidRows = [];
  for (const row of rows) {
    const origin = normalizeKey(row.origem || row.payload?.origem || "jogador");
    const campaignId = uuidOrNull(row.campanha_id);
    if (!campaignId) {
      if (origin === "sessao") {
        console.warn("Bloqueado salvamento com campanha_id invalido", { ficha_id: row.id, origem: origin, campanha_id: row.campanha_id });
        invalidRows.push(row);
        continue;
      }
      console.log("Salvando ficha pessoal sem campanha_id", { ficha_id: row.id });
      validRows.push({ ...row, campanha_id: null });
      continue;
    }
    if (origin === "sessao") console.log("Salvando ficha da sessao com campanha_id:", campaignId);
    const exists = await campaignExistsInSupabase(campaignId);
    if (!exists) {
      console.warn("Bloqueado salvamento com campanha_id invalido", { ficha_id: row.id, campanha_id: campaignId });
      invalidRows.push(row);
      continue;
    }
    validRows.push({ ...row, campanha_id: campaignId });
  }
  return { validRows, invalidRows };
}

async function upsertSheetsOnline(rows) {
  const client = supabaseClient();
  if (!client || !rows.length) return;
  const { validRows, invalidRows } = await filterValidCharacterRows(rows);
  if (!validRows.length && invalidRows.length) {
    console.warn("Backup local criado por falha no Supabase", invalidRows.map((row) => row.id));
    const error = new Error("Ficha salva apenas localmente porque a campanha nao foi encontrada no servidor.");
    error.invalidCampaignId = true;
    throw error;
  }
  const { error } = await client.from("personagens").upsert(validRows, { onConflict: "id" });
  if (!error) {
    console.log("[Supabase] Ficha criada/atualizada no Supabase", validRows.map((row) => row.id));
    if (invalidRows.length) {
      console.warn("Backup local criado por falha no Supabase", invalidRows.map((row) => row.id));
      const invalidError = new Error("Ficha salva apenas localmente porque a campanha nao foi encontrada no servidor.");
      invalidError.invalidCampaignId = true;
      throw invalidError;
    }
    return;
  }
  if (isMissingColumnError(error)) {
    console.warn("[Supabase] Colunas completas de personagens ausentes. Usando fallback minimo. Rode supabase-migration.sql.", error);
    const fallback = await client.from("personagens").upsert(validRows.map(minimalSheetDatabaseRow), { onConflict: "id" });
    if (fallback.error) {
      console.error("[Supabase] Erro Supabase", { table: "personagens", rows: fallback, error: fallback.error });
      throw new Error(`personagens: ${remoteErrorMessage(fallback.error)}`);
    }
    if (invalidRows.length) {
      console.warn("Backup local criado por falha no Supabase", invalidRows.map((row) => row.id));
      const invalidError = new Error("Ficha salva apenas localmente porque a campanha nao foi encontrada no servidor.");
      invalidError.invalidCampaignId = true;
      throw invalidError;
    }
    return;
  }
  console.error("[Supabase] Erro Supabase", { table: "personagens", rows: validRows, error });
  throw new Error(`personagens: ${remoteErrorMessage(error)}`);
}

async function upsertCampaignsOnline(rows) {
  const client = supabaseClient();
  if (!client || !rows.length) return;
  const { error } = await client.from("campanhas").upsert(rows, { onConflict: "id" });
  if (!error) {
    console.log("[Supabase] Campanha criada/atualizada no Supabase", rows.map((row) => row.codigo_convite));
    console.log("Tamanho do grid salvo", rows.map((row) => ({ id: row.id, rows: row.grid_rows, cols: row.grid_cols })));
    return;
  }
  if (isMissingColumnError(error)) {
    console.warn("[Supabase] Colunas novas de campanha ausentes. Usando fallback minimo. Rode supabase-migration.sql.", error);
    const fallbackRows = rows.map((row) => {
      const safe = { ...row };
      delete safe.grid_rows;
      delete safe.grid_cols;
      delete safe.active_scene_id;
      return safe;
    });
    const retry = await client.from("campanhas").upsert(fallbackRows, { onConflict: "id" });
    if (!retry.error) return;
    console.error("[Supabase] Erro Supabase", { table: "campanhas", rows: fallbackRows, error: retry.error });
    throw new Error(`campanhas: ${remoteErrorMessage(retry.error)}`);
  }
  console.error("[Supabase] Erro Supabase", { table: "campanhas", rows, error });
  throw new Error(`campanhas: ${remoteErrorMessage(error)}`);
}

function localCampaignPlayers(campaign = currentCampaign()) {
  if (!campaign) return [];
  const ids = new Set([
    uuidOrNull(campaign.mestreId),
    ...(campaign.jogadores || []).map(uuidOrNull),
    ...state.sheets
      .filter((sheet) => sheetCampaignIdValue(sheet) === campaign.id || (campaign.personagens || []).includes(sheet.id))
      .flatMap((sheet) => [sheet.user_id, sheet.owner_id, sheet.responsavel_id, sheet.userId, sheet.ownerId, sheet.responsavelId].map(uuidOrNull))
  ].filter(Boolean));
  const saved = (state.campaignPlayers || []).filter((item) => item.campanha_id === campaign.id);
  saved.forEach((item) => ids.add(uuidOrNull(item.user_id)));
  return Array.from(ids).filter(Boolean).map((id) => {
    const savedRow = saved.find((item) => item.user_id === id) || {};
    const account = state.accounts.find((item) => item.id === id) || {};
    const linkedCount = state.sheets.filter((sheet) =>
      sheetCampaignIdValue(sheet) === campaign.id &&
      [sheet.user_id, sheet.owner_id, sheet.responsavel_id, sheet.userId, sheet.ownerId, sheet.responsavelId].map(uuidOrNull).includes(id)
    ).length;
    return {
      id: savedRow.id || `${campaign.id}:${id}`,
      campanha_id: campaign.id,
      user_id: id,
      username: account.username || account.email || savedRow.username || (id === campaign.mestreId ? "Mestre" : "Jogador"),
      email: account.email || "",
      role: id === campaign.mestreId ? "mestre" : (savedRow.role || "jogador"),
      status: savedRow.status || "ativo",
      linkedCount
    };
  });
}

async function upsertCampaignPlayerOnline(campaignId, userId, role = "jogador", status = "ativo") {
  const client = supabaseClient();
  const safeCampaignId = uuidOrNull(campaignId);
  const safeUserId = uuidOrNull(userId);
  if (!client || !safeCampaignId || !safeUserId) return;
  console.log("Registrando jogador na campanha:", { campanha_id: safeCampaignId, user_id: safeUserId, role, status });
  if (!(await campaignExistsInSupabase(safeCampaignId))) {
    console.warn("Campanha nao encontrada:", safeCampaignId);
    throw new Error("Campanha atual invalida. Recarregue a mesa.");
  }
  const row = {
    campanha_id: safeCampaignId,
    user_id: safeUserId,
    role,
    status,
    updated_at: new Date().toISOString()
  };
  const existing = await client
    .from("campanha_jogadores")
    .select("*")
    .eq("campanha_id", safeCampaignId)
    .eq("user_id", safeUserId)
    .limit(1);
  if (existing.error) {
    if (isMissingRelationError(existing.error) || isMissingColumnError(existing.error)) {
      console.warn("[Supabase] campanha_jogadores ausente. Rode supabase-migration.sql.", existing.error);
      return;
    }
    throw new Error(`campanha_jogadores: ${remoteErrorMessage(existing.error)}`);
  }
  const existingRow = Array.isArray(existing.data) ? existing.data[0] : null;
  const result = existingRow?.id
    ? await client.from("campanha_jogadores").update(row).eq("id", existingRow.id).select("*").limit(1)
    : await client.from("campanha_jogadores").insert({ ...row, created_at: new Date().toISOString() }).select("*").limit(1);
  if (result.error) {
    if (isMissingRelationError(result.error) || isMissingColumnError(result.error)) {
      console.warn("[Supabase] campanha_jogadores ausente. Rode supabase-migration.sql.", result.error);
      return;
    }
    throw new Error(`campanha_jogadores: ${remoteErrorMessage(result.error)}`);
  }
  const saved = Array.isArray(result.data) ? result.data[0] : null;
  if (saved) {
    state.campaignPlayers = [
      ...(state.campaignPlayers || []).filter((item) => !(item.campanha_id === safeCampaignId && item.user_id === safeUserId)),
      saved
    ];
    console.log("Jogador registrado em campanha_jogadores", saved);
  }
}

async function loadCampaignPlayersFromSupabase(campaign = currentCampaign()) {
  console.log("Carregando jogadores da mesa");
  console.log("campanha_id atual:", campaign?.id || "");
  const client = supabaseClient();
  if (!campaign || !uuidOrNull(campaign.id)) {
    setSyncStatus("Campanha atual invalida. Recarregue a mesa.", true);
    return [];
  }
  if (!client) return localCampaignPlayers(campaign);
  try {
    let { data: rows, error } = await client
      .from("campanha_jogadores")
      .select("*")
      .eq("campanha_id", campaign.id);
    if (error) {
      if (isMissingRelationError(error) || isMissingColumnError(error)) {
        console.warn("Erro ao carregar jogadores da mesa", error);
        return localCampaignPlayers(campaign);
      }
      throw error;
    }
    rows = Array.isArray(rows) ? rows : [];
    console.log("Registros campanha_jogadores encontrados:", rows);
    const userIds = rows.map((row) => uuidOrNull(row.user_id)).filter(Boolean);
    const linkedSheets = sheetsLinkedToCampaign(campaign);
    let userMap = {};
    if (userIds.length) {
      console.log("Buscando usuarios dos jogadores", userIds);
      const { data: users, error: usersError } = await client.from("usuarios").select("id,username,email").in("id", Array.from(new Set(userIds)));
      if (!usersError && Array.isArray(users)) {
        userMap = Object.fromEntries(users.map((row) => [row.id, row]));
        users.forEach((row) => upsertLocalAccount({ id: row.id, username: row.username || row.email || "jogador", email: row.email || "", role: "player", sheetIds: [], campaignIds: [campaign.id], online: true }));
      } else if (usersError) {
        console.warn("Erro ao buscar usuarios dos jogadores", usersError);
      }
    }
    const enrichedRows = rows.map((row) => {
      const userRow = userMap[row.user_id] || state.accounts.find((account) => account.id === row.user_id) || {};
      const linkedCount = linkedSheets.filter((sheet) =>
        [sheet.user_id, sheet.owner_id, sheet.responsavel_id, sheet.userId, sheet.ownerId, sheet.responsavelId].map(uuidOrNull).includes(row.user_id)
      ).length;
      return {
        ...row,
        username: userRow.username || userRow.email || (row.role === "mestre" ? "Mestre" : "Jogador"),
        email: userRow.email || "",
        linkedCount
      };
    });
    state.campaignPlayers = [
      ...(state.campaignPlayers || []).filter((item) => item.campanha_id !== campaign.id),
      ...enrichedRows
    ];
    if (!enrichedRows.length) console.log("Nenhum jogador encontrado para esta campanha");
    console.log("Jogadores da mesa renderizados", { campanha_id: campaign.id, total: enrichedRows.length });
    return enrichedRows;
  } catch (error) {
    console.error("Erro ao carregar jogadores da mesa", error);
    setSyncStatus(`Erro ao carregar jogadores da mesa: ${remoteErrorMessage(error)}`, true);
    return localCampaignPlayers(campaign);
  }
}

async function loadSheetRequestsFromSupabase(campaign = currentCampaign()) {
  console.log("Solicitacoes pendentes carregadas", { campanha_id: campaign?.id || "", inicio: true });
  const client = supabaseClient();
  if (!client || !campaign || !uuidOrNull(campaign.id)) return [];
  try {
    const { data, error } = await client
      .from("ficha_solicitacoes")
      .select("*")
      .eq("campanha_id", campaign.id)
      .order("created_at", { ascending: false });
    if (error) {
      if (isMissingRelationError(error) || isMissingColumnError(error)) {
        console.warn("[Supabase] ficha_solicitacoes ausente. Rode supabase-migration.sql.", error);
        return [];
      }
      throw error;
    }
    const rows = Array.isArray(data) ? data : [];
    const sheetIds = rows.map((row) => uuidOrNull(row.personagem_id)).filter(Boolean);
    const userIds = rows.map((row) => uuidOrNull(row.user_id)).filter(Boolean);
    if (sheetIds.length) {
      const { data: requestedSheets, error: sheetsError } = await client.from("personagens").select("*").in("id", Array.from(new Set(sheetIds)));
      if (!sheetsError && Array.isArray(requestedSheets)) {
        const imported = requestedSheets.map((row) => normalizeSheet({
          ...(row.payload || {}),
          id: row.id,
          user_id: row.user_id,
          owner_id: row.owner_id,
          responsavel_id: row.responsavel_id,
          campanha_id: row.campanha_id,
          origem: row.origem,
          edit_locked: row.edit_locked,
          edit_allowed_by_master: row.edit_allowed_by_master,
          download_allowed: row.download_allowed,
          migrada: row.migrada,
          migrated_to_personagem_id: row.migrated_to_personagem_id,
          name: row.payload?.name || row.nome || "Ficha"
        }));
        state.sheets = mergeById(state.sheets, imported).map(normalizeSheet);
      }
    }
    if (userIds.length) {
      const { data: requestUsers, error: usersError } = await client.from("usuarios").select("id,username,email").in("id", Array.from(new Set(userIds)));
      if (!usersError && Array.isArray(requestUsers)) {
        requestUsers.forEach((row) => upsertLocalAccount({ id: row.id, username: row.username || row.email || "jogador", email: row.email || "", role: "player", sheetIds: [], campaignIds: [campaign.id], online: true }));
      }
    }
    state.sheetRequests = [
      ...(state.sheetRequests || []).filter((item) => item.campanha_id !== campaign.id),
      ...rows
    ];
    console.log("Solicitacoes pendentes carregadas", { campanha_id: campaign.id, total: rows.length });
    return rows;
  } catch (error) {
    console.error("[Supabase] Erro ao carregar solicitacoes de ficha", error);
    return [];
  }
}

async function requestReadySheetForCampaign(sheetId) {
  const user = currentUser();
  const campaign = currentCampaign();
  const sheet = state.sheets.find((item) => item.id === sheetId);
  if (!user || !campaign || !sheet) throw new Error("Selecione campanha e ficha antes de solicitar.");
  console.log("Carregando fichas pessoais do jogador", { user_id: user.id });
  if (!(user.sheetIds || []).includes(sheet.id)) throw new Error("Esta ficha nao pertence a sua conta.");
  if (!sheetMatchesCampaign(sheet, campaign)) throw new Error(systemMismatchMessage(sheet, campaign));
  const existingCampaignId = sheetCampaignIdValue(sheet);
  if (existingCampaignId && existingCampaignId !== campaign.id) throw new Error("Essa ficha ja esta vinculada a outra campanha.");
  const existing = (state.sheetRequests || []).find((item) =>
    item.campanha_id === campaign.id &&
    item.personagem_id === sheet.id &&
    item.user_id === user.id &&
    item.status === "pendente"
  );
  if (existing) {
    setSyncStatus("Essa ficha ja esta aguardando aprovacao do mestre.");
    return;
  }
  const request = {
    id: crypto.randomUUID(),
    campanha_id: campaign.id,
    personagem_id: sheet.id,
    user_id: user.id,
    status: "pendente",
    created_at: new Date().toISOString()
  };
  const client = supabaseClient();
  try {
    if (client && uuidOrNull(campaign.id)) {
      const { data, error } = await client.from("ficha_solicitacoes").insert(request).select("*").limit(1);
      if (error) throw error;
      state.sheetRequests.unshift(Array.isArray(data) && data[0] ? data[0] : request);
    } else {
      state.sheetRequests.unshift(request);
    }
    console.log("Solicitacao de ficha enviada", request);
    setSyncStatus("Ficha enviada para aprovacao do mestre.");
  } catch (error) {
    console.error("Erro ao solicitar uso de ficha", error);
    throw new Error(`Erro ao solicitar uso de ficha: ${remoteErrorMessage(error)}`);
  }
}

async function reviewSheetRequest(requestId, status) {
  if (!isMasterMode()) return;
  const user = currentUser();
  const campaign = currentCampaign();
  const request = (state.sheetRequests || []).find((item) => item.id === requestId);
  if (!campaign || !request) return;
  const sheet = state.sheets.find((item) => item.id === request.personagem_id);
  const client = supabaseClient();
  const accepted = status === "aceita";
  try {
    if (accepted && supabaseClient() && !(await campaignExistsInSupabase(campaign.id))) {
      throw new Error("Campanha invalida ou nao encontrada. Recarregue a mesa.");
    }
    if (accepted) {
      if (!sheet) throw new Error("Ficha nao carregada localmente. Atualize a campanha.");
      console.log("Mestre aceitou ficha pronta", request);
      sheet.campanha_id = campaign.id;
      sheet.campanhaId = campaign.id;
      sheet.origem = sheet.origem || "jogador";
      sheet.owner_id = uuidOrNull(sheet.owner_id || sheet.ownerId) || uuidOrNull(request.user_id);
      sheet.ownerId = sheet.owner_id;
      sheet.responsavel_id = uuidOrNull(sheet.responsavel_id || sheet.responsavelId) || uuidOrNull(request.user_id);
      sheet.responsavelId = sheet.responsavel_id;
      sheet.user_id = uuidOrNull(sheet.user_id) || uuidOrNull(request.user_id);
      sheet.edit_locked = false;
      sheet.editLocked = false;
      sheet.edit_allowed_by_master = true;
      sheet.editAllowedByMaster = true;
      campaign.personagens = mergeUnique([...(campaign.personagens || []), sheet.id]);
      campaign.jogadores = mergeUnique([...(campaign.jogadores || []), request.user_id]);
      await upsertSheetsOnline([sheetDatabaseRow(sheet, { ...user, id: request.user_id })]);
      seedSessionTokensFromSheets(campaign, currentSession());
      console.log("Ficha adicionada ao escudo do mestre", { ficha_id: sheet.id, campanha_id: campaign.id });
    } else {
      console.log("Mestre recusou ficha pronta", request);
    }
    request.status = status;
    request.reviewed_by = user?.id || null;
    request.reviewed_at = new Date().toISOString();
    if (client && uuidOrNull(request.id)) {
      const { error } = await client.from("ficha_solicitacoes").update({
        status,
        reviewed_by: uuidOrNull(user?.id),
        reviewed_at: request.reviewed_at
      }).eq("id", request.id);
      if (error) throw error;
    }
    await saveOnlineState();
    setSyncStatus(accepted ? "Ficha aceita pelo mestre." : "Ficha recusada pelo mestre.");
  } catch (error) {
    console.error(accepted ? "Erro ao aceitar ficha" : "Erro ao recusar ficha", error);
    setSyncStatus(`${accepted ? "Erro ao aceitar ficha" : "Erro ao recusar ficha"}: ${remoteErrorMessage(error)}`, true);
  }
  renderAll();
}

function replaceSheetId(oldId, newId) {
  if (!oldId || !newId || oldId === newId) return;
  state.sheets.forEach((sheet) => {
    if (sheet.id === oldId) sheet.id = newId;
  });
  state.accounts.forEach((account) => {
    account.sheetIds = (account.sheetIds || []).map((id) => id === oldId ? newId : id);
  });
  state.campaigns.forEach((campaign) => {
    campaign.personagens = (campaign.personagens || []).map((id) => id === oldId ? newId : id);
    campaign.sessoes?.forEach((session) => {
      (session.tokens || []).forEach((token) => {
        if (token.sheetId === oldId) token.sheetId = newId;
      });
    });
  });
  state.tokens.forEach((token) => {
    if (token.sheetId === oldId) token.sheetId = newId;
  });
  if (state.activeSheetId === oldId) state.activeSheetId = newId;
}

function replaceCampaignId(oldId, newId) {
  if (!oldId || !newId || oldId === newId) return;
  state.accounts.forEach((account) => {
    account.campaignIds = (account.campaignIds || []).map((id) => id === oldId ? newId : id);
  });
  state.campaigns.forEach((campaign) => {
    if (campaign.id === oldId) {
      campaign.id = newId;
      campaign.sessoes?.forEach((session) => {
        session.campaignId = newId;
      });
    }
  });
  if (state.activeCampaignId === oldId) state.activeCampaignId = newId;
}

function legacySheetCandidates(user) {
  const ids = new Set(user.sheetIds || []);
  const matchingAccounts = state.accounts.filter((account) =>
    account.id === user.id ||
    account.username?.toLowerCase() === user.username?.toLowerCase() ||
    account.email?.toLowerCase() === user.email?.toLowerCase()
  );
  matchingAccounts.forEach((account) => (account.sheetIds || []).forEach((id) => ids.add(id)));
  if (state.activeSheetId) ids.add(state.activeSheetId);
  const byId = state.sheets.filter((sheet) => ids.has(sheet.id));
  const byPlayer = state.sheets.filter((sheet) => normalizeKey(sheet.player) === normalizeKey(user.username) || normalizeKey(sheet.player) === "local");
  return mergeById(byId, byPlayer).map(normalizeSheet);
}

function legacyCampaignCandidates(user) {
  const ids = new Set(user.campaignIds || []);
  if (state.activeCampaignId) ids.add(state.activeCampaignId);
  const byId = state.campaigns.filter((campaign) => ids.has(campaign.id));
  const byOwner = state.campaigns.filter((campaign) => campaign.mestreId === user.id || (campaign.jogadores || []).includes(user.id));
  return mergeById(byId, byOwner).map(normalizeCampaignRecord);
}

async function migrateLocalWorkspaceToSupabase(user = currentUser()) {
  const client = supabaseClient();
  if (!client || !isOnlineUser(user) || onlineLoadRunning) return;
  const now = new Date().toISOString();
  const localSheets = legacySheetCandidates(user);
  const localCampaigns = state.hasLegacyLocalState ? legacyCampaignCandidates(user) : legacyCampaignCandidates(user).filter((campaign) =>
    campaign.mestreId === user.id ||
    (campaign.jogadores || []).includes(user.id) ||
    (user.campaignIds || []).includes(campaign.id)
  );
  if (!localSheets.length && !localCampaigns.length && !state.hasLegacyLocalState) return;

  console.log("[Supabase] Migrando dados locais para Supabase", { sheets: localSheets.length, campaigns: localCampaigns.length });
  const [remoteSheets, remoteCampaigns] = await Promise.all([
    safeSelect("personagens", "*"),
    safeSelect("campanhas", "*")
  ]);

  for (const campaign of localCampaigns) {
    const code = normalizeInviteCode(campaign.codigoConvite || campaign.inviteCode);
    const existing = remoteCampaigns.find((row) => {
      const payload = row.payload || {};
      return normalizeInviteCode(row.codigo_convite || row.invite_code || payload.codigo_convite || payload.invite_code || payload.inviteCode) === code;
    });
    if (existing?.id) replaceCampaignId(campaign.id, existing.id);
    const safeCampaign = normalizeCampaignRecord(existing ? { ...(existing.payload || {}), ...campaign, id: existing.id } : campaign);
    safeCampaign.mestreId = uuidOrNull(safeCampaign.mestreId) || user.id;
    user.campaignIds = mergeUnique([...(user.campaignIds || []), safeCampaign.id]);
    console.log(existing ? "[Supabase] Campanha local ja existia no Supabase" : "[Supabase] Campanha criada no Supabase", safeCampaign.nome);
    await upsertCampaignsOnline([campaignDatabaseRow(safeCampaign, now, user)]);
  }

  const rows = [];
  for (const sheet of localSheets) {
    const existing = remoteSheets.find((row) =>
      row.user_id === user.id &&
      normalizeKey(row.nome || row.payload?.name) === normalizeKey(sheet.name)
    );
    if (existing?.id) replaceSheetId(sheet.id, existing.id);
    const migratedSheet = normalizeSheet({ ...(existing?.payload || {}), ...sheet, id: existing?.id || sheet.id, player: user.username });
    user.sheetIds = mergeUnique([...(user.sheetIds || []), migratedSheet.id]);
    console.log(existing ? "[Supabase] Ficha local ja existia no Supabase" : "[Supabase] Migrando ficha local para Supabase", migratedSheet.name);
    rows.push(sheetDatabaseRow(migratedSheet, user, now));
  }
  await upsertSheetsOnline(rows);
  await saveOnlineUser(user);
  state.hasLegacyLocalState = false;
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (error) {
    console.warn("[Storage] Nao consegui remover estado antigo.", error);
  }
  saveLightSession();
}

function listItemsFromText(text) {
  return splitLines(text);
}

function inventoryRowsForSheet(sheet, user, now, rich = true) {
  return listItemsFromText(sheet.inventory).map((line) => {
    const item = parseInventoryItem(line, sheet);
    const stats = item.stats || {};
    const base = {
      user_id: user.id,
      personagem_id: sheet.id,
      campanha_id: uuidOrNull(sheet.campanha_id || sheet.campanhaId) || uuidOrNull(state.campaigns.find((campaign) => (campaign.personagens || []).includes(sheet.id))?.id),
      nome: item.name,
      payload: {
        name: item.name,
        inventoryText: sheet.inventory,
        line,
        stats,
        system: sheetSystemId(sheet),
        savedAt: now
      },
      updated_at: now
    };
    if (!rich || sheetSystemId(sheet) !== "dnd5e") return base;
    return {
      ...base,
      categoria: dndInventoryCategory(item),
      subtipo: stats.subtype || stats.category || item.entry?.type || "",
      quantidade: Number(stats.quantity) || 1,
      peso: stats.weight || "",
      equipado: !!stats.equipped,
      arma_em_punho: !!stats.weaponReady,
      armadura_em_uso: !!stats.armorInUse,
      escudo_em_uso: !!stats.shieldInUse,
      dano: stats.damage || "",
      tipo_dano: stats.damageType || "",
      propriedades: stats.properties || "",
      dominio: stats.mastery || "",
      alcance: stats.range || "",
      bonus_ataque: Number(stats.attackBonus || 0) || 0,
      bonus_dano: Number(stats.damageBonus || 0) || 0,
      bonus_ca: Number(stats.bonusCa || stats.shieldBonus || 0) || 0,
      ca_base: Number(stats.armorBase || 0) || null,
      observacoes: item.customDescription || stats.notes || item.entry?.desc || ""
    };
  });
}

async function saveOnlineState() {
  const client = supabaseClient();
  const user = currentUser();
  if (!client || !isOnlineUser(user) || onlineSaveRunning) return;
  onlineSaveRunning = true;
  try {
    console.log("Tentando sincronizar backup local");
    syncCurrentSession();
    await saveOnlineUser(user);
    const now = new Date().toISOString();
    const campaigns = userCampaignsForSave(user)
      .filter((campaign) => uuidOrNull(campaign.id))
      .map((campaign) => campaignDatabaseRow(campaign, now, user))
      .filter((campaign) => uuidOrNull(campaign.owner_id) && uuidOrNull(campaign.mestre_id));
    const sheets = userSheetsForSave(user).map((sheet) => sheetDatabaseRow(sheet, user, now));
    if (campaigns.length) {
      await upsertCampaignsOnline(campaigns);
    }
    if (sheets.length) {
      await upsertSheetsOnline(sheets);
    }

    for (const sheet of userSheetsForSave(user)) {
      await client.from("inventario").delete().eq("personagem_id", sheet.id).eq("user_id", user.id);
      const inventoryRows = inventoryRowsForSheet(sheet, user, now, true);
      if (inventoryRows.length) {
        let insertResult = await client.from("inventario").insert(inventoryRows);
        if (insertResult.error && sheetSystemId(sheet) === "dnd5e") {
          console.warn("[Supabase] Erro ao salvar item com colunas D&D. Tentando fallback em payload.", insertResult.error);
          insertResult = await client.from("inventario").insert(inventoryRowsForSheet(sheet, user, now, false));
        }
        if (insertResult.error && isMissingColumnError(insertResult.error)) {
          const safeRows = inventoryRowsForSheet(sheet, user, now, false).map((row) => {
            const safe = { ...row };
            delete safe.campanha_id;
            return safe;
          });
          insertResult = await client.from("inventario").insert(safeRows);
        }
        if (insertResult.error) {
          console.error("[Supabase] Erro ao salvar item", insertResult.error);
          throw new Error(`inventario: ${remoteErrorMessage(insertResult.error)}`);
        }
      }
      await client.from("anotacoes").delete().eq("personagem_id", sheet.id).eq("user_id", user.id);
      if (sheet.notes || sheet.appearance || sheet.personality || sheet.history || sheet.objective) {
        const { error } = await client.from("anotacoes").insert({
          user_id: user.id,
          personagem_id: sheet.id,
          campanha_id: uuidOrNull(sheet.campanha_id || sheet.campanhaId) || uuidOrNull(state.campaigns.find((campaign) => (campaign.personagens || []).includes(sheet.id))?.id),
          titulo: `Anotacoes de ${sheet.name || "agente"}`,
          conteudo: sheet.notes || "",
          payload: {
            notesText: sheet.notes || "",
            appearance: sheet.appearance || "",
            personality: sheet.personality || "",
            history: sheet.history || "",
            objective: sheet.objective || "",
            savedAt: now
          },
          updated_at: now
        });
        if (error) throw new Error(`anotacoes: ${remoteErrorMessage(error)}`);
      }
    }

    if (state.rolls.length) {
      const { error } = await client.from("rolagens").upsert(state.rolls.map((roll) => ({
        id: roll.id,
        user_id: user.id,
        campanha_id: uuidOrNull(state.activeCampaignId),
        personagem_id: uuidOrNull(state.activeSheetId),
        formula: roll.formula,
        resultado: String(roll.displayTotal || roll.total || ""),
        payload: { ...roll, created_at: now },
        created_at: now
      })), { onConflict: "id" });
      if (error) throw new Error(`rolagens: ${remoteErrorMessage(error)}`);
    }
    setSyncStatus("Sincronizado com Supabase.");
    console.log("Backup local sincronizado com Supabase");
  } finally {
    onlineSaveRunning = false;
  }
}

async function deleteOnlineSheet(sheetId) {
  const client = supabaseClient();
  const user = currentUser();
  if (!client || !isOnlineUser(user) || !uuidOrNull(sheetId)) return;
  const inventory = await client.from("inventario").delete().eq("personagem_id", sheetId).eq("user_id", user.id);
  if (inventory.error) throw new Error(`inventario: ${remoteErrorMessage(inventory.error)}`);
  const notes = await client.from("anotacoes").delete().eq("personagem_id", sheetId).eq("user_id", user.id);
  if (notes.error) throw new Error(`anotacoes: ${remoteErrorMessage(notes.error)}`);
  const sheet = await client.from("personagens").delete().eq("id", sheetId).eq("user_id", user.id);
  if (sheet.error) throw new Error(`personagens: ${remoteErrorMessage(sheet.error)}`);
  console.log("[Supabase] Ficha apagada online:", sheetId);
}

async function deleteOnlineCampaign(campaignId) {
  const client = supabaseClient();
  const user = currentUser();
  if (!client || !isOnlineUser(user) || !uuidOrNull(campaignId)) return;
  const campaign = state.campaigns.find((item) => item.id === campaignId);
  const ownsCampaign = user.role === "admin" || campaign?.mestreId === user.id;
  if (!ownsCampaign) throw new Error("Somente o mestre da campanha pode excluir este arquivo.");
  const updateSheets = await client
    .from("personagens")
    .update({ campanha_id: null })
    .eq("campanha_id", campaignId);
  if (updateSheets.error) throw new Error(`personagens: ${remoteErrorMessage(updateSheets.error)}`);
  const rolls = await client.from("rolagens").delete().eq("campanha_id", campaignId);
  if (rolls.error && !isMissingColumnError(rolls.error)) throw new Error(`rolagens: ${remoteErrorMessage(rolls.error)}`);
  const notes = await client.from("anotacoes").delete().eq("campanha_id", campaignId);
  if (notes.error && !isMissingColumnError(notes.error)) throw new Error(`anotacoes: ${remoteErrorMessage(notes.error)}`);
  const campaignDelete = await client.from("campanhas").delete().eq("id", campaignId);
  if (campaignDelete.error) throw new Error(`campanhas: ${remoteErrorMessage(campaignDelete.error)}`);
  console.log("[Supabase] Campanha apagada online:", campaignId);
}

function createCampaignForCurrentUser(name, systemId = "arquivo") {
  const user = currentUser();
  if (!user) throw new Error("Faca login primeiro.");
  console.log("Criando campanha no Supabase", { nome: name, sistema_regra: normalizeSystemId(systemId) });
  const campaign = createCampaignRecord(name || "Nova campanha", user.id, systemId);
  state.campaigns.push(campaign);
  user.role = user.role === "admin" ? "admin" : "master";
  user.campaignIds = Array.from(new Set([...(user.campaignIds || []), campaign.id]));
  state.activeCampaignId = campaign.id;
  state.activeSessionId = campaign.sessoes[0].id;
  applySessionToTable(campaign.sessoes[0]);
  state.tokens = [];
  console.log("[Campanha] Campanha nova criada zerada", { campanha_id: campaign.id, grid: `${campaign.sessoes[0].mapa.rows}x${campaign.sessoes[0].mapa.cols}` });
  return campaign;
}

function blankSheetForSystem(systemId = "arquivo", name = "", player = "") {
  const system = systemFor(systemId);
  if (system.id === "dnd5e") {
    return normalizeSheet(blankDndSheet(name || "Novo aventureiro", player || "Jogador"));
  }
  return normalizeSheet({
    ...blankSheet(name || "Novo agente", player || "Jogador"),
    sistemaRegra: system.id,
    sistema_regra: system.id,
    fichaTipo: system.ficha
  });
}

function createSheetForCurrentUser(name, systemId = "arquivo") {
  const user = currentUser();
  if (!user) throw new Error("Faca login primeiro.");
  user.sheetIds = user.sheetIds || [];
  if (user.sheetIds.length >= 5) throw new Error("Limite de 5 fichas por conta atingido.");
  const system = systemFor(systemId);
  console.log("Criando ficha no Supabase", { nome: name, sistema_regra: system.id });
  const defaultName = system.id === "dnd5e" ? `Aventureiro ${user.sheetIds.length + 1}` : `Agente ${user.sheetIds.length + 1}`;
  const sheet = blankSheetForSystem(system.id, name || defaultName, user.username);
  sheet.campanha_id = "";
  sheet.campanhaId = "";
  sheet.origem = "jogador";
  sheet.owner_id = uuidOrNull(user.id);
  sheet.ownerId = sheet.owner_id;
  sheet.responsavel_id = uuidOrNull(user.id);
  sheet.responsavelId = sheet.responsavel_id;
  sheet.user_id = uuidOrNull(user.id);
  state.sheets.unshift(sheet);
  user.sheetIds.push(sheet.id);
  state.activeSheetId = sheet.id;
  return sheet;
}

function normalizeInviteCode(code) {
  return String(code || "").trim().toUpperCase();
}

function campaignMatchesInvite(campaign, code) {
  const clean = normalizeInviteCode(code);
  return [
    campaign?.inviteCode,
    campaign?.codigoConvite,
    campaign?.invite_code,
    campaign?.codigo_convite
  ].some((value) => normalizeInviteCode(value) === clean);
}

function upsertLocalCampaign(campaign) {
  const safeCampaign = normalizeCampaignRecord(campaign);
  const index = state.campaigns.findIndex((item) => item.id === safeCampaign.id);
  if (index >= 0) state.campaigns[index] = normalizeCampaignRecord({ ...state.campaigns[index], ...safeCampaign });
  else state.campaigns.push(safeCampaign);
  return state.campaigns.find((item) => item.id === safeCampaign.id);
}

async function findCampaignByInviteOnline(code) {
  const client = supabaseClient();
  const clean = normalizeInviteCode(code);
  if (!client || !clean) return null;
  console.log("[Supabase] Buscando convite", { digitado: code, normalizado: clean });
  setSyncStatus(`Buscando convite ${clean} no Supabase...`);

  const attempts = [
    { label: "codigo_convite/invite_code", query: () => client.from("campanhas").select("*").or(`codigo_convite.eq.${clean},invite_code.eq.${clean}`).limit(1) },
    { label: "codigo_convite", query: () => client.from("campanhas").select("*").eq("codigo_convite", clean).limit(1) },
    { label: "invite_code", query: () => client.from("campanhas").select("*").eq("invite_code", clean).limit(1) },
    { label: "payload", query: () => client.from("campanhas").select("*").or(`payload->>codigo_convite.eq.${clean},payload->>invite_code.eq.${clean},payload->>inviteCode.eq.${clean}`).limit(1) }
  ];
  for (const attempt of attempts) {
    const { data, error } = await attempt.query();
    console.log("[Supabase] Resultado da busca de convite", { tentativa: attempt.label, data, error });
    if (error) console.warn("[Supabase] Busca de convite falhou.", { tentativa: attempt.label, error });
    if (data?.[0]) {
      console.log("[Supabase] Campanha encontrada", data[0]);
      return normalizeCampaignRecord({ ...(data[0].payload || {}), ...data[0], id: data[0].id });
    }
  }

  const { data: allRows, error: allError } = await client.from("campanhas").select("*");
  console.log("[Supabase] Resultado da busca ampla de convite", { codigoDigitado: code, codigoNormalizado: clean, quantidade: allRows?.length || 0, erro: allError });
  if (!allError && Array.isArray(allRows)) {
    const payloadMatch = allRows.find((row) => campaignMatchesInvite({ ...(row.payload || {}), ...row }, clean));
    if (payloadMatch) {
      console.log("[Supabase] Campanha encontrada", payloadMatch);
      return normalizeCampaignRecord({ ...(payloadMatch.payload || {}), ...payloadMatch, id: payloadMatch.id });
    }
  } else if (allError) {
    console.error("[Supabase] Erro Supabase", { table: "campanhas", codigoDigitado: code, codigoNormalizado: clean, error: allError });
  }

  setSyncStatus(`Convite ${clean} nao encontrado no Supabase.`, true);
  const row = null;
  return row ? normalizeCampaignRecord({ ...(row.payload || {}), ...row }) : null;
}

function campaignLookupFilters(campaign) {
  return [
    uuidOrNull(campaign?.id) ? `id.eq.${campaign.id}` : "",
    campaign?.codigoConvite || campaign?.codigo_convite ? `codigo_convite.eq.${normalizeInviteCode(campaign.codigoConvite || campaign.codigo_convite)}` : "",
    campaign?.inviteCode || campaign?.invite_code ? `invite_code.eq.${normalizeInviteCode(campaign.inviteCode || campaign.invite_code)}` : ""
  ].filter(Boolean);
}

async function refreshActiveCampaignFromSupabase({ rerender = false } = {}) {
  const client = supabaseClient();
  const localCampaign = currentCampaign();
  if (!client) {
    setSyncStatus("Supabase indisponivel. Usando dados locais da campanha.", true);
    return localCampaign;
  }
  if (!localCampaign) {
    setSyncStatus("Nenhuma campanha ativa para atualizar.", true);
    return null;
  }

  console.log("Carregando escudo do mestre", { campanha_id: localCampaign.id });
  setSyncStatus("Atualizando campanha pelo Supabase...");
  const filters = campaignLookupFilters(localCampaign);
  const campaignQuery = filters.length
    ? client.from("campanhas").select("*").or(filters.join(",")).limit(1)
    : uuidOrNull(localCampaign.id)
      ? client.from("campanhas").select("*").eq("id", localCampaign.id).limit(1)
      : client.from("campanhas").select("*").limit(0);
  const { data: campaignRows, error: campaignError } = await campaignQuery;
  if (campaignError) throw new Error(`campanhas: ${remoteErrorMessage(campaignError)}`);
  const remoteCampaign = campaignRows?.[0]
    ? normalizeCampaignRecord({ ...(campaignRows[0].payload || {}), ...campaignRows[0] })
    : normalizeCampaignRecord(localCampaign);

  const campaign = upsertLocalCampaign({
    ...localCampaign,
    ...remoteCampaign,
    personagens: Array.isArray(localCampaign.personagens) ? localCampaign.personagens : []
  });
  state.activeCampaignId = campaign.id;
  if (!state.activeSessionId) state.activeSessionId = campaign.sessoes[0]?.id || null;
  if (!uuidOrNull(campaign.id)) {
    setSyncStatus("Campanha ativa sem UUID valido. Selecione uma campanha salva no Supabase.", true);
    return campaign;
  }

  const { data: characterRows, error: charactersError } = await client
    .from("personagens")
    .select("*")
    .eq("campanha_id", campaign.id);
  if (charactersError) {
    console.error("Erro ao carregar escudo do mestre", charactersError);
    throw new Error(`personagens: ${remoteErrorMessage(charactersError)}`);
  }

  const linkedRows = Array.isArray(characterRows) ? characterRows.filter((row) => row.campanha_id === campaign.id) : [];
  if (linkedRows.length) console.log("Personagens encontrados para campanha", { campanha_id: campaign.id, total: linkedRows.length });
  else console.log("Nenhum personagem encontrado para campanha", { campanha_id: campaign.id });
  const userIds = linkedRows.flatMap((row) => [row.user_id, row.owner_id, row.responsavel_id].map(uuidOrNull)).filter(Boolean);
  let userMap = {};
  if (userIds.length) {
    const { data: userRows, error: usersError } = await client
      .from("usuarios")
      .select("id, username, email")
      .in("id", Array.from(new Set(userIds)));
    if (!usersError && Array.isArray(userRows)) {
      userMap = Object.fromEntries(userRows.map((row) => [row.id, row]));
      userRows.forEach((row) => upsertLocalAccount({ id: row.id, username: row.username || row.email || "jogador", email: row.email || "", role: "player", sheetIds: [], campaignIds: [campaign.id], online: true }));
    }
  }

  const linkedSheets = linkedRows.map((row) => normalizeSheet({
    ...(row.payload || {}),
    id: row.id,
    user_id: row.user_id,
    owner_id: row.owner_id,
    responsavel_id: row.responsavel_id,
    campanha_id: row.campanha_id,
    origem: row.origem,
    edit_locked: row.edit_locked,
    edit_allowed_by_master: row.edit_allowed_by_master,
    download_allowed: row.download_allowed,
    migrada: row.migrada,
    migrated_to_personagem_id: row.migrated_to_personagem_id,
    name: row.payload?.name || row.nome || row.name || "Agente",
    player: row.payload?.player || userMap[row.user_id]?.username || row.nome || "Jogador"
  })).filter((sheet) => {
    if (sheetOrigin(sheet) === "sessao") console.log("Ficha da sessao adicionada ao escudo", sheet.id);
    else console.log("Ficha vinculada por convite adicionada ao escudo", sheet.id);
    return sheetMatchesCampaign(sheet, campaign);
  });

  const linkedIds = linkedSheets.map((sheet) => uuidOrNull(sheet.id)).filter(Boolean);
  if (linkedIds.length) {
    let { data: inventoryRows, error: inventoryError } = await client
      .from("inventario")
      .select("*")
      .in("personagem_id", linkedIds)
      .eq("campanha_id", campaign.id);
    if (inventoryError && isMissingColumnError(inventoryError)) {
      const retry = await client.from("inventario").select("*").in("personagem_id", linkedIds);
      inventoryRows = retry.data;
      inventoryError = retry.error;
    }
    if (inventoryError) {
      console.warn("[Supabase] Nao consegui carregar inventarios vinculados.", inventoryError);
    } else {
      linkedSheets.forEach((sheet) => {
        const rows = (inventoryRows || []).filter((row) => row.personagem_id === sheet.id);
        const fullText = rows.find((row) => row.payload?.inventoryText)?.payload?.inventoryText;
        if (fullText) sheet.inventory = fullText;
        else if (rows.length) sheet.inventory = rows.map((row) => row.nome).filter(Boolean).join("\n");
      });
    }
  }

  state.sheets = mergeById(state.sheets, linkedSheets).map(normalizeSheet);
  campaign.personagens = linkedSheets.map((sheet) => sheet.id);
  campaign.jogadores = mergeUnique([...(campaign.jogadores || []), ...userIds]);
  const activeUser = currentUser();
  if (activeUser?.id && uuidOrNull(campaign.id)) {
    const role = activeUser.role === "admin" || campaign.mestreId === activeUser.id || campaign.owner_id === activeUser.id || campaign.ownerId === activeUser.id ? "mestre" : "jogador";
    await upsertCampaignPlayerOnline(campaign.id, activeUser.id, role, "ativo");
  }
  await loadCampaignPlayersFromSupabase(campaign);
  await loadSheetRequestsFromSupabase(campaign);
  state.campaigns = state.campaigns.map((item) => item.id === campaign.id ? campaign : item);
  seedSessionTokensFromSheets(campaign, currentSession());
  syncCurrentSession();
  saveLightSession();
  setSyncStatus(`Campanha atualizada: ${linkedSheets.length} ficha(s) vinculada(s).`);
  if (rerender) {
    renderPortal();
    renderAll();
  }
  return campaign;
}

function renderGridSyncUpdate() {
  renderControls();
  renderGrid();
  renderTokenList();
  renderMasterShield();
  renderNpcMiniCards();
  renderSoundtracks();
  window.archiveUI?.render(state);
}

function currentSceneId() {
  return String(state.activeSessionId || currentSession()?.id || "arquivo-inicial");
}

function facingToDegrees(facing = "s") {
  return { n: 0, e: 90, s: 180, w: 270 }[facing] ?? 180;
}

function degreesToFacing(degrees = 180) {
  const normalized = ((Number(degrees) % 360) + 360) % 360;
  if (normalized >= 315 || normalized < 45) return "n";
  if (normalized < 135) return "e";
  if (normalized < 225) return "s";
  return "w";
}

function gridTokenRow(token, mode = "full") {
  const campaign = currentCampaign();
  const user = currentUser();
  const campaignId = uuidOrNull(campaign?.id);
  if (!campaignId || !token?.id) return null;
  if (!uuidOrNull(token.id)) token.id = crypto.randomUUID();
  const base = {
    id: token.id,
    campanha_id: campaignId,
    cena_id: currentSceneId(),
    personagem_id: uuidOrNull(token.sheetId),
    updated_by: uuidOrNull(user?.id),
    updated_at: new Date().toISOString()
  };
  if (mode === "move") {
    return { ...base, x: Number(token.x) || 0, y: Number(token.y) || 0 };
  }
  return {
    ...base,
    nome: tokenDisplayName(token),
    imagem_url: token.portrait || "",
    x: Number(token.x) || 0,
    y: Number(token.y) || 0,
    largura: Number(token.width || token.w || 1),
    altura: Number(token.height || token.h || 1),
    rotacao: Number(token.rotation ?? facingToDegrees(token.facing)),
    visivel: token.hidden !== true,
    bloqueado: token.locked === true,
    payload: { ...token }
  };
}

function tokenFromGridRow(row) {
  const payload = row?.payload || {};
  return {
    ...payload,
    id: row.id,
    sheetId: row.personagem_id || payload.sheetId || "",
    name: row.nome || payload.name || "Token",
    portrait: row.imagem_url || payload.portrait || "",
    x: Number(row.x) || 0,
    y: Number(row.y) || 0,
    width: Number(row.largura || payload.width || 1),
    height: Number(row.altura || payload.height || 1),
    rotation: Number(row.rotacao ?? payload.rotation ?? facingToDegrees(payload.facing)),
    facing: payload.facing || degreesToFacing(row.rotacao),
    hidden: row.visivel === false,
    locked: row.bloqueado === true
  };
}

function applyGridTokenRow(row, eventType = "UPDATE") {
  if (!row || String(row.cena_id || "") !== currentSceneId()) return;
  const token = tokenFromGridRow(row);
  const index = state.tokens.findIndex((item) => item.id === token.id);
  if (eventType === "DELETE") {
    syncedGridTokenIds.delete(token.id);
    if (index >= 0) {
      state.tokens.splice(index, 1);
      syncCurrentSession();
      els.battlefield?.querySelector(`[data-token-id="${selectorEscape(token.id)}"]`)?.remove();
      renderTokenList();
      renderMasterShield();
      renderNpcMiniCards();
    }
    return;
  }
  syncedGridTokenIds.add(token.id);
  if (index >= 0) state.tokens[index] = { ...state.tokens[index], ...token };
  else state.tokens.push(token);
  syncCurrentSession();
  if (index >= 0) updateTokenElement(state.tokens.find((item) => item.id === token.id));
  else renderGrid();
  renderTokenList();
  renderMasterShield();
  renderNpcMiniCards();
}

function updateTokenElement(token) {
  if (!token || !els.battlefield) return;
  const node = els.battlefield.querySelector(`[data-token-id="${selectorEscape(token.id)}"]`);
  if (!node) {
    renderGrid();
    return;
  }
  node.style.left = `calc(${token.x} * var(--cell-size))`;
  node.style.top = `calc(${token.y} * var(--cell-size))`;
  node.classList.toggle("token-hidden", token.hidden === true);
  node.classList.remove("facing-n", "facing-e", "facing-s", "facing-w");
  node.classList.add(`facing-${token.facing || "s"}`);
  node.title = `${tokenDisplayName(token)} | luz ${token.light}${token.hidden ? " | invisivel" : ""}`;
}

async function loadGridTokensFromSupabase({ seedIfEmpty = true } = {}) {
  const client = supabaseClient();
  const campaign = currentCampaign();
  const campaignId = uuidOrNull(campaign?.id);
  if (!client || !campaignId) return;
  console.time("carregar_grid");
  const sceneId = currentSceneId();
  try {
    const { data, error } = await client
      .from("grid_tokens")
      .select("*")
      .eq("campanha_id", campaignId)
      .eq("cena_id", sceneId);
    if (error) {
      console.error("[Supabase] Erro Supabase", { table: "grid_tokens", error });
      return;
    }
    if (Array.isArray(data) && data.length) {
      syncedGridTokenIds.clear();
      data.forEach((row) => {
        if (row.id) syncedGridTokenIds.add(row.id);
      });
      state.tokens = data.map(tokenFromGridRow);
      syncCurrentSession();
      renderGridSyncUpdate();
      console.log("Grid carregado do Supabase", { campanha_id: campaignId, cena_id: sceneId, tokens: state.tokens.length });
      return;
    }
    console.log("Grid carregado do Supabase", { campanha_id: campaignId, cena_id: sceneId, tokens: 0 });
    if (seedIfEmpty && state.tokens.length && (campaign?.personagens || []).length) await upsertGridTokens(state.tokens, "full");
  } finally {
    console.timeEnd("carregar_grid");
  }
}

async function upsertGridTokens(tokens, mode = "full") {
  const client = supabaseClient();
  const rows = tokens.map((token) => gridTokenRow(token, mode)).filter(Boolean);
  if (!client || !rows.length) return;
  const { error } = await client.from("grid_tokens").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("[Supabase] Erro Supabase", { table: "grid_tokens", rows, error });
    return;
  }
  rows.forEach((row) => {
    if (row.id) syncedGridTokenIds.add(row.id);
  });
  console.log("Movimento enviado", rows.map((row) => ({ id: row.id, x: row.x, y: row.y })));
}

function queueGridTokenSave(token, mode = "move", delay = 180) {
  if (!token?.id) return;
  const saveMode = mode === "move" && !syncedGridTokenIds.has(token.id) ? "full" : mode;
  window.clearTimeout(tokenSaveTimers.get(token.id));
  tokenSaveTimers.set(token.id, window.setTimeout(() => {
    tokenSaveTimers.delete(token.id);
    upsertGridTokens([token], saveMode);
  }, delay));
}

async function deleteGridTokenOnline(tokenId) {
  const client = supabaseClient();
  const campaignId = uuidOrNull(currentCampaign()?.id);
  if (!client || !campaignId || !tokenId) return;
  const { error } = await client
    .from("grid_tokens")
    .delete()
    .eq("id", tokenId)
    .eq("campanha_id", campaignId)
    .eq("cena_id", currentSceneId());
  if (error) console.error("[Supabase] Erro Supabase", { table: "grid_tokens", tokenId, error });
  else syncedGridTokenIds.delete(tokenId);
}

function startRealtimeSync(mode = state.currentMode) {
  const client = supabaseClient();
  const campaign = currentCampaign();
  const user = currentUser();
  const campaignId = uuidOrNull(campaign?.id);
  const sceneId = currentSceneId();
  const key = `${campaignId || ""}:${sceneId}:${mode}`;
  if (!client || !campaignId || !isOnlineUser(user) || !["master", "player"].includes(mode)) {
    stopRealtimeSync();
    return;
  }
  if (activeRealtimeKey === key && gridRealtimeChannel && sheetRealtimeChannel) return;
  stopRealtimeSync();
  activeRealtimeKey = key;
  console.time("iniciar_realtime");
  loadGridTokensFromSupabase().catch((error) => console.error("[Supabase] Erro Supabase", error));
  gridRealtimeChannel = client
    .channel(`grid_tokens:${campaignId}:${sceneId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "grid_tokens", filter: `campanha_id=eq.${campaignId}` }, (payload) => {
      try {
        const row = payload.new?.id ? payload.new : payload.old;
        if (String(row?.cena_id || "") !== sceneId) return;
        console.log("Movimento recebido", payload);
        applyGridTokenRow(row, payload.eventType);
      } catch (error) {
        console.error("Erro Realtime", error);
      }
    })
    .subscribe((status, error) => {
      if (error) console.error("Erro Realtime", error);
      if (status === "SUBSCRIBED") {
        console.log("Realtime conectado ao grid");
        console.timeEnd("iniciar_realtime");
      }
    });
  sheetRealtimeChannel = client
    .channel(`personagens:${campaignId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "personagens", filter: `campanha_id=eq.${campaignId}` }, (payload) => {
      try {
        if (payload.eventType === "DELETE") {
          state.sheets = state.sheets.filter((sheet) => sheet.id !== payload.old?.id);
          renderMasterShield();
          return;
        }
        applyRemoteSheetRow(payload.new);
        console.log("Ficha atualizada", payload.new?.id);
      } catch (error) {
        console.error("Erro Realtime", error);
      }
    })
    .subscribe((status, error) => {
      if (error) console.error("Erro Realtime", error);
    });
  campaignRealtimeChannel = client
    .channel(`campanhas:${campaignId}`)
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "campanhas", filter: `id=eq.${campaignId}` }, (payload) => {
      try {
        if (Date.now() - lastLocalGridChangeAt < 500) return;
        if (applyRemoteGridCampaign(payload.new)) {
          renderGridSyncUpdate();
          console.log("Mapa recebido", { campanha_id: campaignId, cena_id: sceneId });
        }
      } catch (error) {
        console.error("Erro Realtime", error);
      }
    })
    .subscribe((status, error) => {
      if (error) console.error("Erro Realtime", error);
    });
  tableSheetsRealtimeChannel = client
    .channel(`mesa-fichas:${campaignId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "campanha_jogadores", filter: `campanha_id=eq.${campaignId}` }, () => {
      loadCampaignPlayersFromSupabase(campaign).then(() => renderTableSheetsPanel()).catch((error) => console.error("Erro Realtime", error));
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "ficha_solicitacoes", filter: `campanha_id=eq.${campaignId}` }, () => {
      loadSheetRequestsFromSupabase(campaign).then(() => renderTableSheetsPanel()).catch((error) => console.error("Erro Realtime", error));
    })
    .subscribe((status, error) => {
      if (error) console.error("Erro Realtime", error);
    });
}

function stopRealtimeSync() {
  const client = supabaseClient();
  if (client && gridRealtimeChannel) client.removeChannel(gridRealtimeChannel);
  if (client && sheetRealtimeChannel) client.removeChannel(sheetRealtimeChannel);
  if (client && campaignRealtimeChannel) client.removeChannel(campaignRealtimeChannel);
  if (client && tableSheetsRealtimeChannel) client.removeChannel(tableSheetsRealtimeChannel);
  gridRealtimeChannel = null;
  sheetRealtimeChannel = null;
  campaignRealtimeChannel = null;
  tableSheetsRealtimeChannel = null;
  activeRealtimeKey = "";
  syncedGridTokenIds.clear();
}

function applyRemoteSheetRow(row) {
  if (!row?.id) return;
  const remote = normalizeSheet({
    ...(row.payload || {}),
    id: row.id,
    user_id: row.user_id,
    owner_id: row.owner_id,
    responsavel_id: row.responsavel_id,
    campanha_id: row.campanha_id,
    origem: row.origem,
    edit_locked: row.edit_locked,
    edit_allowed_by_master: row.edit_allowed_by_master,
    download_allowed: row.download_allowed,
    migrada: row.migrada,
    migrated_to_personagem_id: row.migrated_to_personagem_id,
    name: row.payload?.name || row.nome || "",
    player: row.payload?.player || row.jogador || ""
  });
  if (!sheetVisibleToCurrentUser(remote)) return;
  const index = state.sheets.findIndex((sheet) => sheet.id === remote.id);
  if (index >= 0) state.sheets[index] = normalizeSheet({ ...state.sheets[index], ...remote });
  else state.sheets.push(remote);
  if (state.activeSheetId === remote.id) {
    renderCrisisSheet();
    renderInventoryView();
    renderRitualsView();
    renderNotesView();
  }
  syncSheetToken(remote);
  renderMasterShield();
  renderTableSheetsPanel();
  renderTokenList();
}

function queueSheetPatch(sheet, field, delay = 800) {
  const client = supabaseClient();
  const user = currentUser();
  if (!client || !isOnlineUser(user) || !uuidOrNull(sheet?.id)) return;
  const key = `${sheet.id}:${field}`;
  window.clearTimeout(sheetSaveTimers.get(key));
  sheetSaveTimers.set(key, window.setTimeout(async () => {
    sheetSaveTimers.delete(key);
    try {
      await saveSheetFieldOnline(sheet, field);
    } catch (error) {
      console.error("[Supabase] Erro Supabase", error);
    }
  }, delay));
}

async function saveSheetFieldOnline(sheet, field) {
  const client = supabaseClient();
  const user = currentUser();
  if (!client || !isOnlineUser(user) || !uuidOrNull(sheet?.id)) return;
  const now = new Date().toISOString();
  const safeSheet = normalizeSheet(sheet);
  const patch = { updated_at: now };
  if (field === "name") patch.nome = safeSheet.name || "Agente";
  if (field === "player") patch.jogador = safeSheet.player || user.username || "";
  if (["agi", "str", "int", "pre", "vig"].includes(field)) {
    patch.atributos = { agi: safeSheet.agi, for: safeSheet.str, int: safeSheet.int, pre: safeSheet.pre, vig: safeSheet.vig };
  }
  if (["skills", "skillMods"].includes(field)) patch.pericias = { text: safeSheet.skills || "", mods: safeSheet.skillMods || {} };
  if (["hp", "hpMax", "pe", "peMax"].includes(field)) patch.vida = { atual: safeSheet.hp, max: safeSheet.hpMax, pe: safeSheet.pe, peMax: safeSheet.peMax };
  if (["san", "sanMax"].includes(field)) patch.sanidade = { atual: safeSheet.san, max: safeSheet.sanMax };
  patch.payload = safeSheet;
  const { error } = await client.from("personagens").update(patch).eq("id", safeSheet.id);
  if (error) throw new Error(`personagens: ${remoteErrorMessage(error)}`);
  console.log("Ficha atualizada", { id: safeSheet.id, field });
}

function applyRemoteGridCampaign(row) {
  const localCampaign = currentCampaign();
  if (!row || !localCampaign) return false;
  const remoteCampaign = normalizeCampaignRecord({ ...(row.payload || {}), ...row, id: row.id });
  const activeSessionId = state.activeSessionId || localCampaign.sessoes?.[0]?.id;
  const remoteSession = remoteCampaign.sessoes.find((session) => session.id === activeSessionId) || remoteCampaign.sessoes[0];
  if (!remoteSession) return false;
  const mergedCampaign = normalizeCampaignRecord({
    ...localCampaign,
    ...remoteCampaign,
    personagens: remoteCampaign.personagens?.length ? remoteCampaign.personagens : localCampaign.personagens,
    jogadores: mergeUnique([...(localCampaign.jogadores || []), ...(remoteCampaign.jogadores || [])])
  });
  state.campaigns = state.campaigns.map((campaign) => campaign.id === localCampaign.id ? mergedCampaign : campaign);
  state.activeCampaignId = mergedCampaign.id;
  state.activeSessionId = remoteSession.id;
  applySessionToTable(remoteSession);
  syncCurrentSession();
  console.log("Tamanho do grid recebido via Realtime", { rows: state.map.rows, cols: state.map.cols, campanha_id: mergedCampaign.id });
  console.log("Grid redesenhado para jogador");
  return true;
}

async function refreshGridFromSupabase() {
  const client = supabaseClient();
  const user = currentUser();
  const campaign = currentCampaign();
  if (!client || !isOnlineUser(user) || !uuidOrNull(campaign?.id)) return;
  if (gridSyncRunning || onlineLoadRunning || onlineSaveRunning) return;
  if (Date.now() - lastLocalGridChangeAt < 1400) return;
  gridSyncRunning = true;
  try {
    const { data, error } = await client
      .from("campanhas")
      .select("id,payload,updated_at")
      .eq("id", campaign.id)
      .limit(1);
    if (error) throw new Error(`campanhas: ${remoteErrorMessage(error)}`);
    const row = Array.isArray(data) ? data[0] : null;
    if (!row) return;
    const updateKey = `${row.id}:${row.updated_at || JSON.stringify(row.payload?.sessoes || [])}`;
    if (updateKey === lastAppliedGridUpdate) return;
    if (!applyRemoteGridCampaign(row)) return;
    lastAppliedGridUpdate = updateKey;
    renderGridSyncUpdate();
    setSyncStatus("Grid sincronizado com a mesa.");
  } catch (error) {
    console.warn("Erro ao sincronizar tamanho do grid", error);
    console.warn("[Supabase] Falha ao sincronizar grid.", error);
  } finally {
    gridSyncRunning = false;
  }
}

function stopGridSync() {
  if (!gridSyncTimer) return;
  window.clearInterval(gridSyncTimer);
  gridSyncTimer = null;
}

function updateGridSyncLoop(mode = state.currentMode) {
  stopGridSync();
  startRealtimeSync(mode);
}

async function joinCampaignWithInvite(code) {
  const user = currentUser();
  if (!user) throw new Error("Faca login primeiro.");
  const clean = normalizeInviteCode(code);
  if (!clean) throw new Error("Informe o codigo do convite.");
  console.log("Entrando na campanha por convite", { codigo: clean, user_id: user.id });
  const onlineCampaign = await findCampaignByInviteOnline(clean);
  let campaign = onlineCampaign ? upsertLocalCampaign(onlineCampaign) : state.campaigns.find((item) => campaignMatchesInvite(item, clean));
  if (!campaign) throw new Error("Convite nao encontrado.");
  if (supabaseClient() && !(await campaignExistsInSupabase(campaign.id))) {
    throw new Error("Campanha invalida ou nao encontrada. Recarregue a mesa.");
  }
  console.log("Campanha encontrada:", { id: campaign.id, nome: campaign.nome, codigo: clean });
  campaign.jogadores = Array.from(new Set([...(campaign.jogadores || []), user.id]));
  user.campaignIds = Array.from(new Set([...(user.campaignIds || []), campaign.id]));
  state.activeCampaignId = campaign.id;
  state.activeSessionId = campaign.sessoes.find((session) => session.visibleToPlayers)?.id || campaign.sessoes[0]?.id;
  await upsertCampaignPlayerOnline(campaign.id, user.id, "jogador", "ativo");
  console.log("[Supabase] Jogador vinculado a campanha por convite", { campanha_id: campaign.id, usuario: user.username });
  await saveOnlineState();
  await loadCampaignPlayersFromSupabase(campaign);
  await loadSheetRequestsFromSupabase(campaign);
  return campaign;
}

function linkActiveSheetToCampaign(campaign) {
  if (!campaign) throw new Error("Campanha nao encontrada.");
  const system = systemFor(campaignSystemId(campaign));
  const defaultName = system.id === "dnd5e" ? `${currentUser()?.username || "Novo"} aventureiro` : `${currentUser()?.username || "Novo"} agente`;
  const sheet = activeUserSheet(campaign) || createSheetForCurrentUser(defaultName, system.id);
  if (!sheet?.id) throw new Error("Crie ou selecione uma ficha antes de vincular.");
  addActiveSheetToCampaign(campaign, { strict: true });
  seedSessionTokensFromSheets(campaign, currentSession());
}

function addActiveSheetToCampaign(campaign, options = {}) {
  const sheet = activeUserSheet(campaign);
  if (!campaign || !sheet?.id) return false;
  if (!sheetMatchesCampaign(sheet, campaign)) {
    if (options.strict) throw new Error(systemMismatchMessage(sheet, campaign));
    return false;
  }
  const user = currentUser();
  sheet.campanha_id = campaign.id;
  sheet.campanhaId = campaign.id;
  sheet.owner_id = uuidOrNull(sheet.owner_id || sheet.ownerId) || uuidOrNull(user?.id);
  sheet.ownerId = sheet.owner_id;
  sheet.responsavel_id = uuidOrNull(sheet.responsavel_id || sheet.responsavelId) || uuidOrNull(user?.id);
  sheet.responsavelId = sheet.responsavel_id;
  sheet.origem = sheet.origem || "jogador";
  sheet.edit_locked = false;
  sheet.editLocked = false;
  sheet.edit_allowed_by_master = true;
  sheet.editAllowedByMaster = true;
  campaign.personagens = Array.from(new Set([...(campaign.personagens || []), sheet.id]));
  return true;
}

function sheetsLinkedToCampaign(campaign) {
  if (!campaign) return [];
  const linkedIds = new Set(campaign.personagens || []);
  return state.sheets
    .filter((sheet) => linkedIds.has(sheet.id) || sheetCampaignIdValue(sheet) === campaign.id)
    .map(normalizeSheet)
    .filter((sheet) => sheetMatchesCampaign(sheet, campaign));
}

function tokenFromSheet(sheet, index = 0) {
  return {
    id: crypto.randomUUID(),
    sheetId: sheet.id,
    name: sheet.name || `Agente ${index + 1}`,
    type: "player",
    label: sheet.className || "Personagem",
    color: index % 2 ? "#8b5cf6" : "#2f7ed8",
    portrait: sheet.portrait || "",
    light: inventoryVisionBonus(sheet),
    hidden: false,
    facing: "s",
    x: 2 + (index % 5) * 2,
    y: 2 + Math.floor(index / 5) * 2,
    hp: Number(sheet.hp) || 0,
    hpMax: Number(sheet.hpMax) || 0,
    pe: Number(sheet.pe) || 0,
    peMax: Number(sheet.peMax) || 0,
    san: Number(sheet.san) || 0,
    sanMax: Number(sheet.sanMax) || 0
  };
}

function inventoryVisionBonus(sheet) {
  const bonus = inventoryMechanicalBonuses(sheet);
  if (bonus.light) return bonus.light;
  const text = normalizeKey(`${sheet.notes || ""}`);
  if (text.includes("sinalizador")) return 4;
  return 3 + bonus.vision;
}

function seedSessionTokensFromSheets(campaign, session) {
  if (!campaign || !session) return;
  session.tokens = Array.isArray(session.tokens) ? session.tokens : [];
  sheetsLinkedToCampaign(campaign).forEach((sheet, index) => {
    if (!session.tokens.some((token) => token.sheetId === sheet.id)) {
      session.tokens.push(tokenFromSheet(sheet, index));
    }
  });
  if (state.activeSessionId === session.id) {
    state.tokens = session.tokens.map((token) => ({ ...token }));
  }
}

function createNextSession(campaignId) {
  const campaign = state.campaigns.find((item) => item.id === campaignId);
  if (!campaign) return null;
  const next = Math.max(0, ...campaign.sessoes.map((session) => Number(session.numero) || 0)) + 1;
  const title = window.prompt("Titulo da sessao:", `Sessao ${next}`) || `Sessao ${next}`;
  const summary = window.prompt("Resumo inicial:", "") || "";
  const session = createSessionRecord(campaign.id, next, title, summary, blankMap(title));
  seedSessionTokensFromSheets(campaign, session);
  campaign.sessoes.push(session);
  state.activeCampaignId = campaign.id;
  state.activeSessionId = session.id;
  applySessionToTable(session);
  renderAll();
  renderPortal();
  return session;
}

function applySessionToTable(session) {
  if (!session) return;
  state.map = normalizeMap({ ...state.map, ...(session.mapa || {}) });
  state.tokens = Array.isArray(session.tokens) ? session.tokens.map((token) => ({ ...token })) : [];
}

function defaultSheet() {
  return {
    id: crypto.randomUUID(),
    portrait: "",
    name: "Lia Duarte",
    role: "Academica",
        player: "Local",
        className: "Especialista",
        pathName: "Tecnico",
    nex: "5%",
    rank: "Recruta",
    movement: 9,
    peRound: 1,
    hp: 16,
    hpMax: 16,
    pe: 3,
    peMax: 3,
    san: 12,
    sanMax: 12,
    defense: 12,
    block: 0,
    dodge: 5,
    agi: 2,
    str: 1,
    int: 3,
    pre: 1,
    vig: 2,
        skills: "Investigacao +5, Tecnologia +5, Percepcao +5",
        skillMods: {},
        attacks: "Pistola 1d12, faca 1d4",
        abilities: "Perito",
        rituals: "",
        inventory: "Lanterna Tatica\nKit de Pericia\nSmartphone\nMochila Militar",
        notes: "Lanterna, celular, kit de pericia, uma pista sobre a seita.",
        appearance: "",
        personality: "",
        history: "",
        objective: ""
  };
}

function blankSheet(name = "Novo agente", player = "Local") {
  return {
    id: crypto.randomUUID(),
    portrait: "",
    name,
    player,
    role: "",
    className: "",
    pathName: "",
    nex: "5%",
    rank: "Recruta",
    movement: 9,
    peRound: 1,
    hp: 16,
    hpMax: 16,
    pe: 2,
    peMax: 2,
    san: 12,
    sanMax: 12,
    defense: 10,
    block: 0,
    dodge: 0,
    agi: 1,
    str: 1,
    int: 1,
    pre: 1,
    vig: 1,
    skills: "",
    skillMods: {},
    attacks: "",
    abilities: "",
    rituals: "",
    inventory: "",
    notes: "",
    appearance: "",
    personality: "",
    history: "",
    objective: ""
  };
}

function blankDndSheet(name = "Novo aventureiro", player = "Local") {
  return normalizeSheet({
    ...blankSheet(name, player),
    sistemaRegra: "dnd5e",
    sistema_regra: "dnd5e",
    fichaTipo: "dnd5e",
    role: "Humano",
    className: "",
    pathName: "",
    nex: "1",
    rank: "Nivel 1",
    movement: 9,
    hp: 10,
    hpMax: 10,
    pe: 0,
    peMax: 0,
    san: 0,
    sanMax: 0,
    defense: 10,
    str: 2,
    agi: 2,
    vig: 2,
    int: 2,
    pre: 2,
    skills: "",
    inventory: "",
    rituals: "",
    notes: "",
    dnd: {
      classe: "",
      raca: "Humano",
      antecedente: "",
      alinhamento: "",
      experiencia: 0,
      nivel: 1,
      forca: 10,
      destreza: 10,
      constituicao: 10,
      inteligencia: 10,
      sabedoria: 10,
      carisma: 10,
      pv: 10,
      pvMax: 10,
      pvTemporario: 0,
      ca: 10,
      armorBase: 10,
      dexLimit: "",
      shieldBonus: 0,
      acBonus: 0,
      initiativeBonus: 0,
      deslocamento: 9,
      hitDie: 8,
      hitDiceUsed: 0,
      deathSuccess: 0,
      deathFailure: 0,
      inspiration: false,
      proficientSaves: {},
      proficientSkills: {},
      expertiseSkills: {},
      skillBonus: {},
      saveBonus: {},
      proficiencias: "",
      equipamentos: "",
      magias: "",
      anotacoes: "",
      ataques: "",
      tracos: "",
      idiomas: "",
      personalidade: "",
      ideais: "",
      vinculos: "",
      defeitos: "",
      tesouro: "",
      spellcastingAbility: "carisma",
      spellSaveDcBonus: 0,
      spellAttackBonusExtra: 0,
      spellSlots: {},
      spellSlotsUsed: {},
      magiasPreparadas: ""
    }
  });
}

function save() {
  syncCurrentSession();
  saveLightSession();
  if (suppressOnlineSave) return;
  queueOnlineSave();
}

function localOnlyRender() {
  suppressOnlineSave = true;
  try {
    renderAll();
  } finally {
    suppressOnlineSave = false;
  }
}

function syncCurrentSession() {
  const session = currentSession();
  if (!session) return;
  session.mapa = { ...state.map };
  session.tokens = state.tokens.map((token) => ({ ...token }));
  session.logs = state.rolls.slice(0, 10);
}

function renderAll() {
  applyCampaignTheme();
  renderControls();
  syncSystemTabs();
  renderGrid();
  renderTokenList();
  renderMasterShield();
  renderNpcMiniCards();
  renderMissionsView();
  renderChatView();
  renderVoicePanel();
  renderSoundtracks();
  renderSoundtrackLibrary();
  renderCrisisSheet();
  renderTableSheetsPanel();
  applyCampaignTheme();
  renderSheets();
  renderRollLog();
  renderInventoryView();
  renderRitualsView();
  renderNotesView();
  renderCampaignFiles();
  window.archiveUI?.render(state);
  save();
}

function renderControls() {
  state.map = normalizeMap(state.map);
  if (els.mapName) els.mapName.value = state.map.name;
  if (els.gridCols) els.gridCols.value = state.map.cols;
  if (els.gridRows) els.gridRows.value = state.map.rows;
  if (els.lightsOn) els.lightsOn.checked = state.map.lightsOn;
  if (els.darkness) els.darkness.value = state.map.darkness;
  if (els.quickGridCols) els.quickGridCols.value = state.map.cols;
  if (els.quickGridRows) els.quickGridRows.value = state.map.rows;
  if (els.quickCellSize) els.quickCellSize.value = state.map.cellSize;
  if (els.quickGridOffsetX) els.quickGridOffsetX.value = state.map.gridOffsetX;
  if (els.quickGridOffsetY) els.quickGridOffsetY.value = state.map.gridOffsetY;
  if (els.quickGridOpacity) els.quickGridOpacity.value = state.map.gridOpacity;
  if (els.quickGridColor) els.quickGridColor.value = state.map.gridColor;
  if (els.quickThickEvery) els.quickThickEvery.value = state.map.thickEvery;
  if (els.quickSnap) els.quickSnap.checked = state.map.snap !== false;
  if (els.quickCoordinates) els.quickCoordinates.checked = state.map.coordinates === true;
  if (els.quickLightsOn) els.quickLightsOn.checked = state.map.lightsOn;
  if (els.quickDarkness) els.quickDarkness.value = state.map.darkness;
  if (els.quickTokenScale) els.quickTokenScale.value = state.map.tokenScale;
  if (els.mapTool) els.mapTool.value = state.map.tool || "move";
  if (els.fogEnabled) els.fogEnabled.checked = state.map.fog?.enabled === true;
  if (els.fogMode) els.fogMode.value = state.map.fog?.mode || "manual";
  if (els.fogKeepExplored) els.fogKeepExplored.checked = state.map.fog?.keepExplored !== false;
  const previewButton = document.querySelector("#previewPlayerVision");
  if (previewButton) previewButton.textContent = mapPlayerPreview ? "Ver como mestre" : "Ver como jogador";
  const bg = state.map.background || defaultMapBackground();
  if (els.mapImageScaleX) els.mapImageScaleX.value = bg.scaleX;
  if (els.mapImageScaleY) els.mapImageScaleY.value = bg.scaleY;
  if (els.mapImageX) els.mapImageX.value = bg.x;
  if (els.mapImageY) els.mapImageY.value = bg.y;
  if (els.mapImageRotation) els.mapImageRotation.value = bg.rotation;
  if (els.mapImageOpacity) els.mapImageOpacity.value = bg.opacity;
  const lockButton = document.querySelector("#lockMapImage");
  if (lockButton) lockButton.textContent = bg.locked ? "Destravar" : "Travar";
}

function renderGrid() {
  state.map = normalizeMap(state.map);
  document.documentElement.style.setProperty("--cell-size", `${viewCellSize || state.map.cellSize}px`);
  els.battlefield.style.setProperty("--cols", state.map.cols);
  els.battlefield.style.setProperty("--rows", state.map.rows);
  els.battlefield.style.setProperty("--darkness", state.map.darkness / 100);
  els.battlefield.style.setProperty("--grid-opacity", state.map.gridOpacity / 100);
  els.battlefield.style.setProperty("--grid-color", state.map.gridColor);
  els.battlefield.style.setProperty("--grid-line-color", hexToRgba(state.map.gridColor, state.map.gridOpacity / 100));
  els.battlefield.style.setProperty("--grid-offset-x", `${state.map.gridOffsetX}px`);
  els.battlefield.style.setProperty("--grid-offset-y", `${state.map.gridOffsetY}px`);
  els.battlefield.style.setProperty("--token-scale", (state.map.tokenScale || 100) / 100);
  els.battlefield.dataset.coordinates = state.map.coordinates ? "true" : "false";
  els.battlefield.dataset.thickEvery = state.map.thickEvery || 0;
  els.battlefield.innerHTML = "";
  renderMapBackground();

  for (let y = 0; y < state.map.rows; y += 1) {
    for (let x = 0; x < state.map.cols; x += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = cellClass(x, y);
      cell.dataset.x = x;
      cell.dataset.y = y;
      if (state.map.coordinates) {
        cell.dataset.coord = `${x + 1},${y + 1}`;
        cell.innerHTML = `<span class="cell-coordinate">${x + 1},${y + 1}</span>`;
      }
      if (state.map.thickEvery && (x % state.map.thickEvery === 0 || y % state.map.thickEvery === 0)) cell.dataset.thick = "true";
      const mark = !isPlayerMapView() ? mapMarkAt(x, y) : null;
      if (mark) {
        cell.dataset.mark = mark.type;
        if (mark.open) cell.dataset.open = "true";
      }
      cell.addEventListener("click", () => handleMapCellClick(x, y));
      cell.addEventListener("dblclick", (event) => {
        event.preventDefault();
        handleMapCellDoubleClick(x, y);
      });
      els.battlefield.append(cell);
    }
  }

  renderMapEdges();

  state.tokens.filter((token) => !isPlayerMapView() || !token.hidden).forEach((token) => {
    const piece = document.createElement("div");
    const controllable = canControlToken(token);
    piece.className = `token facing-${token.facing || "s"}${state.selectedToken === token.id ? " selected" : ""}${token.hidden ? " token-hidden" : ""}${token.type === "npc" ? " npc-token" : ""}${controllable ? "" : " token-locked"}`;
    piece.dataset.tokenId = token.id;
    piece.style.left = `calc(${token.x} * var(--cell-size))`;
    piece.style.top = `calc(${token.y} * var(--cell-size))`;
    if (token.portrait) {
      piece.classList.add("token-portrait");
      piece.style.backgroundImage = `url("${token.portrait}")`;
      piece.innerHTML = `${tokenFacing(token)}${tokenBars(token)}${tokenNameTag(token)}`;
    } else {
      piece.style.background = token.color;
      piece.style.color = token.color;
      piece.innerHTML = `<span class="token-initials">${escapeHtml(initials(tokenDisplayName(token)))}</span>${tokenFacing(token)}${tokenBars(token)}${tokenNameTag(token)}`;
    }
    piece.title = `${tokenDisplayName(token)} | luz ${token.light}${token.hidden ? " | invisivel" : ""}${controllable ? " | duplo clique: dano/cura | clique direito: virar" : ""}`;
    piece.draggable = controllable;
    piece.addEventListener("click", (event) => {
      event.stopPropagation();
      const attacker = state.tokens.find((item) => item.id === state.selectedToken);
      if (attacker && attacker.id !== token.id && canControlToken(attacker)) {
        animateTokenAttack(attacker.id, token.id);
        return;
      }
      if (!controllable) return;
      state.selectedToken = token.id;
      renderAll();
    });
    piece.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      if (!controllable) return;
      promptTokenDamage(token.id);
    });
    piece.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!controllable) return;
      rotateTokenFacing(token.id);
    });
    piece.addEventListener("dragstart", (event) => {
      if (!controllable) {
        event.preventDefault();
        return;
      }
      state.selectedToken = token.id;
      event.dataTransfer.setData("text/plain", token.id);
    });
    els.battlefield.append(piece);
  });
}

function tokenDisplayName(token) {
  const sheet = token?.sheetId ? state.sheets.find((item) => item.id === token.sheetId) : null;
  return sheet?.name || token?.name || "Token";
}

function tokenNameTag(token) {
  return `<span class="token-name-tag">${escapeHtml(tokenDisplayName(token))}</span>`;
}

function tokenBars(token) {
  return `
    <span class="token-bars" aria-hidden="true">
      ${miniTokenBar(token.hp, token.hpMax, "hp")}
      ${miniTokenBar(token.pe, token.peMax, "pe")}
      ${miniTokenBar(token.san, token.sanMax, "san")}
    </span>
  `;
}

function tokenFacing(token) {
  return `<span class="token-facing" aria-hidden="true"></span>`;
}

function miniTokenBar(current, max, type) {
  const safeMax = Math.max(Number(max) || 1, 1);
  const safeCurrent = Math.max(0, Math.min(safeMax, Number(current) || 0));
  const pct = Math.round((safeCurrent / safeMax) * 100);
  return `<i class="token-bar ${type}" style="--token-bar:${pct}%"></i>`;
}

function promptTokenDamage(tokenId) {
  const token = state.tokens.find((item) => item.id === tokenId);
  if (!canControlToken(token)) return;
  const raw = window.prompt(`Dano em ${token.name}. Use numero negativo para curar:`, "1");
  if (raw === null) return;
  const value = Number(raw);
  if (!Number.isFinite(value) || value === 0) return;
  applyTokenDamage(tokenId, Math.abs(value), value < 0 ? "heal" : "damage");
}

function animateTokenAttack(attackerId, targetId) {
  const attacker = state.tokens.find((item) => item.id === attackerId);
  const target = state.tokens.find((item) => item.id === targetId);
  if (!attacker || !target || !els.battlefield) return;
  const cellSize = viewCellSize || state.map.cellSize || 48;
  const ax = (attacker.x + 0.5) * cellSize;
  const ay = (attacker.y + 0.5) * cellSize;
  const bx = (target.x + 0.5) * cellSize;
  const by = (target.y + 0.5) * cellSize;
  const length = Math.max(24, Math.hypot(bx - ax, by - ay));
  const angle = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
  const trail = document.createElement("div");
  trail.className = "attack-trail";
  trail.style.left = `${ax}px`;
  trail.style.top = `${ay}px`;
  trail.style.width = `${length}px`;
  trail.style.transform = `rotate(${angle}deg)`;
  trail.innerHTML = `<span>ATAQUE</span>`;
  els.battlefield.append(trail);
  playDiceSound();
  window.setTimeout(() => trail.remove(), 780);
}

function renderMapBackground() {
  const bg = state.map.background || defaultMapBackground();
  if (!bg.src) return;
  const layer = document.createElement("div");
  layer.className = `map-background${bg.locked ? " locked" : ""}`;
  layer.style.backgroundImage = `url("${bg.src}")`;
  layer.style.setProperty("--map-bg-scale-x", `${bg.scaleX}%`);
  layer.style.setProperty("--map-bg-scale-y", `${bg.scaleY}%`);
  layer.style.setProperty("--map-bg-x", `${bg.x}%`);
  layer.style.setProperty("--map-bg-y", `${bg.y}%`);
  layer.style.setProperty("--map-bg-rotation", `${bg.rotation}deg`);
  layer.style.opacity = String((Number(bg.opacity) || 0) / 100);
  els.battlefield.append(layer);
}

function renderMapEdges() {
  state.map = normalizeMap(state.map);
  const edges = state.map.edges || [];
  if (!edges.length && !pendingMapEdgeStart) return;
  if (isPlayerMapView()) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("map-edge-layer");
  svg.setAttribute("viewBox", `0 0 ${state.map.cols} ${state.map.rows}`);
  svg.setAttribute("preserveAspectRatio", "none");
  edges.forEach((edge) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", edge.x1);
    line.setAttribute("y1", edge.y1);
    line.setAttribute("x2", edge.x2);
    line.setAttribute("y2", edge.y2);
    line.classList.add("map-edge", edge.type === "door" ? "map-door-edge" : "map-wall-edge", `edge-${edge.state}`);
    line.dataset.edgeId = edge.id;
    if (edge.type === "door") {
      line.addEventListener("dblclick", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleDoorEdge(edge.id);
      });
    }
    svg.append(line);
    if (edge.type === "door") {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", (edge.x1 + edge.x2) / 2);
      text.setAttribute("y", (edge.y1 + edge.y2) / 2);
      text.classList.add("map-door-label");
      text.textContent = { open: "aberta", closed: "fechada", locked: "trancada", secret: "secreta" }[edge.state] || "porta";
      svg.append(text);
    }
  });
  if (pendingMapEdgeStart) {
    const pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    pulse.setAttribute("cx", pendingMapEdgeStart.x);
    pulse.setAttribute("cy", pendingMapEdgeStart.y);
    pulse.setAttribute("r", ".16");
    pulse.classList.add("map-edge-start");
    svg.append(pulse);
  }
  els.battlefield.append(svg);
}

function cellClass(x, y) {
  const classes = ["cell"];
  const mark = !isPlayerMapView() ? mapMarkAt(x, y) : null;
  if (mark) classes.push(mark.type === "door" ? (mark.open ? "door-open" : "door-closed") : "wall-cell");
  if (state.map.fog?.enabled) {
    const visible = isFogVisible(x, y);
    const revealed = isFogRevealed(x, y);
    if (isPlayerMapView()) {
      if (visible) classes.push("fog-visible");
      else if (revealed && state.map.fog.keepExplored) classes.push("fog-explored");
      else classes.push("fog-hidden");
    } else {
      if (!revealed) classes.push("fog-master");
      if (revealed) classes.push("fog-revealed");
      if (visible) classes.push("fog-visible");
    }
  }
  if (!state.map.lightsOn) return classes.join(" ");
  const lit = state.tokens
    .filter((token) => !isPlayerMapView() || !token.hidden)
    .some((token) => distance(token.x, token.y, x, y) <= tokenVisionRangeForCell(token, x, y) && !isSightBlocked(token.x, token.y, x, y));
  classes.push(lit ? "lit" : "dark");
  return classes.join(" ");
}

function cellKey(x, y) {
  return `${x},${y}`;
}

function isFogRevealed(x, y) {
  return state.map.fog?.revealed?.includes(cellKey(x, y));
}

function isFogVisible(x, y) {
  return state.map.fog?.visible?.includes(cellKey(x, y));
}

function isPlayerMapView() {
  return state.currentMode !== "master" || mapPlayerPreview;
}

function mapMarkAt(x, y) {
  return state.map.marks?.find((mark) => mark.x === x && mark.y === y) || null;
}

function blocksSight(x, y) {
  const mark = mapMarkAt(x, y);
  return mark?.type === "wall" || (mark?.type === "door" && !mark.open);
}

function isSightBlocked(ax, ay, bx, by) {
  const line = { x1: ax + 0.5, y1: ay + 0.5, x2: bx + 0.5, y2: by + 0.5 };
  if ((state.map.edges || []).some((edge) => edgeBlocksSight(edge) && segmentsIntersect(line, edge))) return true;
  const cells = lineCells(ax, ay, bx, by).slice(1, -1);
  return cells.some(([x, y]) => blocksSight(x, y));
}

function edgeBlocksSight(edge) {
  if (!edge) return false;
  if (edge.type === "wall") return true;
  return edge.type === "door" && edge.state !== "open";
}

function segmentsIntersect(a, b) {
  const p1 = { x: a.x1, y: a.y1 };
  const q1 = { x: a.x2, y: a.y2 };
  const p2 = { x: b.x1, y: b.y1 };
  const q2 = { x: b.x2, y: b.y2 };
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);
  if (o1 !== o2 && o3 !== o4) return true;
  return false;
}

function orientation(p, q, r) {
  const value = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (Math.abs(value) < 0.0001) return 0;
  return value > 0 ? 1 : 2;
}

function lineCells(x0, y0, x1, y1) {
  const cells = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let error = dx - dy;
  let x = x0;
  let y = y0;
  while (true) {
    cells.push([x, y]);
    if (x === x1 && y === y1) break;
    const e2 = 2 * error;
    if (e2 > -dy) {
      error -= dy;
      x += sx;
    }
    if (e2 < dx) {
      error += dx;
      y += sy;
    }
  }
  return cells;
}

function upsertMapMark(x, y, type) {
  state.map.marks = (state.map.marks || []).filter((mark) => mark.x !== x || mark.y !== y);
  state.map.marks.push({ x, y, type, open: false });
}

function removeMapMark(x, y) {
  state.map.marks = (state.map.marks || []).filter((mark) => mark.x !== x || mark.y !== y);
}

function mapPointFromCell(x, y) {
  return state.map.snap === false
    ? { x: x + 0.5, y: y + 0.5 }
    : { x: clamp(x + 0.5, 0, state.map.cols), y: clamp(y + 0.5, 0, state.map.rows) };
}

function sameEdge(a, b) {
  if (!a || !b) return false;
  const direct = Math.abs(a.x1 - b.x1) < 0.001 && Math.abs(a.y1 - b.y1) < 0.001 && Math.abs(a.x2 - b.x2) < 0.001 && Math.abs(a.y2 - b.y2) < 0.001;
  const reverse = Math.abs(a.x1 - b.x2) < 0.001 && Math.abs(a.y1 - b.y2) < 0.001 && Math.abs(a.x2 - b.x1) < 0.001 && Math.abs(a.y2 - b.y1) < 0.001;
  return direct || reverse;
}

function upsertMapEdge(start, end, type) {
  state.map.edges = state.map.edges || [];
  const draft = { x1: start.x, y1: start.y, x2: end.x, y2: end.y, type };
  const existing = state.map.edges.find((edge) => sameEdge(edge, draft));
  if (existing) {
    existing.type = type;
    if (type === "door") existing.state = nextDoorState(existing.state);
    else existing.state = "closed";
    return;
  }
  state.map.edges.push({ id: crypto.randomUUID(), ...draft, state: type === "door" ? "closed" : "closed" });
}

function nextDoorState(stateName) {
  return { closed: "open", open: "locked", locked: "secret", secret: "closed" }[stateName] || "closed";
}

function toggleDoorEdge(edgeId) {
  if (!isMasterMode()) return;
  const edge = (state.map.edges || []).find((item) => item.id === edgeId);
  if (!edge || edge.type !== "door") return;
  edge.state = edge.state === "open" ? "closed" : "open";
  renderAll();
  markMapStructureChanged();
}

function toggleNearestDoor(x, y) {
  if (!isMasterMode()) return false;
  const point = mapPointFromCell(x, y);
  let best = null;
  (state.map.edges || []).forEach((edge) => {
    if (edge.type !== "door") return;
    const distanceToEdge = distancePointToSegment(point, edge);
    if (!best || distanceToEdge < best.distance) best = { edge, distance: distanceToEdge };
  });
  if (!best || best.distance > 0.85) return false;
  best.edge.state = best.edge.state === "open" ? "closed" : "open";
  renderAll();
  markMapStructureChanged();
  return true;
}

function removeNearestMapEdge(x, y) {
  const point = mapPointFromCell(x, y);
  const edges = state.map.edges || [];
  if (!edges.length) return false;
  let best = null;
  edges.forEach((edge) => {
    const distanceToEdge = distancePointToSegment(point, edge);
    if (!best || distanceToEdge < best.distance) best = { edge, distance: distanceToEdge };
  });
  if (best && best.distance < 0.75) {
    state.map.edges = edges.filter((edge) => edge.id !== best.edge.id);
    return true;
  }
  return false;
}

function distancePointToSegment(point, edge) {
  const dx = edge.x2 - edge.x1;
  const dy = edge.y2 - edge.y1;
  if (dx === 0 && dy === 0) return Math.hypot(point.x - edge.x1, point.y - edge.y1);
  const t = Math.max(0, Math.min(1, ((point.x - edge.x1) * dx + (point.y - edge.y1) * dy) / (dx * dx + dy * dy)));
  const x = edge.x1 + t * dx;
  const y = edge.y1 + t * dy;
  return Math.hypot(point.x - x, point.y - y);
}

function revealFogAt(x, y, radius = 1) {
  state.map.fog = { ...defaultFog(), ...(state.map.fog || {}) };
  const revealed = new Set(state.map.fog.revealed || []);
  const visible = new Set(state.map.fog.visible || []);
  for (let yy = y - radius; yy <= y + radius; yy += 1) {
    for (let xx = x - radius; xx <= x + radius; xx += 1) {
      if (xx >= 0 && yy >= 0 && xx < state.map.cols && yy < state.map.rows) {
        revealed.add(cellKey(xx, yy));
        visible.add(cellKey(xx, yy));
      }
    }
  }
  state.map.fog.revealed = Array.from(revealed);
  state.map.fog.visible = Array.from(visible);
}

function hideFogAt(x, y, radius = 1) {
  state.map.fog = { ...defaultFog(), ...(state.map.fog || {}) };
  const hide = new Set();
  for (let yy = y - radius; yy <= y + radius; yy += 1) {
    for (let xx = x - radius; xx <= x + radius; xx += 1) hide.add(cellKey(xx, yy));
  }
  state.map.fog.revealed = (state.map.fog.revealed || []).filter((key) => !hide.has(key));
  state.map.fog.visible = (state.map.fog.visible || []).filter((key) => !hide.has(key));
}

function updateFogVisibilityFromTokens() {
  state.map = normalizeMap(state.map);
  state.map.fog = { ...defaultFog(), ...(state.map.fog || {}), enabled: true, mode: "vision" };
  const revealed = new Set(state.map.fog.revealed || []);
  const visible = new Set();
  state.tokens
    .filter((token) => !token.hidden)
    .forEach((token) => {
      const range = Math.max(0, Number(token.light) || 0);
      for (let y = Math.max(0, token.y - range); y <= Math.min(state.map.rows - 1, token.y + range); y += 1) {
        for (let x = Math.max(0, token.x - range); x <= Math.min(state.map.cols - 1, token.x + range); x += 1) {
          const cellRange = tokenVisionRangeForCell(token, x, y);
          if (distance(token.x, token.y, x, y) <= cellRange && !isSightBlocked(token.x, token.y, x, y)) {
            revealed.add(cellKey(x, y));
            visible.add(cellKey(x, y));
          }
        }
      }
    });
  state.map.fog.revealed = Array.from(revealed);
  state.map.fog.visible = Array.from(visible);
}

function revealFogByTokenVision() {
  updateFogVisibilityFromTokens();
  renderAll();
}

function tokenVisionRangeForCell(token, x, y) {
  const range = Math.max(0, Number(token.light) || 0);
  if (x === token.x && y === token.y) return range;
  const vectors = {
    n: { x: 0, y: -1 },
    e: { x: 1, y: 0 },
    s: { x: 0, y: 1 },
    w: { x: -1, y: 0 }
  };
  const facing = vectors[token.facing || "s"] || vectors.s;
  const dx = x - token.x;
  const dy = y - token.y;
  const dot = dx * facing.x + dy * facing.y;
  if (dot < 0) return Math.min(range, 1);
  return range;
}

function handleMapCellClick(x, y) {
  const tool = state.map.tool || "move";
  if (!isMasterMode() && tool !== "move") return;
  if (tool === "move") {
    moveSelectedToken(x, y);
    return;
  }
  if (tool === "reveal") revealFogAt(x, y, 1);
  if (tool === "hide") hideFogAt(x, y, 1);
  if (tool === "wall" || tool === "door") {
    const point = mapPointFromCell(x, y);
    if (!pendingMapEdgeStart) {
      pendingMapEdgeStart = point;
      renderGrid();
      return;
    }
    upsertMapEdge(pendingMapEdgeStart, point, tool);
    pendingMapEdgeStart = null;
    markMapStructureChanged();
  }
  if (tool === "door") {
    // handled by edge workflow above
  }
  if (tool === "erase") {
    removeNearestMapEdge(x, y);
    removeMapMark(x, y);
    hideFogAt(x, y, 0);
    markMapStructureChanged();
  }
  renderAll();
}

function handleMapCellDoubleClick(x, y) {
  if (!isMasterMode()) return;
  if (toggleNearestDoor(x, y)) return;
}

function distance(ax, ay, bx, by) {
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function moveSelectedToken(x, y) {
  const token = state.tokens.find((item) => item.id === state.selectedToken);
  if (!canControlToken(token)) return;
  if (isMovementBlocked(token, x, y)) {
    flashBlockedMove(x, y);
    return;
  }
  token.x = x;
  token.y = y;
  if (state.map.fog?.enabled && state.map.fog.mode === "vision") updateFogVisibilityFromTokens();
  localOnlyRender();
  markGridChanged(token, "move");
}

function isMovementBlocked(token, x, y) {
  if (!token) return true;
  if (x < 0 || y < 0 || x >= state.map.cols || y >= state.map.rows) return true;
  if (blocksSight(x, y)) return true;
  return isSightBlocked(token.x, token.y, x, y);
}

function flashBlockedMove(x, y) {
  const cell = els.battlefield?.querySelector(`[data-x="${x}"][data-y="${y}"]`);
  if (!cell) return;
  cell.classList.remove("move-blocked");
  void cell.offsetWidth;
  cell.classList.add("move-blocked");
  window.setTimeout(() => cell.classList.remove("move-blocked"), 520);
}

function rotateTokenFacing(tokenId) {
  const token = state.tokens.find((item) => item.id === tokenId);
  if (!canControlToken(token)) return;
  const order = ["n", "e", "s", "w"];
  const current = order.indexOf(token.facing || "s");
  token.facing = order[(current + 1 + order.length) % order.length];
  if (state.map.fog?.enabled && state.map.fog.mode === "vision") updateFogVisibilityFromTokens();
  localOnlyRender();
  markGridChanged(token, "full");
}

function renderTokenList() {
  if (!els.tokenList) return;
  els.tokenList.innerHTML = "";
  state.tokens.filter((token) => state.currentMode === "master" || !token.hidden).forEach((token) => {
    const canEdit = canControlToken(token);
    const row = document.createElement("div");
    row.className = `token-item${token.hidden ? " hidden-token-row" : ""}`;
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(token.name)}</strong>
        <small>${escapeHtml(token.label || (token.type === "npc" ? "NPC/Criatura" : "Personagem"))} | ${token.x + 1},${token.y + 1} | Frente ${facingLabel(token.facing)}${token.defense ? ` | Def ${escapeHtml(token.defense)}` : ""}${token.attack ? ` | ${escapeHtml(token.attack)}` : ""}${token.hidden ? " | invisivel" : ""}</small>
      </div>
      <span>PV ${escapeHtml(token.hp ?? "?")} / ${escapeHtml(token.hpMax ?? "?")}<br>Luz ${escapeHtml(token.light)}</span>
      ${canEdit ? `<div class="damage-inline"><input data-token-damage="${escapeAttr(token.id)}" type="number" min="0" placeholder="Dano" /><button type="button" data-token-damage-apply="${escapeAttr(token.id)}">Dano</button><button type="button" data-token-heal-apply="${escapeAttr(token.id)}">Cura</button></div>` : ""}
    `;
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "master-only";
    toggle.textContent = token.hidden ? "Mostrar" : "Ocultar";
    toggle.addEventListener("click", () => {
      token.hidden = !token.hidden;
      localOnlyRender();
      markGridChanged(token, "full");
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "master-only";
    remove.textContent = "Remover";
    remove.addEventListener("click", () => {
      state.tokens = state.tokens.filter((item) => item.id !== token.id);
      localOnlyRender();
      deleteGridTokenOnline(token.id);
    });
    const rotate = document.createElement("button");
    rotate.type = "button";
    rotate.textContent = "Virar";
    rotate.disabled = !canEdit;
    rotate.addEventListener("click", () => rotateTokenFacing(token.id));
    row.append(rotate, toggle, remove);
    els.tokenList.append(row);
  });
  els.tokenList.querySelectorAll("[data-token-damage-apply]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = els.tokenList.querySelector(`[data-token-damage="${selectorEscape(button.dataset.tokenDamageApply)}"]`);
      applyTokenDamage(button.dataset.tokenDamageApply, Number(input?.value || 0), "damage");
    });
  });
  els.tokenList.querySelectorAll("[data-token-heal-apply]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = els.tokenList.querySelector(`[data-token-damage="${selectorEscape(button.dataset.tokenHealApply)}"]`);
      applyTokenDamage(button.dataset.tokenHealApply, Number(input?.value || 0), "heal");
    });
  });
}

function facingLabel(facing = "s") {
  return { n: "Norte", e: "Leste", s: "Sul", w: "Oeste" }[facing] || "Sul";
}

function renderNpcMiniCards() {
  if (!els.npcMiniCards) return;
  const npcs = state.tokens.filter((token) => token.type === "npc" && (state.currentMode === "master" || !token.hidden));
  if (!npcs.length) {
    els.npcMiniCards.innerHTML = `<p>Nenhum NPC criado no grid.</p>`;
    return;
  }
  els.npcMiniCards.innerHTML = npcs.map((token) => {
    const portrait = token.portrait
      ? `<span class="npc-mini-portrait" style="background-image:url('${escapeAttr(token.portrait)}')"></span>`
      : `<span class="npc-mini-portrait fallback">${escapeHtml(initials(token.name || "NPC"))}</span>`;
    return `
      <article class="npc-mini-card${token.hidden ? " hidden-token-row" : ""}">
        ${portrait}
        <div class="npc-mini-body">
          <b>${escapeHtml(token.name || "NPC")}</b>
          <span>${escapeHtml(token.label || "NPC/Criatura")} | ${token.x + 1},${token.y + 1} | Frente ${facingLabel(token.facing)}</span>
          <small>PV ${escapeHtml(token.hp ?? "?")} / ${escapeHtml(token.hpMax ?? "?")} | Def ${escapeHtml(token.defense ?? 10)} | Luz ${escapeHtml(token.light ?? 0)}</small>
          ${token.attack ? `<small>Ataque: ${escapeHtml(token.attack)}</small>` : ""}
          <div class="shield-bars compact-bars">
            ${shieldBar("PV", token.hp, token.hpMax, "#a82924")}
          </div>
          <div class="damage-inline">
            <input data-npc-damage="${escapeAttr(token.id)}" type="number" min="0" placeholder="Dano" />
            <button type="button" data-npc-damage-apply="${escapeAttr(token.id)}">Dano</button>
            <button type="button" data-npc-heal-apply="${escapeAttr(token.id)}">Cura</button>
          </div>
          <div class="npc-mini-actions">
            <button type="button" data-npc-rotate="${escapeAttr(token.id)}">Virar</button>
            <button type="button" data-npc-hide="${escapeAttr(token.id)}">${token.hidden ? "Mostrar" : "Ocultar"}</button>
            <button type="button" data-npc-remove="${escapeAttr(token.id)}">Remover</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
  els.npcMiniCards.querySelectorAll("[data-npc-damage-apply]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = els.npcMiniCards.querySelector(`[data-npc-damage="${selectorEscape(button.dataset.npcDamageApply)}"]`);
      applyTokenDamage(button.dataset.npcDamageApply, Number(input?.value || 0), "damage");
    });
  });
  els.npcMiniCards.querySelectorAll("[data-npc-heal-apply]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = els.npcMiniCards.querySelector(`[data-npc-damage="${selectorEscape(button.dataset.npcHealApply)}"]`);
      applyTokenDamage(button.dataset.npcHealApply, Number(input?.value || 0), "heal");
    });
  });
  els.npcMiniCards.querySelectorAll("[data-npc-rotate]").forEach((button) => {
    button.addEventListener("click", () => rotateTokenFacing(button.dataset.npcRotate));
  });
  els.npcMiniCards.querySelectorAll("[data-npc-hide]").forEach((button) => {
    button.addEventListener("click", () => {
      const token = state.tokens.find((item) => item.id === button.dataset.npcHide);
      if (!token) return;
      token.hidden = !token.hidden;
      localOnlyRender();
      markGridChanged(token, "full");
    });
  });
  els.npcMiniCards.querySelectorAll("[data-npc-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const tokenId = button.dataset.npcRemove;
      state.tokens = state.tokens.filter((item) => item.id !== button.dataset.npcRemove);
      localOnlyRender();
      deleteGridTokenOnline(tokenId);
    });
  });
}

function renderMasterShield() {
  if (!els.masterShield) return;
  const campaign = currentCampaign();
  const linked = sheetsLinkedToCampaign(campaign);
  console.log("Carregando escudo do mestre", { campanha_id: campaign?.id || "", totalLocal: linked.length });
  if (!linked.length) {
    els.masterShield.innerHTML = `
      ${isMasterMode() ? `<div class="master-shield-actions"><button type="button" data-create-session-sheet>Criar ficha da sessao</button></div>` : ""}
      <p>Nenhuma ficha vinculada.</p>
    `;
  } else {
    els.masterShield.innerHTML = `
      ${isMasterMode() ? `<div class="master-shield-actions"><button type="button" data-create-session-sheet>Criar ficha da sessao</button></div>` : ""}
      ${linked.map((sheet) => {
        const token = state.tokens.find((item) => item.sheetId === sheet.id);
        const sessionSheet = sheetOrigin(sheet) === "sessao";
        return `
          <article class="shield-agent">
            <b>${escapeHtml(sheet.name || "Agente")}</b>
            <span>${escapeHtml(sheet.player || "Jogador")} | ${escapeHtml(sheet.className || sheet.fichaCategoria || "Sem classe")} | ${escapeHtml(sheet.nex || sheet.rank || "5%")}</span>
            <small>${sessionSheet ? "Ficha da sessao" : "Ficha do jogador"}${sheet.editLocked ? " | Bloqueada" : " | Edicao liberada"}</small>
            <div class="shield-bars">
              ${shieldBar("PV", sheet.hp, sheet.hpMax, "#a82924")}
              ${shieldBar("PE", sheet.pe, sheet.peMax, "#d08a22")}
              ${shieldBar("SAN", sheet.san, sheet.sanMax, "#7c3bd1")}
            </div>
            <small>Def ${escapeHtml(sheet.defense ?? 10)} | Luz ${escapeHtml(token?.light ?? inventoryVisionBonus(sheet))} | ${token ? `Token ${token.x + 1},${token.y + 1}` : "Sem token"}</small>
            <div class="damage-inline">
              <input data-shield-damage="${escapeAttr(sheet.id)}" type="number" min="0" placeholder="Dano" />
              <button type="button" data-shield-damage-apply="${escapeAttr(sheet.id)}">Dano</button>
              <button type="button" data-shield-heal-apply="${escapeAttr(sheet.id)}">Cura</button>
            </div>
            <div class="shield-shortcuts">
              <button type="button" data-shield-open-sheet="${escapeAttr(sheet.id)}">Ficha</button>
              <button type="button" data-shield-open-inventory="${escapeAttr(sheet.id)}">Inventario</button>
              ${isMasterMode() && sessionSheet ? `<button type="button" data-session-sheet-lock="${escapeAttr(sheet.id)}">${sheet.editLocked ? "Liberar edicao" : "Travar edicao"}</button><button type="button" data-session-sheet-migrate="${escapeAttr(sheet.id)}">Migrar para jogador</button>` : ""}
            </div>
          </article>
        `;
      }).join("")}
    `;
  }
  els.masterShield.querySelector("[data-create-session-sheet]")?.addEventListener("click", createSessionSheetByMaster);
  els.masterShield.querySelectorAll("[data-session-sheet-lock]").forEach((button) => {
    button.addEventListener("click", () => toggleSessionSheetLock(button.dataset.sessionSheetLock));
  });
  els.masterShield.querySelectorAll("[data-session-sheet-migrate]").forEach((button) => {
    button.addEventListener("click", () => migrateSessionSheetToPlayer(button.dataset.sessionSheetMigrate));
  });
  els.masterShield.querySelectorAll("[data-shield-damage-apply]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = els.masterShield.querySelector(`[data-shield-damage="${selectorEscape(button.dataset.shieldDamageApply)}"]`);
      applySheetDamage(button.dataset.shieldDamageApply, Number(input?.value || 0), "damage");
    });
  });
  els.masterShield.querySelectorAll("[data-shield-heal-apply]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = els.masterShield.querySelector(`[data-shield-damage="${selectorEscape(button.dataset.shieldHealApply)}"]`);
      applySheetDamage(button.dataset.shieldHealApply, Number(input?.value || 0), "heal");
    });
  });
  els.masterShield.querySelectorAll("[data-shield-open-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeSheetId = button.dataset.shieldOpenSheet;
      masterInventorySheetId = button.dataset.shieldOpenSheet;
      switchTab("fichas");
    });
  });
  els.masterShield.querySelectorAll("[data-shield-open-inventory]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeSheetId = button.dataset.shieldOpenInventory;
      masterInventorySheetId = button.dataset.shieldOpenInventory;
      switchTab("inventario");
    });
  });
}

function shieldBar(label, current, max, color) {
  const safeMax = Math.max(Number(max) || 1, 1);
  const safeCurrent = Math.max(0, Number(current) || 0);
  const pct = Math.max(0, Math.min(100, (safeCurrent / safeMax) * 100));
  return `<label><span>${label} ${escapeHtml(safeCurrent)} / ${escapeHtml(safeMax)}</span><i style="--bar:${pct}%;--bar-color:${color}"></i></label>`;
}

function sessionPlayerHint() {
  const campaign = currentCampaign();
  const ids = mergeUnique([...(campaign?.jogadores || []), ...state.sheets.map((sheet) => sheet.responsavelId || sheet.ownerId || sheet.user_id)]);
  const names = ids.map((id) => {
    const account = state.accounts.find((item) => item.id === id);
    return account ? `${account.username} (${account.id})` : id;
  }).filter(Boolean);
  return names.length ? `\nJogadores: ${names.join(", ")}` : "";
}

function resolveUserIdFromInput(value) {
  const clean = String(value || "").trim();
  if (!clean) return "";
  if (uuidOrNull(clean)) return clean;
  const account = state.accounts.find((item) =>
    normalizeKey(item.username) === normalizeKey(clean) ||
    normalizeKey(item.email) === normalizeKey(clean)
  );
  return uuidOrNull(account?.id) || "";
}

async function createSessionSheetByMaster() {
  if (!isMasterMode()) return;
  state.activeTab = "fichas";
  switchTab("fichas");
  renderTableSheetsPanel();
  document.querySelector("#sessionSheetName")?.focus();
}

async function createSessionSheetFromPanel() {
  if (!isMasterMode()) return;
  const campaign = currentCampaign();
  const user = currentUser();
  if (!campaign || !uuidOrNull(campaign.id)) {
    window.alert("Selecione uma campanha salva antes de criar ficha da sessao.");
    return;
  }
  if (supabaseClient() && !(await campaignExistsInSupabase(campaign.id))) {
    setSyncStatus("Campanha invalida ou nao encontrada. Recarregue a mesa.", true);
    return;
  }
  const system = systemFor(campaignSystemId(campaign));
  const name = document.querySelector("#sessionSheetName")?.value.trim() || (system.id === "dnd5e" ? "Novo aventureiro da sessao" : "Novo agente da sessao");
  const type = document.querySelector("#sessionSheetType")?.value || "Personagem da sessao";
  const responsibleId = uuidOrNull(document.querySelector("#sessionSheetPlayer")?.value);
  const responsibleInput = playerNameById(responsibleId);
  const unlocked = document.querySelector("#sessionSheetPermission")?.value === "unlocked";
  console.log("Criando ficha da sessao", { campanha_id: campaign.id, nome: name, responsavel_id: responsibleId, tipo: type });
  const sheet = normalizeSheet({
    ...blankSheetForSystem(system.id, name, responsibleInput || user.username),
    origem: "sessao",
    fichaCategoria: type,
    campanha_id: campaign.id,
    campanhaId: campaign.id,
    owner_id: user.id,
    ownerId: user.id,
    responsavel_id: responsibleId,
    responsavelId: responsibleId,
    user_id: responsibleId || user.id,
    edit_locked: !unlocked,
    editLocked: !unlocked,
    edit_allowed_by_master: unlocked,
    editAllowedByMaster: unlocked,
    download_allowed: false,
    migrada: false
  });
  state.sheets.unshift(sheet);
  campaign.personagens = mergeUnique([...(campaign.personagens || []), sheet.id]);
  if (responsibleId) campaign.jogadores = mergeUnique([...(campaign.jogadores || []), responsibleId]);
  state.activeSheetId = sheet.id;
  masterInventorySheetId = sheet.id;
  seedSessionTokensFromSheets(campaign, currentSession());
  try {
    await upsertSheetsOnline([sheetDatabaseRow(sheet, user)]);
    await upsertCampaignPlayerOnline(campaign.id, user.id, "mestre", "ativo");
    if (responsibleId) await upsertCampaignPlayerOnline(campaign.id, responsibleId, "jogador", "ativo");
    await saveOnlineState();
    console.log("Ficha da sessao criada", { ficha_id: sheet.id, campanha_id: campaign.id });
    setSyncStatus("Ficha da sessao criada no Supabase.");
  } catch (error) {
    setSyncStatus(`Ficha da sessao criada localmente. Falha online: ${error.message}`, true);
  }
  renderAll();
}

async function toggleSessionSheetLock(sheetId) {
  if (!isMasterMode()) return;
  const sheet = state.sheets.find((item) => item.id === sheetId);
  if (!sheet) return;
  const locked = !(sheet.editLocked === true);
  sheet.editLocked = locked;
  sheet.edit_locked = locked;
  sheet.editAllowedByMaster = !locked;
  sheet.edit_allowed_by_master = !locked;
  const client = supabaseClient();
  try {
    if (client && uuidOrNull(sheet.id)) {
      const { error } = await client.from("personagens").update({
        edit_locked: locked,
        edit_allowed_by_master: !locked,
        payload: normalizeSheet(sheet),
        updated_at: new Date().toISOString()
      }).eq("id", sheet.id);
      if (error) throw new Error(`personagens: ${remoteErrorMessage(error)}`);
    }
    setSyncStatus(locked ? "Ficha bloqueada pelo mestre." : "Edicao liberada pelo mestre.");
  } catch (error) {
    setSyncStatus(`Nao consegui salvar a trava no Supabase: ${error.message}`, true);
  }
  renderAll();
}

async function migrateSessionSheetToPlayer(sheetId, targetUserId = "") {
  if (!isMasterMode()) return;
  const user = currentUser();
  const source = state.sheets.find((item) => item.id === sheetId);
  const sheet = normalizeSheet(source || {});
  if (!sheet?.id || sheetOrigin(sheet) !== "sessao") return;
  if (!targetUserId) {
    state.pendingMigrationSheetId = sheetId;
    state.activeTab = "fichas";
    switchTab("fichas");
    renderAll();
    return;
  }
  console.log("Migrando ficha para jogador", { ficha_id: sheetId, jogador_id: targetUserId });
  const responsibleId = uuidOrNull(targetUserId);
  if (!responsibleId) {
    window.alert("Informe um jogador valido para receber a copia.");
    return;
  }
  const target = state.accounts.find((account) => account.id === responsibleId);
  const copy = normalizeSheet({
    ...sheet,
    id: crypto.randomUUID(),
    origem: "jogador",
    campanha_id: "",
    campanhaId: "",
    owner_id: responsibleId,
    ownerId: responsibleId,
    responsavel_id: responsibleId,
    responsavelId: responsibleId,
    user_id: responsibleId,
    player: target?.username || sheet.player || "Jogador",
    edit_locked: false,
    editLocked: false,
    edit_allowed_by_master: true,
    editAllowedByMaster: true,
    download_allowed: true,
    migrada: false,
    migrated_to_personagem_id: "",
    migratedToPersonagemId: ""
  });
  source.migrada = true;
  source.migratedToPersonagemId = copy.id;
  source.migrated_to_personagem_id = copy.id;
  state.sheets.unshift(copy);
  if (target) target.sheetIds = mergeUnique([...(target.sheetIds || []), copy.id]);
  const client = supabaseClient();
  try {
    await upsertSheetsOnline([sheetDatabaseRow(copy, { ...user, id: responsibleId, username: copy.player })]);
    if (client) {
      const { error } = await client.from("personagens").update({
        migrada: true,
        migrated_to_personagem_id: copy.id,
        payload: normalizeSheet(source),
        updated_at: new Date().toISOString()
      }).eq("id", sheet.id);
      if (error) throw new Error(`personagens: ${remoteErrorMessage(error)}`);
      if (target) await saveOnlineUser(target);
    }
    setSyncStatus("Ficha migrada para Minhas Fichas do jogador.");
  } catch (error) {
    setSyncStatus(`Migracao local feita, mas Supabase falhou: ${error.message}`, true);
  }
  state.pendingMigrationSheetId = null;
  renderAll();
}

async function changeSessionSheetResponsible(sheetId, responsibleId) {
  if (!isMasterMode()) return;
  const campaign = currentCampaign();
  const sheet = state.sheets.find((item) => item.id === sheetId);
  const safeResponsibleId = uuidOrNull(responsibleId);
  if (!campaign || !sheet || !safeResponsibleId) return;
  console.log("Vinculando ficha ao jogador", { ficha_id: sheetId, jogador_id: safeResponsibleId, campanha_id: campaign.id });
  sheet.responsavel_id = safeResponsibleId;
  sheet.responsavelId = safeResponsibleId;
  sheet.user_id = safeResponsibleId;
  sheet.player = playerNameById(safeResponsibleId);
  campaign.jogadores = mergeUnique([...(campaign.jogadores || []), safeResponsibleId]);
  const client = supabaseClient();
  try {
    await upsertCampaignPlayerOnline(campaign.id, safeResponsibleId, "jogador", "ativo");
    if (client) {
      const { error } = await client.from("personagens").update({
        user_id: safeResponsibleId,
        responsavel_id: safeResponsibleId,
        payload: normalizeSheet(sheet),
        updated_at: new Date().toISOString()
      }).eq("id", sheet.id);
      if (error) throw new Error(`personagens: ${remoteErrorMessage(error)}`);
    }
    setSyncStatus("Jogador responsavel atualizado.");
  } catch (error) {
    setSyncStatus(`Nao consegui atualizar responsavel online: ${error.message}`, true);
  }
  state.pendingResponsibleSheetId = null;
  renderAll();
}

async function removeSessionSheetFromCampaign(sheetId) {
  if (!isMasterMode()) return;
  const campaign = currentCampaign();
  const sheet = state.sheets.find((item) => item.id === sheetId);
  if (!campaign || !sheet) return;
  if (!window.confirm(`Remover "${sheet.name || "ficha"}" desta sessao?`)) return;
  campaign.personagens = (campaign.personagens || []).filter((id) => id !== sheetId);
  state.tokens = state.tokens.filter((token) => token.sheetId !== sheetId);
  if (sheetOrigin(sheet) === "sessao") {
    state.sheets = state.sheets.filter((item) => item.id !== sheetId);
  } else {
    sheet.campanha_id = "";
    sheet.campanhaId = "";
  }
  const client = supabaseClient();
  try {
    if (client && uuidOrNull(sheetId)) {
      if (sheetOrigin(sheet) === "sessao") {
        const { error } = await client.from("personagens").delete().eq("id", sheetId);
        if (error) throw new Error(`personagens: ${remoteErrorMessage(error)}`);
      } else {
        const { error } = await client.from("personagens").update({
          campanha_id: null,
          payload: normalizeSheet(sheet),
          updated_at: new Date().toISOString()
        }).eq("id", sheetId);
        if (error) throw new Error(`personagens: ${remoteErrorMessage(error)}`);
      }
    }
    setSyncStatus("Ficha removida da sessao.");
  } catch (error) {
    setSyncStatus(`Ficha removida localmente. Falha online: ${error.message}`, true);
  }
  renderAll();
}

function addToken(source = "sidebar") {
  const quick = source === "quick";
  const nameInput = quick ? els.quickTokenName : els.tokenName;
  const colorInput = quick ? els.quickTokenColor : els.tokenColor;
  const lightInput = quick ? els.quickTokenLight : els.tokenLight;
  const name = nameInput?.value.trim() || `Token ${state.tokens.length + 1}`;
  const token = {
    id: crypto.randomUUID(),
    name,
    type: "token",
    label: "Token",
    color: colorInput?.value || "#c83b2f",
    light: clamp(Number(lightInput?.value ?? 3), 0, 10),
    hidden: false,
    facing: "s",
    x: Math.floor(state.map.cols / 2),
    y: Math.floor(state.map.rows / 2)
  };
  state.tokens.push(token);
  if (nameInput) nameInput.value = "";
  localOnlyRender();
  markGridChanged(token, "full");
}

function addNpcToken() {
  const name = els.npcName?.value.trim() || `NPC ${state.tokens.length + 1}`;
  const hp = clamp(Number(els.npcHp?.value || 20), 1, 999);
  const defense = clamp(Number(els.npcDefense?.value || 10), 0, 99);
  const light = clamp(Number(els.npcLight?.value || 0), 0, 10);
  const token = {
    id: crypto.randomUUID(),
    name,
    type: "npc",
    label: els.npcType?.value.trim() || "NPC/Criatura",
    color: els.npcColor?.value || "#7b241c",
    portrait: pendingNpcPortrait,
    light,
    hidden: els.npcHidden?.checked === true,
    facing: "s",
    defense,
    attack: els.npcAttack?.value.trim() || "",
    hp,
    hpMax: hp,
    x: Math.floor(state.map.cols / 2),
    y: Math.floor(state.map.rows / 2)
  };
  state.tokens.push(token);
  if (els.npcName) els.npcName.value = "";
  if (els.npcAttack) els.npcAttack.value = "";
  if (els.npcImage) els.npcImage.value = "";
  pendingNpcPortrait = "";
  localOnlyRender();
  markGridChanged(token, "full");
}

function renderMasterSheetNavigator(activeSheet) {
  if (!isMasterMode()) return "";
  const linkedSheets = sheetsLinkedToCampaign(currentCampaign());
  if (!linkedSheets.length) return "";
  return `
    <section class="sheet-master-switcher note-paper">
      <div>
        <b>Fichas vinculadas</b>
        <span>${linkedSheets.length} agente(s) nesta campanha</span>
      </div>
      <div class="sheet-master-buttons">
        ${linkedSheets.map((sheet) => `
          <button type="button" data-master-sheet="${escapeAttr(sheet.id)}" class="${sheet.id === activeSheet.id ? "selected" : ""}">
            <span class="mini-sheet-photo" style="${sheet.portrait ? `background-image:url('${escapeAttr(sheet.portrait)}')` : ""}">${sheet.portrait ? "" : escapeHtml(initials(sheet.name || "AG"))}</span>
            <b>${escapeHtml(sheet.name || "Agente")}</b>
            <small>${escapeHtml(sheet.player || "Jogador")} | ${escapeHtml(sheet.className || "Sem classe")} | ${escapeHtml(sheet.nex || "5%")}</small>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function dndValue(sheet, field, fallback = "") {
  return sheet.dnd?.[field] ?? fallback;
}

const DND_ABILITIES = [
  ["forca", "FOR", "Forca"],
  ["destreza", "DES", "Destreza"],
  ["constituicao", "CON", "Constituicao"],
  ["inteligencia", "INT", "Inteligencia"],
  ["sabedoria", "SAB", "Sabedoria"],
  ["carisma", "CAR", "Carisma"]
];

const DND_SKILLS = [
  ["acrobacia", "Acrobacia", "destreza"],
  ["adestrarAnimais", "Adestrar Animais", "sabedoria"],
  ["arcanismo", "Arcanismo", "inteligencia"],
  ["atletismo", "Atletismo", "forca"],
  ["atuacao", "Atuacao", "carisma"],
  ["enganacao", "Enganacao", "carisma"],
  ["furtividade", "Furtividade", "destreza"],
  ["historia", "Historia", "inteligencia"],
  ["intimidacao", "Intimidacao", "carisma"],
  ["intuicao", "Intuicao", "sabedoria"],
  ["investigacao", "Investigacao", "inteligencia"],
  ["lidarComAnimais", "Lidar com Animais", "sabedoria"],
  ["medicina", "Medicina", "sabedoria"],
  ["natureza", "Natureza", "inteligencia"],
  ["percepcao", "Percepcao", "sabedoria"],
  ["persuasao", "Persuasao", "carisma"],
  ["prestidigitacao", "Prestidigitacao", "destreza"],
  ["religiao", "Religiao", "inteligencia"],
  ["sobrevivencia", "Sobrevivencia", "sabedoria"]
];

const DND_CLASSES = [
  ["", "Escolha a classe"],
  ["Barbaro", "Barbaro"],
  ["Bardo", "Bardo"],
  ["Bruxo", "Bruxo"],
  ["Clerigo", "Clerigo"],
  ["Druida", "Druida"],
  ["Feiticeiro", "Feiticeiro"],
  ["Guerreiro", "Guerreiro"],
  ["Ladino", "Ladino"],
  ["Mago", "Mago"],
  ["Monge", "Monge"],
  ["Paladino", "Paladino"],
  ["Patrulheiro", "Patrulheiro"]
];

const DND_RACES = ["Humano", "Anao", "Elfo", "Halfling", "Draconato", "Gnomo", "Meio-elfo", "Meio-orc", "Tiefling"];
const DND_BACKGROUNDS = ["Acolito", "Artesao de Guilda", "Artista", "Charlatao", "Criminoso", "Eremita", "Forasteiro", "Marinheiro", "Nobre", "Orfao", "Sabio", "Soldado"];

const DND_EQUIPMENT_CATALOG = [
  { name: "Adaga", type: "Arma simples corpo a corpo", category: "Arma", cost: "2 po", weight: "0,5 kg", damage: "1d4 perfurante", range: "1,5m / arremesso 6/18m", properties: "Acuidade, leve, arremesso", desc: "Lamina pequena e discreta. Pode usar Forca ou Destreza no ataque por ter acuidade." },
  { name: "Bordao", type: "Arma simples corpo a corpo", category: "Arma", cost: "2 pp", weight: "2 kg", damage: "1d6 contundente", range: "1,5m", properties: "Versatil 1d8", desc: "Bastao reforcado, util como arma e apoio de viagem." },
  { name: "Clava", type: "Arma simples corpo a corpo", category: "Arma", cost: "1 pp", weight: "1 kg", damage: "1d4 contundente", range: "1,5m", properties: "Leve", desc: "Arma simples de impacto, facil de improvisar." },
  { name: "Lanca", type: "Arma simples corpo a corpo", category: "Arma", cost: "1 po", weight: "1,5 kg", damage: "1d6 perfurante", range: "1,5m / arremesso 6/18m", properties: "Arremesso, versatil 1d8", desc: "Arma longa simples para manter distancia ou arremessar." },
  { name: "Maca", type: "Arma simples corpo a corpo", category: "Arma", cost: "5 po", weight: "2 kg", damage: "1d6 contundente", range: "1,5m", properties: "-", desc: "Arma de impacto usada por viajantes, guardas e sacerdotes." },
  { name: "Machado de mao", type: "Arma simples corpo a corpo", category: "Arma", cost: "5 po", weight: "1 kg", damage: "1d6 cortante", range: "1,5m / arremesso 6/18m", properties: "Leve, arremesso", desc: "Machado pequeno para combate proximo ou arremesso." },
  { name: "Martelo leve", type: "Arma simples corpo a corpo", category: "Arma", cost: "2 po", weight: "1 kg", damage: "1d4 contundente", range: "1,5m / arremesso 6/18m", properties: "Leve, arremesso", desc: "Ferramenta pesada o bastante para virar arma em combate." },
  { name: "Arco curto", type: "Arma simples a distancia", category: "Arma", cost: "25 po", weight: "1 kg", damage: "1d6 perfurante", range: "24/96m", properties: "Duas maos, municao", desc: "Arco leve para ataques a distancia usando Destreza." },
  { name: "Besta leve", type: "Arma simples a distancia", category: "Arma", cost: "25 po", weight: "2,5 kg", damage: "1d8 perfurante", range: "24/96m", properties: "Municao, recarga, duas maos", desc: "Besta comum, forte e facil de mirar, mas lenta para recarregar." },
  { name: "Dardo", type: "Arma simples a distancia", category: "Arma", cost: "5 pc", weight: "0,1 kg", damage: "1d4 perfurante", range: "6/18m", properties: "Acuidade, arremesso", desc: "Projetil leve de arremesso, bom para personagens ageis." },
  { name: "Funda", type: "Arma simples a distancia", category: "Arma", cost: "1 pp", weight: "0 kg", damage: "1d4 contundente", range: "9/36m", properties: "Municao", desc: "Arma simples e barata que usa pedras ou balas de funda." },
  { name: "Espada curta", type: "Arma marcial corpo a corpo", category: "Arma", cost: "10 po", weight: "1 kg", damage: "1d6 perfurante", range: "1,5m", properties: "Acuidade, leve", desc: "Lamina agil, boa para combate com duas armas ou personagens de Destreza." },
  { name: "Espada longa", type: "Arma marcial corpo a corpo", category: "Arma", cost: "15 po", weight: "1,5 kg", damage: "1d8 cortante", range: "1,5m", properties: "Versatil 1d10", desc: "Espada equilibrada, funciona com uma ou duas maos." },
  { name: "Espada grande", type: "Arma marcial corpo a corpo", category: "Arma", cost: "50 po", weight: "3 kg", damage: "2d6 cortante", range: "1,5m", properties: "Pesada, duas maos", desc: "Arma pesada de alto dano, exige as duas maos." },
  { name: "Machado grande", type: "Arma marcial corpo a corpo", category: "Arma", cost: "30 po", weight: "3,5 kg", damage: "1d12 cortante", range: "1,5m", properties: "Pesada, duas maos", desc: "Machado enorme para ataques brutais." },
  { name: "Rapieira", type: "Arma marcial corpo a corpo", category: "Arma", cost: "25 po", weight: "1 kg", damage: "1d8 perfurante", range: "1,5m", properties: "Acuidade", desc: "Lamina precisa, excelente para combatentes focados em Destreza." },
  { name: "Cimitarra", type: "Arma marcial corpo a corpo", category: "Arma", cost: "25 po", weight: "1,5 kg", damage: "1d6 cortante", range: "1,5m", properties: "Acuidade, leve", desc: "Lamina curva rapida, boa para estilo agil." },
  { name: "Martelo de guerra", type: "Arma marcial corpo a corpo", category: "Arma", cost: "15 po", weight: "1 kg", damage: "1d8 contundente", range: "1,5m", properties: "Versatil 1d10", desc: "Martelo robusto contra armaduras e criaturas resistentes." },
  { name: "Arco longo", type: "Arma marcial a distancia", category: "Arma", cost: "50 po", weight: "1 kg", damage: "1d8 perfurante", range: "45/180m", properties: "Pesada, duas maos, municao", desc: "Arco de longo alcance para combate a distancia." },
  { name: "Besta pesada", type: "Arma marcial a distancia", category: "Arma", cost: "50 po", weight: "9 kg", damage: "1d10 perfurante", range: "30/120m", properties: "Pesada, municao, recarga, duas maos", desc: "Besta potente, excelente alcance e dano, mas pesada e lenta." },
  { name: "Armadura acolchoada", type: "Armadura leve", category: "Armadura", cost: "5 po", weight: "4 kg", armorBase: 11, dexLimit: "", stealth: "Desvantagem", desc: "Armadura leve barata. CA 11 + DES, mas atrapalha Furtividade." },
  { name: "Armadura de couro", type: "Armadura leve", category: "Armadura", cost: "10 po", weight: "5 kg", armorBase: 11, dexLimit: "", desc: "Protecao leve comum. CA 11 + modificador de DES." },
  { name: "Couro batido", type: "Armadura leve", category: "Armadura", cost: "45 po", weight: "6,5 kg", armorBase: 12, dexLimit: "", desc: "Armadura leve reforcada. CA 12 + modificador de DES." },
  { name: "Camisao de malha", type: "Armadura media", category: "Armadura", cost: "50 po", weight: "10 kg", armorBase: 13, dexLimit: 2, desc: "Armadura media. CA 13 + DES maximo +2." },
  { name: "Brunea", type: "Armadura media", category: "Armadura", cost: "50 po", weight: "22,5 kg", armorBase: 14, dexLimit: 2, stealth: "Desvantagem", desc: "Armadura media pesada. CA 14 + DES maximo +2 e desvantagem em Furtividade." },
  { name: "Peitoral", type: "Armadura media", category: "Armadura", cost: "400 po", weight: "10 kg", armorBase: 14, dexLimit: 2, desc: "Boa protecao media sem penalizar Furtividade. CA 14 + DES maximo +2." },
  { name: "Meia armadura", type: "Armadura media", category: "Armadura", cost: "750 po", weight: "20 kg", armorBase: 15, dexLimit: 2, stealth: "Desvantagem", desc: "Armadura media forte. CA 15 + DES maximo +2 e desvantagem em Furtividade." },
  { name: "Cota de aneis", type: "Armadura pesada", category: "Armadura", cost: "30 po", weight: "20 kg", armorBase: 14, dexLimit: 0, stealth: "Desvantagem", desc: "Armadura pesada simples. CA 14, sem bonus de DES." },
  { name: "Cota de malha", type: "Armadura pesada", category: "Armadura", cost: "75 po", weight: "27,5 kg", armorBase: 16, dexLimit: 0, strength: 13, stealth: "Desvantagem", desc: "Armadura pesada. CA 16, exige Forca 13 para usar bem." },
  { name: "Cota de talas", type: "Armadura pesada", category: "Armadura", cost: "200 po", weight: "30 kg", armorBase: 17, dexLimit: 0, strength: 15, stealth: "Desvantagem", desc: "Armadura pesada reforcada. CA 17, exige Forca 15." },
  { name: "Armadura de placas", type: "Armadura pesada", category: "Armadura", cost: "1500 po", weight: "32,5 kg", armorBase: 18, dexLimit: 0, strength: 15, stealth: "Desvantagem", desc: "Melhor armadura comum. CA 18, exige Forca 15 e penaliza Furtividade." },
  { name: "Escudo", type: "Escudo", category: "Escudo", cost: "10 po", weight: "3 kg", shieldBonus: 2, bonus: "+2 CA", desc: "Escudo empunhado concede +2 na Classe de Armadura enquanto estiver ativo." },
  { name: "Mochila", type: "Equipamento de aventura", category: "Equipamento", cost: "2 po", weight: "2,5 kg", desc: "Bolsa de viagem para carregar itens essenciais." },
  { name: "Corda de canhamo", type: "Equipamento de aventura", category: "Equipamento", cost: "1 po", weight: "5 kg", desc: "Corda comum de 15 metros para escalada, amarras e improvisos." },
  { name: "Tocha", type: "Equipamento de aventura", category: "Equipamento", cost: "1 pc", weight: "0,5 kg", bonus: "Luz", desc: "Fonte de luz simples para exploracao." },
  { name: "Racoes de viagem", type: "Equipamento de aventura", category: "Equipamento", cost: "5 pp", weight: "1 kg", desc: "Alimento seco para um dia de viagem." },
  { name: "Cantil", type: "Equipamento de aventura", category: "Equipamento", cost: "2 pp", weight: "2,5 kg cheio", desc: "Recipiente para agua durante viagens." },
  { name: "Pe de cabra", type: "Equipamento de aventura", category: "Equipamento", cost: "2 po", weight: "2,5 kg", bonus: "Ajuda a forcar objetos", desc: "Ferramenta para abrir, alavancar ou remover obstaculos." },
  { name: "Ferramentas de ladrao", type: "Ferramenta", category: "Ferramenta", cost: "25 po", weight: "0,5 kg", bonus: "Testes de fechaduras e armadilhas com proficiencia adequada", desc: "Conjunto de gazuas e ferramentas pequenas para fechaduras e armadilhas." },
  { name: "Kit de curandeiro", type: "Equipamento de aventura", category: "Equipamento", cost: "5 po", weight: "1,5 kg", bonus: "Estabilizar criatura", desc: "Kit com bandagens e suprimentos basicos para estabilizar feridos." },
  { name: "Foco arcano", type: "Foco de conjuracao", category: "Foco", cost: "10 po", weight: "0,5 kg", bonus: "Foco para magias arcanas", desc: "Objeto usado por conjuradores arcanos para canalizar magias." },
  { name: "Simbolo sagrado", type: "Foco de conjuracao", category: "Foco", cost: "5 po", weight: "0,5 kg", bonus: "Foco para magias divinas", desc: "Objeto sagrado usado como foco por clerigos e paladinos." }
].map((item) => ({ ...item, system: "dnd5e", image: item.image || `dnd-${normalizeKey(item.name)}` }));

const DND_WEAPON_CATALOG_BASE = [
  ["Clube", "Simples", "Corpo a corpo", "1d4", "Concussao", "Luz", "Lento", "2 libras"],
  ["Punhal", "Simples", "Corpo a corpo", "1d4", "Perfuracao", "Sutileza, leve, arremesso 20/60", "Nick", "1 libra"],
  ["Grande clube", "Simples", "Corpo a corpo", "1d8", "Contundente", "Duas maos", "Empurrar", "10 libras"],
  ["Machado de mao", "Simples", "Corpo a corpo", "1d6", "Cortante", "Leve, arremessavel 20/60", "Vex", "2 libras"],
  ["Dardo", "Simples", "Corpo a corpo", "1d6", "Perfuracao", "Arremessado 30/120", "Lento", "2 libras"],
  ["Martelo leve", "Simples", "Corpo a corpo", "1d4", "Concussao", "Leve, arremessavel 20/60", "Nick", "2 libras"],
  ["Maca", "Simples", "Corpo a corpo", "1d6", "Concussao", "-", "Seiva", "4 libras"],
  ["Bastao", "Simples", "Corpo a corpo", "1d6", "Concussao", "Versatil 1d8", "Derrubar", "4 libras"],
  ["Foice", "Simples", "Corpo a corpo", "1d4", "Cortante", "Luz", "Nick", "2 libras"],
  ["Lanca simples", "Simples", "Corpo a corpo", "1d6", "Perfuracao", "Arremessavel 20/60, versatil 1d8", "Seiva", "3 libras"],
  ["Dardo pequeno", "Simples", "A distancia", "1d4", "Perfuracao", "Sutileza, arremesso 20/60", "Vex", "1/4 libra"],
  ["Besta leve", "Simples", "A distancia", "1d8", "Perfuracao", "Municao 80/320, carregamento, duas maos", "Lento", "5 libras"],
  ["Arco curto", "Simples", "A distancia", "1d6", "Perfuracao", "Municao 80/320, duas maos", "Vex", "2 libras"],
  ["Estilingue", "Simples", "A distancia", "1d4", "Concussao", "Municao 30/120", "Lento", "-"],
  ["Machado de batalha", "Marcial", "Corpo a corpo", "1d8", "Cortante", "Versatil 1d10", "Derrubar", "4 libras"],
  ["Mangual", "Marcial", "Corpo a corpo", "1d8", "Contundente", "-", "Seiva", "2 libras"],
  ["Gladio", "Marcial", "Corpo a corpo", "1d10", "Cortante", "Pesado, alcance, duas maos", "Pastar", "6 libras"],
  ["Grande machado", "Marcial", "Corpo a corpo", "1d12", "Cortante", "Pesado, duas maos", "Dividir", "7 libras"],
  ["Espada grande", "Marcial", "Corpo a corpo", "2d6", "Cortante", "Pesado, duas maos", "Pastar", "6 libras"],
  ["Alabarda", "Marcial", "Corpo a corpo", "1d10", "Cortante", "Pesado, alcance, duas maos", "Dividir", "6 libras"],
  ["Lanca marcial", "Marcial", "Corpo a corpo", "1d10", "Perfuracao", "Pesado, alcance, duas maos, exceto montado", "Derrubar", "6 libras"],
  ["Espada longa", "Marcial", "Corpo a corpo", "1d8", "Cortante", "Versatil 1d10", "Seiva", "3 libras"],
  ["Maul", "Marcial", "Corpo a corpo", "2d6", "Contundente", "Pesado, duas maos", "Derrubar", "10 libras"],
  ["Estrela da manha", "Marcial", "Corpo a corpo", "1d8", "Perfuracao", "-", "Seiva", "4 libras"],
  ["Pique", "Marcial", "Corpo a corpo", "1d10", "Perfuracao", "Pesado, alcance, duas maos", "Empurrar", "18 libras"],
  ["Espada", "Marcial", "Corpo a corpo", "1d8", "Perfuracao", "Sutileza", "Vex", "2 libras"],
  ["Cimitarra", "Marcial", "Corpo a corpo", "1d6", "Cortante", "Delicadeza, luz", "Nick", "3 libras"],
  ["Espada curta", "Marcial", "Corpo a corpo", "1d6", "Perfuracao", "Delicadeza, luz", "Vex", "2 libras"],
  ["Tridente", "Marcial", "Corpo a corpo", "1d8", "Perfuracao", "Arremessavel 20/60, versatil 1d10", "Derrubar", "4 libras"],
  ["Warhammer", "Marcial", "Corpo a corpo", "1d8", "Contundente", "Versatil 1d10", "Empurrar", "5 libras"],
  ["Escolha de guerra", "Marcial", "Corpo a corpo", "1d8", "Perfuracao", "Versatil 1d10", "Seiva", "2 libras"],
  ["Chicote", "Marcial", "Corpo a corpo", "1d4", "Cortante", "Sutileza, alcance", "Lento", "3 libras"],
  ["Zarabatana", "Marcial", "A distancia", "1", "Perfuracao", "Municao 25/100, carregamento", "Vex", "1 libra"],
  ["Besta de mao", "Marcial", "A distancia", "1d6", "Perfuracao", "Municao 30/120, leve, carregamento", "Vex", "3 libras"],
  ["Besta pesada", "Marcial", "A distancia", "1d10", "Perfuracao", "Municao 100/400, pesada, carregamento, duas maos", "Empurrar", "18 libras"],
  ["Arco longo", "Marcial", "A distancia", "1d8", "Perfuracao", "Municao 150/600, pesada, duas maos", "Lento", "2 libras"],
  ["Mosquete", "Marcial", "A distancia", "1d12", "Perfuracao", "Municao 40/120, carregamento, duas maos", "Lento", "10 libras"],
  ["Pistola", "Marcial", "A distancia", "1d10", "Perfuracao", "Municao 30/90, carregamento", "Vex", "3 libras"]
].map(([name, subtype, rangeType, damage, damageType, properties, mastery, weight]) => ({
  name,
  type: `Arma ${subtype.toLowerCase()} ${rangeType.toLowerCase()}`,
  category: "Arma",
  inventoryCategory: "Armas",
  subtype,
  rangeType,
  damage,
  damageType,
  properties,
  mastery,
  weight,
  system: "dnd5e",
  image: `dnd-${normalizeKey(name)}`,
  desc: `${subtype} ${rangeType}. Dano ${damage} ${damageType}. Propriedades: ${properties}. Dominio: ${mastery}.`
}));

DND_WEAPON_CATALOG_BASE.forEach((weapon) => {
  const existing = DND_EQUIPMENT_CATALOG.find((item) => normalizeKey(item.name) === normalizeKey(weapon.name));
  if (existing) Object.assign(existing, weapon);
  else DND_EQUIPMENT_CATALOG.push(weapon);
});

const DND_EQUIPMENT_BY_NAME = Object.fromEntries(DND_EQUIPMENT_CATALOG.map((item) => [normalizeKey(item.name), item]));

const DND_INVENTORY_CATEGORIES = [
  "Armas",
  "Armaduras",
  "Escudos",
  "Equipamentos de Aventura",
  "Ferramentas",
  "Itens Magicos",
  "Consumiveis",
  "Tesouros",
  "Outros"
];

const DND_HIT_DICE = {
  Barbaro: 12,
  Bardo: 8,
  Bruxo: 8,
  Clerigo: 8,
  Druida: 8,
  Feiticeiro: 6,
  Guerreiro: 10,
  Ladino: 8,
  Mago: 6,
  Monge: 8,
  Paladino: 10,
  Patrulheiro: 10
};

const DND_FULL_CASTER_SLOTS = {
  1: [2,0,0,0,0,0,0,0,0],
  2: [3,0,0,0,0,0,0,0,0],
  3: [4,2,0,0,0,0,0,0,0],
  4: [4,3,0,0,0,0,0,0,0],
  5: [4,3,2,0,0,0,0,0,0],
  6: [4,3,3,0,0,0,0,0,0],
  7: [4,3,3,1,0,0,0,0,0],
  8: [4,3,3,2,0,0,0,0,0],
  9: [4,3,3,3,1,0,0,0,0],
  10: [4,3,3,3,2,0,0,0,0],
  11: [4,3,3,3,2,1,0,0,0],
  12: [4,3,3,3,2,1,0,0,0],
  13: [4,3,3,3,2,1,1,0,0],
  14: [4,3,3,3,2,1,1,0,0],
  15: [4,3,3,3,2,1,1,1,0],
  16: [4,3,3,3,2,1,1,1,0],
  17: [4,3,3,3,2,1,1,1,1],
  18: [4,3,3,3,3,1,1,1,1],
  19: [4,3,3,3,3,2,1,1,1],
  20: [4,3,3,3,3,2,2,1,1]
};

function dndModifier(score) {
  return Math.floor(((Number(score) || 10) - 10) / 2);
}

function dndSigned(value) {
  const number = Number(value) || 0;
  return number >= 0 ? `+${number}` : String(number);
}

function dndLevel(sheet) {
  return clamp(Number(dndValue(sheet, "nivel", Number.parseInt(sheet.nex, 10) || 1)), 1, 20);
}

function dndProficiency(level) {
  return Math.ceil((Number(level) || 1) / 4) + 1;
}

function dndAbilityScore(sheet, ability) {
  return Number(dndValue(sheet, ability, 10)) || 10;
}

function dndClassName(sheet) {
  return dndValue(sheet, "classe", sheet.className || "");
}

function dndHitDie(sheet) {
  return Number(dndValue(sheet, "hitDie", DND_HIT_DICE[dndClassName(sheet)] || 8)) || 8;
}

function dndMaxHpByRule(sheet) {
  const level = dndLevel(sheet);
  const hitDie = dndHitDie(sheet);
  const con = dndModifier(dndAbilityScore(sheet, "constituicao"));
  return Math.max(1, hitDie + con + Math.max(0, level - 1) * (Math.ceil(hitDie / 2) + 1 + con));
}

function dndInventoryItems(sheet) {
  return splitLines(sheet?.inventory)
    .map((raw) => parseInventoryItem(raw, sheet))
    .filter((item) => item.name && inventoryLineActive(item.raw));
}

function boolFromMeta(value) {
  return ["1", "sim", "true", "ativo", "equipado", "emuso", "empunho", "yes"].includes(normalizeKey(value));
}

function dndInventoryCategory(item) {
  const stats = item.stats || item;
  const source = `${stats.inventoryCategory || ""} ${stats.category || ""} ${stats.type || ""} ${stats.subtype || ""} ${item.name || ""}`;
  const key = normalizeKey(source);
  if (key.includes("arma")) return "Armas";
  if (key.includes("armadura")) return "Armaduras";
  if (key.includes("escudo")) return "Escudos";
  if (key.includes("ferramenta")) return "Ferramentas";
  if (key.includes("magico") || key.includes("magica")) return "Itens Magicos";
  if (key.includes("pocao") || key.includes("consumivel") || key.includes("racao")) return "Consumiveis";
  if (key.includes("tesouro") || key.includes("moeda")) return "Tesouros";
  if (key.includes("equipamento") || key.includes("aventura") || key.includes("foco")) return "Equipamentos de Aventura";
  return "Outros";
}

function isDndWeaponItem(item) {
  return dndInventoryCategory(item) === "Armas" || normalizeKey(item.stats?.category || "").includes("arma");
}

function isDndArmorItem(item) {
  return dndInventoryCategory(item) === "Armaduras";
}

function isDndShieldItem(item) {
  return dndInventoryCategory(item) === "Escudos";
}

function dndEquipmentBonuses(sheet) {
  if (dndValue(sheet, "autoEquipment", true) === false) return { armor: null, shieldBonus: 0, shieldName: "" };
  return dndInventoryItems(sheet).reduce((bonus, item) => {
    const stats = item.stats || {};
    const category = normalizeKey(stats.category || item.entry?.category || item.entry?.type || "");
    if (stats.armorBase && (stats.armorInUse || stats.armaduraEmUso) && category.includes("armadura")) {
      if (!bonus.armor || Number(stats.armorBase) > Number(bonus.armor.armorBase || 0)) {
        bonus.armor = {
          name: item.name,
          armorBase: Number(stats.armorBase) || 10,
          dexLimit: stats.dexLimit,
          stealth: stats.stealth || "",
          strength: stats.strength || ""
        };
      }
    }
    if ((stats.shieldInUse || stats.escudoEmUso) && (stats.shieldBonus || category.includes("escudo") || normalizeKey(item.name) === "escudo")) {
      bonus.shieldBonus = Math.max(bonus.shieldBonus, Number(stats.shieldBonus || stats.bonusCa) || 2);
      bonus.shieldName = item.name;
    }
    return bonus;
  }, { armor: null, shieldBonus: 0, shieldName: "" });
}

function dndArmorClass(sheet) {
  if (dndValue(sheet, "manualCa", false)) {
    return Number(dndValue(sheet, "caManual", dndValue(sheet, "ca", sheet.defense || 10))) || 10;
  }
  const dex = dndModifier(dndAbilityScore(sheet, "destreza"));
  const equipment = dndEquipmentBonuses(sheet);
  const manualBase = Number(dndValue(sheet, "armorBase", 10)) || 10;
  const armorBase = Math.max(manualBase, Number(equipment.armor?.armorBase) || 10);
  const manualDexLimit = dndValue(sheet, "dexLimit", "");
  const dexLimit = manualDexLimit === "" && equipment.armor ? equipment.armor.dexLimit : manualDexLimit;
  const allowedDex = dexLimit === "" ? dex : Math.min(dex, Number(dexLimit) || 0);
  return armorBase + allowedDex + (Number(dndValue(sheet, "shieldBonus", 0)) || 0) + equipment.shieldBonus + (Number(dndValue(sheet, "acBonus", 0)) || 0);
}

function dndInventoryText(sheet) {
  const manual = dndValue(sheet, "equipamentos", "");
  if (String(manual || "").trim()) return manual;
  return dndInventoryItems(sheet)
    .map((item) => `${item.name}${item.stats?.category ? ` | ${item.stats.category}` : ""}${item.stats?.damage ? ` | ${item.stats.damage}` : ""}${item.stats?.armorBase ? ` | CA ${item.stats.armorBase}` : ""}${item.stats?.shieldBonus ? ` | +${item.stats.shieldBonus} CA` : ""}`)
    .join("\n");
}

function dndEquipmentSummaryMarkup(sheet) {
  const items = dndInventoryItems(sheet);
  if (!items.length) return `<p class="dnd-empty-equipment">Nenhum equipamento D&D cadastrado. Use a aba Inventario para adicionar.</p>`;
  return `
    <div class="dnd-equipment-summary">
      ${DND_INVENTORY_CATEGORIES.map((category) => {
        const categoryItems = items.filter((item) => dndInventoryCategory(item) === category);
        if (!categoryItems.length) return "";
        return `
          <div class="dnd-equipment-sector">
            <b>${escapeHtml(category)}</b>
            <ul>
              ${categoryItems.map((item) => `
                <li>
                  <span>${escapeHtml(item.name)}</span>
                  <small>${item.stats.weaponReady ? "arma em punho" : item.stats.armorInUse ? "armadura em uso" : item.stats.shieldInUse ? "escudo em uso" : item.stats.equipped ? "equipado" : "guardado"}</small>
                </li>
              `).join("")}
            </ul>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function dndAttacksFromInventory(sheet) {
  return dndInventoryItems(sheet)
    .filter((item) => (item.stats?.weaponReady || item.stats?.armaEmPunho) && (isDndWeaponItem(item) || item.stats?.damage))
    .map((item) => `${item.name} | ${item.stats.damage || "1d4"} ${item.stats.damageType || ""} | ${item.stats.range || item.stats.rangeType || "1,5m"} | ${item.stats.properties || "-"}${item.stats.mastery ? ` | Dominio: ${item.stats.mastery}` : ""}`)
    .join("\n");
}

function dndAttackTextareaValue(sheet) {
  const manual = dndValue(sheet, "ataques", sheet.attacks || "");
  const auto = dndAttacksFromInventory(sheet);
  return [manual, auto].map((item) => String(item || "").trim()).filter(Boolean).join("\n");
}

function dndSpellSlotsFor(sheet) {
  const level = dndLevel(sheet);
  const manual = dndValue(sheet, "spellSlots", {});
  const base = DND_FULL_CASTER_SLOTS[level] || [0,0,0,0,0,0,0,0,0];
  return Array.from({ length: 9 }, (_, index) => Number(manual?.[index + 1] ?? base[index] ?? 0) || 0);
}

function dndDerived(sheet) {
  const level = dndLevel(sheet);
  const prof = dndProficiency(level);
  const dex = dndModifier(dndAbilityScore(sheet, "destreza"));
  const wis = dndModifier(dndAbilityScore(sheet, "sabedoria"));
  const proficientSkills = dndValue(sheet, "proficientSkills", {});
  const expertiseSkills = dndValue(sheet, "expertiseSkills", {});
  const perceptionProf = proficientSkills?.percepcao ? prof : 0;
  const perceptionExpertise = expertiseSkills?.percepcao ? prof : 0;
  const spellAbility = dndValue(sheet, "spellcastingAbility", "carisma");
  const spellMod = dndModifier(dndAbilityScore(sheet, spellAbility));
  return {
    level,
    prof,
    initiative: dex + (Number(dndValue(sheet, "initiativeBonus", 0)) || 0),
    passivePerception: 10 + wis + perceptionProf + perceptionExpertise + (Number(dndValue(sheet, "passiveBonus", 0)) || 0),
    ac: dndArmorClass(sheet),
    maxHpByRule: dndMaxHpByRule(sheet),
    hitDie: dndHitDie(sheet),
    spellSaveDc: 8 + prof + spellMod + (Number(dndValue(sheet, "spellSaveDcBonus", 0)) || 0),
    spellAttack: prof + spellMod + (Number(dndValue(sheet, "spellAttackBonusExtra", 0)) || 0)
  };
}

function dndSelect(field, value, options, extra = "") {
  return `<select data-dnd-field="${field}" ${extra}>${options.map((item) => {
    const optionValue = Array.isArray(item) ? item[0] : item;
    const label = Array.isArray(item) ? item[1] : item;
    return `<option value="${escapeAttr(optionValue)}" ${String(optionValue) === String(value || "") ? "selected" : ""}>${escapeHtml(label)}</option>`;
  }).join("")}</select>`;
}

function dndStatInput(sheet, field, label, name) {
  const score = dndAbilityScore(sheet, field);
  const mod = dndModifier(score);
  const proficientSaves = dndValue(sheet, "proficientSaves", {});
  const saveBonus = dndValue(sheet, "saveBonus", {});
  const totalSave = mod + (proficientSaves?.[field] ? dndProficiency(dndLevel(sheet)) : 0) + (Number(saveBonus?.[field]) || 0);
  return `
    <article class="dnd-stat">
      <span>${label}</span>
      <input data-dnd-field="${field}" type="number" min="1" max="30" value="${escapeAttr(score)}" />
      <b>${dndSigned(mod)}</b>
      <label class="dnd-check"><input data-dnd-save="${field}" type="checkbox" ${proficientSaves?.[field] ? "checked" : ""} /> Save ${dndSigned(totalSave)}</label>
      <small>${escapeHtml(name)}</small>
    </article>
  `;
}

function updateDndSheetField(field, value, numeric = false, rerender = false) {
  const sheet = ensureActiveSheet();
  if (!canEditSheet(sheet)) {
    setSyncStatus("Ficha bloqueada pelo mestre.", true);
    return;
  }
  sheet.dnd = { ...(sheet.dnd || {}) };
  sheet.dnd[field] = numeric ? Number(value) : value;
  if (field === "classe") {
    sheet.className = value;
    sheet.dnd.hitDie = DND_HIT_DICE[value] || sheet.dnd.hitDie || 8;
  }
  if (field === "raca") sheet.role = value;
  if (field === "nivel") {
    const level = clamp(Number(value) || 1, 1, 20);
    sheet.dnd.nivel = level;
    sheet.nex = String(level);
    sheet.rank = `Nivel ${level}`;
  }
  if (field === "pv") sheet.hp = Number(value) || 0;
  if (field === "pvMax") sheet.hpMax = Number(value) || 0;
  if (["ca", "caManual", "manualCa", "autoEquipment", "armorBase", "dexLimit", "shieldBonus", "acBonus", "destreza"].includes(field)) {
    sheet.dnd.ca = dndArmorClass(sheet);
    sheet.defense = sheet.dnd.ca;
    console.log("CA atualizada por equipamento", { ca: sheet.dnd.ca, auto: sheet.dnd.autoEquipment !== false, manual: !!sheet.dnd.manualCa });
  }
  if (field === "deslocamento") sheet.movement = Number(value) || 9;
  if (field === "proficiencias") sheet.skills = value;
  if (field === "equipamentos") sheet.inventory = value;
  if (field === "magias") sheet.rituals = value;
  if (field === "anotacoes") sheet.notes = value;
  if (field === "ataques") sheet.attacks = value;
  if (field === "tracos") sheet.abilities = value;
  if (field === "personalidade") sheet.personality = value;
  syncSheetToken(sheet);
  if (rerender) localOnlyRender();
  else {
    suppressOnlineSave = true;
    save();
    suppressOnlineSave = false;
  }
  queueSheetPatch(sheet, "dnd", 800);
}

function updateDndCollection(collection, key, value, rerender = true) {
  const sheet = ensureActiveSheet();
  if (!canEditSheet(sheet)) {
    setSyncStatus("Ficha bloqueada pelo mestre.", true);
    return;
  }
  sheet.dnd = { ...(sheet.dnd || {}), [collection]: { ...(sheet.dnd?.[collection] || {}) } };
  sheet.dnd[collection][key] = value;
  if (rerender) localOnlyRender();
  else save();
  queueSheetPatch(sheet, "dnd", 800);
}

function dndSkillRows(sheet) {
  const derived = dndDerived(sheet);
  const proficient = dndValue(sheet, "proficientSkills", {});
  const expertise = dndValue(sheet, "expertiseSkills", {});
  const bonus = dndValue(sheet, "skillBonus", {});
  return DND_SKILLS.map(([key, label, ability]) => {
    const total = dndModifier(dndAbilityScore(sheet, ability)) +
      (proficient?.[key] ? derived.prof : 0) +
      (expertise?.[key] ? derived.prof : 0) +
      (Number(bonus?.[key]) || 0);
    const abilityLabel = DND_ABILITIES.find((item) => item[0] === ability)?.[1] || "";
    return `
      <tr>
        <td><input data-dnd-skill="${key}" type="checkbox" ${proficient?.[key] ? "checked" : ""} /></td>
        <td><input data-dnd-expertise="${key}" type="checkbox" ${expertise?.[key] ? "checked" : ""} /></td>
        <td><button type="button" data-dnd-roll="${label}" data-dnd-roll-mod="${total}">${escapeHtml(label)}</button></td>
        <td>${abilityLabel}</td>
        <td>${dndSigned(total)}</td>
      </tr>
    `;
  }).join("");
}

function dndDeathChecks(sheet, field, label) {
  const value = clamp(Number(dndValue(sheet, field, 0)) || 0, 0, 3);
  return `
    <label class="dnd-death-row">${label}
      <span>${[1, 2, 3].map((index) => `<input data-dnd-death="${field}" data-dnd-death-value="${index}" type="checkbox" ${value >= index ? "checked" : ""} />`).join("")}</span>
    </label>
  `;
}

function dndSpellSlots(sheet) {
  const slots = dndSpellSlotsFor(sheet);
  const used = dndValue(sheet, "spellSlotsUsed", {});
  return slots.map((max, index) => {
    const level = index + 1;
    return `
      <label>
        <span>Nivel ${level}</span>
        <input data-dnd-slot="${level}" type="number" min="0" max="9" value="${escapeAttr(max)}" />
        <input data-dnd-slot-used="${level}" type="number" min="0" max="9" value="${escapeAttr(Number(used?.[level]) || 0)}" />
      </label>
    `;
  }).join("");
}

function dndAbilitySelect(field, value) {
  return dndSelect(field, value, DND_ABILITIES.map(([key, label, name]) => [key, `${label} - ${name}`]));
}

function dndHeroSheetMarkup(sheet, derived, spellSlots) {
  const dndPanelLayout = dndLayoutSettings();
  const saves = dndValue(sheet, "proficientSaves", {});
  const saveStrip = DND_ABILITIES.map(([field, label, name]) => {
    const total = dndModifier(dndAbilityScore(sheet, field)) + (saves?.[field] ? derived.prof : 0);
    return `
      <label class="dnd-save-line" title="Salvaguarda de ${escapeAttr(name)}">
        <input data-dnd-save="${escapeAttr(field)}" type="checkbox" ${saves?.[field] ? "checked" : ""} />
        <span>${escapeHtml(label)}</span>
        <b>${dndSigned(total)}</b>
      </label>
    `;
  }).join("");
  const abilityColumn = DND_ABILITIES.map(([field, label, name]) => {
    const score = dndAbilityScore(sheet, field);
    return `
      <label class="dnd-ability-box dnd-ability-${escapeAttr(field)}" title="${escapeAttr(name)}">
        <span>${escapeHtml(label)}</span>
        <input data-dnd-field="${escapeAttr(field)}" type="number" min="1" max="30" value="${escapeAttr(score)}" />
        <b>${dndSigned(dndModifier(score))}</b>
      </label>
    `;
  }).join("");
  const passiveInsight = 10 + dndModifier(dndAbilityScore(sheet, "sabedoria")) + (dndValue(sheet, "proficientSkills", {})?.insight ? derived.prof : 0);
  const passiveInvestigation = 10 + dndModifier(dndAbilityScore(sheet, "inteligencia")) + (dndValue(sheet, "proficientSkills", {})?.investigation ? derived.prof : 0);
  const emptyPortrait = `<b>${escapeHtml(initials(sheet.name || "AV"))}</b><small>Clique para foto</small>`;
  return `
    ${renderMasterSheetNavigator(sheet)}
    <section class="dnd-sheet dnd-classic-sheet">
      <header class="dnd-classic-head">
        <div class="dnd-dragon-brand">
          <span>Dungeons & Dragons</span>
          <b>5e</b>
        </div>
        <label class="dnd-character-name">
          <span>Nome do personagem</span>
          <input data-sheet-field="name" value="${escapeAttr(sheet.name || "Aventureiro")}" />
        </label>
        <div class="dnd-classic-identity">
          <label>Classe ${dndSelect("classe", dndClassName(sheet), DND_CLASSES)}</label>
          <label>Nivel <input data-dnd-field="nivel" type="number" min="1" max="20" value="${escapeAttr(derived.level)}" /></label>
          <label>Jogador <input data-sheet-field="player" value="${escapeAttr(sheet.player || "")}" /></label>
          <label>Raca ${dndSelect("raca", dndValue(sheet, "raca", sheet.role || "Humano"), DND_RACES)}</label>
          <label>Antecedente ${dndSelect("antecedente", dndValue(sheet, "antecedente", ""), [["", "Escolha"], ...DND_BACKGROUNDS.map((item) => [item, item])])}</label>
          <label>XP <input data-dnd-field="experiencia" type="number" min="0" value="${escapeAttr(dndValue(sheet, "experiencia", 0))}" /></label>
        </div>
      </header>

      <div class="dnd-classic-grid">
        <aside class="dnd-classic-left">
          <section class="dnd-attributes-title">Atributos</section>
          <div class="dnd-ability-column">${abilityColumn}</div>
          <section class="dnd-box dnd-save-panel">
            <h3>Salvaguardas</h3>
            ${saveStrip}
          </section>
          <section class="dnd-box dnd-skills-card">
            <h3>Pericias</h3>
            <table class="dnd-skills-table">
              <thead><tr><th>Prof.</th><th>Esp.</th><th>Pericia</th><th>Atr.</th><th>Total</th></tr></thead>
              <tbody>${dndSkillRows(sheet)}</tbody>
            </table>
          </section>
        </aside>

        <main class="dnd-classic-main is-layout-fixed" data-dnd-layout-panel style="--dnd-panel-x:${escapeAttr(dndPanelLayout.x)}px; --dnd-panel-y:${escapeAttr(dndPanelLayout.y)}px;">
          <section class="dnd-top-stats">
            <label><span>Inspiracao</span><input data-dnd-field="inspiration" type="checkbox" ${dndValue(sheet, "inspiration", false) ? "checked" : ""} /></label>
            <b><span>Proficiencia</span>${dndSigned(derived.prof)}</b>
            <b><span>CA</span>${derived.ac}</b>
            <b><span>Iniciativa</span>${dndSigned(derived.initiative)}</b>
            <b><span>Desloc.</span>${dndValue(sheet, "deslocamento", sheet.movement || 9)}m</b>
          </section>
          <section class="dnd-box dnd-resources-box">
            <h3>Combate</h3>
            <div class="dnd-equipment-rules">
              <label class="dnd-check"><input data-dnd-field="autoEquipment" type="checkbox" ${dndValue(sheet, "autoEquipment", true) !== false ? "checked" : ""} /> Usar calculo automatico de equipamento</label>
              <label class="dnd-check"><input data-dnd-field="manualCa" type="checkbox" ${dndValue(sheet, "manualCa", false) ? "checked" : ""} /> CA manual</label>
              <label>CA manual <input data-dnd-field="caManual" type="number" value="${escapeAttr(dndValue(sheet, "caManual", derived.ac))}" /></label>
            </div>
            <div class="dnd-resource-grid">
              <label>PV atual <input data-dnd-field="pv" type="number" value="${escapeAttr(dndValue(sheet, "pv", sheet.hp || 10))}" /></label>
              <label>PV max <input data-dnd-field="pvMax" type="number" value="${escapeAttr(dndValue(sheet, "pvMax", sheet.hpMax || 10))}" /><small>Regra sugere ${derived.maxHpByRule}</small></label>
              <label>PV temp <input data-dnd-field="pvTemporario" type="number" min="0" value="${escapeAttr(dndValue(sheet, "pvTemporario", 0))}" /></label>
              <label>Dado vida <input data-dnd-field="hitDie" type="number" min="4" max="12" value="${escapeAttr(derived.hitDie)}" /></label>
              <label>Dados gastos <input data-dnd-field="hitDiceUsed" type="number" min="0" max="${derived.level}" value="${escapeAttr(dndValue(sheet, "hitDiceUsed", 0))}" /></label>
              <label>Armadura base <input data-dnd-field="armorBase" type="number" value="${escapeAttr(dndValue(sheet, "armorBase", 10))}" /></label>
              <label>Escudo <input data-dnd-field="shieldBonus" type="number" value="${escapeAttr(dndValue(sheet, "shieldBonus", 0))}" /></label>
              <label>Bonus CA <input data-dnd-field="acBonus" type="number" value="${escapeAttr(dndValue(sheet, "acBonus", 0))}" /></label>
              <label>Limite DES <input data-dnd-field="dexLimit" type="number" placeholder="sem limite" value="${escapeAttr(dndValue(sheet, "dexLimit", ""))}" /></label>
              <label>Bonus iniciativa <input data-dnd-field="initiativeBonus" type="number" value="${escapeAttr(dndValue(sheet, "initiativeBonus", 0))}" /></label>
              <label>Deslocamento <input data-dnd-field="deslocamento" type="number" min="0" value="${escapeAttr(dndValue(sheet, "deslocamento", sheet.movement || 9))}" /></label>
            </div>
            <div class="dnd-death-grid">
              ${dndDeathChecks(sheet, "deathSuccess", "Sucessos contra morte")}
              ${dndDeathChecks(sheet, "deathFailure", "Falhas contra morte")}
            </div>
            <div class="sheet-damage-tools">
              <label>Dano ou cura <input data-sheet-damage-value type="number" min="0" placeholder="0" /></label>
              <button type="button" data-sheet-damage-apply>Dano</button>
              <button type="button" data-sheet-heal-apply>Cura</button>
            </div>
          </section>
          <section class="dnd-box dnd-attack-card">
            <h3>Ataques e conjuracao</h3>
            <textarea data-dnd-field="ataques" placeholder="Espada longa | +5 | 1d8 cortante | alcance 1,5m&#10;Arco curto | +5 | 1d6 perfurante | 24/96m">${escapeHtml(dndAttackTextareaValue(sheet))}</textarea>
          </section>
        </main>

        <aside class="dnd-classic-right">
          <label class="profile-photo-trigger dnd-classic-portrait" title="Trocar foto do personagem">
            <span class="profile-photo-preview" style="${sheet.portrait ? `background-image:url('${escapeAttr(sheet.portrait)}')` : ""}">
              ${sheet.portrait ? "" : emptyPortrait}
            </span>
            <input data-profile-photo type="file" accept="image/*" />
          </label>
          <section class="dnd-box dnd-passive-box">
            <h3>Sentidos passivos</h3>
            <b>Percepcao passiva ${derived.passivePerception}</b>
            <b>Intuicao passiva ${passiveInsight}</b>
            <b>Investigacao passiva ${passiveInvestigation}</b>
          </section>
          <section class="dnd-box dnd-magic-panel dnd-grimoire-panel">
            <h3>Magia</h3>
            <div class="dnd-magic-stats">
              <label>Atributo ${dndAbilitySelect("spellcastingAbility", dndValue(sheet, "spellcastingAbility", "carisma"))}</label>
              <b>CD ${derived.spellSaveDc}</b>
              <b>Ataque ${dndSigned(derived.spellAttack)}</b>
            </div>
            <div class="dnd-slot-grid">
              <span>Nivel</span><span>Total</span><span>Gastos</span>
              ${spellSlots}
            </div>
            <label>Magias preparadas / conhecidas <textarea data-dnd-field="magiasPreparadas">${escapeHtml(dndValue(sheet, "magiasPreparadas", ""))}</textarea></label>
          </section>
          <section class="dnd-box"><h3>Personalidade</h3><textarea data-dnd-field="personalidade">${escapeHtml(dndValue(sheet, "personalidade", sheet.personality || ""))}</textarea></section>
          <section class="dnd-box"><h3>Ideais</h3><textarea data-dnd-field="ideais">${escapeHtml(dndValue(sheet, "ideais", ""))}</textarea></section>
          <section class="dnd-box"><h3>Vinculos</h3><textarea data-dnd-field="vinculos">${escapeHtml(dndValue(sheet, "vinculos", ""))}</textarea></section>
          <section class="dnd-box"><h3>Defeitos</h3><textarea data-dnd-field="defeitos">${escapeHtml(dndValue(sheet, "defeitos", ""))}</textarea></section>
        </aside>
      </div>

      <div class="dnd-classic-bottom">
        <section class="dnd-box"><h3>Tracos e recursos</h3><textarea data-dnd-field="tracos" placeholder="Caracteristicas de classe, raca, talentos e recursos.">${escapeHtml(dndValue(sheet, "tracos", sheet.abilities || ""))}</textarea></section>
        <section class="dnd-box"><h3>Proficiencias e idiomas</h3><textarea data-dnd-field="proficiencias">${escapeHtml(dndValue(sheet, "proficiencias", sheet.skills || ""))}</textarea></section>
        <section class="dnd-box dnd-equipment-wide"><h3>Equipamentos</h3>${dndEquipmentSummaryMarkup(sheet)}<button type="button" data-dnd-open-inventory>Gerenciar inventario</button></section>
        <section class="dnd-box"><h3>Tesouro</h3><textarea data-dnd-field="tesouro">${escapeHtml(dndValue(sheet, "tesouro", ""))}</textarea></section>
        <section class="dnd-box dnd-notes-wide"><h3>Anotacoes</h3><textarea data-dnd-field="anotacoes">${escapeHtml(dndValue(sheet, "anotacoes", sheet.notes || ""))}</textarea></section>
      </div>

      <footer class="dnd-sheet-foot">
        <button type="button" data-save-dnd-sheet>Salvar ficha</button>
        <span>Sistema: ${escapeHtml(systemFor(sheet.sistemaRegra).nome)}</span>
      </footer>
    </section>
  `;
}

function renderDndSheet(sheet) {
  if (!els.crisisSheet) return;
  document.body.classList.add("theme-dnd5e", "theme-dnd", "campaign-dnd");
  document.body.dataset.campaignSystem = "dnd5e";
  sheet.dnd = normalizeSheet(sheet).dnd;
  const derived = dndDerived(sheet);
  const spellSlots = dndSpellSlots(sheet);
  els.crisisSheet.innerHTML = `
    ${renderMasterSheetNavigator(sheet)}
    <section class="dnd-sheet">
      <header class="dnd-sheet-head">
        <div>
          <span class="dnd-system-pill">D&D 5e</span>
          <h2>Ficha do aventureiro</h2>
          <p>Ficha editavel com calculos de modificador, proficiencia, pericias, salvaguardas, combate e magia.</p>
        </div>
        <label class="profile-photo-trigger dnd-avatar" title="Trocar foto do personagem">
          <span class="profile-photo-preview" style="${sheet.portrait ? `background-image:url('${escapeAttr(sheet.portrait)}')` : ""}">${sheet.portrait ? "" : escapeHtml(initials(sheet.name || "AV"))}</span>
          <input data-profile-photo type="file" accept="image/*" />
        </label>
      </header>

      <div class="dnd-identity-grid">
        <label>Personagem <input data-sheet-field="name" value="${escapeAttr(sheet.name || "Aventureiro")}" /></label>
        <label>Jogador <input data-sheet-field="player" value="${escapeAttr(sheet.player || "")}" /></label>
        <label>Classe ${dndSelect("classe", dndClassName(sheet), DND_CLASSES)}</label>
        <label>Raca ${dndSelect("raca", dndValue(sheet, "raca", sheet.role || "Humano"), DND_RACES)}</label>
        <label>Antecedente ${dndSelect("antecedente", dndValue(sheet, "antecedente", ""), [["", "Escolha o antecedente"], ...DND_BACKGROUNDS.map((item) => [item, item])])}</label>
        <label>Alinhamento <input data-dnd-field="alinhamento" value="${escapeAttr(dndValue(sheet, "alinhamento", ""))}" /></label>
        <label>Nivel <input data-dnd-field="nivel" type="number" min="1" max="20" value="${escapeAttr(derived.level)}" /></label>
        <label>Experiencia <input data-dnd-field="experiencia" type="number" min="0" value="${escapeAttr(dndValue(sheet, "experiencia", 0))}" /></label>
      </div>

      <div class="dnd-core-grid">
        <section class="dnd-card">
          <h3>Atributos e salvaguardas</h3>
          <div class="dnd-stats-grid">
            ${DND_ABILITIES.map(([field, label, name]) => dndStatInput(sheet, field, label, name)).join("")}
          </div>
        </section>
        <section class="dnd-card dnd-vitals">
          <h3>Combate</h3>
          <div class="dnd-derived-grid">
            <b>Prof. ${dndSigned(derived.prof)}</b>
            <b>CA ${derived.ac}</b>
            <b>Inic. ${dndSigned(derived.initiative)}</b>
            <b>Passiva ${derived.passivePerception}</b>
          </div>
          <div class="dnd-equipment-rules">
            <label class="dnd-check"><input data-dnd-field="autoEquipment" type="checkbox" ${dndValue(sheet, "autoEquipment", true) !== false ? "checked" : ""} /> Usar calculo automatico de equipamento</label>
            <label class="dnd-check"><input data-dnd-field="manualCa" type="checkbox" ${dndValue(sheet, "manualCa", false) ? "checked" : ""} /> CA manual</label>
            <label>CA manual <input data-dnd-field="caManual" type="number" value="${escapeAttr(dndValue(sheet, "caManual", derived.ac))}" /></label>
          </div>
          <label>PV atual <input data-dnd-field="pv" type="number" value="${escapeAttr(dndValue(sheet, "pv", sheet.hp || 10))}" /></label>
          <label>PV max <input data-dnd-field="pvMax" type="number" value="${escapeAttr(dndValue(sheet, "pvMax", sheet.hpMax || 10))}" /><small>Regra sugere ${derived.maxHpByRule}</small></label>
          <label>PV temporario <input data-dnd-field="pvTemporario" type="number" min="0" value="${escapeAttr(dndValue(sheet, "pvTemporario", 0))}" /></label>
          <div class="dnd-ac-grid">
            <label>Armadura base <input data-dnd-field="armorBase" type="number" value="${escapeAttr(dndValue(sheet, "armorBase", 10))}" /></label>
            <label>Limite DES <input data-dnd-field="dexLimit" type="number" placeholder="sem limite" value="${escapeAttr(dndValue(sheet, "dexLimit", ""))}" /></label>
            <label>Escudo <input data-dnd-field="shieldBonus" type="number" value="${escapeAttr(dndValue(sheet, "shieldBonus", 0))}" /></label>
            <label>Bonus CA <input data-dnd-field="acBonus" type="number" value="${escapeAttr(dndValue(sheet, "acBonus", 0))}" /></label>
          </div>
          <label>Deslocamento <input data-dnd-field="deslocamento" type="number" min="0" value="${escapeAttr(dndValue(sheet, "deslocamento", sheet.movement || 9))}" /></label>
          <label>Bonus iniciativa <input data-dnd-field="initiativeBonus" type="number" value="${escapeAttr(dndValue(sheet, "initiativeBonus", 0))}" /></label>
          <div class="dnd-hitdice-grid">
            <label>Dado de vida <input data-dnd-field="hitDie" type="number" min="4" max="12" value="${escapeAttr(derived.hitDie)}" /></label>
            <label>Dados gastos <input data-dnd-field="hitDiceUsed" type="number" min="0" max="${derived.level}" value="${escapeAttr(dndValue(sheet, "hitDiceUsed", 0))}" /></label>
          </div>
          <div class="dnd-death-grid">
            ${dndDeathChecks(sheet, "deathSuccess", "Sucessos contra morte")}
            ${dndDeathChecks(sheet, "deathFailure", "Falhas contra morte")}
          </div>
          <div class="sheet-damage-tools">
            <label>Dano ou cura <input data-sheet-damage-value type="number" min="0" placeholder="0" /></label>
            <button type="button" data-sheet-damage-apply>Dano</button>
            <button type="button" data-sheet-heal-apply>Cura</button>
          </div>
        </section>
      </div>

      <div class="dnd-rules-grid">
        <section class="dnd-card dnd-skills-card">
          <h3>Pericias</h3>
          <table class="dnd-skills-table">
            <thead><tr><th>Prof.</th><th>Esp.</th><th>Pericia</th><th>Atr.</th><th>Total</th></tr></thead>
            <tbody>${dndSkillRows(sheet)}</tbody>
          </table>
        </section>
        <section class="dnd-card">
          <h3>Ataques</h3>
          <textarea data-dnd-field="ataques" placeholder="Espada longa | +5 | 1d8 cortante | alcance 1,5m&#10;Arco curto | +5 | 1d6 perfurante | 24/96m">${escapeHtml(dndAttackTextareaValue(sheet))}</textarea>
          <small>Use uma linha por ataque. O botão de rolagem da mesa aceita formulas como 1d20+5 e 1d8+3.</small>
        </section>
      </div>

      <div class="dnd-magic-grid">
        <section class="dnd-card">
          <h3>Magia</h3>
          <div class="dnd-magic-stats">
            <label>Atributo de conjuracao ${dndAbilitySelect("spellcastingAbility", dndValue(sheet, "spellcastingAbility", "carisma"))}</label>
            <b>CD ${derived.spellSaveDc}</b>
            <b>Ataque ${dndSigned(derived.spellAttack)}</b>
          </div>
          <div class="dnd-slot-grid">
            <span>Nivel</span><span>Total</span><span>Gastos</span>
            ${spellSlots}
          </div>
          <label>Magias preparadas / conhecidas <textarea data-dnd-field="magiasPreparadas">${escapeHtml(dndValue(sheet, "magiasPreparadas", ""))}</textarea></label>
        </section>
        <section class="dnd-card">
          <h3>Tracos e recursos</h3>
          <label class="dnd-check dnd-inspiration"><input data-dnd-field="inspiration" type="checkbox" ${dndValue(sheet, "inspiration", false) ? "checked" : ""} /> Inspiracao</label>
          <textarea data-dnd-field="tracos" placeholder="Caracteristicas de classe, raca, talentos e recursos.">${escapeHtml(dndValue(sheet, "tracos", sheet.abilities || ""))}</textarea>
        </section>
      </div>

      <div class="dnd-notes-grid">
        <label><b>Proficiencias e idiomas</b><textarea data-dnd-field="proficiencias">${escapeHtml(dndValue(sheet, "proficiencias", sheet.skills || ""))}</textarea></label>
        <label class="dnd-equipment-wide"><b>Equipamentos</b>${dndEquipmentSummaryMarkup(sheet)}<button type="button" data-dnd-open-inventory>Gerenciar inventario</button></label>
        <label><b>Tesouro</b><textarea data-dnd-field="tesouro">${escapeHtml(dndValue(sheet, "tesouro", ""))}</textarea></label>
        <label><b>Personalidade</b><textarea data-dnd-field="personalidade">${escapeHtml(dndValue(sheet, "personalidade", sheet.personality || ""))}</textarea></label>
        <label><b>Ideais / Vinculos / Defeitos</b><textarea data-dnd-field="ideais">${escapeHtml(dndValue(sheet, "ideais", ""))}</textarea><textarea data-dnd-field="vinculos">${escapeHtml(dndValue(sheet, "vinculos", ""))}</textarea><textarea data-dnd-field="defeitos">${escapeHtml(dndValue(sheet, "defeitos", ""))}</textarea></label>
        <label><b>Anotacoes</b><textarea data-dnd-field="anotacoes">${escapeHtml(dndValue(sheet, "anotacoes", sheet.notes || ""))}</textarea></label>
      </div>

      <footer class="dnd-sheet-foot">
        <button type="button" data-save-dnd-sheet>Salvar ficha</button>
        <span>Sistema: ${escapeHtml(systemFor(sheet.sistemaRegra).nome)}</span>
      </footer>
    </section>
  `;
  els.crisisSheet.innerHTML = dndHeroSheetMarkup(sheet, derived, spellSlots);
  applySheetEditState(sheet);

  els.crisisSheet.querySelectorAll("[data-sheet-field]").forEach((field) => {
    field.addEventListener("input", () => updateActiveSheet(field.dataset.sheetField, field.value, field.type === "number", false));
    field.addEventListener("change", () => updateActiveSheet(field.dataset.sheetField, field.value, field.type === "number"));
  });
  els.crisisSheet.querySelectorAll("[data-dnd-field]").forEach((field) => {
    const isNumeric = field.type === "number" && field.dataset.dndField !== "dexLimit";
    const readValue = () => field.type === "checkbox" ? field.checked : field.value;
    field.addEventListener("input", () => updateDndSheetField(field.dataset.dndField, readValue(), isNumeric, false));
    field.addEventListener("change", () => updateDndSheetField(field.dataset.dndField, readValue(), isNumeric, ["classe", "nivel", "forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma", "armorBase", "dexLimit", "shieldBonus", "acBonus", "initiativeBonus", "hitDie", "spellcastingAbility", "autoEquipment", "manualCa", "caManual"].includes(field.dataset.dndField)));
  });
  els.crisisSheet.querySelectorAll("[data-dnd-save]").forEach((field) => {
    field.addEventListener("change", () => updateDndCollection("proficientSaves", field.dataset.dndSave, field.checked));
  });
  els.crisisSheet.querySelectorAll("[data-dnd-skill]").forEach((field) => {
    field.addEventListener("change", () => updateDndCollection("proficientSkills", field.dataset.dndSkill, field.checked));
  });
  els.crisisSheet.querySelectorAll("[data-dnd-expertise]").forEach((field) => {
    field.addEventListener("change", () => updateDndCollection("expertiseSkills", field.dataset.dndExpertise, field.checked));
  });
  els.crisisSheet.querySelectorAll("[data-dnd-death]").forEach((field) => {
    field.addEventListener("change", () => updateDndSheetField(field.dataset.dndDeath, field.checked ? field.dataset.dndDeathValue : Number(field.dataset.dndDeathValue) - 1, true, true));
  });
  els.crisisSheet.querySelectorAll("[data-dnd-slot]").forEach((field) => {
    field.addEventListener("change", () => updateDndCollection("spellSlots", field.dataset.dndSlot, Number(field.value) || 0, true));
  });
  els.crisisSheet.querySelectorAll("[data-dnd-slot-used]").forEach((field) => {
    field.addEventListener("change", () => updateDndCollection("spellSlotsUsed", field.dataset.dndSlotUsed, Number(field.value) || 0, true));
  });
  els.crisisSheet.querySelectorAll("[data-dnd-roll]").forEach((button) => {
    button.addEventListener("click", () => performRoll(`1d20${dndSigned(button.dataset.dndRollMod)}`));
  });
  els.crisisSheet.querySelectorAll("[data-master-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeSheetId = button.dataset.masterSheet;
      masterInventorySheetId = button.dataset.masterSheet;
      renderAll();
    });
  });
  els.crisisSheet.querySelector("[data-profile-photo]")?.addEventListener("change", (event) => {
    uploadProfilePhoto(event.target.files?.[0]);
  });
  els.crisisSheet.querySelector("[data-sheet-damage-apply]")?.addEventListener("click", () => {
    const value = Number(els.crisisSheet.querySelector("[data-sheet-damage-value]")?.value || 0);
    applySheetDamage(sheet.id, value, "damage");
  });
  els.crisisSheet.querySelector("[data-sheet-heal-apply]")?.addEventListener("click", () => {
    const value = Number(els.crisisSheet.querySelector("[data-sheet-damage-value]")?.value || 0);
    applySheetDamage(sheet.id, value, "heal");
  });
  els.crisisSheet.querySelector("[data-save-dnd-sheet]")?.addEventListener("click", () => {
    save();
    queueSheetPatch(ensureActiveSheet(), "dnd", 100);
    setSyncStatus("Ficha D&D salva.");
  });
  els.crisisSheet.querySelectorAll("[data-dnd-open-inventory]").forEach((button) => {
    button.addEventListener("click", () => switchTab("inventario"));
  });
}

function renderCrisisSheet() {
  if (!els.crisisSheet) return;
  const sheet = ensureActiveSheet();
  if (normalizeSystemId(sheet.sistemaRegra) === "dnd5e") {
    renderDndSheet(sheet);
    return;
  }
  const canEditNex = isMasterMode();
  const skills = parseSkills(sheet);
  const attacks = splitLines(sheet.attacks);
  const abilities = splitSheetEntries(sheet.abilities);
  const inventory = splitLines(sheet.inventory);
  const rituals = splitSheetEntries(sheet.rituals);
  els.crisisSheet.innerHTML = `
    ${renderMasterSheetNavigator(sheet)}
    <section class="dossier-sheet">
      <div class="paper-clip clip-a"></div>
      <div class="paper-clip clip-b"></div>
      <div class="file-stamp">Confidencial</div>
      <div class="barcode-card"><span>Arquivo pessoal</span><i></i><b></b></div>

      <div class="dossier-left">
        <div class="dossier-identity">
          <div class="profile-photo-box">
            <label class="profile-photo-trigger" title="Trocar foto do agente">
              <span class="profile-photo-preview" style="${sheet.portrait ? `background-image:url('${escapeAttr(sheet.portrait)}')` : ""}">${sheet.portrait ? "" : escapeHtml(initials(sheet.name || "AG"))}</span>
              <input data-profile-photo type="file" accept="image/*" />
            </label>
            ${sheet.portrait ? `<button class="profile-photo-clear" type="button" data-clear-profile-photo title="Remover foto">x</button>` : ""}
          </div>
          <label>Personagem <input data-sheet-field="name" value="${escapeAttr(sheet.name || "Agente")}" /></label>
          <label>Jogador <input data-sheet-field="player" value="${escapeAttr(sheet.player)}" /></label>
        </div>

        <div class="section-title">Atributos</div>
        <div class="paper-attrs">
          ${attributePaperNode("agi", "Agilidade", "AGI", sheet.agi, "attr-paper-agi")}
          ${attributePaperNode("str", "Forca", "FOR", sheet.str, "attr-paper-for")}
          ${attributePaperNode("int", "Intelecto", "INT", sheet.int, "attr-paper-int")}
          ${attributePaperNode("pre", "Presenca", "PRE", sheet.pre, "attr-paper-pre")}
          ${attributePaperNode("vig", "Vigor", "VIG", sheet.vig, "attr-paper-vig")}
          <div class="paper-attr-core"></div>
          <p class="attr-note note-agi">Reflexos, velocidade, esquiva e coordenacao.</p>
          <p class="attr-note note-for">Poder fisico, dano, forca bruta.</p>
          <p class="attr-note note-int">Conhecimento, logica, analise e aprendizado.</p>
          <p class="attr-note note-pre">Carisma, influencia, autocontrole e lideranca.</p>
          <p class="attr-note note-vig">Resistencia, folego, saude e determinacao.</p>
        </div>

        <div class="origin-blocks">
          <label><b>Origem</b><input data-sheet-field="role" value="${escapeAttr(sheet.role || "")}" /><button type="button" data-open-catalog="role">Catalogo</button><small>Concede pericias e talento.</small></label>
          <label><b>Classe</b><input data-sheet-field="className" value="${escapeAttr(sheet.className || "")}" /><button type="button" data-open-catalog="className">Catalogo</button><small>Define seu papel principal.</small></label>
          <label><b>Trilha</b><input data-sheet-field="pathName" value="${escapeAttr(sheet.pathName || "")}" /><button type="button" data-open-catalog="pathName">Catalogo</button><small>Especializacao dentro da classe.</small></label>
        </div>

        <div class="progress-row">
          <label>Nivel <input data-sheet-field="rank" value="${escapeAttr(sheet.rank || "")}" /></label>
          <label class="nex-field">Exp / NEX <span><input data-sheet-field="nex" value="${escapeAttr(sheet.nex || "0%")}" ${canEditNex ? "" : "readonly aria-readonly=\"true\""} />${canEditNex ? `<button type="button" data-open-catalog="nex">Catalogo</button>` : `<small>Somente mestre</small>`}</span></label>
          <label>PE / rodada <input data-sheet-field="peRound" type="number" value="${sheet.peRound}" /></label>
        </div>
        ${renderNexProgress(sheet)}

        <div class="vitals-grid">
          ${paperStatBox("PV", "Pontos de vida", "hp", "hpMax", sheet.hp, sheet.hpMax)}
          ${paperStatBox("Energia", "Pontos de energia", "pe", "peMax", sheet.pe, sheet.peMax)}
          <label class="paper-stat"><b>Defesa</b><small>10 + AGI</small><input data-sheet-field="defense" type="number" value="${sheet.defense}" /></label>
          <label class="paper-stat"><b>Protecao</b><small>Reducao de dano</small><input data-sheet-field="block" type="number" value="${sheet.block}" /></label>
          ${paperStatBox("Sanidade", "Resistencia mental", "san", "sanMax", sheet.san, sheet.sanMax)}
          <label class="paper-stat"><b>Esquiva</b><small>Ajuste defensivo</small><input data-sheet-field="dodge" type="number" value="${sheet.dodge}" /></label>
        </div>
        <div class="derived-summary">
          <span><b>Deslocamento</b> ${escapeHtml(sheet.movement)} m</span>
          <span><b>Carga</b> ${escapeHtml(sheet.currentLoad || 0)} / ${escapeHtml(sheet.loadLimit || Math.max(1, Number(sheet.str || 0) * 5))}</span>
          <span><b>Recalculo</b> classe, NEX, atributos e itens ativos</span>
        </div>
        <div class="sheet-damage-tools">
          <label>Dano ou cura <input data-sheet-damage-value type="number" min="0" placeholder="0" /></label>
          <button type="button" data-sheet-damage-apply>Dano</button>
          <button type="button" data-sheet-heal-apply>Cura</button>
        </div>
      </div>

      <div class="dossier-right">
        <div class="section-title skills-title">Pericias</div>
        <div class="paper-skills">
          ${renderDossierSkillGroup("Fisicas", skills.filter((skill) => ["AGI", "FOR", "VIG"].includes(skill.attr)))}
          ${renderDossierSkillGroup("Mentais", skills.filter((skill) => skill.attr === "INT"))}
          ${renderDossierSkillGroup("Sociais", skills.filter((skill) => skill.attr === "PRE"))}
        </div>
      </div>

      <div class="attacks-wide paper-table-wrap">
        <div class="section-title tape-title">Ataques</div>
        <button class="paper-add" type="button" data-add-line="attacks">Novo ataque</button>
        <table class="paper-table">
          <thead><tr><th>Nome do ataque</th><th>Teste</th><th>Dano</th><th>Critico</th><th>Alcance</th><th>Especial</th><th></th></tr></thead>
          <tbody>${renderAttackRows(attacks)}</tbody>
        </table>
      </div>

      <div class="bottom-panel talents-panel">
        <div class="section-title mini-title">Talentos / Habilidades</div>
        <button class="paper-add" type="button" data-add-line="abilities">Adicionar</button>
        ${renderAbilityPanel(sheet)}
      </div>

      <div class="bottom-panel equipment-panel">
        <div class="section-title mini-title">Equipamentos</div>
        <button class="paper-add" type="button" data-add-line="inventory">Adicionar</button>
        ${renderLineList(inventory, "Nenhum equipamento cadastrado", "inventory")}
      </div>

      <div class="bottom-panel rituals-panel">
        <div class="section-title mini-title">Rituais</div>
        <button class="paper-add" type="button" data-add-line="rituals">Adicionar</button>
        ${renderRitualPanel(sheet)}
      </div>

      <div class="rules-panel">
        <div><b>Treinamento</b><p>Destreinado +0, treinado +2, veterano +4, especialista +6, mestre +8.</p></div>
        <div><b>Como testar</b><p>Role dados iguais ao atributo e some bonus, treino e outros.</p></div>
        <div><b>Regras rapidas</b><p>Maior resultado vence. Critico: resultado 20 natural.</p></div>
        <label><b>Anotacoes</b><textarea data-sheet-field="notes">${escapeHtml(sheet.notes)}</textarea></label>
      </div>
    </section>
  `;
  applySheetEditState(sheet);

  els.crisisSheet.querySelectorAll("[data-sheet-field]").forEach((field) => {
    field.addEventListener("input", () => updateActiveSheet(field.dataset.sheetField, field.value, field.type === "number", false));
    field.addEventListener("change", () => updateActiveSheet(field.dataset.sheetField, field.value, field.type === "number"));
  });

  els.crisisSheet.querySelectorAll("[data-skill-field]").forEach((field) => {
    field.addEventListener("input", () => updateSkillMod(field.dataset.skill, field.dataset.skillField, Number(field.value), false));
    field.addEventListener("change", () => updateSkillMod(field.dataset.skill, field.dataset.skillField, Number(field.value)));
  });

  els.crisisSheet.querySelectorAll("[data-adjust]").forEach((button) => {
    button.addEventListener("click", () => adjustSheetNumber(button.dataset.adjust, Number(button.dataset.delta)));
  });

  els.crisisSheet.querySelectorAll("[data-roll-skill]").forEach((button) => {
    button.addEventListener("click", () => rollSkill(button.dataset.rollSkill));
  });

  els.crisisSheet.querySelectorAll("[data-roll-text]").forEach((button) => {
    button.addEventListener("click", () => rollFromText(button.dataset.rollText));
  });

  els.crisisSheet.querySelectorAll("[data-attack-field]").forEach((field) => {
    field.addEventListener("input", () => updateAttackField(Number(field.dataset.attackIndex), field.dataset.attackField, field.value, false));
    field.addEventListener("change", () => updateAttackField(Number(field.dataset.attackIndex), field.dataset.attackField, field.value));
  });

  els.crisisSheet.querySelectorAll("[data-add-line]").forEach((button) => {
    button.addEventListener("click", () => openCatalog(button.dataset.addLine));
  });

  els.crisisSheet.querySelectorAll("[data-open-catalog]").forEach((button) => {
    button.addEventListener("click", () => openCatalog(button.dataset.openCatalog));
  });

  els.crisisSheet.querySelectorAll("[data-master-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeSheetId = button.dataset.masterSheet;
      masterInventorySheetId = button.dataset.masterSheet;
      renderAll();
    });
  });

  els.crisisSheet.querySelector("[data-profile-photo]")?.addEventListener("change", (event) => {
    uploadProfilePhoto(event.target.files?.[0]);
  });

  els.crisisSheet.querySelector("[data-clear-profile-photo]")?.addEventListener("click", () => {
    updateActiveSheet("portrait", "");
  });

  els.crisisSheet.querySelector("[data-sheet-damage-apply]")?.addEventListener("click", () => {
    const value = Number(els.crisisSheet.querySelector("[data-sheet-damage-value]")?.value || 0);
    applySheetDamage(sheet.id, value, "damage");
  });

  els.crisisSheet.querySelector("[data-sheet-heal-apply]")?.addEventListener("click", () => {
    const value = Number(els.crisisSheet.querySelector("[data-sheet-damage-value]")?.value || 0);
    applySheetDamage(sheet.id, value, "heal");
  });

  els.crisisSheet.querySelectorAll("[data-remove-line]").forEach((button) => {
    button.addEventListener("click", () => removeSheetLine(button.dataset.removeLine, Number(button.dataset.index)));
  });
}

function openCatalog(field) {
  if (field === "nex" && !isMasterMode()) {
    setSyncStatus("Apenas o mestre pode alterar NEX.", true);
    return;
  }
  const entries = catalogForField(field);
  if (!entries.length) {
    if (field === "attacks") addSheetLine(field);
    else openEmptyCatalog(field);
    return;
  }
  const existing = document.querySelector(".catalog-modal");
  if (existing) existing.remove();
  const modal = document.createElement("div");
  modal.className = "catalog-modal";
  modal.innerHTML = `
    <div class="catalog-box">
      <div class="catalog-head">
        <div>
          <strong>${escapeHtml(catalogTitle(field))}</strong>
          <span>${isSheetChoiceField(field) ? "Escolha uma opcao para preencher este campo." : "Escolha uma opcao para adicionar na ficha."}</span>
        </div>
        <button type="button" data-close-catalog>Fechar</button>
      </div>
      <input class="catalog-search" type="search" placeholder="Buscar por nome ou tipo..." />
      <div class="catalog-body">
        <div class="catalog-list"></div>
        <div class="catalog-detail">
          <b>Selecione uma opcao</b>
          <p>A descricao resumida aparece aqui antes de adicionar.</p>
        </div>
      </div>
      <div class="catalog-actions">
        ${isSheetChoiceField(field) ? "" : `<button class="ghost" type="button" data-custom-catalog>Adicionar manualmente</button>`}
        <button class="primary" type="button" data-confirm-catalog disabled>${isSheetChoiceField(field) ? "Usar selecionado" : "Adicionar selecionado"}</button>
      </div>
    </div>
  `;
  document.body.append(modal);

  let selected = null;
  const list = modal.querySelector(".catalog-list");
  const detail = modal.querySelector(".catalog-detail");
  const confirm = modal.querySelector("[data-confirm-catalog]");
  const search = modal.querySelector(".catalog-search");

  const renderCatalog = () => {
    const query = search.value.trim().toLowerCase();
    const filtered = entries.filter((entry) => `${entry.name} ${entry.type} ${entry.desc} ${entry.className || ""} ${entry.pathName || ""} ${entry.origin || ""} ${catalogMetaText(entry)}`.toLowerCase().includes(query));
    list.innerHTML = filtered.map((entry, index) => `
      <button type="button" data-catalog-index="${entries.indexOf(entry)}" class="${selected === entry ? "selected" : ""}">
        ${catalogThumb(entry)}
        <b>${escapeHtml(entry.name)}</b>
        <span>${escapeHtml(entry.type)}</span>
      </button>
    `).join("") || `<p class="catalog-empty">Nada encontrado.</p>`;
    list.querySelectorAll("[data-catalog-index]").forEach((button) => {
      button.addEventListener("click", () => {
        selected = entries[Number(button.dataset.catalogIndex)];
        confirm.disabled = false;
        detail.innerHTML = catalogDetail(selected);
        renderCatalog();
      });
    });
  };

  search.addEventListener("input", renderCatalog);
  modal.querySelector("[data-close-catalog]").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.remove();
  });
  const customButton = modal.querySelector("[data-custom-catalog]");
  if (customButton) {
    customButton.addEventListener("click", () => {
      modal.remove();
      addSheetLine(field);
    });
  }
  confirm.addEventListener("click", () => {
    if (!selected) return;
    addCatalogEntry(field, selected);
    modal.remove();
  });
  renderCatalog();
  search.focus();
}

function openEmptyCatalog(field) {
  const existing = document.querySelector(".catalog-modal");
  if (existing) existing.remove();
  const modal = document.createElement("div");
  modal.className = "catalog-modal";
  modal.innerHTML = `
    <div class="catalog-box catalog-box-small">
      <div class="catalog-head">
        <div>
          <strong>${escapeHtml(catalogTitle(field))}</strong>
          <span>Nenhuma opcao encontrada para a ficha atual.</span>
        </div>
        <button type="button" data-close-catalog>Fechar</button>
      </div>
      <p class="catalog-empty catalog-empty-large">${escapeHtml(emptyCatalogText(field))}</p>
    </div>
  `;
  document.body.append(modal);
  modal.querySelector("[data-close-catalog]").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.remove();
  });
}

function catalogForField(field) {
  const sheet = ensureActiveSheet();
  const isDnd = sheetSystemId(sheet) === "dnd5e";
  if (isDnd) {
    if (field === "inventory") return DND_EQUIPMENT_CATALOG;
    if (field === "attacks") {
      return DND_EQUIPMENT_CATALOG
        .filter((entry) => normalizeKey(entry.category).includes("arma") || entry.damage)
        .map((entry) => ({ ...entry, type: `Ataque - ${entry.type}` }));
    }
    if (field === "rituals") return [];
  }
  if (field === "abilities") {
    const role = normalizeKey(sheet.role);
    const className = normalizeKey(sheet.className);
    const pathName = normalizeKey(sheet.pathName);
    const nex = parseNex(sheet.nex);
    if (!role && !className && !pathName) return [];
    return catalog.abilities.filter((entry) => {
      const entryClass = normalizeKey(entry.className || (["Combatente", "Especialista", "Ocultista"].includes(entry.type) ? entry.type : ""));
      const entryPath = normalizeKey(entry.pathName);
      const entryOrigin = normalizeKey(entry.origin);
      if (entry.nex && entry.nex > nex) return false;
      if (entryPath) return entryPath === pathName;
      return (entryClass && entryClass === className) || (entryOrigin && entryOrigin === role) || (entry.allClasses && className);
    });
  }
  if (field === "rituals") {
    if (!canUseRituals(sheet)) return [];
    const maxCircle = maxRitualCircle(sheet);
    return catalog.rituals.filter((entry) => Number(entry.circle || 1) <= maxCircle);
  }
  if (field === "pathName") {
    const className = normalizeKey(sheet.className);
    if (!className) return [];
    return catalog.paths.filter((entry) => normalizeKey(entry.className) === className);
  }
  if (field === "attacks") {
    return catalog.inventory
      .filter((entry) => {
        const stats = catalogStats[entry.name] || {};
        return stats.damage && stats.damage !== "-";
      })
      .map((entry) => ({ ...entry, type: `Ataque - ${catalogStats[entry.name]?.category || entry.type}` }));
  }
  return {
    nex: catalog.nex,
    role: catalog.origins,
    className: catalog.classes,
    inventory: catalog.inventory,
  }[field] || [];
}

function dndInventoryLine(entry) {
  const category = dndInventoryCategory({ name: entry.name, stats: entry, entry });
  const meta = [
    ["Categoria", category],
    ["Tipo", entry.category || entry.type],
    ["Subtipo", entry.subtype || ""],
    ["Quantidade", entry.quantity || 1],
    ["Peso", entry.weight],
    ["Dano", entry.damage],
    ["Tipo dano", entry.damageType],
    ["Alcance", entry.range],
    ["Alcance tipo", entry.rangeType],
    ["Propriedades", entry.properties],
    ["Dominio", entry.mastery],
    ["CA", entry.armorBase],
    ["Limite DES", entry.dexLimit],
    ["Escudo", entry.shieldBonus],
    ["Furtividade", entry.stealth],
    ["Forca", entry.strength],
    ["Bonus CA", entry.bonusCa],
    ["Bonus", entry.bonus],
    ["Imagem", entry.image]
  ]
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([label, value]) => `${label}: ${value}`)
    .join(" | ");
  return `${entry.name}${meta ? ` | ${meta}` : ""} - ${entry.desc || ""}`;
}

function catalogTitle(field) {
  return {
    nex: "Catalogo de NEX",
    role: "Catalogo de origens",
    className: "Catalogo de classes",
    pathName: "Catalogo de trilhas",
    abilities: "Talentos / Habilidades",
    attacks: "Ataques",
    inventory: "Equipamentos",
    rituals: "Rituais"
  }[field] || "Catalogo";
}

function addCatalogEntry(field, entry) {
  const sheet = ensureActiveSheet();
  if (isSheetChoiceField(field)) {
    if (field === "nex" && !isMasterMode()) return;
    const previousNex = parseNex(sheet.nex);
    sheet[field] = entry.name;
    const selectedPath = catalog.paths.find((path) => normalizeKey(path.name) === normalizeKey(sheet.pathName));
    if (field === "className" && normalizeKey(selectedPath?.className) !== normalizeKey(entry.name)) {
      sheet.pathName = "";
    }
    recalculateDerivedStats(sheet, field);
    localOnlyRender();
    queueSheetPatch(sheet, field, 800);
    if (field === "nex") {
      const nextNex = parseNex(sheet.nex);
      if (nextNex > previousNex) showNexUpdateMessage(sheet, previousNex, nextNex);
    }
    return;
  }
  if (field === "attacks") {
    if (sheetSystemId(sheet) === "dnd5e") {
      const line = `${entry.name} | ${entry.damage || "1d4"} | ${entry.range || "1,5m"} | ${entry.properties || entry.desc || "-"}`;
      sheet.attacks = splitLines(sheet.attacks).concat(line).join("\n");
      sheet.dnd = { ...(sheet.dnd || {}), ataques: splitLines(sheet.attacks).join("\n") };
      localOnlyRender();
      queueSheetPatch(sheet, "attacks", 800);
      return;
    }
    const stats = catalogStats[entry.name] || {};
    const line = serializeAttackLine({
      name: entry.name,
      test: stats.category?.includes("corpo") ? "FOR ou AGI" : "Pontaria",
      damage: stats.damage || "1d20",
      critical: "20",
      range: stats.range || "Curto",
      special: entry.desc || stats.bonus || "-"
    });
    sheet.attacks = splitLines(sheet.attacks).concat(line).join("\n");
    localOnlyRender();
    queueSheetPatch(sheet, "attacks", 800);
    return;
  }
  if (field === "inventory" && sheetSystemId(sheet) === "dnd5e") {
    sheet.inventory = splitLines(sheet.inventory).concat(dndInventoryLine(entry)).join("\n");
    recalculateDerivedStats(sheet, field);
    localOnlyRender();
    queueSheetPatch(sheet, field, 800);
    return;
  }
  const safeDesc = String(entry.desc || "").replace(/\n/g, " ");
  const line = `${entry.name} | ${catalogMetaText(entry)} - ${safeDesc}`;
  sheet[field] = splitSheetEntries(sheet[field]).concat(line).join("\n");
  if (["inventory", "abilities", "rituals"].includes(field)) recalculateDerivedStats(sheet, field);
  localOnlyRender();
  queueSheetPatch(sheet, field, 800);
}

function catalogDetail(entry) {
  return `
    <div class="catalog-detail-top">
      ${catalogThumb(entry)}
      <div>
        <b>${escapeHtml(entry.name)}</b>
        <span>${escapeHtml(entry.type)}</span>
      </div>
    </div>
    <div class="catalog-meta">${catalogMeta(entry).map((item) => `<small>${escapeHtml(item)}</small>`).join("")}</div>
    <p>${escapeHtml(entry.desc)}</p>
  `;
}

function catalogMeta(entry) {
  const stats = catalogStats[entry.name] || {};
  const entryType = normalizeKey(entry.type);
  const dndEntry = entry.system === "dnd5e" ? entry : DND_EQUIPMENT_BY_NAME[normalizeKey(entry.name)];
  if (dndEntry) {
    return [
      `Tipo: ${dndEntry.category || dndEntry.type || "-"}`,
      dndEntry.weight ? `Peso: ${dndEntry.weight}` : "",
      dndEntry.damage ? `Dano: ${dndEntry.damage}` : "",
      dndEntry.damageType ? `Tipo de dano: ${dndEntry.damageType}` : "",
      dndEntry.range ? `Alcance: ${dndEntry.range}` : "",
      dndEntry.properties ? `Propriedades: ${dndEntry.properties}` : "",
      dndEntry.mastery ? `Dominio: ${dndEntry.mastery}` : "",
      dndEntry.armorBase ? `CA: ${dndEntry.armorBase}${dndEntry.dexLimit === "" ? " + DES" : dndEntry.dexLimit > 0 ? ` + DES max ${dndEntry.dexLimit}` : ""}` : "",
      dndEntry.shieldBonus ? `Escudo: +${dndEntry.shieldBonus} CA` : "",
      dndEntry.stealth ? `Furtividade: ${dndEntry.stealth}` : "",
      dndEntry.strength ? `Forca minima: ${dndEntry.strength}` : "",
      dndEntry.bonus ? `Bonus: ${dndEntry.bonus}` : ""
    ].filter(Boolean);
  }
  const isInventoryEntry = catalog.inventory.includes(entry) || catalog.inventory.some((item) => normalizeKey(item.name) === normalizeKey(entry.name));
  const isRitualEntry = catalog.rituals.includes(entry) || catalog.rituals.some((item) => normalizeKey(item.name) === normalizeKey(entry.name));
  if (catalog.origins.includes(entry) || entry.origin || entryType.includes("origem escolhida")) {
    return [
      entry.origin ? `Origem: ${entry.origin}` : "",
      entry.skills ? `Pericias: ${entry.skills}` : "",
      entry.talent ? `Talento: ${entry.talent}` : ""
    ].filter(Boolean);
  }
  if (catalog.classes.includes(entry) || entryType.includes("classe escolhida")) {
    return [
      `Classe: ${entry.name}`,
      entry.desc?.includes("Base") ? "" : `Recursos: ${classResourceFormula(ensureActiveSheet())}`
    ];
  }
  if (catalog.nex.includes(entry)) {
    return [`NEX: ${entry.name}`];
  }
  if (catalog.paths.includes(entry) || entry.pathName || entry.className || entryType.includes("trilha escolhida")) {
    return [
      `Classe: ${entry.className || "-"}`,
      entry.pathName ? `Trilha: ${entry.pathName}` : `Trilha: ${entry.name}`
    ].filter(Boolean);
  }
  if (isInventoryEntry) {
    return [
      `Tipo: ${stats.category || entry.type}`,
      `Volume: ${stats.volume ?? "-"}`,
      `Dano: ${stats.damage || "-"}`,
      stats.range ? `Alcance: ${stats.range}` : "",
      stats.defense ? `Defesa: ${stats.defense}` : "",
      stats.bonus ? `Uso: ${stats.bonus}` : ""
    ].filter(Boolean);
  }
  if (isRitualEntry) {
    return [
      `Circulo: ${stats.circle || entry.circle || 1}`,
      `NEX minimo: ${entry.nex || ritualNexRequirement(entry.circle || 1)}%`,
      `Custo: ${stats.cost || "-"}`,
      `Dano/Efeito: ${stats.damage || "-"}`,
      `Elemento: ${stats.element || "-"}`,
      `Requisito: ${stats.requirement || "-"}`
    ];
  }
  return [
    `Tipo: ${entry.type}`,
    entry.nex ? `NEX minimo: ${entry.nex}%` : "",
    entry.className ? `Classe: ${entry.className}` : "",
    entry.pathName ? `Trilha: ${entry.pathName}` : "",
    entry.origin ? `Origem: ${entry.origin}` : ""
  ].filter(Boolean);
}

function catalogMetaText(entry) {
  return catalogMeta(entry).join(" | ");
}

function catalogThumb(entry) {
  const stats = catalogStats[entry.name] || {};
  const label = stats.image || entry.type || entry.name;
  const svg = catalogSvg(label, entry.name);
  return `<span class="catalog-thumb" style="background-image:url('${svg}')"></span>`;
}

function catalogPhotoUrl(kind, name, type = "") {
  return "";
}

function catalogSvg(kind, name) {
  const short = name.slice(0, 2).toUpperCase();
  const color = kind.startsWith("ritual") ? "#6d257d" : kind.includes("faca") || kind.includes("katana") ? "#343230" : kind.includes("colete") || kind.includes("armadura") ? "#5d503c" : kind.includes("granada") || kind.includes("molotov") ? "#65351f" : "#27384a";
  const accent = kind.startsWith("ritual") ? "#e6d8ff" : "#f7ead2";
  const icon = catalogIconPath(kind, accent);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="72" viewBox="0 0 96 72"><rect width="96" height="72" rx="8" fill="${color}"/><circle cx="22" cy="20" r="13" fill="${accent}" opacity=".18"/><g stroke="${accent}" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${icon}</g><text x="48" y="63" font-size="13" text-anchor="middle" font-family="Arial" font-weight="700" fill="${accent}">${short}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function catalogIconPath(kind, accent) {
  if (["revolver", "pistola"].includes(kind)) return `<path d="M21 35h34l6 7h12M54 35l-5 15h13l5-8"/><path d="M26 31h28"/>`;
  if (["espingarda", "fuzil"].includes(kind)) return `<path d="M16 35h54l10-6M28 35l-8 10M54 35l7 12"/><path d="M64 35h12"/>`;
  if (kind === "faca") return `<path d="M24 48l34-25 13 3-31 28M20 52l8-8"/>`;
  if (kind === "katana") return `<path d="M18 51c18-18 36-30 58-33M24 55l8-8M33 45l9 8"/>`;
  if (kind === "bastao") return `<path d="M20 50l56-28"/><path d="M25 54l-7-10M75 28l-6-12"/>`;
  if (["colete", "armadura"].includes(kind)) return `<path d="M32 17h32l8 14-7 27H31l-7-27 8-14z"/><path d="M39 18v13M57 18v13M32 42h32"/>`;
  if (kind === "kit" || kind === "medkit") return `<rect x="27" y="24" width="42" height="28" rx="3"/><path d="M39 24v-7h18v7M48 31v14M41 38h14"/>`;
  if (kind === "lanterna") return `<path d="M22 39h31l10-8 9 18-13-5H22z"/><path d="M63 31l14-8M72 40h13M63 49l14 8"/>`;
  if (kind === "algemas") return `<circle cx="34" cy="37" r="13"/><circle cx="62" cy="37" r="13"/><path d="M47 37h2"/>`;
  if (kind === "camera") return `<rect x="22" y="25" width="52" height="31" rx="4"/><circle cx="48" cy="41" r="10"/><path d="M33 25l5-7h16l5 7"/>`;
  if (kind === "mochila" || kind === "sobrevivencia") return `<rect x="31" y="22" width="34" height="34" rx="6"/><path d="M36 22c0-10 24-10 24 0M31 38h34M38 56v-8M58 56v-8"/>`;
  if (kind === "celular") return `<rect x="35" y="14" width="26" height="44" rx="5"/><path d="M43 20h10M47 52h2"/>`;
  if (kind === "arpeu") return `<path d="M48 56V23M48 23c-11 3-18 10-20 20M48 23c11 3 18 10 20 20M48 23l-8-8M48 23l8-8"/>`;
  if (kind === "binoculos") return `<circle cx="36" cy="39" r="13"/><circle cx="60" cy="39" r="13"/><path d="M44 39h8M36 26l5-9M60 26l-5-9"/>`;
  if (kind === "corda") return `<path d="M28 42c0-17 40-17 40 0 0 14-30 14-30 2 0-8 18-8 18 0"/><path d="M28 52h40"/>`;
  if (kind === "mascara") return `<path d="M30 28c8-13 28-13 36 0v16c-8 13-28 13-36 0z"/><circle cx="39" cy="36" r="5"/><circle cx="57" cy="36" r="5"/><path d="M43 49h10"/>`;
  if (kind === "detector" || kind === "bloqueador") return `<rect x="31" y="25" width="34" height="28" rx="3"/><path d="M39 18h18M48 25v-9M40 39h16M72 21c7 9 7 21 0 30M24 21c-7 9-7 21 0 30"/>`;
  if (kind === "spray") return `<rect x="36" y="25" width="22" height="30" rx="3"/><path d="M39 25v-7h15v7M58 31l18-8M60 38h20M58 45l18 8"/>`;
  if (kind === "granada") return `<path d="M37 27h22l7 9-5 20H35l-5-20z"/><path d="M42 27v-9h13v9M55 18l12 5"/>`;
  if (kind === "molotov") return `<path d="M41 19h14l-3 14 8 18c2 5-4 9-12 9s-14-4-12-9l8-18z"/><path d="M51 19c8-5 8-11 2-15"/>`;
  if (kind.startsWith("ritual")) return `<circle cx="48" cy="35" r="19"/><path d="M48 16v38M29 35h38M36 23l24 24M60 23L36 47"/><circle cx="48" cy="35" r="5" fill="${accent}" stroke="none"/>`;
  return `<path d="M18 49h60M24 41h48M34 28h28"/>`;
}

function attributePaperNode(field, label, short, value, className) {
  return `<div class="paper-attr-node ${className}"><span>${label}</span><b>${short}</b><input data-sheet-field="${field}" type="number" min="0" max="6" value="${value}" /></div>`;
}

function paperStatBox(title, subtitle, field, maxField, current, max) {
  return `<div class="paper-stat paper-stat-double"><b>${title}</b><small>${subtitle}</small><div><button type="button" data-adjust="${field}" data-delta="-1">-</button><input data-sheet-field="${field}" type="number" value="${current}" /><span>/</span><input data-sheet-field="${maxField}" type="number" value="${max}" /><button type="button" data-adjust="${field}" data-delta="1">+</button></div></div>`;
}

function renderDossierSkillGroup(title, skills) {
  return `<section class="skill-group"><h4>${title}</h4><div class="skill-grid-head"><span>Pericia</span><span>Atr.</span><span>Treino</span><span>Bonus</span><span>Outros</span><span></span></div>${skills.map((skill) => `<div class="paper-skill-row"><span>${escapeHtml(skill.name)}</span><span>${skill.attr}</span><input data-skill="${escapeAttr(skill.name)}" data-skill-field="train" type="number" value="${skill.train}" /><b>${formatBonus(skill.total)}</b><input data-skill="${escapeAttr(skill.name)}" data-skill-field="other" type="number" value="${skill.other}" /><button type="button" data-roll-skill="${escapeAttr(skill.name)}">Rolar</button></div>`).join("")}</section>`;
}

function renderAttackRows(attacks) {
  const rows = attacks.length ? attacks : ["Novo ataque | 1d20 | 1d4 | 20 | Curto | -"];
  return rows.slice(0, 8).map((item, index) => {
    const attack = parseAttackLine(item);
    return `
      <tr>
        <td><input data-attack-index="${index}" data-attack-field="name" value="${escapeAttr(attack.name)}" /></td>
        <td><input data-attack-index="${index}" data-attack-field="test" value="${escapeAttr(attack.test)}" /></td>
        <td><input data-attack-index="${index}" data-attack-field="damage" value="${escapeAttr(attack.damage)}" /></td>
        <td><input data-attack-index="${index}" data-attack-field="critical" value="${escapeAttr(attack.critical)}" /></td>
        <td><input data-attack-index="${index}" data-attack-field="range" value="${escapeAttr(attack.range)}" /></td>
        <td><input data-attack-index="${index}" data-attack-field="special" value="${escapeAttr(attack.special)}" /></td>
        <td><button type="button" data-roll-text="${escapeAttr(attack.damage || attack.test || item)}">Rolar</button><button type="button" data-remove-line="attacks" data-index="${index}">Remover</button></td>
      </tr>
    `;
  }).join("");
}

function parseAttackLine(line) {
  const text = String(line || "");
  const parts = text.split("|").map((part) => part.trim());
  if (parts.length >= 6) {
    return {
      name: parts[0],
      test: parts[1] || "1d20",
      damage: parts[2] || "",
      critical: parts[3] || "20",
      range: parts[4] || "Curto",
      special: parts.slice(5).join(" | ") || "-"
    };
  }
  return {
    name: text.replace(/\d*d\d+.*/i, "").trim() || text || "Novo ataque",
    test: "1d20",
    damage: text.match(/\d*d\d+(?:[+-]\d+)?/i)?.[0] || "",
    critical: "20",
    range: "Curto",
    special: text.includes("-") ? text.split("-").slice(1).join("-").trim() : "-"
  };
}

function serializeAttackLine(attack) {
  return [
    attack.name || "Novo ataque",
    attack.test || "1d20",
    attack.damage || "-",
    attack.critical || "20",
    attack.range || "Curto",
    attack.special || "-"
  ].join(" | ");
}

function updateAttackField(index, field, value, rerender = true) {
  const sheet = ensureActiveSheet();
  const attacks = splitLines(sheet.attacks);
  while (attacks.length <= index) attacks.push("Novo ataque | 1d20 | 1d4 | 20 | Curto | -");
  const attack = parseAttackLine(attacks[index]);
  attack[field] = value;
  attacks[index] = serializeAttackLine(attack);
  sheet.attacks = attacks.join("\n");
  if (rerender) localOnlyRender();
  else {
    suppressOnlineSave = true;
    save();
    suppressOnlineSave = false;
  }
  queueSheetPatch(sheet, "attacks", 800);
}

function renderLineList(lines, emptyText, field) {
  if (!lines.length) return `<ul class="paper-lines"><li class="paper-line-empty">${escapeHtml(emptyText)}</li></ul>`;
  return `<ul class="paper-lines">${lines.slice(0, 8).map((item, index) => `<li><span>${escapeHtml(item)}</span><button type="button" data-remove-line="${escapeAttr(field)}" data-index="${index}">Remover</button></li>`).join("")}</ul>`;
}

function splitSheetEntries(text) {
  return String(text || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function selectedSheetCatalogEntries(sheet) {
  const role = catalog.origins.find((item) => normalizeKey(item.name) === normalizeKey(sheet.role));
  const klass = catalog.classes.find((item) => normalizeKey(item.name) === normalizeKey(sheet.className));
  const path = catalog.paths.find((item) => normalizeKey(item.name) === normalizeKey(sheet.pathName));
  return [
    role ? { ...role, type: "Origem escolhida", auto: true } : null,
    role?.talent ? { name: role.talent, type: "Talento de origem", origin: role.name, desc: `Talento concedido pela origem ${role.name}. Pericias da origem: ${role.skills || "-"}.`, auto: true } : null,
    klass ? { ...klass, type: "Classe escolhida", desc: `${klass.desc || ""} ${classResourceFormula(sheet)}`, auto: true } : null,
    path ? { ...path, type: "Trilha escolhida", auto: true } : null
  ].filter(Boolean);
}

function abilityEntriesForSheet(sheet) {
  const manual = splitSheetEntries(sheet.abilities).map((line, index) => ({ ...entryFromSavedLine(line, catalog.abilities), manual: true, index }));
  const automatic = selectedSheetCatalogEntries(sheet)
    .concat(catalogForField("abilities").map((entry) => ({ ...entry, auto: true })));
  return mergeCatalogEntries(automatic.concat(manual));
}

function ritualEntriesForSheet(sheet) {
  const manual = splitSheetEntries(sheet.rituals).map((line, index) => ({ ...entryFromSavedLine(line, catalog.rituals), manual: true, index }));
  return mergeCatalogEntries(manual);
}

function mergeCatalogEntries(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    const key = `${normalizeKey(entry.type)}:${normalizeKey(entry.name)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function entryFromSavedLine(line, source) {
  const name = String(line || "").split("|")[0].split(" - ")[0].trim();
  const found = source.find((entry) => normalizeKey(entry.name) === normalizeKey(name));
  return found ? { ...found, savedLine: line } : { name: name || "Registro", type: "Manual", desc: line, savedLine: line };
}

function renderAbilityPanel(sheet) {
  const entries = abilityEntriesForSheet(sheet);
  if (!entries.length) return `<ul class="paper-lines"><li class="paper-line-empty">Nenhum talento cadastrado</li></ul>`;
  return `<div class="sheet-info-cards">${entries.map((entry) => renderSheetInfoCard(entry, "abilities")).join("")}</div>`;
}

function renderRitualPanel(sheet) {
  if (!canUseRituals(sheet)) {
    return `<p class="paper-line-empty">Esta ficha ainda nao possui acesso a rituais.</p>`;
  }
  const entries = ritualEntriesForSheet(sheet);
  if (!entries.length) return `<p class="paper-line-empty">Nenhum ritual cadastrado. Use Adicionar para escolher rituais liberados pelo NEX.</p>`;
  return `<div class="sheet-info-cards">${entries.map((entry) => renderSheetInfoCard(entry, "rituals")).join("")}</div>`;
}

function renderSheetInfoCard(entry, field) {
  const meta = catalogMeta(entry).filter(Boolean);
  return `
    <article class="sheet-info-card">
      <div>
        <b>${escapeHtml(entry.name)}</b>
        <small>${escapeHtml(entry.type || "Registro")}</small>
      </div>
      <p>${escapeHtml(entry.desc || entry.savedLine || "Sem descricao cadastrada.")}</p>
      ${meta.length ? `<dl>${meta.map((item) => {
        const [label, ...valueParts] = item.split(":");
        return `<div><dt>${escapeHtml(label.trim())}</dt><dd>${escapeHtml(valueParts.join(":").trim() || "-")}</dd></div>`;
      }).join("")}</dl>` : ""}
      ${entry.manual ? `<button type="button" data-remove-line="${escapeAttr(field)}" data-index="${entry.index}">Remover</button>` : ""}
    </article>
  `;
}

function parseInventoryLineRich(raw) {
  const [left, ...descriptionParts] = String(raw || "").split(" - ");
  const parts = left.split("|").map((part) => part.trim()).filter(Boolean);
  const meta = {};
  parts.slice(1).forEach((part) => {
    const [label, ...valueParts] = part.split(":");
    if (!valueParts.length) return;
    const key = normalizeKey(label).replace(/\s+/g, "");
    const value = valueParts.join(":").trim();
    if (key === "tipo") meta.category = value;
    if (key === "categoria") meta.inventoryCategory = value;
    if (key === "subtipo") meta.subtype = value;
    if (key === "quantidade" || key === "qtd") meta.quantity = Math.max(1, Number(value) || 1);
    if (key === "volume") meta.volume = value;
    if (key === "peso") meta.weight = value;
    if (key === "dano") meta.damage = value;
    if (key === "tipodano") meta.damageType = value;
    if (key === "alcance") meta.range = value;
    if (key === "alcancetipo") meta.rangeType = value;
    if (key === "propriedades") meta.properties = value;
    if (key === "dominio") meta.mastery = value;
    if (key === "ca") meta.armorBase = Number(value) || value;
    if (key === "limitedes") meta.dexLimit = value === "" ? "" : Number(value);
    if (key === "escudo") meta.shieldBonus = Number(value) || value;
    if (key === "bonusca") meta.bonusCa = Number(value) || 0;
    if (key === "bonusataque") meta.attackBonus = Number(value) || 0;
    if (key === "bonusdano") meta.damageBonus = Number(value) || 0;
    if (key === "furtividade") meta.stealth = value;
    if (key === "forca") meta.strength = Number(value) || value;
    if (key === "bonus" || key === "uso") meta.bonus = value;
    if (key === "defesa") meta.defense = value;
    if (key === "equipado") meta.equipped = boolFromMeta(value);
    if (key === "armaempunho") meta.weaponReady = boolFromMeta(value);
    if (key === "armaduraemuso") meta.armorInUse = boolFromMeta(value);
    if (key === "escudoemuso") meta.shieldInUse = boolFromMeta(value);
    if (key === "observacoes") meta.notes = value;
    if (key === "imagem" || key === "foto" || key === "image") meta.image = value;
  });
  return {
    name: parts[0] || "Item sem nome",
    meta,
    description: descriptionParts.join(" - ").trim()
  };
}

function parseInventoryItem(raw, sheet = ensureActiveSheet()) {
  const parsed = parseInventoryLineRich(raw);
  const name = parsed.name;
  const isDnd = sheetSystemId(sheet) === "dnd5e";
  const source = isDnd ? DND_EQUIPMENT_CATALOG : catalog.inventory;
  const entry = source.find((item) => normalizeKey(item.name) === normalizeKey(name));
  const baseStats = isDnd ? (DND_EQUIPMENT_BY_NAME[normalizeKey(entry?.name || name)] || {}) : (catalogStats[entry?.name || name] || {});
  const stats = { ...baseStats, ...parsed.meta };
  return { raw, name: entry?.name || name || "Item sem nome", entry, stats, customDescription: parsed.description };
}

function parseInventoryLine(raw) {
  const [left, ...descriptionParts] = String(raw || "").split(" - ");
  const parts = left.split("|").map((part) => part.trim()).filter(Boolean);
  const meta = {};
  parts.slice(1).forEach((part) => {
    const [label, ...valueParts] = part.split(":");
    if (!valueParts.length) return;
    const key = normalizeKey(label).replace(/\s+/g, "");
    const value = valueParts.join(":").trim();
    if (key === "tipo") meta.category = value;
    if (key === "volume") meta.volume = value;
    if (key === "peso") meta.weight = value;
    if (key === "custo" || key === "preco") meta.cost = value;
    if (key === "dano") meta.damage = value;
    if (key === "alcance") meta.range = value;
    if (key === "propriedades") meta.properties = value;
    if (key === "ca") meta.armorBase = Number(value) || value;
    if (key === "limitedes") meta.dexLimit = value === "" ? "" : Number(value);
    if (key === "escudo") meta.shieldBonus = Number(value) || value;
    if (key === "furtividade") meta.stealth = value;
    if (key === "forca") meta.strength = Number(value) || value;
    if (key === "bonus" || key === "bônus" || key === "uso") meta.bonus = value;
    if (key === "defesa") meta.defense = value;
    if (key === "imagem" || key === "foto" || key === "image") meta.image = value;
  });
  return {
    name: parts[0] || "Item sem nome",
    meta,
    description: descriptionParts.join(" - ").trim()
  };
}

function inventoryItemDescription(item) {
  if (item.entry?.system === "dnd5e" || DND_EQUIPMENT_BY_NAME[normalizeKey(item.name)]) {
    return item.customDescription || item.stats?.desc || item.entry?.desc || "Equipamento de D&D 5e. Ajuste os campos mecanicos conforme a decisao do mestre.";
  }
  const details = {
    Revolver: "Arma curta, simples de portar e facil de esconder. Boa para agentes que precisam de defesa rapida sem carregar equipamento pesado.",
    Pistola: "Arma de fogo leve e pratica, indicada para combate a curta e media distancia. Funciona bem como arma secundaria ou de uso discreto.",
    Espingarda: "Arma de alto impacto em curta distancia. E barulhenta, chama atencao e exige cuidado, mas pode encerrar confrontos rapidamente.",
    Fuzil: "Arma longa para confronto aberto. Tem bom alcance e pressao de fogo, mas ocupa mais espaco e combina melhor com missoes preparadas.",
    Faca: "Arma corpo a corpo pequena, discreta e versatil. Pode ser usada em combate proximo, sobrevivencia, corte de cordas e pequenas tarefas de campo.",
    Bastao: "Arma simples de impacto, util para defesa, controle e abordagem nao letal quando a situacao permite.",
    Katana: "Lamina longa e precisa. Causa bom dano em combate proximo, mas e chamativa e pouco discreta em investigacoes comuns.",
    "Protecao Leve": "Protecao discreta para reduzir risco em campo. Ajuda o agente a sobreviver sem comprometer muito a mobilidade.",
    "Protecao Pesada": "Protecao robusta para confrontos esperados. Aumenta defesa, mas pesa, chama atencao e pode atrapalhar cenas de furtividade.",
    "Kit de Pericia": "Conjunto de ferramentas para uma pericia especifica. Inclui instrumentos, pecas pequenas, medidores e recursos de apoio.",
    "Lanterna Tatica": "Fonte de luz resistente para ambientes escuros. Ajuda em exploracao, sinalizacao e cenas com baixa visibilidade.",
    Algemas: "Equipamento de contencao para suspeitos rendidos ou criaturas humanas controladas. Nao substitui vigilancia.",
    Camera: "Registra cenas, simbolos, ferimentos, locais e fenomenos. Serve como memoria visual e prova dentro da investigacao.",
    Cicatrizante: "Recurso medico de emergencia. Ajuda a estabilizar ferimentos leves e manter um agente funcional ate atendimento melhor.",
    "Mochila Militar": "Mochila reforcada para organizar equipamento de campo. Boa para carregar itens sem perder acesso rapido ao essencial.",
    Smartphone: "Ferramenta de comunicacao, registro, mapas e pesquisa. Pode ser inutilizado por interferencia, falta de sinal ou fenomenos paranormais.",
    Arpeu: "Gancho com cabo para escalada e travessia. Util para entrar por rotas alternativas ou acessar locais elevados.",
    Binoculos: "Permite observar alvos, janelas, trilhas e movimentacao a distancia sem se expor.",
    Corda: "Item basico para escalada, resgate, amarras, improvisos e travessias. Quase sempre encontra uso em campo.",
    "Equipamento de Sobrevivencia": "Conjunto de campo com recursos para abrigo, orientacao, fogo e pequenas emergencias fora de area urbana.",
    "Mascara de Gas": "Protege contra fumaca, toxinas e ar contaminado por tempo limitado. Precisa estar acessivel antes da exposicao.",
    "Detector de Sinais": "Ajuda a localizar transmissoes, rastreadores e interferencias eletronicas durante uma investigacao.",
    "Bloqueador de Sinal": "Interfere em comunicacoes proximas. Pode proteger uma operacao, mas tambem isola o grupo.",
    "Spray de Pimenta": "Item de contencao para atrapalhar visao e reacao de um alvo proximo. Menos efetivo contra criaturas nao humanas.",
    "Granada de Fragmentacao": "Explosivo de area para situacoes extremas. Perigoso para aliados, evidencias e estruturas proximas.",
    Molotov: "Incendiario improvisado que cria fogo e pressiona uma area. E instavel, chamativo e arriscado em locais fechados."
  };
  return item.customDescription || details[item.name] || item.entry?.desc || "Item registrado manualmente na ficha. Complete a descricao conforme a decisao do mestre e o contexto da cena.";
}

function inventoryItemMeta(item) {
  const stats = item.stats || {};
  if (item.entry?.system === "dnd5e" || DND_EQUIPMENT_BY_NAME[normalizeKey(item.name)]) {
    return [
      ["Categoria", dndInventoryCategory(item)],
      ["Tipo", stats.category || item.entry?.type || "Manual"],
      ["Qtd.", stats.quantity || 1],
      ["Peso", stats.weight || "-"],
      ["Dano", stats.damage || "-"],
      ["Tipo dano", stats.damageType || "-"],
      ["Alcance", stats.range || "-"],
      ["Propriedades", stats.properties || "-"],
      ["Dominio", stats.mastery || "-"],
      ["CA", stats.armorBase ? String(stats.armorBase) : "-"],
      ["Limite DES", stats.dexLimit === "" ? "Sem limite" : stats.dexLimit ?? "-"],
      ["Escudo", stats.shieldBonus ? `+${stats.shieldBonus} CA` : "-"],
      ["Bonus", stats.bonus || stats.stealth || "-"]
    ];
  }
  return [
    ["Tipo", stats.category || item.entry?.type || "Manual"],
    ["Volume", stats.volume ?? "-"],
    ["Dano", stats.damage || "-"],
    ["Alcance", stats.range || "-"],
    ["Defesa", stats.defense || "-"],
    ["Bonus", stats.bonus || stats.defense || (stats.damage && stats.damage !== "-" ? "Possui uso ofensivo, sem bonus fixo automatico." : "Nao possui bonus mecanico fixo.")]
  ];
}

function inventoryItemCard(raw, index, sheet = ensureActiveSheet()) {
  const item = parseInventoryItem(raw);
  const isDnd = sheetSystemId(sheet) === "dnd5e";
  const active = isDnd ? !!item.stats.equipped : inventoryLineActive(raw);
  return `
    <article class="inventory-card ${isDnd ? "dnd-inventory-card" : ""} ${active ? "item-active" : "item-inactive"}">
      <div class="inventory-photo-wrap">
        ${inventoryItemThumb(item, sheet)}
        <label class="item-image-picker">Trocar imagem <input data-inventory-image="${index}" type="file" accept="image/*" /></label>
      </div>
      <div class="inventory-card-body">
        <div class="inventory-card-head">
          <h3>${escapeHtml(item.name)}</h3>
          ${isDnd ? `<span class="dnd-item-category-pill">${escapeHtml(dndInventoryCategory(item))}</span>` : ""}
          <button type="button" data-inventory-toggle="${index}">${active ? "Desequipar" : "Equipar"}</button>
          ${isDnd && isDndWeaponItem(item) ? `<button type="button" data-dnd-equip-action="weapon" data-index="${index}">${item.stats.weaponReady ? "Guardar" : "Arma em punho"}</button>` : ""}
          ${isDnd && isDndArmorItem(item) ? `<button type="button" data-dnd-equip-action="armor" data-index="${index}">${item.stats.armorInUse ? "Remover armadura" : "Armadura em uso"}</button>` : ""}
          ${isDnd && isDndShieldItem(item) ? `<button type="button" data-dnd-equip-action="shield" data-index="${index}">${item.stats.shieldInUse ? "Remover escudo" : "Escudo em uso"}</button>` : ""}
          <button type="button" data-inventory-remove="${index}">Remover</button>
        </div>
        <dl class="inventory-meta">
          <div><dt>Estado</dt><dd>${active ? "Ativo" : "Inativo"}</dd></div>
          ${isDnd ? `<div><dt>Uso</dt><dd>${item.stats.weaponReady ? "Arma em punho" : item.stats.armorInUse ? "Armadura em uso" : item.stats.shieldInUse ? "Escudo em uso" : item.stats.equipped ? "Equipado" : "Guardado"}</dd></div>` : ""}
          ${inventoryItemMeta(item).map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
        </dl>
        <div class="inventory-edit-grid">
          <label>Tipo <input data-inventory-index="${index}" data-inventory-field="category" value="${escapeAttr(item.stats.category || item.entry?.type || "Manual")}" /></label>
          ${isDnd ? `<label>Categoria <input data-inventory-index="${index}" data-inventory-field="inventoryCategory" value="${escapeAttr(dndInventoryCategory(item))}" /></label>
          <label>Quantidade <input data-inventory-index="${index}" data-inventory-field="quantity" type="number" min="1" value="${escapeAttr(item.stats.quantity || 1)}" /></label>` : ""}
          ${isDnd ? `<label>Subtipo <input data-inventory-index="${index}" data-inventory-field="subtype" value="${escapeAttr(item.stats.subtype || item.entry?.type || "")}" /></label>` : `<label>Volume <input data-inventory-index="${index}" data-inventory-field="volume" value="${escapeAttr(item.stats.volume ?? "-")}" /></label>`}
          <label>Peso <input data-inventory-index="${index}" data-inventory-field="weight" value="${escapeAttr(item.stats.weight || "")}" /></label>
          <label>Dano <input data-inventory-index="${index}" data-inventory-field="damage" value="${escapeAttr(item.stats.damage || "-")}" /></label>
          ${isDnd ? `<label>Tipo dano <input data-inventory-index="${index}" data-inventory-field="damageType" value="${escapeAttr(item.stats.damageType || "")}" /></label>` : ""}
          <label>Alcance <input data-inventory-index="${index}" data-inventory-field="range" value="${escapeAttr(item.stats.range || "-")}" /></label>
          <label>CA <input data-inventory-index="${index}" data-inventory-field="armorBase" value="${escapeAttr(item.stats.armorBase || "")}" /></label>
          <label>Limite DES <input data-inventory-index="${index}" data-inventory-field="dexLimit" value="${escapeAttr(item.stats.dexLimit ?? "")}" /></label>
          <label>Escudo <input data-inventory-index="${index}" data-inventory-field="shieldBonus" value="${escapeAttr(item.stats.shieldBonus || "")}" /></label>
          <label>Propriedades <input data-inventory-index="${index}" data-inventory-field="properties" value="${escapeAttr(item.stats.properties || "")}" /></label>
          ${isDnd ? `<label>Dominio <input data-inventory-index="${index}" data-inventory-field="mastery" value="${escapeAttr(item.stats.mastery || "")}" /></label>` : ""}
          <label>Bonus <input data-inventory-index="${index}" data-inventory-field="bonus" value="${escapeAttr(item.stats.bonus || item.stats.defense || "-")}" /></label>
          <label>Imagem URL <input data-inventory-index="${index}" data-inventory-field="image" value="${escapeAttr(item.stats.image || "")}" placeholder="Cole uma URL ou envie arquivo" /></label>
        </div>
        <p>${escapeHtml(inventoryItemDescription(item))}</p>
      </div>
    </article>
  `;
}

function inventoryItemThumb(item, sheet) {
  const savedImage = sheet?.itemImages?.[inventoryImageKey(item.name)] || item.stats?.image;
  if (savedImage && /^(data:|https?:|blob:|file:)/i.test(String(savedImage))) {
    return `<span class="catalog-thumb photo-thumb custom-photo-thumb" style="background-image:url('${escapeAttr(savedImage)}')"></span>`;
  }
  return catalogThumb(item.entry || { name: item.name, type: "Item" });
}

function inventoryImageKey(name) {
  return normalizeKey(name || "item-sem-nome");
}

function dndCatalogItemsForCategory(category) {
  return DND_EQUIPMENT_CATALOG.filter((entry) => dndInventoryCategory({ name: entry.name, stats: entry, entry }) === category);
}

function renderDndInventoryAddPanel() {
  const categoryOptions = DND_INVENTORY_CATEGORIES.map((category) => `<option value="${escapeAttr(category)}">${escapeHtml(category)}</option>`).join("");
  const itemOptions = DND_EQUIPMENT_CATALOG
    .map((entry) => `<option value="${escapeAttr(entry.name)}" data-category="${escapeAttr(dndInventoryCategory({ name: entry.name, stats: entry, entry }))}">${escapeHtml(entry.name)} (${escapeHtml(dndInventoryCategory({ name: entry.name, stats: entry, entry }))})</option>`)
    .join("");
  return `
    <form class="dnd-inventory-add" data-dnd-inventory-add>
      <label>Categoria
        <select data-dnd-new-category>${categoryOptions}</select>
      </label>
      <label>Item do catalogo
        <select data-dnd-new-item>${itemOptions}</select>
      </label>
      <label>Nome manual
        <input data-dnd-new-name placeholder="Item personalizado" />
      </label>
      <label>Qtd.
        <input data-dnd-new-quantity type="number" min="1" value="1" />
      </label>
      <button type="submit">Adicionar item</button>
    </form>
  `;
}

function renderDndInventorySections(items, sheet) {
  const parsedItems = items.map((raw, index) => ({ raw, index, item: parseInventoryItem(raw, sheet) }));
  return DND_INVENTORY_CATEGORIES.map((category) => {
    const categoryItems = parsedItems.filter(({ item }) => dndInventoryCategory(item) === category);
    if (!categoryItems.length) return "";
    return `
      <section class="dnd-inventory-section">
        <h3>${escapeHtml(category)}</h3>
        <div class="inventory-list detailed dnd-inventory-list">
          ${categoryItems.map(({ raw, index }) => inventoryItemCard(raw, index, sheet)).join("")}
        </div>
      </section>
    `;
  }).join("") || `<p>Nenhum equipamento cadastrado na ficha.</p>`;
}

function addDndInventoryItemFromPanel(form) {
  const sheet = ensureActiveSheet();
  if (sheetSystemId(sheet) !== "dnd5e") return;
  const category = form.querySelector("[data-dnd-new-category]")?.value || "Outros";
  const selectedName = form.querySelector("[data-dnd-new-item]")?.value || "";
  const manualName = form.querySelector("[data-dnd-new-name]")?.value.trim() || "";
  const quantity = Math.max(1, Number(form.querySelector("[data-dnd-new-quantity]")?.value) || 1);
  const entry = DND_EQUIPMENT_CATALOG.find((item) => normalizeKey(item.name) === normalizeKey(manualName || selectedName));
  const base = entry || { name: manualName || "Item personalizado", category: category === "Armas" ? "Arma" : category, inventoryCategory: category, type: category, desc: "Item personalizado da ficha D&D." };
  const line = dndInventoryLine({ ...base, quantity, inventoryCategory: category });
  sheet.inventory = splitLines(sheet.inventory).concat(line).join("\n");
  syncDndEquipmentEffects(sheet, "add-item");
  recalculateDerivedStats(sheet, "inventory");
  console.log("Item adicionado ao inventário", { item: base.name, category });
  renderAll();
  queueSheetPatch(sheet, "inventory", 500);
}

function renderInventoryView() {
  const container = document.querySelector("#inventoryApp");
  if (!container) return;
  const linkedSheets = isMasterMode() ? sheetsLinkedToCampaign(currentCampaign()) : [];
  if (isMasterMode() && linkedSheets.length) {
    if (!masterInventorySheetId || !linkedSheets.some((sheet) => sheet.id === masterInventorySheetId)) masterInventorySheetId = linkedSheets[0].id;
    state.activeSheetId = masterInventorySheetId;
  }
  const sheet = ensureActiveSheet();
  const items = splitLines(sheet.inventory);
  const isDnd = sheetSystemId(sheet) === "dnd5e";
  if (isDnd) console.log("Carregando inventário D&D", { sheet: sheet.id, items: items.length });
  container.innerHTML = `
    ${isMasterMode() && linkedSheets.length ? `
      <div class="inventory-sheet-picker">
        ${linkedSheets.map((linked) => `
          <button type="button" data-inventory-sheet="${escapeAttr(linked.id)}" class="${linked.id === sheet.id ? "selected" : ""}">
            <span class="mini-sheet-photo" style="${linked.portrait ? `background-image:url('${escapeAttr(linked.portrait)}')` : ""}">${linked.portrait ? "" : escapeHtml(initials(linked.name || "AG"))}</span>
            <b>${escapeHtml(linked.name || "Agente")}</b>
            <small>${escapeHtml(linked.player || "Jogador")} | ${escapeHtml(linked.className || "Sem classe")} | ${escapeHtml(linked.nex || "5%")}</small>
          </button>
        `).join("")}
      </div>
    ` : ""}
    <div class="inventory-summary">
      <b>${escapeHtml(sheet.name || "Ficha ativa")}</b>
      <span>${items.length} item(ns) registrados${isDnd ? " | D&D 5e" : ""}</span>
    </div>
    ${isDnd ? renderDndInventoryAddPanel() : ""}
    ${isDnd ? renderDndInventorySections(items, sheet) : (items.length ? `<div class="inventory-list detailed">${items.map((item, index) => inventoryItemCard(item, index, sheet)).join("")}</div>` : `<p>Nenhum equipamento cadastrado na ficha.</p>`)}
    <div class="inventory-actions">
      ${isMasterMode() ? `<button type="button" data-refresh-inventory-campaign>Atualizar fichas da campanha</button>` : ""}
      <button type="button" data-tab="fichas">Abrir ficha</button>
      ${isDnd ? "" : `<button type="button" data-inventory-add>Adicionar pelo catalogo</button>`}
      <button type="button" data-save-file>Salvar arquivo</button>
    </div>
  `;
  container.querySelectorAll("[data-inventory-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      masterInventorySheetId = button.dataset.inventorySheet;
      state.activeSheetId = masterInventorySheetId;
      renderInventoryView();
      renderCrisisSheet();
    });
  });
  container.querySelectorAll("[data-inventory-remove]").forEach((button) => {
    button.addEventListener("click", () => removeSheetLine("inventory", Number(button.dataset.inventoryRemove)));
  });
  container.querySelectorAll("[data-inventory-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleInventoryActive(Number(button.dataset.inventoryToggle)));
  });
  container.querySelectorAll("[data-dnd-equip-action]").forEach((button) => {
    button.addEventListener("click", () => setDndEquipmentState(Number(button.dataset.index), button.dataset.dndEquipAction));
  });
  container.querySelector("[data-dnd-inventory-add]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    addDndInventoryItemFromPanel(event.currentTarget);
  });
  container.querySelector("[data-dnd-new-category]")?.addEventListener("change", (event) => {
    const select = container.querySelector("[data-dnd-new-item]");
    if (!select) return;
    const category = event.currentTarget.value;
    Array.from(select.options).forEach((option) => {
      option.hidden = option.dataset.category !== category;
    });
    const first = Array.from(select.options).find((option) => !option.hidden);
    if (first) select.value = first.value;
  });
  container.querySelector("[data-dnd-new-category]")?.dispatchEvent(new Event("change"));
  container.querySelectorAll("[data-inventory-field]").forEach((field) => {
    field.addEventListener("input", () => updateInventoryField(Number(field.dataset.inventoryIndex), field.dataset.inventoryField, field.value, false));
    field.addEventListener("change", () => updateInventoryField(Number(field.dataset.inventoryIndex), field.dataset.inventoryField, field.value));
  });
  container.querySelectorAll("[data-inventory-image]").forEach((field) => {
    field.addEventListener("change", () => updateInventoryImage(Number(field.dataset.inventoryImage), field.files?.[0]));
  });
  container.querySelector("[data-inventory-add]")?.addEventListener("click", () => openCatalog("inventory"));
  container.querySelector("[data-refresh-inventory-campaign]")?.addEventListener("click", async () => {
    try {
      await refreshActiveCampaignFromSupabase({ rerender: false });
      renderInventoryView();
      setSyncStatus("Inventarios vinculados atualizados.");
    } catch (error) {
      setSyncStatus(`Nao consegui atualizar inventarios: ${error.message}`, true);
      window.alert(error.message);
    }
  });
  container.querySelector("[data-tab]")?.addEventListener("click", () => switchTab("fichas"));
  container.querySelector("[data-save-file]")?.addEventListener("click", saveCurrentFile);
}

function renderRitualsView() {
  const container = document.querySelector("#ritualsApp");
  if (!container) return;
  const linkedSheets = isMasterMode() ? sheetsLinkedToCampaign(currentCampaign()) : [];
  if (isMasterMode() && linkedSheets.length) {
    if (!masterInventorySheetId || !linkedSheets.some((sheet) => sheet.id === masterInventorySheetId)) masterInventorySheetId = linkedSheets[0].id;
    state.activeSheetId = masterInventorySheetId;
  }
  const sheet = ensureActiveSheet();
  const entries = ritualEntriesForSheet(sheet);
  const canUse = canUseRituals(sheet);
  container.innerHTML = `
    ${isMasterMode() && linkedSheets.length ? `
      <div class="inventory-sheet-picker">
        ${linkedSheets.map((linked) => `
          <button type="button" data-ritual-sheet="${escapeAttr(linked.id)}" class="${linked.id === sheet.id ? "selected" : ""}">
            <span class="mini-sheet-photo" style="${linked.portrait ? `background-image:url('${escapeAttr(linked.portrait)}')` : ""}">${linked.portrait ? "" : escapeHtml(initials(linked.name || "AG"))}</span>
            <b>${escapeHtml(linked.name || "Agente")}</b>
            <small>${escapeHtml(linked.player || "Jogador")} | ${escapeHtml(linked.className || "Sem classe")} | ${escapeHtml(linked.nex || "5%")}</small>
          </button>
        `).join("")}
      </div>
    ` : ""}
    <div class="inventory-summary">
      <b>${escapeHtml(sheet.name || "Ficha ativa")}</b>
      <span>${canUse ? `${entries.length} ritual(is) | ate ${maxRitualCircle(sheet)} circulo` : "Sem acesso a rituais"}</span>
    </div>
    ${canUse ? `
      ${entries.length ? `<div class="sheet-info-cards rituals-list">${entries.map((entry) => renderSheetInfoCard(entry, "rituals")).join("")}</div>` : `<p class="paper-line-empty">Nenhum ritual cadastrado. Use o catalogo para adicionar rituais liberados pelo NEX.</p>`}
    ` : `<p class="paper-line-empty">${escapeHtml(emptyCatalogText("rituals"))}</p>`}
    <div class="inventory-actions">
      ${isMasterMode() ? `<button type="button" data-refresh-ritual-campaign>Atualizar fichas da campanha</button>` : ""}
      <button type="button" data-tab="fichas">Abrir ficha</button>
      <button type="button" data-ritual-add ${canUse ? "" : "disabled"}>Adicionar pelo catalogo</button>
      <button type="button" data-save-file>Salvar arquivo</button>
    </div>
  `;
  container.querySelectorAll("[data-ritual-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      masterInventorySheetId = button.dataset.ritualSheet;
      state.activeSheetId = masterInventorySheetId;
      renderRitualsView();
      renderCrisisSheet();
    });
  });
  container.querySelectorAll("[data-remove-line]").forEach((button) => {
    button.addEventListener("click", () => removeSheetLine(button.dataset.removeLine, Number(button.dataset.index)));
  });
  container.querySelector("[data-ritual-add]")?.addEventListener("click", () => openCatalog("rituals"));
  container.querySelector("[data-refresh-ritual-campaign]")?.addEventListener("click", async () => {
    try {
      await refreshActiveCampaignFromSupabase({ rerender: false });
      renderRitualsView();
      setSyncStatus("Rituais vinculados atualizados.");
    } catch (error) {
      setSyncStatus(`Nao consegui atualizar rituais: ${error.message}`, true);
      window.alert(error.message);
    }
  });
  container.querySelector("[data-tab]")?.addEventListener("click", () => switchTab("fichas"));
  container.querySelector("[data-save-file]")?.addEventListener("click", saveCurrentFile);
}

function renderNotesView() {
  const container = document.querySelector("#notesApp");
  if (!container) return;
  const sheet = ensureActiveSheet();
  container.innerHTML = `
    <div class="inventory-summary">
      <b>${escapeHtml(sheet.name || "Ficha ativa")}</b>
      <span>Anotacoes da ficha pessoal</span>
    </div>
    <label>Anotacoes <textarea data-notes-field="notes" rows="5" placeholder="Pistas, condicoes, traumas, contatos...">${escapeHtml(sheet.notes)}</textarea></label>
    <label>Aparencia <textarea data-notes-field="appearance" rows="4" placeholder="Nome, genero, idade, descricao fisica...">${escapeHtml(sheet.appearance)}</textarea></label>
    <label>Personalidade <textarea data-notes-field="personality" rows="4" placeholder="Tracos marcantes, opinioes, ideais...">${escapeHtml(sheet.personality)}</textarea></label>
    <label>Historico <textarea data-notes-field="history" rows="5" placeholder="Infancia, familia, contato com o paranormal...">${escapeHtml(sheet.history)}</textarea></label>
    <label>Objetivo <textarea data-notes-field="objective" rows="3" placeholder="O que move esse personagem?">${escapeHtml(sheet.objective)}</textarea></label>
    <div class="inventory-actions">
      <button type="button" data-save-file>Salvar arquivo</button>
    </div>
  `;
  container.querySelectorAll("[data-notes-field]").forEach((field) => {
    field.addEventListener("input", () => updateActiveSheet(field.dataset.notesField, field.value, false, false));
    field.addEventListener("change", () => updateActiveSheet(field.dataset.notesField, field.value));
  });
  container.querySelector("[data-save-file]")?.addEventListener("click", saveCurrentFile);
}

function renderMissionsView() {
  if (!els.missionsApp) return;
  const session = currentSession();
  if (!session) {
    els.missionsApp.innerHTML = `<p>Nenhum arquivo ativo.</p>`;
    return;
  }
  const pistas = session.pistas || [];
  els.missionsApp.innerHTML = `
    <article class="mission-file">
      <b>${escapeHtml(session.codigoArquivo || "arquivo")}</b>
      <h3>${escapeHtml(session.titulo || "Missao sem titulo")}</h3>
      <p>${escapeHtml(session.mission || session.resumo || "Objetivo ainda nao registrado pelo mestre.")}</p>
      <dl>
        <div><dt>Status</dt><dd>${escapeHtml(session.visibleToPlayers ? "Liberada" : "Restrita")}</dd></div>
        <div><dt>Data</dt><dd>${escapeHtml(session.dataCriacao || "-")}</dd></div>
        <div><dt>Mapa</dt><dd>${escapeHtml(state.map.name || "Mapa sem nome")}</dd></div>
      </dl>
      <h4>Pistas reveladas</h4>
      ${pistas.length ? `<ul>${pistas.map((pista) => `<li>${escapeHtml(pista)}</li>`).join("")}</ul>` : `<p>Nenhuma pista revelada ainda.</p>`}
      ${isMasterMode() ? `<button type="button" data-generate-mission>Gerar arquivo de missao</button>` : ""}
    </article>
  `;
  els.missionsApp.querySelector("[data-generate-mission]")?.addEventListener("click", generateMissionForMaster);
}

function generateMissionForMaster() {
  const campaign = currentCampaign();
  if (!campaign || !isMasterMode()) return;
  const themes = [
    ["Ecos no necroterio", "Investigue registros de corpos que continuaram emitindo sons apos a declaracao de obito.", "Tecnico legista desaparecido", "Camera do corredor apagou as 03:17", "Um simbolo foi riscado sob a mesa fria"],
    ["A casa sem reflexo", "Entre em uma residencia onde espelhos mostram pessoas que nao estao mais vivas.", "Vizinho ouviu passos dentro das paredes", "Todos os espelhos foram cobertos com jornal antigo", "Uma chave foi achada dentro de um copo d'agua"],
    ["Sinal de emergencia", "Rastreie uma transmissao de radio repetindo nomes dos investigadores antes deles chegarem.", "Antena improvisada no telhado", "Mensagem repete a cada sete minutos", "Um aparelho esquenta quando alguem mente"]
  ];
  const pick = themes[Math.floor(Math.random() * themes.length)];
  const next = Math.max(0, ...campaign.sessoes.map((session) => Number(session.numero) || 0)) + 1;
  const session = createSessionRecord(campaign.id, next, pick[0], pick[1], blankMap(pick[0]));
  session.pistas = pick.slice(2);
  session.privateNote = "Use luz baixa, pistas incompletas e uma consequencia clara para falhas criticas.";
  session.publicText = pick[1];
  session.visibleToPlayers = false;
  session.tokens.push({
    id: crypto.randomUUID(),
    name: "Ameaca inicial",
    type: "npc",
    label: "Criatura / suspeito",
    color: "#7b241c",
    light: 0,
    hidden: true,
    hp: 20 + next * 4,
    hpMax: 20 + next * 4,
    x: 8,
    y: 6
  });
  seedSessionTokensFromSheets(campaign, session);
  campaign.sessoes.push(session);
  state.activeCampaignId = campaign.id;
  state.activeSessionId = session.id;
  applySessionToTable(session);
  renderAll();
  renderPortal();
}

function renderChatView() {
  if (!els.chatLog) return;
  const session = currentSession();
  const chat = session?.chat || [];
  els.chatLog.innerHTML = chat.length ? chat.slice(-80).map((message) => `
    <article class="chat-message ${message.role === "master" ? "from-master" : "from-player"}">
      <b>${escapeHtml(message.user || "Mesa")}</b>
      <p>${escapeHtml(message.text)}</p>
      <span>${escapeHtml(message.at || "")}</span>
    </article>
  `).join("") : `<p>Nenhuma mensagem nesta sessao.</p>`;
  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

function sendChatMessage(text) {
  const session = currentSession();
  const user = currentUser();
  const clean = text.trim();
  if (!session || !clean) return;
  session.chat = Array.isArray(session.chat) ? session.chat : [];
  session.chat.push({
    id: crypto.randomUUID(),
    user: user?.username || (state.currentMode === "master" ? "Mestre" : "Jogador"),
    role: state.currentMode === "master" ? "master" : "player",
    text: clean,
    at: new Date().toLocaleTimeString("pt-BR")
  });
  session.chat = session.chat.slice(-120);
  if (els.chatText) els.chatText.value = "";
  renderChatView();
  save();
}

function voiceUserId() {
  const user = currentUser();
  if (user?.id) return user.id;
  let id = sessionStorage.getItem("arquivo-voice-client-id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("arquivo-voice-client-id", id);
  }
  return id;
}

function voiceMeta(extra = {}) {
  const user = currentUser();
  return {
    id: voiceUserId(),
    username: user?.username || (state.currentMode === "master" ? "Mestre" : "Jogador"),
    role: state.currentMode === "master" ? "master" : "player",
    muted: voiceMuted,
    ...extra
  };
}

function setVoiceStatus(message, isAlert = false) {
  if (!els.voiceStatus) return;
  els.voiceStatus.textContent = message;
  els.voiceStatus.classList.toggle("voice-alert", isAlert);
}

function renderVoicePanel() {
  if (!els.voiceStatus) return;
  els.voiceJoin.textContent = voiceJoined ? "Sair da voz" : "Entrar na voz";
  [els.voiceMute, els.voiceDeafen, els.voiceAttention, els.voiceRequestTalk, els.voiceMonitor].forEach((button) => {
    if (button) button.disabled = !voiceJoined;
  });
  if (els.voiceMute) els.voiceMute.textContent = voiceMuted ? "Desmutar" : "Mute";
  if (els.voiceDeafen) els.voiceDeafen.textContent = voiceDeafened ? "Ouvir mesa" : "Silenciar mesa";
  if (els.voiceMonitor) els.voiceMonitor.textContent = voiceMonitoring ? "Parar teste" : "Testar micro";
  if (els.voiceMicLamp) {
    els.voiceMicLamp.classList.toggle("off", !voiceJoined);
    els.voiceMicLamp.classList.toggle("muted", voiceJoined && voiceMuted && !voiceMonitoring);
    els.voiceMicLamp.classList.toggle("active", voiceJoined && !voiceMuted && !voiceMonitoring);
    els.voiceMicLamp.classList.toggle("monitoring", voiceJoined && voiceMonitoring);
    els.voiceMicLamp.title = !voiceJoined ? "Microfone desconectado" : voiceMonitoring ? "Teste de microfone ativo" : voiceMuted ? "Microfone mutado para a mesa" : "Microfone ativo para a mesa";
  }
  renderVoiceParticipants();
}

function renderVoiceParticipants() {
  if (!els.voiceParticipants) return;
  const rows = Array.from(voiceParticipants.values());
  if (!voiceJoined || !rows.length) {
    els.voiceParticipants.textContent = voiceJoined ? "Aguardando conexoes..." : "Ninguem conectado.";
    return;
  }
  els.voiceParticipants.innerHTML = rows.map((item) => `
    <span class="${item.role === "master" ? "voice-master" : ""}">
      <b>${escapeHtml(item.username)}</b>
      <small>${item.role === "master" ? "mestre" : "jogador"}${item.muted ? " | mute" : ""}</small>
    </span>
  `).join("");
}

function voiceRoomName() {
  const campaignId = uuidOrNull(currentCampaign()?.id) || "local";
  const sceneId = currentSceneId();
  return `voice:${campaignId}:${sceneId}`;
}

async function toggleVoiceRoom() {
  if (voiceJoined) {
    stopVoiceRoom();
    return;
  }
  await startVoiceRoom();
}

async function startVoiceRoom() {
  const client = supabaseClient();
  const user = currentUser();
  if (!client || !isOnlineUser(user)) {
    setVoiceStatus("sem servidor", true);
    window.alert("A voz precisa de login online e Supabase ativo.");
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    setVoiceStatus("microfone indisponivel", true);
    window.alert("Este navegador nao liberou microfone.");
    return;
  }
  try {
    setVoiceStatus("pedindo microfone...");
    localVoiceStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
    voiceJoined = true;
    voiceMuted = false;
    voiceDeafened = false;
    voiceParticipants.set(voiceUserId(), voiceMeta());
    renderVoicePanel();
    voiceChannel = client.channel(voiceRoomName(), {
      config: { broadcast: { self: false }, presence: { key: voiceUserId() } }
    });
    voiceChannel
      .on("broadcast", { event: "signal" }, ({ payload }) => handleVoiceSignal(payload))
      .on("broadcast", { event: "voice_event" }, ({ payload }) => handleVoiceEvent(payload))
      .on("presence", { event: "sync" }, syncVoicePresence)
      .on("presence", { event: "leave" }, ({ key }) => removeVoicePeer(key))
      .subscribe(async (status, error) => {
        if (error) {
          console.error("Erro Realtime", error);
          setVoiceStatus("erro na voz", true);
          return;
        }
        if (status === "SUBSCRIBED") {
          await voiceChannel.track(voiceMeta());
          setVoiceStatus("voz conectada");
          console.log("[Voz] Sala conectada", voiceRoomName());
        }
      });
  } catch (error) {
    console.error("[Voz] Falha ao iniciar", error);
    setVoiceStatus("microfone negado", true);
    stopVoiceRoom();
  }
}

function stopVoiceRoom() {
  voiceJoined = false;
  voiceMuted = false;
  voiceDeafened = false;
  stopVoiceMonitor(false);
  voicePeers.forEach((peer) => peer.close());
  voicePeers.clear();
  voiceParticipants.clear();
  localVoiceStream?.getTracks().forEach((track) => track.stop());
  localVoiceStream = null;
  if (els.voiceRemoteAudio) els.voiceRemoteAudio.innerHTML = "";
  const client = supabaseClient();
  if (client && voiceChannel) client.removeChannel(voiceChannel);
  voiceChannel = null;
  setVoiceStatus("desconectado");
  renderVoicePanel();
}

function syncVoicePresence() {
  if (!voiceChannel || !voiceJoined) return;
  const stateMap = voiceChannel.presenceState();
  voiceParticipants.clear();
  Object.entries(stateMap).forEach(([key, entries]) => {
    const meta = entries?.[0] || {};
    voiceParticipants.set(key, { id: key, username: meta.username || "Agente", role: meta.role || "player", muted: meta.muted === true });
  });
  voiceParticipants.set(voiceUserId(), voiceMeta());
  renderVoiceParticipants();
  Array.from(voiceParticipants.keys()).forEach((remoteId) => {
    if (remoteId !== voiceUserId() && !voicePeers.has(remoteId) && voiceUserId() < remoteId) createVoiceOffer(remoteId);
  });
}

function createVoicePeer(remoteId) {
  if (voicePeers.has(remoteId)) return voicePeers.get(remoteId);
  const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
  localVoiceStream?.getTracks().forEach((track) => peer.addTrack(track, localVoiceStream));
  peer.onicecandidate = (event) => {
    if (event.candidate) sendVoiceSignal(remoteId, { type: "candidate", candidate: event.candidate });
  };
  peer.ontrack = (event) => attachRemoteVoice(remoteId, event.streams[0]);
  peer.onconnectionstatechange = () => {
    if (["failed", "disconnected", "closed"].includes(peer.connectionState)) removeVoicePeer(remoteId);
  };
  voicePeers.set(remoteId, peer);
  return peer;
}

async function createVoiceOffer(remoteId) {
  const peer = createVoicePeer(remoteId);
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  sendVoiceSignal(remoteId, { type: "offer", sdp: offer });
}

async function handleVoiceSignal(payload) {
  if (!payload || payload.to !== voiceUserId() || payload.from === voiceUserId()) return;
  try {
    const peer = createVoicePeer(payload.from);
    if (payload.type === "offer") {
      await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      sendVoiceSignal(payload.from, { type: "answer", sdp: answer });
    } else if (payload.type === "answer") {
      await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    } else if (payload.type === "candidate" && payload.candidate) {
      await peer.addIceCandidate(new RTCIceCandidate(payload.candidate));
    }
  } catch (error) {
    console.error("[Voz] Erro de sinalizacao", error);
    setVoiceStatus("falha na conexao", true);
  }
}

function sendVoiceSignal(to, payload) {
  voiceChannel?.send({
    type: "broadcast",
    event: "signal",
    payload: { ...payload, from: voiceUserId(), to, meta: voiceMeta() }
  });
}

function attachRemoteVoice(remoteId, stream) {
  if (!els.voiceRemoteAudio || !stream) return;
  let audio = els.voiceRemoteAudio.querySelector(`[data-voice-audio="${selectorEscape(remoteId)}"]`);
  if (!audio) {
    audio = document.createElement("audio");
    audio.dataset.voiceAudio = remoteId;
    audio.autoplay = true;
    audio.playsInline = true;
    els.voiceRemoteAudio.append(audio);
  }
  audio.srcObject = stream;
  audio.muted = voiceDeafened;
}

function removeVoicePeer(remoteId) {
  const peer = voicePeers.get(remoteId);
  if (peer) peer.close();
  voicePeers.delete(remoteId);
  voiceParticipants.delete(remoteId);
  els.voiceRemoteAudio?.querySelector(`[data-voice-audio="${selectorEscape(remoteId)}"]`)?.remove();
  renderVoiceParticipants();
}

function toggleVoiceMute() {
  if (!localVoiceStream) return;
  if (voiceMonitoring) stopVoiceMonitor(false);
  voiceMuted = !voiceMuted;
  localVoiceStream.getAudioTracks().forEach((track) => {
    track.enabled = !voiceMuted;
  });
  voiceChannel?.track(voiceMeta());
  renderVoicePanel();
}

function setLocalVoiceEnabled(enabled) {
  localVoiceStream?.getAudioTracks().forEach((track) => {
    track.enabled = enabled;
  });
}

function createSilentVoiceTrack() {
  if (silentVoiceTrack) return silentVoiceTrack;
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const destination = audioContext.createMediaStreamDestination();
  const gain = audioContext.createGain();
  gain.gain.value = 0;
  oscillator.connect(gain).connect(destination);
  oscillator.start();
  silentVoiceTrack = destination.stream.getAudioTracks()[0];
  return silentVoiceTrack;
}

function replaceOutgoingVoiceTrack(track) {
  voicePeers.forEach((peer) => {
    const sender = peer.getSenders().find((item) => item.track?.kind === "audio");
    sender?.replaceTrack(track).catch((error) => console.warn("[Voz] Nao consegui trocar faixa de audio.", error));
  });
}

function toggleVoiceMonitor() {
  if (!localVoiceStream || !voiceJoined) return;
  if (voiceMonitoring) {
    stopVoiceMonitor(true);
    return;
  }
  voiceMonitoring = true;
  voiceMuted = true;
  const microphoneTrack = localVoiceStream.getAudioTracks()[0];
  replaceOutgoingVoiceTrack(createSilentVoiceTrack());
  if (microphoneTrack) microphoneTrack.enabled = true;
  if (!voiceMonitorAudio) {
    voiceMonitorAudio = document.createElement("audio");
    voiceMonitorAudio.autoplay = true;
    voiceMonitorAudio.playsInline = true;
  }
  voiceMonitorAudio.srcObject = localVoiceStream;
  voiceMonitorAudio.muted = false;
  voiceMonitorAudio.volume = 0.85;
  voiceMonitorAudio.play?.().catch((error) => console.warn("[Voz] Teste de microfone aguardando permissao do navegador.", error));
  voiceChannel?.track(voiceMeta({ muted: true, monitoring: true }));
  setVoiceStatus("teste de micro ativo", true);
  renderVoicePanel();
}

function stopVoiceMonitor(restoreOpenMic = true) {
  if (!voiceMonitoring && !voiceMonitorAudio) return;
  voiceMonitoring = false;
  if (voiceMonitorAudio) {
    voiceMonitorAudio.pause();
    voiceMonitorAudio.srcObject = null;
  }
  if (restoreOpenMic && localVoiceStream) {
    voiceMuted = false;
    const microphoneTrack = localVoiceStream.getAudioTracks()[0];
    if (microphoneTrack) {
      microphoneTrack.enabled = true;
      replaceOutgoingVoiceTrack(microphoneTrack);
    }
    voiceChannel?.track(voiceMeta());
    setVoiceStatus("voz conectada");
  }
  renderVoicePanel();
}

function toggleVoiceDeafen() {
  voiceDeafened = !voiceDeafened;
  els.voiceRemoteAudio?.querySelectorAll("audio").forEach((audio) => {
    audio.muted = voiceDeafened;
  });
  renderVoicePanel();
}

function sendVoiceEvent(kind) {
  if (!voiceChannel || !voiceJoined) return;
  const text = kind === "attention" ? "Atencao na mesa" : "Pediu a palavra";
  voiceChannel.send({ type: "broadcast", event: "voice_event", payload: { kind, text, from: voiceMeta() } });
  handleVoiceEvent({ kind, text, from: voiceMeta() });
}

function handleVoiceEvent(payload) {
  if (!payload?.from) return;
  const text = `${payload.from.username}: ${payload.text}`;
  setVoiceStatus(text, true);
  window.setTimeout(() => setVoiceStatus(voiceJoined ? "voz conectada" : "desconectado"), 2600);
}

function soundtrackEmbedUrl(url) {
  const text = String(url || "").trim();
  if (soundtrackType(text) === "audio") return text;
  try {
    const parsed = new URL(text);
    const origin = window.location.origin && window.location.origin.startsWith("http") ? `&origin=${encodeURIComponent(window.location.origin)}` : "";
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}?controls=1&modestbranding=1&playsinline=1&enablejsapi=1${origin}` : "";
    }
    if (parsed.hostname.includes("youtube.com")) {
      const playlist = parsed.searchParams.get("list");
      if (parsed.pathname.includes("/playlist") && playlist) {
        return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlist)}&controls=1&modestbranding=1&playsinline=1&enablejsapi=1${origin}`;
      }
      const parts = parsed.pathname.split("/").filter(Boolean);
      const id = parsed.searchParams.get("v") || (parts[0] === "shorts" ? parts[1] : parts.pop());
      const list = playlist ? `&list=${encodeURIComponent(playlist)}` : "";
      return id ? `https://www.youtube.com/embed/${id}?controls=1&modestbranding=1&playsinline=1&enablejsapi=1${list}${origin}` : "";
    }
    if (parsed.hostname.includes("spotify.com")) {
      const path = parsed.pathname.replace(/^\/intl-[^/]+/, "");
      return `https://open.spotify.com/embed${path}`;
    }
  } catch (_) {}
  return "";
}

function soundtrackType(url) {
  const text = String(url || "").toLowerCase();
  if (text.startsWith("data:audio/") || text.startsWith("blob:")) return "audio";
  if (/\.(mp3|ogg|wav|m4a|aac|flac)(\?|#|$)/i.test(text)) return "audio";
  if (text.includes("spotify.com")) return "spotify";
  if (text.includes("youtu.be") || text.includes("youtube.com")) return "youtube";
  return "link";
}

function soundtrackTitle(url) {
  const type = soundtrackType(url);
  if (type === "audio") return "Audio direto";
  if (type === "spotify") return "Spotify";
  if (type === "youtube") return "YouTube";
  return "Trilha";
}

function getSoundtrackVolume(session = currentSession()) {
  return clamp(Number(session?.soundtrackVolume ?? 70), 0, 100);
}

function applySoundtrackVolume() {
  const volume = getSoundtrackVolume();
  if (els.soundtrackVolume) els.soundtrackVolume.value = String(volume);
  if (els.soundtrackVolumeValue) els.soundtrackVolumeValue.textContent = `${volume}%`;
  const audio = document.querySelector("#soundtrackAudio");
  if (audio) audio.volume = volume / 100;
}

function updateSoundtrackVolumeHint(type = "") {
  const directAudio = type === "audio" || type === "effect";
  const externalOrInactive = !directAudio;
  const controls = document.querySelector(".soundtrack-controls");
  const label = document.querySelector(".soundtrack-controls label");
  if (label) label.textContent = directAudio ? "Volume da mesa" : "Volume para audio direto";
  if (controls) controls.classList.toggle("provider-controlled", externalOrInactive);
  if (els.soundtrackVolume) {
    els.soundtrackVolume.disabled = externalOrInactive;
    els.soundtrackVolume.title = directAudio
      ? "Controla o volume deste audio em cada navegador da mesa."
      : "Spotify e YouTube usam o volume do proprio player. Este controle vale para links diretos de audio.";
  }
}

function tryPlaySoundtrackAudio() {
  const audio = document.querySelector("#soundtrackAudio");
  if (!audio) return;
  applySoundtrackVolume();
  audio.play().catch((error) => {
    console.info("[Trilha] Navegador bloqueou autoplay. Clique no player para liberar audio da mesa.", error);
  });
}

function playGeneratedSoundEffect(effect = "monstro") {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    window.alert("Este navegador nao liberou audio sintetico.");
    return;
  }
  const context = new AudioContextClass();
  const master = context.createGain();
  const now = context.currentTime;
  const volume = getSoundtrackVolume() / 100;
  master.gain.setValueAtTime(Math.max(0.02, volume * 0.75), now);
  master.connect(context.destination);
  const closeAt = (seconds) => window.setTimeout(() => context.close?.(), Math.ceil(seconds * 1000) + 250);
  const oscillator = (type, start, end, duration, gain = 0.35) => {
    const osc = context.createOscillator();
    const amp = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(start, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, end), now + duration);
    amp.gain.setValueAtTime(0.001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.03);
    amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(amp).connect(master);
    osc.start(now);
    osc.stop(now + duration);
  };
  const noise = (duration, gain = 0.22, filterType = "bandpass", frequency = 900) => {
    const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const amp = context.createGain();
    filter.type = filterType;
    filter.frequency.setValueAtTime(frequency, now);
    amp.gain.setValueAtTime(0.001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.buffer = buffer;
    source.connect(filter).connect(amp).connect(master);
    source.start(now);
    source.stop(now + duration);
  };
  if (effect === "susto") {
    noise(0.55, 0.42, "highpass", 1400);
    oscillator("sine", 90, 42, 0.7, 0.42);
    closeAt(0.8);
    return;
  }
  if (effect === "chuva") {
    noise(2.4, 0.25, "bandpass", 1800);
    noise(2.4, 0.12, "lowpass", 550);
    closeAt(2.5);
    return;
  }
  if (effect === "vento") {
    noise(2.8, 0.28, "lowpass", 420);
    oscillator("sine", 170, 95, 2.8, 0.08);
    closeAt(2.9);
    return;
  }
  if (effect === "porta") {
    oscillator("sawtooth", 170, 55, 1.25, 0.22);
    noise(1.1, 0.16, "bandpass", 360);
    closeAt(1.35);
    return;
  }
  if (effect === "vidro") {
    noise(0.8, 0.34, "highpass", 2600);
    oscillator("triangle", 2200, 720, 0.75, 0.12);
    oscillator("triangle", 1450, 520, 0.9, 0.1);
    closeAt(1);
    return;
  }
  oscillator("sawtooth", 92, 36, 1.8, 0.34);
  oscillator("square", 58, 28, 1.6, 0.22);
  noise(1.6, 0.16, "lowpass", 480);
  closeAt(1.9);
}

function applySoundtrackCommand(session, active, type) {
  const command = session?.soundtrackCommand;
  if (!command?.id || command.id === lastSoundtrackCommandId) return;
  lastSoundtrackCommandId = command.id;
  if (command.trackId && active?.id && command.trackId !== active.id) return;
  if (type === "effect") {
    if (command.action === "play") playGeneratedSoundEffect(active?.effect || command.effect || "monstro");
    return;
  }
  if (type !== "audio") return;
  const audio = document.querySelector("#soundtrackAudio");
  if (!audio) return;
  if (command.action === "pause") {
    audio.pause();
    return;
  }
  if (command.action === "play") window.setTimeout(tryPlaySoundtrackAudio, 80);
}

function sendSoundtrackCommand(action, trackId = "") {
  const session = currentSession();
  if (!session) return;
  const active = session.soundtracks?.find((track) => track.id === trackId) || session.soundtracks?.find((track) => track.active);
  session.soundtrackCommand = {
    id: crypto.randomUUID(),
    action,
    trackId,
    effect: active?.effect || "",
    at: Date.now()
  };
  if (action === "play" && active?.type === "effect") playGeneratedSoundEffect(active.effect);
  else if (action === "play") tryPlaySoundtrackAudio();
  if (action === "pause") document.querySelector("#soundtrackAudio")?.pause();
  save();
}

function setSoundtrackVolume(value, persist = false) {
  const session = currentSession();
  if (!session) return;
  session.soundtrackVolume = clamp(Number(value) || 0, 0, 100);
  applySoundtrackVolume();
  if (persist) save();
}

function renderSoundtracks() {
  const session = currentSession();
  if (!els.soundtrackList || !els.soundtrackPlayer || !session) {
    applySoundtrackVolume();
    return;
  }
  session.soundtracks = Array.isArray(session.soundtracks) ? session.soundtracks : [];
  session.soundtrackVolume = getSoundtrackVolume(session);
  const active = session.soundtracks.find((track) => track.active) || session.soundtracks[0];
  if (active?.embed || active?.url) {
    const type = active.type || soundtrackType(active.url);
    const activeTrackId = active.id || active.url || "";
    const shouldTryAutoplay = ["audio", "effect"].includes(type) && activeTrackId && activeTrackId !== lastSoundtrackTrackId;
    lastSoundtrackTrackId = activeTrackId;
    els.soundtrackPlayer.className = `soundtrack-player ${type}`;
    updateSoundtrackVolumeHint(type);
    if (type === "audio") {
      els.soundtrackPlayer.innerHTML = `
        <div class="soundtrack-audio-card soundtrack-direct-audio">
          <b>${escapeHtml(active.title || "Audio da mesa")}</b>
          <span>Este arquivo toca no navegador de cada pessoa da mesa e respeita o volume sincronizado.</span>
          <audio id="soundtrackAudio" controls preload="metadata" src="${escapeAttr(active.url)}"></audio>
          <div class="soundtrack-audio-actions">
            <button type="button" data-soundtrack-command="play">Tocar na mesa</button>
            <button type="button" data-soundtrack-command="pause">Pausar mesa</button>
          </div>
        </div>
      `;
      applySoundtrackVolume();
      const audio = document.querySelector("#soundtrackAudio");
      audio?.addEventListener("volumechange", () => {
        const nextVolume = Math.round((audio.volume || 0) * 100);
        if (nextVolume !== getSoundtrackVolume()) setSoundtrackVolume(nextVolume, true);
      });
      if (shouldTryAutoplay) window.setTimeout(tryPlaySoundtrackAudio, 60);
      applySoundtrackCommand(session, active, type);
    } else if (type === "effect") {
      els.soundtrackPlayer.innerHTML = `
        <div class="soundtrack-audio-card soundtrack-direct-audio">
          <b>${escapeHtml(active.title || "Efeito sonoro")}</b>
          <span>Som rapido gerado pelo sistema. Use para monstros, sustos, portas, vidro e clima.</span>
          <div class="soundtrack-audio-actions">
            <button type="button" data-soundtrack-command="play">Tocar na mesa</button>
            <button type="button" data-soundtrack-command="pause">Parar</button>
          </div>
        </div>
      `;
      applySoundtrackVolume();
      if (shouldTryAutoplay) window.setTimeout(() => playGeneratedSoundEffect(active.effect || "monstro"), 60);
      applySoundtrackCommand(session, active, type);
    } else if (type === "youtube") {
      els.soundtrackPlayer.innerHTML = `
        <iframe class="youtube-frame" title="Trilha sonora do YouTube" src="${escapeAttr(active.embed || soundtrackEmbedUrl(active.url))}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
        <div class="soundtrack-provider-note">
          <b>${escapeHtml(active.title || "YouTube embutido")}</b>
          <span>O YouTube toca dentro do site quando o video permite incorporacao. O volume fica no player do YouTube.</span>
          <a href="${escapeAttr(active.url)}" target="_blank" rel="noopener noreferrer">Abrir</a>
        </div>
      `;
      applySoundtrackVolume();
    } else if (type === "spotify") {
      els.soundtrackPlayer.innerHTML = `
        <iframe title="Trilha sonora Spotify" src="${escapeAttr(active.embed)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
        <small>Spotify usa o proprio player. O volume geral do site nao altera esse iframe.</small>
      `;
      applySoundtrackVolume();
    } else {
      els.soundtrackPlayer.innerHTML = `
        <div class="soundtrack-audio-card">
          <b>Link da trilha</b>
          <span>Use um link direto de audio para tocar com volume sincronizado na mesa.</span>
          <a href="${escapeAttr(active.url)}" target="_blank" rel="noopener noreferrer">Abrir</a>
        </div>
      `;
      applySoundtrackVolume();
    }
  } else {
    els.soundtrackPlayer.className = "soundtrack-player";
    els.soundtrackPlayer.textContent = "Nenhuma trilha selecionada.";
    updateSoundtrackVolumeHint("");
    applySoundtrackVolume();
  }
  els.soundtrackList.innerHTML = session.soundtracks.length ? session.soundtracks.map((track) => `
    <article class="${track.active ? "active" : ""}">
      <span>${escapeHtml(track.title || soundtrackTitle(track.url) || "Trilha")}</span>
      <button type="button" data-play-track="${escapeAttr(track.id)}">Tocar</button>
      <button type="button" data-remove-track="${escapeAttr(track.id)}">Remover</button>
    </article>
  `).join("") : `<p>Nenhuma trilha cadastrada.</p>`;
  renderSoundtrackLibrary();
}

function soundtrackCategoryLabel(category = "trilha") {
  return {
    trilha: "Trilha sonora",
    ambiente: "Ambiente",
    monstro: "Monstro",
    susto: "Susto",
    npc: "NPC",
    objeto: "Objeto",
    outro: "Outro"
  }[category] || "Trilha sonora";
}

function addSoundtrack(url, options = {}) {
  const session = currentSession();
  if (!session) return;
  const embed = soundtrackEmbedUrl(url);
  const type = soundtrackType(url);
  if (!embed && type !== "link") {
    window.alert("Use um link valido do YouTube, Spotify ou um audio direto.");
    return;
  }
  session.soundtracks = Array.isArray(session.soundtracks) ? session.soundtracks : [];
  session.soundtracks.forEach((track) => {
    track.active = false;
  });
  session.soundtracks.push({
    id: crypto.randomUUID(),
    url,
    embed: embed || url,
    type,
    title: options.title?.trim() || soundtrackTitle(url),
    category: options.category || "trilha",
    source: options.source || "link",
    fileName: options.fileName || "",
    active: true
  });
  session.soundtrackCommand = { id: crypto.randomUUID(), action: "play", trackId: session.soundtracks.at(-1)?.id || "", at: Date.now() };
  if (els.soundtrackUrl) els.soundtrackUrl.value = "";
  renderSoundtracks();
  save();
}

function addUploadedSoundtrack(file, options = {}) {
  const session = currentSession();
  if (!session || !file) return;
  if (!file.type.startsWith("audio/")) {
    window.alert("Escolha um arquivo de audio.");
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    window.alert("Esse audio esta grande demais para salvar dentro da ficha da campanha. Use um link direto para arquivos maiores que 8MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    addSoundtrack(String(reader.result || ""), {
      ...options,
      title: options.title?.trim() || file.name.replace(/\.[^.]+$/, ""),
      source: "upload",
      fileName: file.name
    });
  };
  reader.onerror = () => window.alert("Nao consegui ler esse arquivo de audio.");
  reader.readAsDataURL(file);
}

function addGeneratedSoundtrack(effect, title, category = "monstro") {
  const session = currentSession();
  if (!session) return;
  session.soundtracks = Array.isArray(session.soundtracks) ? session.soundtracks : [];
  let track = session.soundtracks.find((item) => item.type === "effect" && item.effect === effect && item.title === title);
  session.soundtracks.forEach((item) => {
    item.active = false;
  });
  if (!track) {
    track = {
      id: crypto.randomUUID(),
      url: `effect:${effect}`,
      embed: "",
      type: "effect",
      effect,
      title,
      category,
      source: "gerado",
      fileName: "",
      active: true
    };
    session.soundtracks.push(track);
  } else {
    track.active = true;
  }
  renderSoundtracks();
  sendSoundtrackCommand("play", track.id);
}

function playSoundtrack(id) {
  const session = currentSession();
  if (!session?.soundtracks) return;
  session.soundtracks.forEach((track) => {
    track.active = track.id === id;
  });
  renderSoundtracks();
  sendSoundtrackCommand("play", id);
}

function removeSoundtrack(id) {
  const session = currentSession();
  if (!session?.soundtracks) return;
  session.soundtracks = session.soundtracks.filter((track) => track.id !== id);
  if (session.soundtracks[0] && !session.soundtracks.some((track) => track.active)) session.soundtracks[0].active = true;
  renderSoundtracks();
  save();
}

function renderSoundtrackLibrary() {
  const container = document.querySelector("#soundtrackLibraryApp");
  if (!container) return;
  const session = currentSession();
  if (!session) {
    container.innerHTML = `<p>Nenhum arquivo ativo.</p>`;
    return;
  }
  session.soundtracks = Array.isArray(session.soundtracks) ? session.soundtracks : [];
  const categories = ["trilha", "ambiente", "monstro", "susto", "npc", "objeto", "outro"];
  const categoryOptions = categories.map((category) => `<option value="${category}">${soundtrackCategoryLabel(category)}</option>`).join("");
  const quickEffects = [
    ["monstro", "monstro", "Rugido de monstro"],
    ["susto", "susto", "Susto repentino"],
    ["ambiente", "chuva", "Chuva distante"],
    ["ambiente", "vento", "Vento no corredor"],
    ["objeto", "porta", "Porta rangendo"],
    ["objeto", "vidro", "Vidro quebrando"]
  ];
  container.innerHTML = `
    <div class="soundtrack-studio-grid">
      <form class="soundtrack-studio-card" data-soundtrack-link-form>
        <h3>Adicionar por link</h3>
        <label>Nome <input data-soundtrack-title type="text" placeholder="Nome da faixa" /></label>
        <label>Categoria <select data-soundtrack-category>${categoryOptions}</select></label>
        <label>Link <input data-soundtrack-link type="url" placeholder="YouTube, Spotify ou audio direto .mp3" /></label>
        <button type="submit">Adicionar link</button>
      </form>
      <form class="soundtrack-studio-card" data-soundtrack-upload-form>
        <h3>Subir audio</h3>
        <label>Nome <input data-upload-title type="text" placeholder="Nome do som" /></label>
        <label>Categoria <select data-upload-category>${categoryOptions}</select></label>
        <label>Arquivo <input data-upload-file type="file" accept="audio/*" /></label>
        <small>Audios enviados ficam salvos na campanha. Para arquivos grandes, use link direto.</small>
        <button type="submit">Enviar para mesa</button>
      </form>
    </div>
    <section class="soundtrack-effect-pad">
      <h3>Sons rapidos de mesa</h3>
      <div>
        ${quickEffects.map(([category, effect, title]) => `<button type="button" data-quick-effect="${escapeAttr(effect)}" data-quick-category="${escapeAttr(category)}" data-quick-title="${escapeAttr(title)}">${escapeHtml(title)}</button>`).join("")}
      </div>
      <small>Use os botoes para tocar imediatamente na mesa e salvar o efeito na biblioteca da sessao.</small>
    </section>
    <section class="soundtrack-library-list">
      <h3>Biblioteca da sessao</h3>
      ${session.soundtracks.length ? categories.map((category) => {
        const tracks = session.soundtracks.filter((track) => (track.category || "trilha") === category);
        if (!tracks.length) return "";
        return `
          <div class="soundtrack-category">
            <h4>${soundtrackCategoryLabel(category)}</h4>
            ${tracks.map((track) => `
              <article class="${track.active ? "active" : ""}">
                <div>
                  <b>${escapeHtml(track.title || soundtrackTitle(track.url))}</b>
                  <small>${escapeHtml(track.source === "upload" ? `Upload: ${track.fileName || "audio"}` : track.type || soundtrackType(track.url))}</small>
                </div>
                <button type="button" data-library-play="${escapeAttr(track.id)}">Tocar</button>
                <button type="button" data-library-remove="${escapeAttr(track.id)}">Remover</button>
              </article>
            `).join("")}
          </div>
        `;
      }).join("") : `<p>Nenhuma trilha cadastrada.</p>`}
    </section>
  `;
  container.querySelector("[data-soundtrack-link-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const url = form.querySelector("[data-soundtrack-link]")?.value || "";
    addSoundtrack(url, {
      title: form.querySelector("[data-soundtrack-title]")?.value || "",
      category: form.querySelector("[data-soundtrack-category]")?.value || "trilha"
    });
  });
  container.querySelector("[data-soundtrack-upload-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    addUploadedSoundtrack(form.querySelector("[data-upload-file]")?.files?.[0], {
      title: form.querySelector("[data-upload-title]")?.value || "",
      category: form.querySelector("[data-upload-category]")?.value || "trilha"
    });
  });
  container.querySelectorAll("[data-library-play]").forEach((button) => {
    button.addEventListener("click", () => playSoundtrack(button.dataset.libraryPlay));
  });
  container.querySelectorAll("[data-library-remove]").forEach((button) => {
    button.addEventListener("click", () => removeSoundtrack(button.dataset.libraryRemove));
  });
  container.querySelectorAll("[data-quick-effect]").forEach((button) => {
    button.addEventListener("click", () => {
      addGeneratedSoundtrack(
        button.dataset.quickEffect || "monstro",
        button.dataset.quickTitle || "Efeito sonoro",
        button.dataset.quickCategory || "monstro"
      );
    });
  });
}

function renderCampaignFiles() {
  const container = document.querySelector("#campaignFiles");
  if (!container) return;
  const campaign = currentCampaign();
  const user = currentUser();
  if (!campaign) {
    container.innerHTML = `<p>Nenhuma campanha selecionada.</p>`;
    return;
  }
  const isMaster = user && (campaign.mestreId === user.id || user.role === "admin");
  const sessions = isMaster ? campaign.sessoes : campaign.sessoes.filter((session) => session.visibleToPlayers);
  container.innerHTML = `
    <div class="archive-list-head">
      <div>
        <b>${escapeHtml(campaign.nome)}</b>
        <span>Convite: ${escapeHtml(campaign.inviteCode)}</span>
      </div>
      ${isMaster ? `
        <label class="campaign-name-edit">Nome da campanha <input data-campaign-name value="${escapeAttr(campaign.nome)}" /></label>
        <button type="button" data-copy-invite="${escapeAttr(campaign.inviteCode)}">Copiar convite</button>
        <button type="button" data-new-session="${escapeAttr(campaign.id)}">+ Criar novo arquivo</button>
        <button type="button" data-save-file>Salvar arquivo</button>
      ` : ""}
    </div>
    ${sessions.length ? sessions.map((session) => archiveSessionCard(session, isMaster)).join("") : `<p>Nenhum arquivo liberado para este jogador.</p>`}
  `;
  container.querySelector("[data-campaign-name]")?.addEventListener("change", (event) => {
    campaign.nome = event.target.value.trim() || "Campanha sem nome";
    saveCurrentFile();
    renderAll();
  });
  container.querySelector("[data-copy-invite]")?.addEventListener("click", (event) => {
    const invite = event.currentTarget.dataset.copyInvite;
    const link = `${window.location.href.split("#")[0]}#convite=${encodeURIComponent(invite)}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(() => window.alert("Convite copiado."));
    } else {
      window.prompt("Link de convite:", link);
    }
  });
  container.querySelector("[data-save-file]")?.addEventListener("click", saveCurrentFile);
  container.querySelectorAll("[data-open-session]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeCampaignId = campaign.id;
      state.activeSessionId = button.dataset.openSession;
      applySessionToTable(currentSession());
      switchTab("mesa");
      renderAll();
    });
  });
  container.querySelectorAll("[data-new-session]").forEach((button) => {
    button.addEventListener("click", () => createNextSession(button.dataset.newSession));
  });
  container.querySelectorAll("[data-toggle-session]").forEach((button) => {
    button.addEventListener("click", () => {
      const session = campaign.sessoes.find((item) => item.id === button.dataset.toggleSession);
      if (session) session.visibleToPlayers = !session.visibleToPlayers;
      renderAll();
    });
  });
  container.querySelectorAll("[data-archive-session]").forEach((button) => {
    button.addEventListener("click", () => {
      const session = campaign.sessoes.find((item) => item.id === button.dataset.archiveSession);
      if (session) session.status = session.status === "arquivada" ? "ativa" : "arquivada";
      renderAll();
    });
  });
  container.querySelectorAll("[data-delete-session]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!isMaster) return;
      if (!window.confirm("Apagar este arquivo salvo?")) return;
      campaign.sessoes = campaign.sessoes.filter((item) => item.id !== button.dataset.deleteSession);
      if (state.activeSessionId === button.dataset.deleteSession) {
        state.activeSessionId = campaign.sessoes[0]?.id || null;
        applySessionToTable(currentSession());
      }
      renderAll();
    });
  });
  container.querySelectorAll("[data-session-field]").forEach((field) => {
    field.addEventListener("input", () => updateSessionField(campaign, field, false));
    field.addEventListener("change", () => updateSessionField(campaign, field, true));
  });
}

function archiveSessionCard(session, isMaster) {
  const pistasText = (session.pistas || []).join("\n");
  return `
    <article class="archive-file-card ${session.visibleToPlayers ? "liberado" : "bloqueado"}">
      <b>${escapeHtml(session.codigoArquivo)}</b>
      ${isMaster ? `
        <div class="archive-session-editor">
          <label>Titulo <input data-session-field="titulo" data-session-id="${escapeAttr(session.id)}" value="${escapeAttr(session.titulo)}" /></label>
          <label>Descricao do arquivo <textarea data-session-field="resumo" data-session-id="${escapeAttr(session.id)}" rows="3">${escapeHtml(session.resumo || "")}</textarea></label>
          <label>Objetivo / missao <textarea data-session-field="mission" data-session-id="${escapeAttr(session.id)}" rows="2">${escapeHtml(session.mission || "")}</textarea></label>
          <label>Pistas reveladas <textarea data-session-field="pistas" data-session-id="${escapeAttr(session.id)}" rows="4" placeholder="Uma pista por linha">${escapeHtml(pistasText)}</textarea></label>
          <label>Texto liberado ao jogador <textarea data-session-field="publicText" data-session-id="${escapeAttr(session.id)}" rows="3">${escapeHtml(session.publicText || "")}</textarea></label>
        </div>
      ` : `
        <h3>${escapeHtml(session.titulo)}</h3>
        <p>${escapeHtml(session.publicText || session.resumo || "Arquivo ainda sem descricao liberada.")}</p>
      `}
      <span>Status: ${session.visibleToPlayers ? "liberado" : "bloqueado"} | ${escapeHtml(session.status)}</span>
      <small>Data: ${escapeHtml(session.dataCriacao || "ainda nao iniciada")}</small>
      <div>
        <button type="button" data-open-session="${escapeAttr(session.id)}">Abrir</button>
        ${isMaster ? `<button type="button" data-toggle-session="${escapeAttr(session.id)}">${session.visibleToPlayers ? "Bloquear" : "Liberar"}</button><button type="button" data-archive-session="${escapeAttr(session.id)}">Arquivar</button><button type="button" data-delete-session="${escapeAttr(session.id)}">Apagar</button>` : ""}
      </div>
    </article>
  `;
}

function updateSessionField(campaign, field, rerender) {
  const session = campaign.sessoes.find((item) => item.id === field.dataset.sessionId);
  if (!session) return;
  if (field.dataset.sessionField === "pistas") {
    session.pistas = splitLines(field.value.replace(/,/g, "\n"));
  } else {
    session[field.dataset.sessionField] = field.value;
  }
  save();
  window.archiveUI?.render(state);
  if (rerender) renderAll();
}

function isSheetChoiceField(field) {
  return ["nex", "role", "className", "pathName"].includes(field);
}

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parseNex(value) {
  return Number(String(value || "").match(/\d+/)?.[0] || 0);
}

function nexBonusesBetween(previous, next) {
  return nexProgression.filter((step) => step.nex > previous && step.nex <= next);
}

function previousNexValue(nex) {
  const index = nexProgression.findIndex((step) => step.nex === nex);
  return index > 0 ? nexProgression[index - 1].nex : 0;
}

function resourceAtNex(sheet, nex) {
  const base = classBaseStats(sheet);
  const itemBonus = inventoryMechanicalBonuses(sheet);
  const steps = Math.max(0, Math.floor(Number(nex || 0) / 5) - 1);
  const vig = Number(sheet.vig || 0);
  const pre = Number(sheet.pre || 0);
  return {
    hpMax: Math.max(1, base.hpStart + vig + steps * (base.hpPerStep + vig)),
    peMax: Math.max(1, base.peStart + pre + steps * base.pePerStep),
    sanMax: Math.max(1, base.sanStart + steps * base.sanPerStep),
    peRound: Math.max(1, 1 + Math.floor(Number(nex || 0) / 20)),
    defense: Math.max(0, 10 + Number(sheet.agi || 0) + itemBonus.defense),
    dodgeBase: Math.max(0, 10 + Number(sheet.agi || 0) + itemBonus.defense)
  };
}

function classResourceFormula(sheet) {
  const base = classBaseStats(sheet);
  return `Por marco de +5% apos 5%: +${base.hpPerStep} + VIG em PV max, +${base.pePerStep} PE max, +${base.sanPerStep} SAN max. Base em 5%: PV ${base.hpStart} + VIG, PE ${base.peStart} + PRE, SAN ${base.sanStart}.`;
}

function nexResourceLine(sheet, step) {
  const current = resourceAtNex(sheet, step.nex);
  const previousValue = previousNexValue(step.nex);
  if (!previousValue) {
    return `Totais em 5%: PV ${current.hpMax}, PE ${current.peMax}, SAN ${current.sanMax}, PE/rodada ${current.peRound}.`;
  }
  const previous = resourceAtNex(sheet, previousValue);
  const peRoundDelta = current.peRound - previous.peRound;
  return `Ganha neste marco: +${current.hpMax - previous.hpMax} PV max, +${current.peMax - previous.peMax} PE max, +${current.sanMax - previous.sanMax} SAN max${peRoundDelta ? `, +${peRoundDelta} PE/rodada` : ""}. Totais: PV ${current.hpMax}, PE ${current.peMax}, SAN ${current.sanMax}, PE/rodada ${current.peRound}.`;
}

function currentNexStep(sheet) {
  const current = parseNex(sheet.nex);
  return nexProgression.find((step) => step.nex === current)
    || [...nexProgression].reverse().find((step) => step.nex <= current)
    || nexProgression[0];
}

function nextNexStep(step) {
  return nexProgression.find((item) => item.nex > step.nex) || null;
}

function matchesSheetChoice(entry, sheet) {
  const className = normalizeKey(sheet.className);
  const pathName = normalizeKey(sheet.pathName);
  const role = normalizeKey(sheet.role);
  const entryClass = normalizeKey(entry.className || (["Combatente", "Especialista", "Ocultista"].includes(entry.type) ? entry.type : ""));
  const entryPath = normalizeKey(entry.pathName);
  const entryOrigin = normalizeKey(entry.origin);
  if (entryPath && entryPath !== pathName) return false;
  if (entryClass && entryClass !== className) return false;
  if (entryOrigin && entryOrigin !== role) return false;
  if (entry.allClasses && className) return true;
  return Boolean(entryPath || entryClass || entryOrigin);
}

function renderNexProgress(sheet) {
  const step = currentNexStep(sheet);
  const next = nextNexStep(step);
  const cleanGains = nexCleanGains(step);
  return `
    <section class="nex-progress-panel">
      <b>Progressao de NEX</b>
      <p>NEX atual: ${escapeHtml(sheet.nex || "0%")}. ${escapeHtml(classResourceFormula(sheet))}</p>
      <div class="nex-current-card">
        <strong>${step.nex}%</strong>
        <div>
          <span>${escapeHtml(nexResourceLine(sheet, step))}</span>
          ${cleanGains.length ? `<small>${cleanGains.map(escapeHtml).join(" | ")}</small>` : ""}
        </div>
      </div>
      ${next ? `<p class="nex-next"><b>Proximo marco ${next.nex}%:</b> ${escapeHtml(nexResourceLine(sheet, next))}</p>` : ""}
    </section>
  `;
}

function nexCleanGains(step) {
  return (step.gains || []).filter((gain) => !/(origem|classe|trilha|habilidade|poder|ritual|catalogo|conjurador)/i.test(gain));
}

function showNexUpdateMessage(sheet, previousNex, nextNex) {
  const gains = nexBonusesBetween(previousNex, nextNex);
  if (!gains.length) return;
  document.querySelector(".nex-toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "nex-toast";
  toast.innerHTML = `
    <div>
      <b>${escapeHtml(sheet.name || "Agente")} evoluiu para ${nextNex}% NEX</b>
      <p>${escapeHtml(classResourceFormula(sheet))}</p>
      ${gains.map((step) => `<p><strong>${step.nex}%</strong><br>${escapeHtml(nexResourceLine(sheet, step))}${nexCleanGains(step).length ? `<br>${nexCleanGains(step).map(escapeHtml).join(" | ")}` : ""}</p>`).join("")}
      <button type="button">Entendido</button>
    </div>
  `;
  document.body.append(toast);
  toast.querySelector("button")?.addEventListener("click", () => toast.remove());
  window.setTimeout(() => toast.remove(), 12000);
}

function ritualNexRequirement(circle) {
  return {
    1: 5,
    2: 25,
    3: 55,
    4: 85
  }[Number(circle)] || 5;
}

function maxRitualCircle(sheet) {
  const nex = parseNex(sheet.nex);
  if (nex >= 85) return 4;
  if (nex >= 55) return 3;
  if (nex >= 25) return 2;
  if (nex >= 5) return 1;
  return 0;
}

function canUseRituals(sheet) {
  if (sheetSystemId(sheet) === "dnd5e") return false;
  const className = normalizeKey(sheet.className);
  const abilityText = normalizeKey(sheet.abilities);
  return className === "ocultista" || abilityText.includes("conjurar ritual") || abilityText.includes("escolhido pelo outro lado");
}

function emptyCatalogText(field) {
  if (field === "rituals") return "Rituais aparecem apenas para fichas capazes de conjurar e dentro do circulo liberado pelo NEX.";
  if (field === "abilities") return "Escolha origem, classe, trilha e NEX compativeis para liberar habilidades.";
  if (field === "pathName") return "Escolha uma classe primeiro para liberar as trilhas correspondentes.";
  return "Nenhuma opcao encontrada para a ficha atual.";
}

function removeSheetLine(field, index) {
  const sheet = ensureActiveSheet();
  if (!canEditSheet(sheet)) {
    setSyncStatus("Ficha bloqueada pelo mestre.", true);
    return;
  }
  const lines = ["abilities", "rituals"].includes(field) ? splitSheetEntries(sheet[field]) : splitLines(sheet[field]);
  lines.splice(index, 1);
  sheet[field] = lines.join("\n");
  recalculateDerivedStats(sheet);
  localOnlyRender();
  queueSheetPatch(sheet, field, 800);
}

function classBaseStats(sheet) {
  const className = normalizeKey(sheet.className);
  if (className === "combatente") return { hpStart: 20, hpPerStep: 4, sanStart: 12, sanPerStep: 3, peStart: 2, pePerStep: 1, movement: 9 };
  if (className === "ocultista") return { hpStart: 12, hpPerStep: 2, sanStart: 20, sanPerStep: 5, peStart: 3, pePerStep: 1, movement: 9 };
  return { hpStart: 16, hpPerStep: 3, sanStart: 16, sanPerStep: 4, peStart: 2, pePerStep: 1, movement: 9 };
}

function inventoryMechanicalBonuses(sheet) {
  return splitLines(sheet.inventory).reduce((bonus, raw) => {
    if (!inventoryLineActive(raw)) return bonus;
    const item = parseInventoryItem(raw);
    const defenseText = String(item.stats.defense || "");
    const bonusText = normalizeKey(`${item.stats.bonus || ""} ${item.stats.category || ""} ${item.name || ""}`);
    const volume = Number(String(item.stats.volume ?? 0).match(/[+-]?\d+/)?.[0] || 0);
    const defense = Number(defenseText.match(/[+-]?\d+/)?.[0] || 0);
    const key = normalizeKey(item.name);
    bonus.volume += Math.max(0, volume);
    if (defense > 0) {
      bonus.defense += defense;
      bonus.block += key.includes("pesada") ? 5 : 2;
    }
    const protectionMatch = String(`${item.stats.bonus || ""} ${item.stats.defense || ""}`).match(/(?:protecao|proteção|reducao|redução|rd)\D*([+-]?\d+)/i);
    if (protectionMatch) bonus.block += Math.max(0, Number(protectionMatch[1]) || 0);
    if (key.includes("protecao pesada") || key.includes("proteção pesada")) bonus.movementPenalty += 1;
    if (key.includes("mochila militar") || bonusText.includes("aumenta carga")) bonus.loadBonus += 5;
    if (key.includes("lanterna tatica")) bonus.light = Math.max(bonus.light, 6);
    else if (key.includes("lanterna")) bonus.light = Math.max(bonus.light, 5);
    if (key.includes("binoculos")) bonus.vision += 2;
    return bonus;
  }, { defense: 0, block: 0, light: 0, vision: 0, movementPenalty: 0, loadBonus: 0, volume: 0 });
}

function inventoryLineActive(raw) {
  return !normalizeKey(raw).includes("inativo");
}

function serializeInventoryRecord(name, meta = {}, description = "") {
  const labels = {
    inventoryCategory: "Categoria",
    category: "Tipo",
    subtype: "Subtipo",
    quantity: "Quantidade",
    volume: "Volume",
    weight: "Peso",
    damage: "Dano",
    damageType: "Tipo dano",
    range: "Alcance",
    rangeType: "Alcance tipo",
    properties: "Propriedades",
    mastery: "Dominio",
    armorBase: "CA",
    dexLimit: "Limite DES",
    shieldBonus: "Escudo",
    bonusCa: "Bonus CA",
    attackBonus: "Bonus ataque",
    damageBonus: "Bonus dano",
    equipped: "Equipado",
    weaponReady: "Arma em punho",
    armorInUse: "Armadura em uso",
    shieldInUse: "Escudo em uso",
    stealth: "Furtividade",
    strength: "Forca",
    bonus: "Bonus",
    defense: "Defesa",
    notes: "Observacoes",
    image: "Imagem"
  };
  const metaText = Object.entries(meta)
    .filter(([key, value]) => labels[key] && value !== undefined && value !== null && String(value).trim() !== "" && String(value) !== "false")
    .map(([key, value]) => `${labels[key] || key}: ${typeof value === "boolean" ? (value ? "sim" : "nao") : value}`)
    .join(" | ");
  return `${name || "Item sem nome"}${metaText ? ` | ${metaText}` : ""}${description ? ` - ${description}` : ""}`;
}

function syncDndEquipmentEffects(sheet, reason = "") {
  if (!sheet || sheetSystemId(sheet) !== "dnd5e") return;
  sheet.dnd = { ...(sheet.dnd || {}) };
  if (sheet.dnd.autoEquipment !== false) {
    sheet.dnd.equipmentAttacks = dndAttacksFromInventory(sheet);
    if (!sheet.dnd.manualCa) {
      sheet.dnd.ca = dndArmorClass(sheet);
      sheet.defense = sheet.dnd.ca;
      console.log("CA atualizada por equipamento", { id: sheet.id, ca: sheet.dnd.ca, reason });
    }
    console.log("Ataques atualizados por equipamento", { id: sheet.id, reason });
  }
  syncSheetToken(sheet);
}

function setDndEquipmentState(index, action) {
  try {
  const sheet = ensureActiveSheet();
  if (sheetSystemId(sheet) !== "dnd5e") return;
  const lines = splitLines(sheet.inventory);
  const target = parseInventoryItem(lines[index] || "", sheet);
  if (!target.name) return;
  lines.forEach((raw, lineIndex) => {
    const parsed = parseInventoryLineRich(raw);
    const item = parseInventoryItem(raw, sheet);
    const meta = { ...item.stats, ...parsed.meta };
    if (action === "weapon" && lineIndex === index) {
      meta.equipped = true;
      meta.weaponReady = !target.stats.weaponReady;
      console.log("Arma em punho definida", { item: target.name, active: meta.weaponReady });
    }
    if (action === "armor") {
      meta.armorInUse = lineIndex === index ? !target.stats.armorInUse : false;
      if (lineIndex === index) {
        meta.equipped = meta.armorInUse;
        console.log("Armadura em uso definida", { item: target.name, active: meta.armorInUse });
      }
    }
    if (action === "shield") {
      meta.shieldInUse = lineIndex === index ? !target.stats.shieldInUse : false;
      if (lineIndex === index) {
        meta.equipped = meta.shieldInUse;
        console.log("Escudo em uso definido", { item: target.name, active: meta.shieldInUse });
      }
    }
    lines[lineIndex] = serializeInventoryRecord(parsed.name, meta, parsed.description);
  });
  sheet.inventory = lines.join("\n");
  syncDndEquipmentEffects(sheet, action);
  recalculateDerivedStats(sheet, "inventory");
  renderAll();
  queueSheetPatch(sheet, "inventory", 500);
  } catch (error) {
    console.error("Erro ao atualizar equipamento", error);
    if (typeof setSyncStatus === "function") setSyncStatus(`Erro ao atualizar equipamento: ${error.message}`, true);
  }
}

function toggleInventoryActive(index) {
  const sheet = ensureActiveSheet();
  const items = splitLines(sheet.inventory);
  const raw = items[index] || "";
  if (!raw) return;
  if (sheetSystemId(sheet) === "dnd5e") {
    const parsed = parseInventoryLineRich(raw);
    const item = parseInventoryItem(raw, sheet);
    const meta = { ...item.stats, ...parsed.meta, equipped: !item.stats.equipped };
    items[index] = serializeInventoryRecord(parsed.name, meta, parsed.description);
    sheet.inventory = items.join("\n");
    syncDndEquipmentEffects(sheet, "equip-toggle");
    recalculateDerivedStats(sheet, "inventory");
    renderAll();
    queueSheetPatch(sheet, "inventory", 500);
    return;
  }
  const active = inventoryLineActive(raw);
  items[index] = active
    ? raw.includes("|") ? `${raw} | Inativo` : `${raw} | Inativo`
    : raw.replace(/\s*\|\s*inativo/ig, "").replace(/\s*-\s*inativo/ig, "");
  sheet.inventory = items.join("\n");
  recalculateDerivedStats(sheet, "inventory");
  renderAll();
  queueSheetPatch(sheet, "inventory", 800);
}

function updateInventoryField(index, field, value, rerender = true) {
  const sheet = ensureActiveSheet();
  const items = splitLines(sheet.inventory);
  const current = parseInventoryLineRich(items[index] || "Item sem nome");
  const meta = { ...current.meta, [field]: value };
  const labels = {
    category: "Tipo",
    inventoryCategory: "Categoria",
    quantity: "Quantidade",
    subtype: "Subtipo",
    volume: "Volume",
    weight: "Peso",
    damage: "Dano",
    damageType: "Tipo dano",
    range: "Alcance",
    rangeType: "Alcance tipo",
    properties: "Propriedades",
    mastery: "Dominio",
    armorBase: "CA",
    dexLimit: "Limite DES",
    shieldBonus: "Escudo",
    bonusCa: "Bonus CA",
    attackBonus: "Bonus ataque",
    damageBonus: "Bonus dano",
    equipped: "Equipado",
    weaponReady: "Arma em punho",
    armorInUse: "Armadura em uso",
    shieldInUse: "Escudo em uso",
    stealth: "Furtividade",
    strength: "Forca",
    bonus: "Bonus",
    defense: "Defesa",
    image: "Imagem"
  };
  const metaText = Object.entries(meta)
    .filter(([, metaValue]) => String(metaValue || "").trim())
    .map(([metaKey, metaValue]) => `${labels[metaKey] || metaKey}: ${metaValue}`)
    .join(" | ");
  items[index] = `${current.name}${metaText ? ` | ${metaText}` : ""}${current.description ? ` - ${current.description}` : ""}`;
  sheet.inventory = items.join("\n");
  if (sheetSystemId(sheet) === "dnd5e") syncDndEquipmentEffects(sheet, "edit-item");
  recalculateDerivedStats(sheet, "inventory");
  if (rerender) renderAll();
  else save();
  queueSheetPatch(sheet, "inventory", 800);
}

function updateInventoryImage(index, file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    window.alert("Escolha uma imagem para o item.");
    return;
  }
  const sheet = ensureActiveSheet();
  const items = splitLines(sheet.inventory);
  const item = parseInventoryItem(items[index] || "Item sem nome");
  sheet.itemImages = sheet.itemImages || {};
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    sheet.itemImages[inventoryImageKey(item.name)] = reader.result || "";
    renderAll();
    queueSheetPatch(sheet, "itemImages", 800);
  });
  reader.readAsDataURL(file);
}

function recalculateDerivedStats(sheet, changedField = "") {
  if (!sheet) return sheet;
  if (sheetSystemId(sheet) === "dnd5e") {
    sheet.dnd = { ...(sheet.dnd || {}) };
    const derived = dndDerived(sheet);
    sheet.dnd.ca = derived.ac;
    sheet.defense = derived.ac;
    sheet.hp = Number(dndValue(sheet, "pv", sheet.hp || 10)) || 0;
    sheet.hpMax = Number(dndValue(sheet, "pvMax", sheet.hpMax || derived.maxHpByRule)) || derived.maxHpByRule;
    sheet.movement = Number(dndValue(sheet, "deslocamento", sheet.movement || 9)) || 9;
    syncSheetToken(sheet);
    return sheet;
  }
  const base = classBaseStats(sheet);
  const itemBonus = inventoryMechanicalBonuses(sheet);
  const nex = parseNex(sheet.nex);
  const nexSteps = Math.max(0, Math.floor(nex / 5) - 1);
  const agi = Number(sheet.agi || 0);
  const pre = Number(sheet.pre || 0);
  const vig = Number(sheet.vig || 0);
  const reflexes = Number(parseSkills(sheet).find((skill) => normalizeKey(skill.name) === "reflexos")?.total || 0);
  const maxHp = Math.max(1, base.hpStart + vig + nexSteps * (base.hpPerStep + vig));
  const maxPe = Math.max(1, base.peStart + pre + nexSteps * base.pePerStep);
  const maxSan = Math.max(1, base.sanStart + nexSteps * base.sanPerStep);
  const defense = Math.max(0, 10 + agi + itemBonus.defense);
  const dodge = Math.max(defense, defense + reflexes);
  const movement = Math.max(3, base.movement - itemBonus.movementPenalty);
  const peRound = Math.max(1, 1 + Math.floor(nex / 20));
  const preserveCurrent = (field, maxField, newMax) => {
    const current = Number(sheet[field]);
    const oldMax = Number(sheet[maxField]);
    sheet[maxField] = newMax;
    if (!Number.isFinite(current) || current <= 0 || current === oldMax || current > newMax || changedField === maxField) {
      sheet[field] = newMax;
    }
  };
  preserveCurrent("hp", "hpMax", maxHp);
  preserveCurrent("pe", "peMax", maxPe);
  preserveCurrent("san", "sanMax", maxSan);
  sheet.defense = defense;
  sheet.block = itemBonus.block;
  sheet.dodge = dodge;
  sheet.movement = movement;
  sheet.peRound = peRound;
  sheet.loadLimit = Math.max(1, Number(sheet.str || 0) * 5 + itemBonus.loadBonus);
  sheet.currentLoad = itemBonus.volume;
  syncSheetToken(sheet);
  return sheet;
}

function updateActiveSheet(field, value, numeric = false, rerender = true) {
  const sheet = ensureActiveSheet();
  if (!canEditSheet(sheet)) {
    setSyncStatus("Ficha bloqueada pelo mestre.", true);
    return;
  }
  const previousNex = parseNex(sheet.nex);
  sheet[field] = numeric ? Number(value) : value;
  if (["agi", "str", "int", "pre", "vig", "className", "pathName", "nex", "inventory", "skills"].includes(field)) {
    recalculateDerivedStats(sheet, field);
  } else if (["portrait", "name", "className", "hp", "hpMax", "pe", "peMax", "san", "sanMax"].includes(field)) {
    syncSheetToken(sheet);
  }
  if (rerender) {
    localOnlyRender();
    if (field === "nex") {
      const nextNex = parseNex(sheet.nex);
      if (nextNex > previousNex) showNexUpdateMessage(sheet, previousNex, nextNex);
    }
  } else {
    suppressOnlineSave = true;
    save();
    suppressOnlineSave = false;
  }
  queueSheetPatch(sheet, field, 800);
  const token = state.tokens.find((item) => item.sheetId === sheet.id);
  if (token && ["portrait", "name", "className", "hp", "hpMax", "pe", "peMax", "san", "sanMax", "inventory"].includes(field)) {
    markGridChanged(token, "full");
  }
}

function syncSheetToken(sheet = ensureActiveSheet()) {
  const statValue = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  state.tokens.forEach((token) => {
    if (token.sheetId !== sheet.id) return;
    token.name = sheet.name || token.name;
    token.label = sheet.className || token.label;
    token.portrait = sheet.portrait || "";
    token.hp = statValue(sheet.hp, token.hp);
    token.hpMax = statValue(sheet.hpMax, token.hpMax);
    token.pe = statValue(sheet.pe, token.pe);
    token.peMax = statValue(sheet.peMax, token.peMax);
    token.san = statValue(sheet.san, token.san);
    token.sanMax = statValue(sheet.sanMax, token.sanMax);
    token.light = statValue(inventoryVisionBonus(sheet), token.light);
  });
  const campaign = currentCampaign();
  campaign?.sessoes?.forEach((session) => {
    session.tokens = (session.tokens || []).map((token) => token.sheetId === sheet.id ? {
      ...token,
      name: sheet.name || token.name,
      label: sheet.className || token.label,
      portrait: sheet.portrait || "",
      hp: statValue(sheet.hp, token.hp),
      hpMax: statValue(sheet.hpMax, token.hpMax),
      pe: statValue(sheet.pe, token.pe),
      peMax: statValue(sheet.peMax, token.peMax),
      san: statValue(sheet.san, token.san),
      sanMax: statValue(sheet.sanMax, token.sanMax),
      light: statValue(inventoryVisionBonus(sheet), token.light)
    } : token);
  });
}

function canEditSheetVitals(sheetId) {
  const sheet = state.sheets.find((item) => item.id === sheetId);
  if (sheet && !canEditSheet(sheet)) return false;
  const user = currentUser();
  if (isMasterMode()) return true;
  return Boolean(user && (user.sheetIds || []).includes(sheetId));
}

function canEditSheet(sheet) {
  const safeSheet = normalizeSheet(sheet || {});
  const user = currentUser();
  if (!user) return false;
  if (isMasterMode()) return true;
  if ((user.sheetIds || []).includes(safeSheet.id)) return true;
  const responsible = uuidOrNull(safeSheet.responsavelId || safeSheet.responsavel_id);
  if (responsible === user.id) return safeSheet.editLocked !== true && safeSheet.editAllowedByMaster === true;
  return false;
}

function applySheetEditState(sheet) {
  if (!els.crisisSheet) return;
  const canEdit = canEditSheet(sheet);
  els.crisisSheet.classList.toggle("sheet-locked-by-master", !canEdit);
  els.crisisSheet.querySelector(".sheet-lock-notice")?.remove();
  if (!canEdit) {
    els.crisisSheet.insertAdjacentHTML("afterbegin", `<div class="sheet-lock-notice">Ficha bloqueada pelo mestre.</div>`);
  } else if (sheetOrigin(sheet) === "sessao" && sheet.editAllowedByMaster) {
    els.crisisSheet.insertAdjacentHTML("afterbegin", `<div class="sheet-lock-notice unlocked">Edicao liberada pelo mestre.</div>`);
  }
  els.crisisSheet.querySelectorAll("input, textarea, select").forEach((field) => {
    if (field.matches("[data-sheet-damage-value]")) return;
    field.disabled = !canEdit;
    if (!canEdit) field.setAttribute("aria-readonly", "true");
    else field.removeAttribute("aria-readonly");
  });
}

function applySheetDamage(sheetId, amount, mode = "damage") {
  const value = Math.max(0, Number(amount) || 0);
  if (!value) return;
  const sheet = state.sheets.find((item) => item.id === sheetId);
  if (!sheet || !canEditSheetVitals(sheet.id)) return;
  const max = Math.max(Number(sheet.hpMax) || Number(sheet.hp) || 1, 1);
  const current = Math.max(0, Number(sheet.hp) || 0);
  const protection = Math.max(0, Number(sheet.block) || 0);
  const finalDamage = mode === "damage" ? Math.max(0, value - protection) : value;
  sheet.hp = mode === "heal" ? Math.min(max, current + value) : Math.max(0, current - finalDamage);
  syncSheetToken(sheet);
  localOnlyRender();
  queueSheetPatch(sheet, "hp", 500);
  const token = state.tokens.find((item) => item.sheetId === sheet.id);
  if (token) markGridChanged(token, "full");
  animateTokenImpactForSheet(sheet.id, mode, mode === "damage" ? finalDamage : value);
}

function applyTokenDamage(tokenId, amount, mode = "damage") {
  const value = Math.max(0, Number(amount) || 0);
  if (!value) return;
  const token = state.tokens.find((item) => item.id === tokenId);
  if (!canControlToken(token)) return;
  if (token.sheetId) {
    applySheetDamage(token.sheetId, value, mode);
    return;
  }
  const max = Math.max(Number(token.hpMax) || Number(token.hp) || 1, 1);
  const current = Math.max(0, Number(token.hp) || 0);
  token.hp = mode === "heal" ? Math.min(max, current + value) : Math.max(0, current - value);
  syncCurrentSession();
  localOnlyRender();
  markGridChanged(token, "full");
  animateTokenImpact(token.id, mode, value);
}

function animateTokenImpactForSheet(sheetId, mode, amount) {
  const token = state.tokens.find((item) => item.sheetId === sheetId);
  if (token) animateTokenImpact(token.id, mode, amount);
}

function animateTokenImpact(tokenId, mode, amount) {
  window.requestAnimationFrame(() => {
    const node = els.battlefield?.querySelector(`[data-token-id="${selectorEscape(tokenId)}"]`);
    if (!node) return;
    node.classList.remove("token-impact-damage", "token-impact-heal");
    node.dataset.impact = mode === "heal" ? `+${amount}` : `-${amount}`;
    void node.offsetWidth;
    node.classList.add(mode === "heal" ? "token-impact-heal" : "token-impact-damage");
    window.setTimeout(() => {
      node.classList.remove("token-impact-damage", "token-impact-heal");
      delete node.dataset.impact;
    }, 760);
  });
}

function uploadProfilePhoto(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    window.alert("Escolha um arquivo de imagem.");
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => updateActiveSheet("portrait", reader.result || ""));
  reader.readAsDataURL(file);
}

function updateSkillMod(skill, field, value, rerender = true) {
  const sheet = ensureActiveSheet();
  if (!canEditSheet(sheet)) {
    setSyncStatus("Ficha bloqueada pelo mestre.", true);
    return;
  }
  sheet.skillMods = sheet.skillMods || {};
  sheet.skillMods[skill] = { ...(sheet.skillMods[skill] || {}), [field]: value };
  recalculateDerivedStats(sheet, "skills");
  if (rerender) localOnlyRender();
  else {
    suppressOnlineSave = true;
    save();
    suppressOnlineSave = false;
  }
  queueSheetPatch(sheet, "skillMods", 800);
}

function adjustSheetNumber(field, delta) {
  const sheet = ensureActiveSheet();
  if (!canEditSheet(sheet)) {
    setSyncStatus("Ficha bloqueada pelo mestre.", true);
    return;
  }
  sheet[field] = numberOr(sheet[field], 0) + delta;
  localOnlyRender();
  queueSheetPatch(sheet, field, 500);
}

function addSheetLine(field) {
  const label = {
    attacks: "Novo ataque | 1d20 | 1d4 | 20 | Curto | -",
    abilities: "Nova habilidade",
    rituals: "Novo ritual 1d20",
    inventory: "Novo item"
  }[field] || "Novo";
  const value = window.prompt("Adicionar:", label);
  if (!value) return;
  const sheet = ensureActiveSheet();
  const lines = ["abilities", "rituals"].includes(field) ? splitSheetEntries(sheet[field]) : splitLines(sheet[field]);
  sheet[field] = lines.concat(value).join("\n");
  if (["inventory", "abilities", "rituals"].includes(field)) recalculateDerivedStats(sheet, field);
  localOnlyRender();
  queueSheetPatch(sheet, field, 800);
}

function rollSkill(skillName) {
  const sheet = ensureActiveSheet();
  const skill = parseSkills(normalizeSheet(sheet)).find((item) => item.name === skillName);
  if (!skill) return;
  const attrValue = attrValueForSkill(sheet, skill.attr);
  const diceAmount = Math.max(1, attrValue);
  performRoll(`${diceAmount}d20${formatSigned(skill.total)}`);
}

function rollFromText(text) {
  const formula = String(text).match(/\d*d\d+(?:[+-]\d+)?/i)?.[0] || "1d20";
  performRoll(formula);
}

function attrValueForSkill(sheet, attr) {
  return {
    AGI: sheet.agi,
    FOR: sheet.str,
    INT: sheet.int,
    PRE: sheet.pre,
    VIG: sheet.vig
  }[attr] || 1;
}

function ensureActiveSheet() {
  const user = currentUser();
  const ownedIds = user?.sheetIds || [];
  const campaign = currentCampaign();
  const linkedIds = campaign?.personagens || [];
  const selectedSheet = state.sheets.find((sheet) => sheet.id === state.activeSheetId);
  const systemId = state.currentMode === "sheet" && selectedSheet ? sheetSystemId(selectedSheet) : campaignSystemId(campaign);
  let index = state.sheets.findIndex((sheet) => sheet.id === state.activeSheetId);
  const activeSheet = index >= 0 ? normalizeSheet(state.sheets[index]) : null;
  const canUseActive = activeSheet
    && sheetSystemId(activeSheet) === systemId
    && (state.currentMode === "sheet" ? ownedIds.includes(activeSheet.id) : (isMasterMode() ? (linkedIds.includes(activeSheet.id) || ownedIds.includes(activeSheet.id)) : ownedIds.includes(activeSheet.id)));
  if (!canUseActive) index = -1;
  if (index < 0 && state.currentMode !== "sheet" && isMasterMode() && linkedIds.length) {
    index = state.sheets.findIndex((sheet) => linkedIds.includes(sheet.id) && sheetSystemId(sheet) === systemId);
  }
  if (index < 0 && ownedIds.length) {
    index = state.sheets.findIndex((sheet) => ownedIds.includes(sheet.id) && sheetSystemId(sheet) === systemId);
  }
  if (index < 0) {
    const system = systemFor(systemId);
    const defaultName = system.id === "dnd5e" ? "Novo aventureiro" : "Novo agente";
    const sheet = blankSheetForSystem(system.id, defaultName, user?.username || "Local");
    state.sheets.unshift(sheet);
    index = 0;
    if (user) {
      user.sheetIds = user.sheetIds || [];
      if (user.sheetIds.length < 5) user.sheetIds.unshift(sheet.id);
    }
  }
  state.sheets[index] = normalizeSheet(state.sheets[index]);
  state.activeSheetId = state.sheets[index].id;
  return state.sheets[index];
}

function activeUserSheet(campaign = currentCampaign()) {
  const user = currentUser();
  if (!user) return null;
  user.sheetIds = user.sheetIds || [];
  if (!user.sheetIds.length) return null;
  const systemId = campaignSystemId(campaign);
  let index = state.sheets.findIndex((sheet) => sheet.id === state.activeSheetId && user.sheetIds.includes(sheet.id) && sheetSystemId(sheet) === systemId);
  if (index < 0) index = state.sheets.findIndex((sheet) => user.sheetIds.includes(sheet.id) && sheetSystemId(sheet) === systemId);
  if (index < 0) return null;
  state.sheets[index] = normalizeSheet(state.sheets[index]);
  state.activeSheetId = state.sheets[index].id;
  return state.sheets[index];
}

function isMasterMode() {
  const user = currentUser();
  const campaign = currentCampaign();
  return state.currentMode === "master" && user && (user.role === "admin" || campaign?.mestreId === user.id);
}

function canControlToken(token) {
  if (!token) return false;
  if (isMasterMode()) return true;
  const user = currentUser();
  return Boolean(token.sheetId && (user?.sheetIds || []).includes(token.sheetId));
}

function formatBonus(value) {
  return Number(value) > 0 ? `+${value}` : String(value);
}

function formatSigned(value) {
  return Number(value) >= 0 ? `+${value}` : String(value);
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function selectorEscape(value) {
  if (window.CSS?.escape) return CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
}

function resourceBar(label, field, maxField, current, max, type) {
  const percent = Math.max(0, Math.min(100, Math.round((Number(current) / Math.max(1, Number(max))) * 100)));
  return `
    <div class="resource-bar ${type}">
      <span>${label}</span>
      <div>
        <i style="width:${percent}%"></i>
        <button type="button" data-adjust="${field}" data-delta="-1">‹</button>
        <b><input data-sheet-field="${field}" type="number" value="${current}" /> / <input data-sheet-field="${maxField}" type="number" value="${max}" /></b>
        <button type="button" data-adjust="${field}" data-delta="1">›</button>
      </div>
    </div>
  `;
}

function parseSkills(sheet) {
  const defaults = ["Acrobacia AGI", "Adestramento PRE", "Artes PRE", "Atletismo FOR", "Atualidades INT", "Ciencias INT", "Crime AGI", "Diplomacia PRE", "Enganacao PRE", "Fortitude VIG", "Furtividade AGI", "Iniciativa AGI", "Intimidacao PRE", "Intuicao PRE", "Investigacao INT", "Luta FOR", "Medicina INT", "Ocultismo INT", "Percepcao PRE", "Pontaria AGI", "Reflexos AGI", "Tecnologia INT", "Vontade PRE"];
  const custom = splitLines(sheet.skills).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  return defaults.map((entry, index) => {
    const [name, attr] = entry.split(" ");
    const found = custom.find((line) => line.toLowerCase().startsWith(name.toLowerCase()));
    const saved = sheet.skillMods?.[name] || {};
    const train = numberOr(saved.train, found?.match(/[+-]\d+/)?.[0] || (index % 4 === 0 ? 5 : 0));
    const other = numberOr(saved.other, 0);
    const total = train + other;
    return { name: found ? found.replace(/[+-]\d+.*/, "").trim() : name, attr, train, other, total, trained: total !== 0 };
  });
}

function splitLines(text) {
  const raw = String(text || "").trim();
  if (!raw) return [];
  const newlineItems = raw.split(/\n+/).map((item) => item.trim()).filter(Boolean);
  if (newlineItems.length > 1) return newlineItems;
  if (raw.includes(" | ") || raw.includes(" - ")) return [raw];
  return raw.split(/[,;]/).map((item) => item.trim()).filter(Boolean);
}

function resizeGrid() {
  state.map.name = els.mapName?.value.trim() || state.map.name || "Mapa sem nome";
  state.map.cols = clamp(Number(els.gridCols?.value || state.map.cols), 6, 100);
  state.map.rows = clamp(Number(els.gridRows?.value || state.map.rows), 6, 100);
  state.tokens.forEach((token) => {
    token.x = Math.min(token.x, state.map.cols - 1);
    token.y = Math.min(token.y, state.map.rows - 1);
  });
  renderAll();
  markMapStructureChanged();
}

function updateMapBackground(field, value) {
  state.map = normalizeMap(state.map);
  if (state.map.background.locked && field !== "locked" && field !== "src") return;
  state.map.background[field] = value;
  renderAll();
}

function fitMapBackground() {
  state.map = normalizeMap(state.map);
  state.map.background = {
    ...state.map.background,
    scaleX: 100,
    scaleY: 100,
    x: 0,
    y: 0,
    rotation: 0,
    opacity: Math.max(Number(state.map.background.opacity) || 82, 72)
  };
  renderAll();
}

function centerMapBackground() {
  state.map = normalizeMap(state.map);
  if (state.map.background.locked) return;
  state.map.background.x = 0;
  state.map.background.y = 0;
  state.map.background.rotation = 0;
  renderAll();
}

function fitGridToView() {
  state.map = normalizeMap(state.map);
  const wrap = document.querySelector(".battlefield-wrap");
  if (!wrap) return;
  const width = Math.max(320, wrap.clientWidth - 28);
  const height = Math.max(260, Math.min(wrap.clientHeight || window.innerHeight * 0.64, window.innerHeight * 0.64) - 28);
  const byWidth = Math.floor(width / state.map.cols);
  const byHeight = Math.floor(height / state.map.rows);
  viewCellSize = clamp(Math.min(byWidth, byHeight), 14, 64);
  renderGrid();
}

function setGridZoom(size) {
  state.map = normalizeMap(state.map);
  viewCellSize = clamp(Number(size) || state.map.cellSize, 14, 96);
  renderGrid();
}

function zoomGrid(delta) {
  const current = viewCellSize || state.map.cellSize || 48;
  setGridZoom(current + delta);
}

function resetGridZoom() {
  viewCellSize = null;
  renderGrid();
}

function centerTokenView() {
  const wrap = document.querySelector(".battlefield-wrap");
  if (!wrap) return;
  const user = currentUser();
  const token = state.tokens.find((item) => item.id === state.selectedToken && canControlToken(item))
    || state.tokens.find((item) => item.sheetId && (user?.sheetIds || []).includes(item.sheetId))
    || state.tokens.find((item) => isMasterMode() || !item.hidden);
  if (!token) return;
  const cellSize = viewCellSize || state.map.cellSize || 48;
  wrap.scrollTo({
    left: Math.max(0, token.x * cellSize - wrap.clientWidth / 2 + cellSize / 2),
    top: Math.max(0, token.y * cellSize - wrap.clientHeight / 2 + cellSize / 2),
    behavior: "smooth"
  });
}

function startMapPan(event) {
  const wrap = document.querySelector(".battlefield-wrap");
  if (!wrap || !(event.button === 1 || isSpacePressed)) return;
  event.preventDefault();
  panState = { x: event.clientX, y: event.clientY, left: wrap.scrollLeft, top: wrap.scrollTop };
  wrap.classList.add("panning");
}

function moveMapPan(event) {
  const wrap = document.querySelector(".battlefield-wrap");
  if (!wrap || !panState) return;
  wrap.scrollLeft = panState.left - (event.clientX - panState.x);
  wrap.scrollTop = panState.top - (event.clientY - panState.y);
}

function stopMapPan() {
  const wrap = document.querySelector(".battlefield-wrap");
  if (wrap) wrap.classList.remove("panning");
  panState = null;
}

function toggleMapAssistant(mode = "guide") {
  const panel = document.querySelector("#mapAssistantPanel");
  if (!panel) return;
  const isOpen = !panel.classList.contains("hidden") && panel.dataset.mode === mode;
  if (isOpen) {
    panel.classList.add("hidden");
    return;
  }
  panel.dataset.mode = mode;
  panel.classList.remove("hidden");
  panel.innerHTML = mode === "checklist" ? mapChecklistHtml() : mapGuideHtml(mode);
  panel.querySelector("[data-close-assistant]")?.addEventListener("click", () => panel.classList.add("hidden"));
}

function mapGuideHtml(mode) {
  const title = mode === "help" ? "Ajuda da ferramenta" : "Assistente do Grid";
  return `
    <article class="assistant-paper">
      <button type="button" data-close-assistant>Fechar</button>
      <h3>${title}</h3>
      <ol>
        <li>Defina colunas, linhas, tamanho, offset, snap e coordenadas em Grid.</li>
        <li>Use Fundo para subir uma imagem e alinhar opacidade, escala e posicao.</li>
        <li>Escolha Parede ou Porta e clique em dois pontos do mapa para criar uma linha.</li>
        <li>Desenhar a mesma porta alterna: fechada, aberta, trancada e secreta.</li>
        <li>Ative Neblina e use Revelar/Ocultar para controlar areas vistas.</li>
        <li>Segure espaco e arraste, ou use o botao do meio do mouse, para navegar.</li>
      </ol>
      <p><b>Regra operacional:</b> paredes e portas fechadas/trancadas/secretas bloqueiam luz e visao.</p>
    </article>
  `;
}

function mapChecklistHtml() {
  const map = state.map || {};
  const checks = [
    ["Imagem de fundo", Boolean(map.background?.src)],
    ["Grid configurado", map.cols > 0 && map.rows > 0],
    ["Tokens posicionados", state.tokens.length > 0],
    ["Paredes/portas registradas", (map.edges || []).length > 0 || (map.marks || []).length > 0],
    ["Neblina configurada", map.fog?.enabled === true],
    ["Luz ambiente conferida", Number.isFinite(Number(map.darkness))],
    ["Mapa salvo", true]
  ];
  return `
    <article class="assistant-paper">
      <button type="button" data-close-assistant>Fechar</button>
      <h3>Checklist do Arquivo</h3>
      <ul>${checks.map(([label, ok]) => `<li class="${ok ? "done" : ""}">${ok ? "✓" : "□"} ${escapeHtml(label)}</li>`).join("")}</ul>
      <p>${checks.every(([, ok]) => ok) ? "ARQUIVO PRONTO." : "Pendencias registradas para o mestre."}</p>
    </article>
  `;
}

function removeMapBackground() {
  state.map = normalizeMap(state.map);
  state.map.background = defaultMapBackground();
  if (els.mapImageInput) els.mapImageInput.value = "";
  renderAll();
}

function uploadMapBackground(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    window.alert("Escolha uma imagem para usar como fundo do mapa.");
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    state.map = normalizeMap(state.map);
    state.map.background = {
      ...defaultMapBackground(),
      ...state.map.background,
      src: reader.result,
      locked: false
    };
    renderAll();
  });
  reader.readAsDataURL(file);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value || min));
}

function hexToRgba(hex, alpha = 1) {
  const clean = String(hex || "#debc79").replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean;
  const number = Number.parseInt(full, 16);
  if (!Number.isFinite(number)) return `rgba(222, 188, 121, ${alpha})`;
  const r = (number >> 16) & 255;
  const g = (number >> 8) & 255;
  const b = number & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

function renderSheets() {
  els.sheetList.innerHTML = "";
  const user = currentUser();
  const campaign = currentCampaign();
  const visibleSheets = isMasterMode()
    ? state.sheets.filter((sheet) => sheetMatchesCampaign(sheet, campaign) && (!campaign?.id || sheetCampaignIdValue(sheet) === campaign.id || (campaign.personagens || []).includes(sheet.id)))
    : state.sheets.filter((sheet) => sheetMatchesCampaign(sheet, campaign) && sheetVisibleToCurrentUser(sheet, campaign));
  visibleSheets.forEach((sheet) => {
    const safeSheet = normalizeSheet(sheet);
    const card = document.createElement("article");
    card.className = "sheet-card";
    card.innerHTML = `
      <div class="sheet-card-photo ${safeSheet.portrait ? "has-photo" : ""}" style="${safeSheet.portrait ? `background-image:url('${escapeAttr(safeSheet.portrait)}')` : ""}">${safeSheet.portrait ? "" : escapeHtml(initials(safeSheet.name || "AG"))}</div>
      <div class="sheet-identity">
        <span class="sheet-name">${escapeHtml(safeSheet.name || "Agente sem nome")}</span>
        <span>${escapeHtml(safeSheet.rank || "Sem patente")}</span>
      </div>
      <div class="sheet-tags">
        <span>${escapeHtml(safeSheet.role || "Sem origem")}</span>
        <span>${escapeHtml(safeSheet.className || "Sem classe")}</span>
        <span>${escapeHtml(safeSheet.pathName || "Sem trilha")}</span>
        <span>${escapeHtml(safeSheet.nex || "0% NEX")}</span>
      </div>
      <div class="sheet-resources">
        <span><b>PV</b>${safeSheet.hp}/${safeSheet.hpMax}</span>
        <span><b>PE</b>${safeSheet.pe}/${safeSheet.peMax}</span>
        <span><b>SAN</b>${safeSheet.san}/${safeSheet.sanMax}</span>
        <span><b>DEF</b>${safeSheet.defense}</span>
      </div>
      <div class="sheet-attrs">
        <span>AGI <b>${safeSheet.agi}</b></span>
        <span>FOR <b>${safeSheet.str}</b></span>
        <span>INT <b>${safeSheet.int}</b></span>
        <span>PRE <b>${safeSheet.pre}</b></span>
        <span>VIG <b>${safeSheet.vig}</b></span>
      </div>
      <div class="sheet-notes">
        <p>${escapeHtml(safeSheet.skills || "Sem pericias anotadas.")}</p>
        <p>${escapeHtml(safeSheet.attacks || "Sem ataques ou rituais anotados.")}</p>
        <p>${escapeHtml(safeSheet.notes || "Sem inventario ou anotacoes.")}</p>
      </div>
    `;
    const actions = document.createElement("div");
    actions.className = "sheet-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "Editar";
    edit.addEventListener("click", () => fillSheet(safeSheet));
    const token = document.createElement("button");
    token.type = "button";
    token.textContent = "Virar token";
    token.addEventListener("click", () => {
      els.tokenName.value = safeSheet.name;
      addToken();
      switchTab("mesa");
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Excluir";
    remove.addEventListener("click", () => {
      state.sheets = state.sheets.filter((item) => item.id !== safeSheet.id);
      state.accounts.forEach((account) => {
        account.sheetIds = (account.sheetIds || []).filter((id) => id !== safeSheet.id);
      });
      state.campaigns.forEach((campaign) => {
        campaign.personagens = (campaign.personagens || []).filter((id) => id !== safeSheet.id);
      });
      if (state.activeSheetId === safeSheet.id) state.activeSheetId = state.sheets[0]?.id || null;
      renderAll();
    });
    actions.append(edit, token, remove);
    card.append(actions);
    els.sheetList.append(card);
  });
}

function playerNameById(userId) {
  const account = state.accounts.find((item) => item.id === userId);
  return account?.username || account?.email || (userId ? `Jogador ${String(userId).slice(0, 8)}` : "Sem responsavel");
}

function renderPlayerOptions(players = [], selected = "") {
  const options = players.filter((player) => uuidOrNull(player.user_id)).map((player) =>
    `<option value="${escapeAttr(player.user_id)}" ${player.user_id === selected ? "selected" : ""}>${escapeHtml(player.username)} (${escapeHtml(player.role || "jogador")})</option>`
  );
  return `<option value="">Sem jogador vinculado</option>${options.join("")}`;
}

function tablePlayersForCampaign(campaign = currentCampaign()) {
  if (!campaign || !uuidOrNull(campaign.id)) return [];
  const remoteRows = (state.campaignPlayers || []).filter((item) => item.campanha_id === campaign.id && uuidOrNull(item.user_id));
  if (remoteRows.length || supabaseClient()) {
    const linkedSheets = sheetsLinkedToCampaign(campaign);
    return remoteRows.map((row) => {
      const account = state.accounts.find((item) => item.id === row.user_id) || {};
      const linkedCount = linkedSheets.filter((sheet) =>
        [sheet.user_id, sheet.owner_id, sheet.responsavel_id, sheet.userId, sheet.ownerId, sheet.responsavelId].map(uuidOrNull).includes(row.user_id)
      ).length;
      return {
        ...row,
        username: row.username || account.username || account.email || (row.role === "mestre" ? "Mestre" : "Jogador"),
        email: row.email || account.email || "",
        linkedCount
      };
    });
  }
  return localCampaignPlayers(campaign);
}

function sessionSheetTypeLabel(sheet) {
  return sheet.fichaCategoria || sheet.sheetType || sheet.payload?.fichaCategoria || "Personagem da sessao";
}

function renderTableSheetsPanel() {
  if (!els.tableSheetsPanel) return;
  const campaign = currentCampaign();
  const user = currentUser();
  if (!campaign || !user) {
    els.tableSheetsPanel.innerHTML = "";
    return;
  }
  const players = tablePlayersForCampaign(campaign);
  const linkedSheets = sheetsLinkedToCampaign(campaign);
  const sessionSheets = linkedSheets.filter((sheet) => sheetOrigin(sheet) === "sessao");
  console.log("Carregando fichas da sessao", { campanha_id: campaign.id, total: sessionSheets.length });
  const personalSheets = state.sheets.filter((sheet) => (user.sheetIds || []).includes(sheet.id) && sheetMatchesCampaign(sheet, campaign));
  const pendingRequests = (state.sheetRequests || []).filter((item) => item.campanha_id === campaign.id && item.status === "pendente");
  const userRequests = (state.sheetRequests || []).filter((item) => item.campanha_id === campaign.id && item.user_id === user.id);
  const canMaster = isMasterMode();
  els.tableSheetsPanel.classList.toggle("player-sheet-requests", !canMaster);
  els.tableSheetsPanel.innerHTML = canMaster ? `
    <div class="table-sheets-head">
      <div>
        <p class="eyebrow">Campanha atual</p>
        <h2>Gerenciar Fichas</h2>
      </div>
      <button type="button" data-refresh-table-sheets>Atualizar listas</button>
    </div>
    <section class="table-sheet-block">
      <h3>Criar ficha da sessao</h3>
      <div class="table-sheet-form">
        <label>Nome da ficha <input id="sessionSheetName" type="text" placeholder="${campaignSystemId(campaign) === "dnd5e" ? "Novo aventureiro da sessao" : "Novo agente da sessao"}" /></label>
        <label>Tipo
          <select id="sessionSheetType">
            <option>Personagem da sessao</option>
            <option>NPC</option>
            <option>Monstro</option>
            <option>Aliado</option>
            <option>Temporario</option>
          </select>
        </label>
        <label>Jogador responsavel <select id="sessionSheetPlayer">${renderPlayerOptions(players)}</select></label>
        <label>Permissao inicial
          <select id="sessionSheetPermission">
            <option value="locked">Bloqueada para jogador</option>
            <option value="unlocked">Liberada para jogador responsavel</option>
          </select>
        </label>
        <button type="button" data-create-session-sheet-inline>Criar ficha da sessao</button>
      </div>
    </section>
    <section class="table-sheet-block">
      <h3>Jogadores da Mesa</h3>
      <div class="table-sheet-list">
        ${players.length ? players.map((player) => `
          <article class="table-sheet-card compact">
            <b>${escapeHtml(player.username)}</b>
            <span>${escapeHtml(player.role === "mestre" ? "Mestre" : "Jogador")} | ${escapeHtml(player.status || "ativo")}</span>
            <small>${player.linkedCount ? `${player.linkedCount} ficha(s) vinculada(s)` : "Sem ficha vinculada"}</small>
            <div>
              <button type="button" data-filter-player-sheets="${escapeAttr(player.user_id)}">Ver fichas</button>
              ${sessionSheets.length ? `<button type="button" data-link-session-sheet-player="${escapeAttr(player.user_id)}">Vincular ficha da sessao</button>` : ""}
            </div>
          </article>
        `).join("") : `<p>Nenhum jogador entrou nesta mesa ainda.</p>`}
      </div>
    </section>
    <section class="table-sheet-block">
      <h3>Fichas da Sessao</h3>
      <div class="table-sheet-list">
        ${sessionSheets.length ? sessionSheets.map((sheet) => {
          const responsible = uuidOrNull(sheet.responsavelId || sheet.responsavel_id);
          const isPendingMigration = state.pendingMigrationSheetId === sheet.id;
          const isPendingResponsible = state.pendingResponsibleSheetId === sheet.id;
          return `
            <article class="table-sheet-card">
              <div>
                <b>${escapeHtml(sheet.name || "Ficha da sessao")}</b>
                <span>${escapeHtml(systemFor(sheetSystemId(sheet)).nome)} | ${escapeHtml(sessionSheetTypeLabel(sheet))}</span>
                <small>Responsavel: ${escapeHtml(playerNameById(responsible))} | ${sheet.editLocked ? "Bloqueada" : "Liberada"} | ${sheet.migrada ? "Migrada" : "Nao migrada"}</small>
              </div>
              <div class="table-sheet-actions">
                <button type="button" data-table-open-sheet="${escapeAttr(sheet.id)}">Abrir ficha</button>
                <button type="button" data-session-sheet-lock="${escapeAttr(sheet.id)}">${sheet.editLocked ? "Liberar edicao" : "Travar edicao"}</button>
                <button type="button" data-session-sheet-migrate="${escapeAttr(sheet.id)}">Migrar para jogador</button>
                <button type="button" data-change-responsible="${escapeAttr(sheet.id)}">Alterar responsavel</button>
                <button class="danger-action" type="button" data-remove-session-sheet="${escapeAttr(sheet.id)}">Remover da sessao</button>
              </div>
              ${isPendingMigration ? `
                <div class="inline-migration-box">
                  <label>Migrar para <select data-migration-target="${escapeAttr(sheet.id)}">${renderPlayerOptions(players, responsible)}</select></label>
                  <button type="button" data-confirm-session-migration="${escapeAttr(sheet.id)}">Confirmar migracao</button>
                  <button type="button" data-cancel-session-migration>Cancelar</button>
                </div>
              ` : ""}
              ${isPendingResponsible ? `
                <div class="inline-migration-box">
                  <label>Novo responsavel <select data-responsible-target="${escapeAttr(sheet.id)}">${renderPlayerOptions(players, responsible)}</select></label>
                  <button type="button" data-confirm-responsible-change="${escapeAttr(sheet.id)}">Confirmar responsavel</button>
                  <button type="button" data-cancel-responsible-change>Cancelar</button>
                </div>
              ` : ""}
            </article>
          `;
        }).join("") : `<p>Nenhuma ficha da sessao criada.</p>`}
      </div>
    </section>
    <section class="table-sheet-block">
      <h3>Solicitacoes de Fichas</h3>
      <div class="table-sheet-list">
        ${pendingRequests.length ? pendingRequests.map((request) => {
          const sheet = state.sheets.find((item) => item.id === request.personagem_id);
          return `
            <article class="table-sheet-card compact">
              <b>${escapeHtml(sheet?.name || "Ficha nao carregada")}</b>
              <span>${escapeHtml(playerNameById(request.user_id))} | ${escapeHtml(systemFor(sheetSystemId(sheet || {})).nome)}</span>
              <small>${request.created_at ? new Date(request.created_at).toLocaleString("pt-BR") : "Sem data"}</small>
              <div class="table-sheet-actions">
                <button type="button" data-table-open-sheet="${escapeAttr(request.personagem_id)}">Ver ficha</button>
                <button type="button" data-accept-sheet-request="${escapeAttr(request.id)}">Aceitar ficha</button>
                <button class="danger-action" type="button" data-reject-sheet-request="${escapeAttr(request.id)}">Recusar ficha</button>
              </div>
            </article>
          `;
        }).join("") : `<p>Nenhuma solicitacao pendente.</p>`}
      </div>
    </section>
  ` : `
    <div class="table-sheets-head">
      <div>
        <p class="eyebrow">Mesa atual</p>
        <h2>Solicitar ficha pronta</h2>
      </div>
      <button type="button" data-refresh-table-sheets>Atualizar</button>
    </div>
    <section class="table-sheet-block">
      <h3>Minhas fichas disponiveis</h3>
      <div class="table-sheet-list">
        ${personalSheets.length ? personalSheets.map((sheet) => {
          const request = userRequests.find((item) => item.personagem_id === sheet.id);
          const alreadyLinked = sheetCampaignIdValue(sheet) === campaign.id || (campaign.personagens || []).includes(sheet.id);
          return `
            <article class="table-sheet-card compact">
              <b>${escapeHtml(sheet.name || "Ficha")}</b>
              <span>${escapeHtml(systemFor(sheetSystemId(sheet)).nome)} | ${escapeHtml(sheet.className || sheet.dnd?.classe || "Sem classe")}</span>
              <small>${alreadyLinked ? "Ficha vinculada a esta mesa" : request ? `Solicitacao ${request.status}` : "Disponivel para pedir aprovacao"}</small>
              <div class="table-sheet-actions">
                <button type="button" data-table-open-sheet="${escapeAttr(sheet.id)}">Abrir ficha</button>
                ${alreadyLinked || request?.status === "pendente" ? "" : `<button type="button" data-request-ready-sheet="${escapeAttr(sheet.id)}">Enviar para aprovacao do mestre</button>`}
              </div>
            </article>
          `;
        }).join("") : `<p>Nenhuma ficha pessoal compativel com esta campanha.</p>`}
      </div>
    </section>
  `;
  attachTableSheetPanelEvents(players);
}

function attachTableSheetPanelEvents(players = []) {
  const root = els.tableSheetsPanel;
  if (!root) return;
  root.querySelector("[data-refresh-table-sheets]")?.addEventListener("click", async () => {
    await refreshActiveCampaignFromSupabase({ rerender: true });
  });
  root.querySelector("[data-create-session-sheet-inline]")?.addEventListener("click", createSessionSheetFromPanel);
  root.querySelectorAll("[data-filter-player-sheets]").forEach((button) => {
    button.addEventListener("click", () => {
      const playerId = button.dataset.filterPlayerSheets;
      const campaign = currentCampaign();
      const total = state.sheets.filter((sheet) =>
        sheetCampaignIdValue(sheet) === campaign?.id &&
        [sheet.user_id, sheet.owner_id, sheet.responsavel_id, sheet.userId, sheet.ownerId, sheet.responsavelId].map(uuidOrNull).includes(playerId)
      ).length;
      setSyncStatus(`${playerNameById(playerId)} tem ${total} ficha(s) vinculada(s) nesta mesa.`);
    });
  });
  root.querySelectorAll("[data-link-session-sheet-player]").forEach((button) => {
    button.addEventListener("click", () => {
      const playerId = uuidOrNull(button.dataset.linkSessionSheetPlayer);
      const campaign = currentCampaign();
      const sessionSheets = sheetsLinkedToCampaign(campaign).filter((sheet) => sheetOrigin(sheet) === "sessao");
      const target = sessionSheets.find((sheet) => !uuidOrNull(sheet.responsavelId || sheet.responsavel_id)) || sessionSheets[0];
      if (!playerId || !target) {
        setSyncStatus("Nenhuma ficha da sessao disponivel para vincular.", true);
        return;
      }
      state.pendingResponsibleSheetId = target.id;
      renderTableSheetsPanel();
      const select = els.tableSheetsPanel?.querySelector(`[data-responsible-target="${selectorEscape(target.id)}"]`);
      if (select) select.value = playerId;
      setSyncStatus(`Escolha a ficha da sessao para vincular a ${playerNameById(playerId)}.`);
    });
  });
  root.querySelectorAll("[data-table-open-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeSheetId = button.dataset.tableOpenSheet;
      masterInventorySheetId = state.activeSheetId;
      renderAll();
    });
  });
  root.querySelectorAll("[data-session-sheet-lock]").forEach((button) => {
    button.addEventListener("click", () => toggleSessionSheetLock(button.dataset.sessionSheetLock));
  });
  root.querySelectorAll("[data-session-sheet-migrate]").forEach((button) => {
    button.addEventListener("click", () => migrateSessionSheetToPlayer(button.dataset.sessionSheetMigrate));
  });
  root.querySelectorAll("[data-confirm-session-migration]").forEach((button) => {
    button.addEventListener("click", () => {
      const select = root.querySelector(`[data-migration-target="${selectorEscape(button.dataset.confirmSessionMigration)}"]`);
      migrateSessionSheetToPlayer(button.dataset.confirmSessionMigration, select?.value || "");
    });
  });
  root.querySelector("[data-cancel-session-migration]")?.addEventListener("click", () => {
    state.pendingMigrationSheetId = null;
    renderAll();
  });
  root.querySelectorAll("[data-change-responsible]").forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingResponsibleSheetId = button.dataset.changeResponsible;
      renderAll();
    });
  });
  root.querySelectorAll("[data-confirm-responsible-change]").forEach((button) => {
    button.addEventListener("click", () => {
      const select = root.querySelector(`[data-responsible-target="${selectorEscape(button.dataset.confirmResponsibleChange)}"]`);
      changeSessionSheetResponsible(button.dataset.confirmResponsibleChange, select?.value || "");
    });
  });
  root.querySelector("[data-cancel-responsible-change]")?.addEventListener("click", () => {
    state.pendingResponsibleSheetId = null;
    renderAll();
  });
  root.querySelectorAll("[data-remove-session-sheet]").forEach((button) => {
    button.addEventListener("click", () => removeSessionSheetFromCampaign(button.dataset.removeSessionSheet));
  });
  root.querySelectorAll("[data-request-ready-sheet]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await requestReadySheetForCampaign(button.dataset.requestReadySheet);
        renderAll();
      } catch (error) {
        setSyncStatus(error.message, true);
      }
    });
  });
  root.querySelectorAll("[data-accept-sheet-request]").forEach((button) => {
    button.addEventListener("click", () => reviewSheetRequest(button.dataset.acceptSheetRequest, "aceita"));
  });
  root.querySelectorAll("[data-reject-sheet-request]").forEach((button) => {
    button.addEventListener("click", () => reviewSheetRequest(button.dataset.rejectSheetRequest, "recusada"));
  });
}

function fillSheet(sheet) {
  const safeSheet = normalizeSheet(sheet);
  Object.entries(safeSheet).forEach(([key, value]) => {
    const fieldId = { id: "sheetId", role: "sheetRole" }[key] || key;
    const field = document.querySelector(`#${fieldId}`);
    if (field) field.value = value;
  });
  state.activeSheetId = safeSheet.id;
  save();
}

function clearSheetForm() {
  els.sheetForm.reset();
  document.querySelector("#sheetId").value = "";
  ["agi", "str", "int", "pre", "vig"].forEach((id) => (document.querySelector(`#${id}`).value = 1));
  document.querySelector("#movement").value = 9;
  document.querySelector("#peRound").value = 1;
  document.querySelector("#hp").value = 16;
  document.querySelector("#hpMax").value = 16;
  document.querySelector("#pe").value = 2;
  document.querySelector("#peMax").value = 2;
  document.querySelector("#san").value = 12;
  document.querySelector("#sanMax").value = 12;
  document.querySelector("#defense").value = 10;
  document.querySelector("#block").value = 0;
  document.querySelector("#dodge").value = 0;
}

function saveSheet(event) {
  event.preventDefault();
  const id = document.querySelector("#sheetId").value || crypto.randomUUID();
  const existingSheet = state.sheets.find((item) => item.id === id);
  const user = currentUser();
  if (!existingSheet && user) {
    user.sheetIds = user.sheetIds || [];
    if (user.sheetIds.length >= 5) {
      window.alert("Limite de 5 fichas por conta atingido.");
      return;
    }
  }
  const sheet = {
    ...normalizeSheet(existingSheet || {}),
    id,
    player: existingSheet?.player || user?.username || "Local",
    name: document.querySelector("#sheetName").value.trim(),
    role: document.querySelector("#sheetRole").value.trim(),
    className: document.querySelector("#className").value.trim(),
    pathName: document.querySelector("#pathName").value.trim(),
    nex: document.querySelector("#nex").value.trim(),
    rank: document.querySelector("#rank").value.trim(),
    movement: Number(document.querySelector("#movement").value),
    peRound: Number(document.querySelector("#peRound").value),
    hp: Number(document.querySelector("#hp").value),
    hpMax: Number(document.querySelector("#hpMax").value),
    pe: Number(document.querySelector("#pe").value),
    peMax: Number(document.querySelector("#peMax").value),
    san: Number(document.querySelector("#san").value),
    sanMax: Number(document.querySelector("#sanMax").value),
    defense: Number(document.querySelector("#defense").value),
    block: Number(document.querySelector("#block").value),
    dodge: Number(document.querySelector("#dodge").value),
    agi: Number(document.querySelector("#agi").value),
    str: Number(document.querySelector("#str").value),
    int: Number(document.querySelector("#int").value),
    pre: Number(document.querySelector("#pre").value),
    vig: Number(document.querySelector("#vig").value),
    skills: document.querySelector("#skills").value.trim(),
    attacks: document.querySelector("#attacks").value.trim(),
    notes: document.querySelector("#notes").value.trim()
  };
  const existing = state.sheets.findIndex((item) => item.id === sheet.id);
  if (existing >= 0) state.sheets[existing] = sheet;
  else {
    state.sheets.unshift(sheet);
    if (user) user.sheetIds = Array.from(new Set([...(user.sheetIds || []), sheet.id]));
  }
  state.activeSheetId = sheet.id;
  clearSheetForm();
  localOnlyRender();
  queueSheetPatch(sheet, "full", 200);
}

function normalizeSheet(sheet) {
  const system = systemFor(sheet.payload?.sistema_regra || sheet.payload?.sistemaRegra || sheet.sistemaRegra || sheet.sistema_regra || sheet.system || "arquivo");
  const dnd = sheet.dnd || {};
  return {
    id: sheet.id || crypto.randomUUID(),
    user_id: uuidOrNull(sheet.user_id || sheet.userId),
    owner_id: uuidOrNull(sheet.owner_id || sheet.ownerId),
    ownerId: uuidOrNull(sheet.ownerId || sheet.owner_id),
    responsavel_id: uuidOrNull(sheet.responsavel_id || sheet.responsavelId),
    responsavelId: uuidOrNull(sheet.responsavelId || sheet.responsavel_id),
    campanha_id: uuidOrNull(sheet.campanha_id || sheet.campanhaId),
    campanhaId: uuidOrNull(sheet.campanhaId || sheet.campanha_id),
    origem: sheet.origem || sheet.origin || "jogador",
    fichaCategoria: sheet.fichaCategoria || sheet.ficha_categoria || "Personagem",
    edit_locked: sheet.edit_locked === true || sheet.editLocked === true,
    editLocked: sheet.editLocked === true || sheet.edit_locked === true,
    edit_allowed_by_master: sheet.edit_allowed_by_master === true || sheet.editAllowedByMaster === true,
    editAllowedByMaster: sheet.editAllowedByMaster === true || sheet.edit_allowed_by_master === true,
    download_allowed: sheet.download_allowed === true || sheet.downloadAllowed === true,
    downloadAllowed: sheet.downloadAllowed === true || sheet.download_allowed === true,
    migrada: sheet.migrada === true || sheet.migrated === true,
    migrated_to_personagem_id: uuidOrNull(sheet.migrated_to_personagem_id || sheet.migratedToPersonagemId),
    migratedToPersonagemId: uuidOrNull(sheet.migratedToPersonagemId || sheet.migrated_to_personagem_id),
    sistemaRegra: system.id,
    sistema_regra: system.id,
    fichaTipo: sheet.fichaTipo || sheet.ficha_tipo || system.ficha,
    portrait: sheet.portrait || "",
    name: sheet.name || "",
    player: sheet.player || "Local",
    role: sheet.role || "",
    className: sheet.className || "",
    pathName: sheet.pathName || "",
    nex: sheet.nex || "",
    rank: sheet.rank || "",
    movement: numberOr(sheet.movement, dnd.deslocamento || 9),
    peRound: numberOr(sheet.peRound, 1),
    loadLimit: numberOr(sheet.loadLimit, Math.max(1, Number(sheet.str || 1) * 5)),
    currentLoad: numberOr(sheet.currentLoad, 0),
    hp: numberOr(sheet.hp, dnd.pv || 16),
    hpMax: numberOr(sheet.hpMax, dnd.pvMax || sheet.hp || 16),
    pe: numberOr(sheet.pe, 2),
    peMax: numberOr(sheet.peMax, sheet.pe || 2),
    san: numberOr(sheet.san, 12),
    sanMax: numberOr(sheet.sanMax, sheet.san || 12),
    defense: numberOr(sheet.defense, dnd.ca || sheet.ac || 10),
    block: numberOr(sheet.block, 0),
    dodge: numberOr(sheet.dodge, 0),
    agi: attrOr(sheet.agi, sheet.dex ? Math.max(1, Math.round(sheet.dex / 5)) : 1),
    str: attrOr(sheet.str, 1),
    int: attrOr(sheet.int, 1),
    pre: attrOr(sheet.pre, sheet.cha ? Math.max(1, Math.round(sheet.cha / 5)) : 1),
    vig: attrOr(sheet.vig, sheet.con ? Math.max(1, Math.round(sheet.con / 5)) : 1),
    dnd: {
      ...dnd,
      classe: dnd.classe || sheet.className || "",
      raca: dnd.raca || sheet.role || "Humano",
      antecedente: dnd.antecedente || "",
      alinhamento: dnd.alinhamento || "",
      experiencia: numberOr(dnd.experiencia, 0),
      nivel: numberOr(dnd.nivel, Number.parseInt(sheet.nex, 10) || 1),
      forca: numberOr(dnd.forca, 10),
      destreza: numberOr(dnd.destreza, 10),
      constituicao: numberOr(dnd.constituicao, 10),
      inteligencia: numberOr(dnd.inteligencia, 10),
      sabedoria: numberOr(dnd.sabedoria, 10),
      carisma: numberOr(dnd.carisma, 10),
      pv: numberOr(dnd.pv, sheet.hp || 10),
      pvMax: numberOr(dnd.pvMax, sheet.hpMax || sheet.hp || 10),
      pvTemporario: numberOr(dnd.pvTemporario, 0),
      ca: numberOr(dnd.ca, sheet.defense || 10),
      armorBase: numberOr(dnd.armorBase, 10),
      dexLimit: dnd.dexLimit ?? "",
      shieldBonus: numberOr(dnd.shieldBonus, 0),
      acBonus: numberOr(dnd.acBonus, 0),
      initiativeBonus: numberOr(dnd.initiativeBonus, 0),
      deslocamento: numberOr(dnd.deslocamento, sheet.movement || 9),
      hitDie: numberOr(dnd.hitDie, DND_HIT_DICE[dnd.classe || sheet.className] || 8),
      hitDiceUsed: numberOr(dnd.hitDiceUsed, 0),
      deathSuccess: numberOr(dnd.deathSuccess, 0),
      deathFailure: numberOr(dnd.deathFailure, 0),
      inspiration: Boolean(dnd.inspiration),
      proficientSaves: dnd.proficientSaves || {},
      proficientSkills: dnd.proficientSkills || {},
      expertiseSkills: dnd.expertiseSkills || {},
      skillBonus: dnd.skillBonus || {},
      saveBonus: dnd.saveBonus || {},
      proficiencias: dnd.proficiencias || sheet.skills || "",
      equipamentos: dnd.equipamentos || sheet.inventory || "",
      magias: dnd.magias || sheet.rituals || "",
      anotacoes: dnd.anotacoes || sheet.notes || "",
      ataques: dnd.ataques || sheet.attacks || "",
      tracos: dnd.tracos || sheet.abilities || "",
      idiomas: dnd.idiomas || "",
      personalidade: dnd.personalidade || sheet.personality || "",
      ideais: dnd.ideais || "",
      vinculos: dnd.vinculos || "",
      defeitos: dnd.defeitos || "",
      tesouro: dnd.tesouro || "",
      spellcastingAbility: dnd.spellcastingAbility || "carisma",
      spellSaveDcBonus: numberOr(dnd.spellSaveDcBonus, 0),
      spellAttackBonusExtra: numberOr(dnd.spellAttackBonusExtra, 0),
      spellSlots: dnd.spellSlots || {},
      spellSlotsUsed: dnd.spellSlotsUsed || {},
      magiasPreparadas: dnd.magiasPreparadas || ""
    },
    skills: sheet.skills || "",
    skillMods: sheet.skillMods || {},
    attacks: sheet.attacks || "",
    abilities: sheet.abilities || "",
    rituals: sheet.rituals || "",
    inventory: sheet.inventory || "",
    itemImages: sheet.itemImages || {},
    notes: sheet.notes || "",
    appearance: sheet.appearance || "",
    personality: sheet.personality || "",
    history: sheet.history || "",
    objective: sheet.objective || ""
  };
}

function numberOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function attrOr(value, fallback) {
  const number = numberOr(value, fallback);
  return Math.max(0, Math.min(6, number));
}

function rollFormula(formula) {
  const clean = formula.replace(/\s+/g, "").toLowerCase();
  if (!/^[\dd+\-%]+$/.test(clean)) throw new Error("Use algo como 1d20+3, 2d6 ou 1d%.");
  const parts = clean.match(/[+\-]?[^+\-]+/g) || [];
  const allowedSides = new Set([4, 6, 8, 10, 12, 20, 100]);
  const dice = [];
  let modifier = 0;

  parts.forEach((part) => {
    const sign = part.startsWith("-") ? -1 : 1;
    const body = part.replace(/^[+\-]/, "");
    if (body.includes("d")) {
      const [amountText, sidesText] = body.split("d");
      const amount = clamp(Number(amountText || 1), 1, 20);
      const sides = sidesText === "%" ? 100 : Number(sidesText);
      if (!allowedSides.has(sides)) throw new Error("Dados permitidos: d4, d6, d8, d10, d12, d20 e d%.");
      const rolls = Array.from({ length: amount }, () => Math.floor(Math.random() * sides) + 1);
      rolls.forEach((value) => dice.push({ value: sign * value, face: value, sides, sign }));
    } else {
      const value = Number(body);
      if (!Number.isFinite(value)) throw new Error("Formula invalida.");
      modifier += sign * value;
    }
  });

  if (!dice.length) throw new Error("Inclua pelo menos um dado.");
  const positiveD20 = dice.filter((die) => die.sides === 20 && die.sign > 0);
  const seed = dice.reduce((sum, die) => sum + die.face + die.sides, modifier);

  if (positiveD20.length) {
    const rolls = positiveD20.map((die) => die.face);
    const highest = Math.max(...rolls);
    const ones = rolls.filter((value) => value === 1).length;
    const hasTwenty = rolls.includes(20);
    const critical = hasTwenty && ones === 0;
    const criticalFailure = rolls.length === 1 ? rolls[0] === 1 : ones >= 2;
    const cancelledCritical = hasTwenty && ones > 0 && !criticalFailure;
    const total = highest + modifier;
    const narrative = critical
      ? "sucesso critico"
      : criticalFailure
        ? "falha critica"
        : cancelledCritical
          ? "sucesso normal; o 1 anulou o critico"
          : ones === 1 && rolls.length > 1
            ? "teste normal, possivel complicacao"
            : "teste normal";
    return {
      formula: clean.replace(/d100/g, "d%"),
      total,
      seed,
      displayTotal: String(total),
      detail: `Rolagem: ${rolls.join(", ")} | Maior dado: ${highest} | Bonus: ${formatSigned(modifier)} | Resultado final: ${total} | ${narrative}`,
      dice,
      rollMode: "d20-test",
      rolls,
      highest,
      bonus: modifier,
      finalTotal: total,
      narrative
    };
  }

  const rollGroups = dice.reduce((groups, die) => {
    const key = `d${die.sides === 100 ? "%" : die.sides}`;
    groups[key] = groups[key] || [];
    groups[key].push(die.face);
    return groups;
  }, {});
  const rollText = Object.entries(rollGroups).map(([key, values]) => `${key}: ${values.join(", ")}`).join(" | ");
  const displayTotal = modifier ? `${rollText} | Bonus ${formatSigned(modifier)}` : rollText;
  return {
    formula: clean.replace(/d100/g, "d%"),
    total: seed,
    seed,
    displayTotal,
    detail: `Resultados separados: ${displayTotal}`,
    dice,
    rollMode: "open-roll",
    rolls: dice.map((die) => die.face),
    bonus: modifier,
    narrative: "resultados mantidos separados"
  };
}

function performRoll(formula) {
  try {
    const result = rollFormula(formula);
    if (els.crtFormula) els.crtFormula.value = result.formula;
    switchTab("mesa");
    playDiceSound(result);
    animateDiceRoll(result);
    window.setTimeout(() => {
      els.rollResult.classList.remove("roll-result-pulse", "roll-critical", "roll-fumble", "roll-cancelled");
      void els.rollResult.offsetWidth;
      els.rollResult.classList.add("roll-result-pulse", rollSpecialClass(result) || "roll-normal");
      els.rollResult.textContent = result.rollMode === "d20-test" ? `Resultado final: ${result.finalTotal}` : result.displayTotal;
      els.rollResult.title = `${result.formula} | ${result.detail}`;
    }, 460);
    state.rolls.unshift({ ...result, id: crypto.randomUUID(), at: new Date().toLocaleTimeString("pt-BR") });
    state.rolls = state.rolls.slice(0, 12);
    renderRollLog();
    save();
  } catch (error) {
    els.rollResult.textContent = error.message;
    els.rollResult.title = "Corrija a formula e clique para tentar de novo.";
  }
}

function currentRollFormula() {
  const crt = els.crtFormula?.value;
  const quick = document.querySelector("#quickFormula")?.value;
  const full = document.querySelector("#diceFormula")?.value;
  return String(crt || quick || full || "1d20").trim() || "1d20";
}

function getDiceAudio() {
  if (!diceAudio) {
    diceAudio = new Audio("./assets/dice-roll.mp3");
    diceAudio.preload = "auto";
    diceAudio.volume = 0.72;
  }
  return diceAudio;
}

function playDiceSound(result = null) {
  try {
    const audio = getDiceAudio();
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0.72;
    audio.play().catch((error) => console.warn("[Audio] Som dos dados bloqueado pelo navegador.", error));
  } catch (error) {
    console.warn("[Audio] Nao consegui tocar o arquivo de dados.", error);
  }
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  if (context.state === "suspended") context.resume().catch(() => {});
  const now = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
  gain.connect(context.destination);
  const special = rollSpecialClass(result);
  const frequencies = special === "roll-critical"
    ? [220, 330, 440, 660]
    : special === "roll-fumble"
      ? [150, 90, 70, 48]
      : special === "roll-cancelled"
        ? [240, 180, 240, 120]
        : [120, 170, 95, 210];
  frequencies.forEach((frequency, index) => {
    const osc = context.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(frequency, now + index * 0.045);
    osc.connect(gain);
    osc.start(now + index * 0.045);
    osc.stop(now + 0.1 + index * 0.06);
  });
  window.setTimeout(() => context.close(), 820);
}

function animateDiceRoll(result) {
  if (!els.diceStage) return;
  window.clearTimeout(diceClearTimer);
  els.diceStage.innerHTML = "";
  els.diceStage.className = `dice-stage ${rollSpecialClass(result)}`;
  const stageRect = els.diceStage.getBoundingClientRect();
  const width = Math.max(stageRect.width, 320);
  const height = Math.max(stageRect.height, 240);
  const visibleDice = result.dice.slice(0, 18);

  visibleDice.forEach((die, index) => {
    const node = document.createElement("div");
    const dieSize = die.sides <= 6 ? 46 : die.sides >= 12 ? 54 : 50;
    const startX = 20 + (index % 4) * 18;
    const startY = height - 82 - (index % 3) * 22;
    const endX = Math.max(24, Math.min(width - dieSize - 24, width * (0.34 + seededRandom(index, result.seed) * 0.42)));
    const endY = Math.max(22, Math.min(height - dieSize - 26, height * (0.2 + seededRandom(index + 11, result.seed) * 0.48)));
    node.className = `visual-die d${die.sides}`;
    node.dataset.die = die.sides === 100 ? "d%" : `d${die.sides}`;
    node.textContent = die.sign < 0 ? `-${die.face}` : die.face;
    node.style.setProperty("--die-size", `${dieSize}px`);
    node.style.setProperty("--start-x", `${startX}px`);
    node.style.setProperty("--start-y", `${startY}px`);
    node.style.setProperty("--end-x", `${endX - startX}px`);
    node.style.setProperty("--end-y", `${endY - startY}px`);
    node.style.setProperty("--spin-mid", `${420 + index * 61}deg`);
    node.style.setProperty("--spin-end", `${720 + index * 47}deg`);
    node.style.setProperty("--delay", `${index * 48}ms`);
    els.diceStage.append(node);
  });

  const specialClass = rollSpecialClass(result);
  if (specialClass) {
    const runes = document.createElement("div");
    runes.className = `roll-runes ${specialClass}`;
    runes.innerHTML = Array.from({ length: 10 }, (_, index) => `<i style="--rune-index:${index}"></i>`).join("");
    els.diceStage.append(runes);
  }

  diceClearTimer = window.setTimeout(() => {
    els.diceStage.innerHTML = "";
    els.diceStage.className = "dice-stage";
  }, 5000);
}

function rollSpecialClass(result) {
  if (result?.narrative === "sucesso critico") return "roll-critical";
  if (result?.narrative === "falha critica") return "roll-fumble";
  if (String(result?.narrative || "").includes("anulou")) return "roll-cancelled";
  return "";
}

function rollSpecialLabel(result) {
  if (result?.narrative === "sucesso critico") return "SUCESSO CRITICO";
  if (result?.narrative === "falha critica") return "FALHA CRITICA";
  if (String(result?.narrative || "").includes("anulou")) return "CRITICO ANULADO";
  return "";
}

function seededRandom(seed, salt) {
  const value = Math.sin(seed * 997 + salt * 37) * 10000;
  return value - Math.floor(value);
}

function renderRollLog() {
  els.rollLog.innerHTML = "";
  state.rolls.forEach((roll) => {
    const item = document.createElement("div");
    item.className = "log-item";
    item.innerHTML = `<strong>${escapeHtml(roll.displayTotal || roll.total)}</strong> em ${escapeHtml(roll.formula)}<br>${escapeHtml(roll.detail)}<br>${roll.at}`;
    els.rollLog.append(item);
  });
}

function playRps() {
  const choices = ["PEDRA", "PAPEL", "TESOURA"];
  const a = choices[Math.floor(Math.random() * choices.length)];
  const b = choices[Math.floor(Math.random() * choices.length)];
  const winner = a === b ? "empate" : (a === "PEDRA" && b === "TESOURA") || (a === "TESOURA" && b === "PAPEL") || (a === "PAPEL" && b === "PEDRA") ? "lado esquerdo vence" : "lado direito vence";
  switchTab("mesa");
  if (els.diceStage) {
    window.clearTimeout(diceClearTimer);
    els.diceStage.innerHTML = `
      <div class="rps-duel">
        <div><span>Investigador</span><b>${a}</b></div>
        <strong>${winner}</strong>
        <div><span>Oponente</span><b>${b}</b></div>
      </div>
    `;
    diceClearTimer = window.setTimeout(() => {
      els.diceStage.innerHTML = "";
      els.diceStage.className = "dice-stage";
    }, 5000);
  }
  if (els.rollResult) {
    els.rollResult.classList.remove("roll-result-pulse", "roll-critical", "roll-fumble", "roll-cancelled");
    void els.rollResult.offsetWidth;
    els.rollResult.classList.add("roll-result-pulse");
    els.rollResult.textContent = winner;
  }
  playDiceSound();
  state.rolls.unshift({
    id: crypto.randomUUID(),
    at: new Date().toLocaleTimeString("pt-BR"),
    formula: "pedra-papel-tesoura",
    displayTotal: winner,
    total: 0,
    detail: `Investigador: ${a} | Oponente: ${b}`,
    dice: [],
    rollMode: "rps"
  });
  state.rolls = state.rolls.slice(0, 12);
  renderRollLog();
  save();
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

async function saveCurrentFile() {
  save();
  try {
    await saveOnlineState();
  } catch (error) {
    setSyncStatus(`Arquivo local salvo. Falha online: ${error.message}`, true);
  }
  document.querySelectorAll("[data-save-file], #saveFileButton").forEach((button) => {
    const original = button.dataset.originalText || button.textContent;
    button.dataset.originalText = original;
    button.textContent = "Salvo";
    window.setTimeout(() => {
      button.textContent = button.dataset.originalText || original;
    }, 1100);
  });
}

function showLogin() {
  stopVoiceRoom();
  stopGridSync();
  stopRealtimeSync();
  clearCampaignTheme();
  document.querySelector("#loginScreen")?.classList.remove("hidden");
  document.querySelector("#portalScreen")?.classList.add("hidden");
  document.querySelector("#appShell")?.classList.add("hidden");
  document.body.classList.remove("sheet-area");
}

function showPortal() {
  stopGridSync();
  stopRealtimeSync();
  clearCampaignTheme();
  document.querySelector("#loginScreen")?.classList.add("hidden");
  document.querySelector("#portalScreen")?.classList.remove("hidden");
  document.querySelector("#appShell")?.classList.add("hidden");
  document.body.classList.remove("sheet-area");
  renderPortal();
}

function startBackgroundDataLoad(reason = "login") {
  const user = currentUser();
  if (backgroundLoadRunning || !supabaseClient() || !isOnlineUser(user)) return;
  backgroundLoadRunning = true;
  setSyncStatus("Carregando dados...");
  window.setTimeout(async () => {
    try {
      console.log("[Supabase] Carregamento em segundo plano", { reason, user_id: user.id });
      await loadOnlineWorkspace();
      renderPortal();
      if (!document.querySelector("#appShell")?.classList.contains("hidden")) renderAll();
      setSyncStatus("Dados carregados.");
    } catch (error) {
      console.error("[Supabase] Erro Supabase", { etapa: "carregamento em segundo plano", error });
      setSyncStatus(`Login feito. Alguns dados ainda nao carregaram: ${error.message}`, true);
    } finally {
      backgroundLoadRunning = false;
    }
  }, 0);
}

function showApp(mode = state.currentMode || "player") {
  state.currentMode = mode;
  applyCampaignTheme();
  document.querySelector("#loginScreen")?.classList.add("hidden");
  document.querySelector("#portalScreen")?.classList.add("hidden");
  document.querySelector("#appShell")?.classList.remove("hidden");
  document.body.classList.toggle("sheet-area", mode === "sheet");
  document.body.classList.toggle("master-view", mode === "master");
  document.body.classList.toggle("player-view", mode === "player" || mode === "sheet");
  if (mode === "master" || mode === "player") {
    const campaign = currentCampaign();
    const session = currentSession();
    if (campaign && session) {
      seedSessionTokensFromSheets(campaign, session);
      applySessionToTable(session);
    }
  }
  if (mode !== "master" && state.activeTab === "biblioteca") state.activeTab = "mesa";
  if (mode === "sheet") {
    const sheetTabs = activeCampaignSystemId() === "dnd5e" ? ["fichas", "inventario", "anotacoes"] : ["fichas", "inventario", "rituais", "anotacoes"];
    state.activeTab = sheetTabs.includes(state.activeTab) ? state.activeTab : "fichas";
  }
  renderAll();
  switchTab(state.activeTab || "mesa");
  if (state.activeTab === "mesa") window.setTimeout(fitGridToView, 60);
  updateGridSyncLoop(mode);
}

function systemOptionsHtml(selected = "arquivo") {
  const active = normalizeSystemId(selected);
  return Object.values(RPG_SYSTEMS).map((system) =>
    `<option value="${system.id}" ${system.id === active ? "selected" : ""}>${escapeHtml(system.nome)}</option>`
  ).join("");
}

function renderSystemSelectors() {
  ["#newCampaignSystem", "#newSheetSystem"].forEach((selector) => {
    const field = document.querySelector(selector);
    if (!field) return;
    const selected = field.value || "arquivo";
    field.innerHTML = systemOptionsHtml(selected);
  });
}

function renderSystemCards() {
  const container = document.querySelector("#systemCards");
  if (!container) return;
  container.innerHTML = Object.values(RPG_SYSTEMS).map((system) => `
    <article class="orbe-system-card ${system.cardClass}">
      <div>
        <span>${escapeHtml(system.abreviacao)}</span>
        <h3>${escapeHtml(system.nome)}</h3>
        <p>${escapeHtml(system.desc)}</p>
      </div>
      <button type="button" data-select-system="${escapeAttr(system.id)}">Selecionar</button>
    </article>
  `).join("");
  container.querySelectorAll("[data-select-system]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = normalizeSystemId(button.dataset.selectSystem);
      const campaignSelect = document.querySelector("#newCampaignSystem");
      const sheetSelect = document.querySelector("#newSheetSystem");
      if (campaignSelect) campaignSelect.value = id;
      if (sheetSelect) sheetSelect.value = id;
      setSyncStatus(`Sistema selecionado: ${systemFor(id).nome}.`);
    });
  });
}

function switchPortalPage(page = "inicio") {
  const safePage = ["inicio", "mesas", "fichas", "sistemas", "biblioteca"].includes(page) ? page : "inicio";
  state.portalPage = safePage;
  document.querySelectorAll("[data-portal-page]").forEach((section) => {
    section.classList.toggle("active", section.dataset.portalPage === safePage);
  });
  document.querySelectorAll("[data-portal-page-button]").forEach((button) => {
    const active = button.dataset.portalPageButton === safePage;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  const subtitles = {
    inicio: "Central de Criacao",
    mesas: "Mesas e campanhas",
    fichas: "Fichas de personagem",
    sistemas: "Sistemas de RPG",
    biblioteca: "Biblioteca do ORBE"
  };
  const subtitle = document.querySelector("#portalSubtitle");
  if (subtitle) subtitle.textContent = subtitles[safePage] || subtitles.inicio;
}

function renderPortalNavigation() {
  switchPortalPage(state.portalPage || "inicio");
}

function renderPortal() {
  const user = currentUser();
  const campaigns = document.querySelector("#portalCampaigns");
  const sheets = document.querySelector("#portalSheets");
  const badge = document.querySelector("#portalUserBadge");
  const limit = document.querySelector("#sheetLimitInfo");
  const inviteInput = document.querySelector("#inviteCode");
  if (!user) return;
  renderSystemSelectors();
  renderSystemCards();
  renderPortalNavigation();
  const inviteFromHash = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("convite");
  if (inviteInput && inviteFromHash && !inviteInput.value) inviteInput.value = inviteFromHash;
  if (badge) badge.textContent = `${user.username} | ${user.role === "admin" ? "ADM MASTER" : user.role === "master" ? "MESTRE" : "JOGADOR"}`;
  if (limit) limit.textContent = `Limite: ${(user.sheetIds || []).length}/5 fichas por conta.`;
  const visibleCampaigns = state.campaigns.filter((campaign) => campaign.mestreId === user.id || user.role === "admin" || (user.campaignIds || []).includes(campaign.id) || (campaign.jogadores || []).includes(user.id));
  if (campaigns) {
    campaigns.innerHTML = visibleCampaigns.length ? visibleCampaigns.map((campaign) => `
      <article class="archive-file-card">
        <b>${escapeHtml(campaign.nome)}</b>
        <p>${escapeHtml(systemFor(campaign.sistemaRegra).nome)} | ${campaign.mestreId === user.id || user.role === "admin" ? "Mestre" : "Jogador"}</p>
        <span>${campaign.sessoes.length} arquivo(s) | ${campaign.personagens?.length || 0} jogador(es) | Convite: ${escapeHtml(campaign.inviteCode)}</span>
        <small>${escapeHtml(campaignSheetNames(campaign) || "Nenhuma ficha vinculada ainda.")}</small>
        <div>
          ${campaign.mestreId === user.id || user.role === "admin" ? `<button type="button" data-portal-open="${escapeAttr(campaign.id)}" data-mode="master">Mestre</button>` : ""}
          <button type="button" data-portal-open="${escapeAttr(campaign.id)}" data-mode="player">Jogador</button>
          <button type="button" data-link-sheet="${escapeAttr(campaign.id)}">Solicitar ficha ativa</button>
          ${campaign.mestreId === user.id || user.role === "admin" ? `<button class="danger-action" type="button" data-delete-campaign="${escapeAttr(campaign.id)}">Excluir campanha</button>` : ""}
        </div>
      </article>
    `).join("") : `<p>Nenhuma campanha vinculada.</p>`;
  }
  if (sheets) {
    const owned = state.sheets.filter((sheet) => (user.sheetIds || []).includes(sheet.id));
    sheets.innerHTML = owned.length ? owned.map((sheet) => `
      <article class="archive-file-card">
        <b>${escapeHtml(sheet.name || "Agente")}</b>
        <p>${escapeHtml(systemFor(sheet.sistemaRegra).nome)} | ${escapeHtml(sheet.className || sheet.dnd?.classe || "Sem classe")} | ${escapeHtml(sheet.nex || "5%")}</p>
        <span>${state.activeSheetId === sheet.id ? "Ficha ativa" : `ID de ficha: ${escapeHtml(sheet.id.slice(0, 8))}`}</span>
        <small>${escapeHtml(sheetCampaignNames(sheet.id) || "Nao vinculada a campanha.")}</small>
        <div>
          <button type="button" data-portal-sheet="${escapeAttr(sheet.id)}">Usar ficha</button>
          <button type="button" data-open-sheet="${escapeAttr(sheet.id)}">Abrir ficha</button>
          <button type="button" data-delete-sheet="${escapeAttr(sheet.id)}">Apagar ficha</button>
        </div>
      </article>
    `).join("") : `<p>Nenhuma ficha criada.</p>`;
  }
  document.querySelectorAll("[data-portal-open]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeCampaignId = button.dataset.portalOpen;
      const campaign = currentCampaign();
      state.activeSessionId = campaign?.sessoes.find((session) => button.dataset.mode === "master" || session.visibleToPlayers)?.id || campaign?.sessoes[0]?.id || null;
      state.activeTab = "mesa";
      showApp(button.dataset.mode);
      refreshActiveCampaignFromSupabase({ rerender: true }).catch((error) => {
        setSyncStatus(`Nao consegui atualizar campanha online: ${error.message}`, true);
      });
    });
  });
  document.querySelectorAll("[data-link-sheet]").forEach((button) => {
    button.addEventListener("click", async () => {
      const campaign = state.campaigns.find((item) => item.id === button.dataset.linkSheet);
      try {
        if (!campaign) throw new Error("Campanha nao encontrada.");
        if (!state.activeSheetId) throw new Error("Escolha uma ficha antes de solicitar.");
        state.activeCampaignId = campaign.id;
        await requestReadySheetForCampaign(state.activeSheetId);
        renderPortal();
        save();
      } catch (error) {
        window.alert(error.message);
      }
    });
  });
  document.querySelectorAll("[data-portal-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeSheetId = button.dataset.portalSheet;
      renderPortal();
      save();
    });
  });
  document.querySelectorAll("[data-open-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeSheetId = button.dataset.openSheet;
      state.activeTab = "fichas";
      showApp("sheet");
    });
  });
  document.querySelectorAll("[data-delete-sheet]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!window.confirm("Apagar esta ficha salva?")) return;
      const id = button.dataset.deleteSheet;
      try {
        await deleteOnlineSheet(id);
        setSyncStatus("Ficha apagada do Supabase.");
      } catch (error) {
        setSyncStatus(`Ficha apagada localmente. Falha ao apagar online: ${error.message}`, true);
      }
      user.sheetIds = (user.sheetIds || []).filter((sheetId) => sheetId !== id);
      state.sheets = state.sheets.filter((sheet) => sheet.id !== id);
      state.campaigns.forEach((campaign) => {
        campaign.personagens = (campaign.personagens || []).filter((sheetId) => sheetId !== id);
        campaign.sessoes?.forEach((session) => {
          session.tokens = (session.tokens || []).filter((token) => token.sheetId !== id);
        });
      });
      if (state.activeSheetId === id) state.activeSheetId = user.sheetIds[0] || state.sheets[0]?.id || null;
      renderPortal();
      save();
    });
  });
  document.querySelectorAll("[data-delete-campaign]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.deleteCampaign;
      const campaign = state.campaigns.find((item) => item.id === id);
      if (!campaign) return;
      if (!window.confirm(`Excluir a campanha "${campaign.nome}"? As fichas dos jogadores serao mantidas.`)) return;
      try {
        button.disabled = true;
        button.textContent = "Excluindo...";
        await deleteOnlineCampaign(id);
        setSyncStatus("Campanha excluida do Supabase.");
      } catch (error) {
        setSyncStatus(`Campanha excluida localmente. Falha online: ${error.message}`, true);
      }
      user.campaignIds = (user.campaignIds || []).filter((campaignId) => campaignId !== id);
      state.campaigns = state.campaigns.filter((item) => item.id !== id);
      state.sheets = state.sheets.map((sheet) => normalizeSheet(sheet));
      if (state.activeCampaignId === id) {
        state.activeCampaignId = user.campaignIds[0] || state.campaigns[0]?.id || null;
        state.activeSessionId = currentCampaign()?.sessoes?.[0]?.id || null;
      }
      renderPortal();
      save();
      saveOnlineUser(user).catch((error) => console.warn("[Supabase] Nao consegui atualizar usuario apos exclusao.", error));
    });
  });
}

function campaignSheetNames(campaign) {
  return (campaign.personagens || [])
    .map((id) => {
      const sheet = state.sheets.find((item) => item.id === id);
      return sheet ? `${sheet.name || "Agente"} (${sheet.player || "Jogador"})` : "";
    })
    .filter(Boolean)
    .join(", ");
}

function sheetCampaignNames(sheetId) {
  return state.campaigns
    .filter((campaign) => (campaign.personagens || []).includes(sheetId))
    .map((campaign) => campaign.nome)
    .join(", ");
}

function setAuthError(message) {
  const error = document.querySelector("#loginError");
  if (error) error.textContent = message || "";
  if (message) console.warn("[Login]", message);
}

function setSignupError(message) {
  const error = document.querySelector("#signupError");
  if (error) error.textContent = message || "";
}

function setServerStatus(online, detail = "") {
  const badge = document.querySelector("#serverStatusBadge");
  if (!badge) return;
  const panel = badge.closest(".orbe-connection-panel");
  const detailNode = document.querySelector("#orbeConnectionDetail");
  panel?.classList.remove("orbe-orb-online", "orbe-orb-loading", "orbe-orb-error");
  panel?.classList.add(online ? "orbe-orb-online" : "orbe-orb-error");
  badge.classList.toggle("offline", !online);
  badge.textContent = online ? "ORBE ONLINE" : "Falha na conexao";
  if (detailNode) detailNode.textContent = online ? "Conexao estavel" : (detail || "Nao foi possivel alcancar o ORBE.");
  if (detail) badge.title = detail;
}

function setOrbeConnectionState(stateName, message = "") {
  const panel = document.querySelector(".orbe-connection-panel");
  const badge = document.querySelector("#serverStatusBadge");
  const detailNode = document.querySelector("#orbeConnectionDetail");
  if (!panel || !badge) return;
  panel.classList.remove("orbe-orb-online", "orbe-orb-loading", "orbe-orb-error");
  if (stateName === "online" || stateName === "granted") {
    panel.classList.add("orbe-orb-online");
    badge.classList.remove("offline");
    badge.textContent = stateName === "granted" ? "Acesso concedido" : "ORBE ONLINE";
    if (detailNode) detailNode.textContent = message || "Conexao estavel";
    return;
  }
  if (stateName === "error") {
    panel.classList.add("orbe-orb-error");
    badge.classList.add("offline");
    badge.textContent = "Erro de login";
    if (detailNode) detailNode.textContent = message || "Verifique usuario, senha ou conexao.";
    return;
  }
  panel.classList.add("orbe-orb-loading");
  badge.classList.remove("offline");
  badge.textContent = stateName === "checking" ? "Verificando credenciais..." : "Aguardando acesso";
  if (detailNode) detailNode.textContent = message || "Conexao com o ORBE em verificacao.";
}

async function updateServerStatus() {
  const client = supabaseClient();
  if (!client) {
    setServerStatus(false, "Supabase nao carregou.");
    return false;
  }
  try {
    const { error } = await client.from("usuarios").select("id").limit(1);
    if (error) throw error;
    console.log("[Supabase] Supabase conectado");
    setServerStatus(true, "Supabase conectado.");
    return true;
  } catch (error) {
    console.error("[Supabase] Erro Supabase", { table: "usuarios", error });
    setServerStatus(false, remoteErrorMessage(error));
    return false;
  }
}

async function recoverPasswordOnline() {
  const identifier = document.querySelector("#loginUser")?.value.trim() || window.prompt("Usuario ou email cadastrado:", "");
  if (!identifier) return;
  const newPassword = window.prompt("Nova senha para este acesso:", "");
  if (!newPassword) return;
  if (newPassword.length < 4) {
    setAuthError("A nova senha precisa ter pelo menos 4 caracteres.");
    return;
  }
  const client = supabaseClient();
  if (!client) {
    setAuthError("Servidor indisponivel. Nao foi possivel recuperar agora.");
    return;
  }
  try {
    const users = await safeSelect("usuarios", "*");
    const row = users.find((item) =>
      item.username?.toLowerCase() === identifier.toLowerCase() ||
      item.email?.toLowerCase() === identifier.toLowerCase()
    );
    if (!row) throw new Error("Usuario/email nao encontrado.");
    const account = userFromRow(row);
    account.passwordHash = await hashPassword(newPassword);
    await saveOnlineUser(account);
    setAuthError("Senha atualizada. Entre novamente com a nova senha.");
    console.log("[Supabase] Senha atualizada para usuario", { id: account.id, username: account.username });
  } catch (error) {
    console.error("[Supabase] Erro Supabase", { action: "recoverPassword", error });
    setAuthError(`Nao consegui recuperar senha: ${error.message}`);
  }
}

function showSignup() {
  document.querySelector("#signupModal")?.classList.remove("hidden");
  setSignupError("");
  const loginUser = document.querySelector("#loginUser")?.value || "";
  const signupUser = document.querySelector("#signupUser");
  if (signupUser && loginUser) signupUser.value = loginUser;
  signupUser?.focus();
}

function hideSignup() {
  document.querySelector("#signupModal")?.classList.add("hidden");
}

function ensureRitualsTab() {
  const inventoryTab = document.querySelector('[data-tab="inventario"]');
  if (inventoryTab && !document.querySelector('[data-tab="rituais"]')) {
    const ritualTab = document.createElement("button");
    ritualTab.className = "tab menu-button";
    ritualTab.dataset.tab = "rituais";
    ritualTab.type = "button";
    ritualTab.innerHTML = "<span>✦</span>Rituais";
    inventoryTab.insertAdjacentElement("afterend", ritualTab);
  }
  const inventoryView = document.querySelector("#inventario");
  if (inventoryView && !document.querySelector("#rituais")) {
    const view = document.createElement("section");
    view.id = "rituais";
    view.className = "view dossier-view";
    view.innerHTML = `
      <section class="paper-panel dossier-placeholder">
        <h2>Rituais</h2>
        <p>Rituais vinculados diretamente a ficha ativa.</p>
        <div id="ritualsApp" class="rituals-linked"></div>
      </section>
    `;
    inventoryView.insertAdjacentElement("afterend", view);
  }
}

function ensureSoundtrackStudioTab() {
  const anchorTab = document.querySelector('[data-tab="rituais"]') || document.querySelector('[data-tab="inventario"]');
  if (anchorTab && !document.querySelector('[data-tab="trilha-sonora"]')) {
    const tab = document.createElement("button");
    tab.className = "tab menu-button";
    tab.dataset.tab = "trilha-sonora";
    tab.type = "button";
    tab.innerHTML = "<span>♫</span>Trilha sonora";
    anchorTab.insertAdjacentElement("afterend", tab);
  }
  const anchorView = document.querySelector("#rituais") || document.querySelector("#inventario");
  if (anchorView && !document.querySelector("#trilha-sonora")) {
    const view = document.createElement("section");
    view.id = "trilha-sonora";
    view.className = "view dossier-view";
    view.innerHTML = `
      <section class="paper-panel dossier-placeholder">
        <h2>Trilha sonora</h2>
        <p>Biblioteca de musicas, ambiente e efeitos sonoros da sessao.</p>
        <div id="soundtrackLibraryApp" class="soundtrack-library-app"></div>
      </section>
    `;
    anchorView.insertAdjacentElement("afterend", view);
  }
}

function syncSystemTabs() {
  const isDnd = activeCampaignSystemId() === "dnd5e";
  const ritualTab = document.querySelector('[data-tab="rituais"]');
  const ritualView = document.querySelector("#rituais");
  if (ritualTab) {
    ritualTab.hidden = isDnd;
    ritualTab.style.display = isDnd ? "none" : "";
  }
  if (ritualView) {
    ritualView.hidden = isDnd;
    ritualView.style.display = isDnd ? "none" : "";
  }
  if (isDnd && state.activeTab === "rituais") state.activeTab = "inventario";
  const soundtrackTab = document.querySelector('[data-tab="trilha-sonora"]');
  const inventoryTab = document.querySelector('[data-tab="inventario"]');
  if (isDnd && soundtrackTab && inventoryTab && soundtrackTab.previousElementSibling !== inventoryTab) {
    inventoryTab.insertAdjacentElement("afterend", soundtrackTab);
  }
}

function switchTab(tabId) {
  if (tabId === "rituais" && activeCampaignSystemId() === "dnd5e") tabId = "inventario";
  if (tabId === "biblioteca" && !isMasterMode()) tabId = "mesa";
  state.activeTab = tabId;
  applyCampaignTheme();
  syncSystemTabs();
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabId));
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active-view", view.id === tabId));
  const activeSystem = activeCampaignSystemId();
  document.querySelector("#viewTitle").textContent = {
    mesa: activeSystem === "dnd5e" ? "Mapa de combate" : "Mapa de combate",
    fichas: activeSystem === "dnd5e" ? "Ficha do aventureiro" : "Ficha do agente",
    inventario: activeSystem === "dnd5e" ? "Equipamentos" : "Inventario",
    rituais: activeSystem === "dnd5e" ? "Magias" : "Rituais",
    "trilha-sonora": "Trilha sonora",
    anotacoes: "Anotacoes",
    missoes: "Missoes",
    biblioteca: "Arquivos da campanha",
    configuracoes: "Configuracoes",
    dados: "Rolador de dados"
  }[tabId] || "Arquivo";
  if (tabId === "rituais") renderRitualsView();
  if (tabId === "trilha-sonora") renderSoundtrackLibrary();
  window.archiveUI?.render(state);
  save();
}

ensureRitualsTab();
ensureSoundtrackStudioTab();

document.querySelectorAll("[data-tab]").forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

const loginForm = document.querySelector("#loginForm");
const loginSubmit = document.querySelector("#loginSubmit");

loginSubmit?.addEventListener("click", () => {
  console.log("Clique em Entrar detectado");
});

if (!loginForm) {
  console.error("Erro no login", new Error("Formulario de login nao encontrado."));
} else {
  console.log("Listener do login ativo");
}

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  console.log("Clique em Entrar detectado");
  setAuthError("");
  setOrbeConnectionState("checking", "Verificando credenciais...");
  try {
    try {
      await loginAccountOnline(document.querySelector("#loginUser").value, document.querySelector("#loginPassword").value);
    } catch (onlineError) {
      if (supabaseClient()) throw onlineError;
      console.warn("[Supabase] Login online falhou, tentando backup local.", onlineError);
      loginAccount(document.querySelector("#loginUser").value, document.querySelector("#loginPassword").value);
      setSyncStatus("Login local ativo. Supabase nao carregou este acesso.", true);
    }
    setAuthError("");
    setOrbeConnectionState("granted", "Acesso concedido. Abrindo seu portal.");
    showPortal();
    startBackgroundDataLoad("login");
  } catch (error) {
    console.error("Erro no login", error);
    setOrbeConnectionState("error", error.message || "Erro de login.");
    setAuthError(error.message || "Nao consegui entrar. Veja o console para detalhes.");
  }
});

document.querySelector("#createAccess")?.addEventListener("click", () => {
  showSignup();
});

document.querySelector("#toggleLoginPassword")?.addEventListener("click", () => {
  const input = document.querySelector("#loginPassword");
  const button = document.querySelector("#toggleLoginPassword");
  if (!input || !button) return;
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  button.textContent = showing ? "Mostrar" : "Ocultar";
});

document.querySelector("#recoverPassword")?.addEventListener("click", recoverPasswordOnline);

document.querySelector("#signupCancel")?.addEventListener("click", () => {
  hideSignup();
});

document.querySelector("#signupForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    try {
      await createAccountOnline(
        document.querySelector("#signupUser").value,
        document.querySelector("#signupEmail").value,
        document.querySelector("#signupPassword").value,
        document.querySelector("#signupConfirm").value
      );
    } catch (onlineError) {
      if (supabaseClient()) throw onlineError;
      console.warn("[Supabase] Criacao online falhou, criando backup local.", onlineError);
      createAccount(
        document.querySelector("#signupUser").value,
        document.querySelector("#signupEmail").value,
        document.querySelector("#signupPassword").value,
        document.querySelector("#signupConfirm").value
      );
      setSyncStatus(`Conta local criada. Rode a migracao/verifique Supabase: ${onlineError.message}`, true);
    }
    document.querySelector("#loginUser").value = document.querySelector("#signupUser").value;
    document.querySelector("#loginPassword").value = document.querySelector("#signupPassword").value;
    setAuthError("");
    setSignupError("");
    hideSignup();
    showPortal();
    startBackgroundDataLoad("criar_acesso");
  } catch (error) {
    setSignupError(error.message);
  }
});

document.querySelector("#inviteAccess")?.addEventListener("click", async () => {
  try {
    try {
      await loginAccountOnline(document.querySelector("#loginUser").value, document.querySelector("#loginPassword").value);
    } catch (onlineError) {
      if (supabaseClient()) throw onlineError;
      console.warn("[Supabase] Convite com login online falhou, tentando local.", onlineError);
      loginAccount(document.querySelector("#loginUser").value, document.querySelector("#loginPassword").value);
    }
    const code = window.prompt("Codigo do convite:", "");
    if (code) await joinCampaignWithInvite(code);
    setAuthError("");
    showPortal();
    startBackgroundDataLoad("convite");
  } catch (error) {
    setAuthError(`${error.message} Para entrar com convite, faca login ou crie acesso com email.`);
  }
});

document.querySelector("#logoutButton")?.addEventListener("click", () => {
  stopVoiceRoom();
  supabaseClient()?.auth?.signOut?.();
  state.currentUserId = null;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.warn("[Storage] Nao consegui limpar sessao leve.", error);
  }
  save();
  showLogin();
});

document.querySelector("#backPortal")?.addEventListener("click", () => {
  showPortal();
});

document.querySelectorAll("[data-portal-page-button], [data-portal-page-link]").forEach((button) => {
  button.addEventListener("click", () => {
    switchPortalPage(button.dataset.portalPageButton || button.dataset.portalPageLink);
  });
});

els.sidebarToggle?.addEventListener("click", () => {
  const shell = document.querySelector("#appShell");
  if (!shell) return;
  const collapsed = shell.classList.toggle("sidebar-collapsed");
  els.sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  els.sidebarToggle.textContent = collapsed ? "☰ Menu" : "× Fechar";
});

document.querySelector("#saveFileButton")?.addEventListener("click", saveCurrentFile);

document.querySelector("#createCampaignButton")?.addEventListener("click", async () => {
  try {
    const campaign = createCampaignForCurrentUser(
      document.querySelector("#newCampaignName").value.trim() || "Nova campanha",
      selectedSystemValue("#newCampaignSystem")
    );
    const user = currentUser();
    const now = new Date().toISOString();
    await upsertCampaignsOnline([campaignDatabaseRow(campaign, now, user)]);
    await saveOnlineUser(user);
    await upsertCampaignPlayerOnline(campaign.id, user?.id, "mestre", "ativo");
    await loadCampaignPlayersFromSupabase(campaign);
    saveLightSession();
    save();
    state.portalPage = "mesas";
    renderPortal();
  } catch (error) {
    window.alert(error.message);
  }
});

document.querySelector("#createSheetButton")?.addEventListener("click", async () => {
  try {
    const systemId = selectedSystemValue("#newSheetSystem");
    const defaultName = systemId === "dnd5e" ? "Novo aventureiro" : "Novo agente";
    createSheetForCurrentUser(
      document.querySelector("#newSheetName").value.trim() || defaultName,
      systemId
    );
    save();
    await saveOnlineState();
    state.activeTab = "fichas";
    state.portalPage = "fichas";
    showApp("sheet");
  } catch (error) {
    window.alert(error.message);
  }
});

document.querySelector("#joinCampaignButton")?.addEventListener("click", async () => {
  try {
    await joinCampaignWithInvite(document.querySelector("#inviteCode").value);
    save();
    state.portalPage = "mesas";
    renderPortal();
  } catch (error) {
    window.alert(error.message);
  }
});

document.querySelector("#portalRefreshCampaignButton")?.addEventListener("click", async () => {
  try {
    await refreshActiveCampaignFromSupabase({ rerender: false });
    renderPortal();
    setSyncStatus("Campanha atualizada no portal.");
  } catch (error) {
    setSyncStatus(`Nao consegui atualizar campanha online: ${error.message}`, true);
    window.alert(error.message);
  }
});

document.querySelector("#openMasterPanel")?.addEventListener("click", async () => {
  const campaign = currentCampaign() || state.campaigns[0];
  const user = currentUser();
  if (campaign && user && campaign.mestreId !== user.id && user.role !== "admin") {
    window.alert("Essa campanha pertence a outro mestre. Entre como jogador ou use uma campanha sua.");
    return;
  }
  if (campaign) {
    state.activeCampaignId = campaign.id;
    state.activeSessionId = campaign.sessoes[0]?.id || null;
  }
  state.activeTab = "mesa";
  try {
    await refreshActiveCampaignFromSupabase();
  } catch (error) {
    setSyncStatus(`Nao consegui atualizar campanha online: ${error.message}`, true);
  }
  showApp("master");
});

async function refreshCampaignAction() {
  try {
    await refreshActiveCampaignFromSupabase({ rerender: true });
  } catch (error) {
    setSyncStatus(`Nao consegui atualizar campanha online: ${error.message}`, true);
    window.alert(error.message);
  }
}

document.querySelector("#refreshCampaignButton")?.addEventListener("click", refreshCampaignAction);
document.querySelector("#topRefreshCampaignButton")?.addEventListener("click", refreshCampaignAction);

document.querySelector("#openPlayerPanel")?.addEventListener("click", () => {
  const campaign = currentCampaign() || state.campaigns[0];
  if (campaign) {
    state.activeCampaignId = campaign.id;
    state.activeSessionId = campaign.sessoes.find((session) => session.visibleToPlayers)?.id || campaign.sessoes[0]?.id || null;
  }
  state.activeTab = "mesa";
  showApp("player");
});

els.battlefield.addEventListener("dragover", (event) => event.preventDefault());
els.battlefield.addEventListener("drop", (event) => {
  event.preventDefault();
  const rect = els.battlefield.getBoundingClientRect();
  const cellSize = Number(getComputedStyle(document.documentElement).getPropertyValue("--cell-size").replace("px", ""));
  const x = clamp(Math.floor((event.clientX - rect.left + els.battlefield.parentElement.scrollLeft) / cellSize), 0, state.map.cols - 1);
  const y = clamp(Math.floor((event.clientY - rect.top + els.battlefield.parentElement.scrollTop) / cellSize), 0, state.map.rows - 1);
  const token = state.tokens.find((item) => item.id === event.dataTransfer.getData("text/plain"));
  if (canControlToken(token)) {
    state.selectedToken = token.id;
    moveSelectedToken(x, y);
  }
});
document.querySelector(".battlefield-wrap")?.addEventListener("mousedown", startMapPan);
window.addEventListener("mousemove", moveMapPan);
window.addEventListener("mouseup", stopMapPan);
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") isSpacePressed = true;
});
window.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    isSpacePressed = false;
    stopMapPan();
  }
});

document.querySelector("#resizeGrid")?.addEventListener("click", resizeGrid);
document.querySelector("#addToken")?.addEventListener("click", addToken);
document.querySelector("#quickResizeGrid")?.addEventListener("click", () => {
  if (!isMasterMode()) return;
  state.map.cols = clamp(Number(els.quickGridCols?.value || state.map.cols), 6, 100);
  state.map.rows = clamp(Number(els.quickGridRows?.value || state.map.rows), 6, 100);
  state.map.cellSize = clamp(Number(els.quickCellSize?.value || state.map.cellSize), 18, 64);
  state.map.gridOffsetX = clamp(Number(els.quickGridOffsetX?.value || 0), -100, 100);
  state.map.gridOffsetY = clamp(Number(els.quickGridOffsetY?.value || 0), -100, 100);
  state.map.gridOpacity = clamp(Number(els.quickGridOpacity?.value ?? state.map.gridOpacity), 0, 100);
  state.map.gridColor = els.quickGridColor?.value || state.map.gridColor;
  state.map.thickEvery = clamp(Number(els.quickThickEvery?.value ?? state.map.thickEvery), 0, 20);
  state.map.snap = els.quickSnap?.checked !== false;
  state.map.coordinates = els.quickCoordinates?.checked === true;
  if (els.gridCols) els.gridCols.value = state.map.cols;
  if (els.gridRows) els.gridRows.value = state.map.rows;
  state.tokens.forEach((token) => {
    token.x = Math.min(token.x, state.map.cols - 1);
    token.y = Math.min(token.y, state.map.rows - 1);
  });
  state.map.marks = (state.map.marks || []).filter((mark) => mark.x < state.map.cols && mark.y < state.map.rows);
  state.map.edges = (state.map.edges || []).filter((edge) => edge.x1 <= state.map.cols && edge.x2 <= state.map.cols && edge.y1 <= state.map.rows && edge.y2 <= state.map.rows);
  state.map.fog.revealed = (state.map.fog.revealed || []).filter((key) => {
    const [x, y] = key.split(",").map(Number);
    return x < state.map.cols && y < state.map.rows;
  });
  state.map.fog.visible = (state.map.fog.visible || []).filter((key) => {
    const [x, y] = key.split(",").map(Number);
    return x < state.map.cols && y < state.map.rows;
  });
  renderAll();
  markMapStructureChanged();
});
document.querySelector("#quickAddToken")?.addEventListener("click", () => {
  if (isMasterMode()) addToken("quick");
});
els.quickTokenScale?.addEventListener("input", () => {
  if (!isMasterMode()) return;
  state.map = normalizeMap({ ...state.map, tokenScale: Number(els.quickTokenScale.value) });
  renderAll();
});
document.querySelector("#quickAddNpc")?.addEventListener("click", () => {
  if (isMasterMode()) addNpcToken();
});
els.npcImage?.addEventListener("change", () => {
  const file = els.npcImage.files?.[0];
  if (!file) {
    pendingNpcPortrait = "";
    return;
  }
  if (!file.type.startsWith("image/")) {
    window.alert("Escolha uma imagem para o NPC.");
    els.npcImage.value = "";
    pendingNpcPortrait = "";
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    pendingNpcPortrait = reader.result || "";
  });
  reader.readAsDataURL(file);
});
els.mapTool?.addEventListener("change", () => {
  if (!isMasterMode()) return;
  pendingMapEdgeStart = null;
  state.map.tool = els.mapTool.value;
  renderAll();
});
els.fogEnabled?.addEventListener("change", () => {
  if (!isMasterMode()) return;
  state.map.fog = { ...defaultFog(), ...(state.map.fog || {}), enabled: els.fogEnabled.checked };
  if (state.map.fog.enabled && state.map.fog.mode === "vision") updateFogVisibilityFromTokens();
  renderAll();
});
els.fogMode?.addEventListener("change", () => {
  if (!isMasterMode()) return;
  state.map.fog = { ...defaultFog(), ...(state.map.fog || {}), enabled: true, mode: els.fogMode.value === "vision" ? "vision" : "manual" };
  if (state.map.fog.mode === "vision") updateFogVisibilityFromTokens();
  renderAll();
});
els.fogKeepExplored?.addEventListener("change", () => {
  if (!isMasterMode()) return;
  state.map.fog = { ...defaultFog(), ...(state.map.fog || {}), keepExplored: els.fogKeepExplored.checked };
  renderAll();
});
document.querySelector("#revealAllFog")?.addEventListener("click", () => {
  if (!isMasterMode()) return;
  state.map.fog = { ...defaultFog(), ...(state.map.fog || {}), enabled: true };
  const revealed = [];
  for (let y = 0; y < state.map.rows; y += 1) {
    for (let x = 0; x < state.map.cols; x += 1) revealed.push(cellKey(x, y));
  }
  state.map.fog.revealed = revealed;
  state.map.fog.visible = revealed;
  renderAll();
});
document.querySelector("#hideAllFog")?.addEventListener("click", () => {
  if (!isMasterMode()) return;
  state.map.fog = { ...defaultFog(), ...(state.map.fog || {}), enabled: true, revealed: [], visible: [] };
  renderAll();
});
document.querySelector("#revealByVision")?.addEventListener("click", () => {
  if (isMasterMode()) revealFogByTokenVision();
});
document.querySelector("#previewPlayerVision")?.addEventListener("click", () => {
  if (!isMasterMode()) return;
  mapPlayerPreview = !mapPlayerPreview;
  renderAll();
});
els.mapImageInput?.addEventListener("change", () => {
  if (isMasterMode()) uploadMapBackground(els.mapImageInput.files?.[0]);
});
document.querySelector("#fitMapImage")?.addEventListener("click", () => {
  if (isMasterMode()) fitMapBackground();
});
document.querySelector("#centerMapImage")?.addEventListener("click", () => {
  if (isMasterMode()) centerMapBackground();
});
document.querySelector("#fitGridToView")?.addEventListener("click", fitGridToView);
document.querySelector("#zoomOutGrid")?.addEventListener("click", () => zoomGrid(-6));
document.querySelector("#zoomInGrid")?.addEventListener("click", () => zoomGrid(6));
document.querySelector("#resetGridZoom")?.addEventListener("click", resetGridZoom);
document.querySelector("#centerTokenView")?.addEventListener("click", centerTokenView);
document.querySelector("#gridAssistantButton")?.addEventListener("click", () => toggleMapAssistant("guide"));
document.querySelector("#mapHelpButton")?.addEventListener("click", () => toggleMapAssistant("help"));
document.querySelector("#mapChecklistButton")?.addEventListener("click", () => toggleMapAssistant("checklist"));
window.addEventListener("resize", () => {
  if (state.activeTab === "mesa") window.setTimeout(fitGridToView, 80);
});
document.querySelector("#removeMapImage")?.addEventListener("click", () => {
  if (isMasterMode()) removeMapBackground();
});
document.querySelector("#lockMapImage")?.addEventListener("click", () => {
  if (!isMasterMode()) return;
  state.map = normalizeMap(state.map);
  state.map.background.locked = !state.map.background.locked;
  renderAll();
});
[
  [els.mapImageScaleX, "scaleX"],
  [els.mapImageScaleY, "scaleY"],
  [els.mapImageX, "x"],
  [els.mapImageY, "y"],
  [els.mapImageRotation, "rotation"],
  [els.mapImageOpacity, "opacity"]
].forEach(([input, field]) => {
  input?.addEventListener("input", () => {
    if (isMasterMode()) updateMapBackground(field, Number(input.value));
  });
});
document.querySelector("#clearMap")?.addEventListener("click", () => {
  if (!isMasterMode()) return;
  state.tokens = [];
  renderAll();
});
els.lightsOn?.addEventListener("change", () => {
  state.map.lightsOn = els.lightsOn.checked;
  renderAll();
});
els.darkness?.addEventListener("input", () => {
  state.map.darkness = Number(els.darkness.value);
  renderAll();
});
els.quickLightsOn?.addEventListener("change", () => {
  if (!isMasterMode()) return;
  state.map.lightsOn = els.quickLightsOn.checked;
  if (els.lightsOn) els.lightsOn.checked = state.map.lightsOn;
  renderAll();
});
els.quickDarkness?.addEventListener("input", () => {
  if (!isMasterMode()) return;
  state.map.darkness = Number(els.quickDarkness.value);
  if (els.darkness) els.darkness.value = state.map.darkness;
  renderAll();
});
document.querySelectorAll(".map-quick-tools details").forEach((details) => {
  details.addEventListener("toggle", () => {
    if (!details.open) return;
    document.querySelectorAll(".map-quick-tools details").forEach((other) => {
      if (other !== details) other.removeAttribute("open");
    });
  });
});
function closeMapQuickTools() {
  document.querySelectorAll(".map-quick-tools details[open]").forEach((details) => details.removeAttribute("open"));
}
document.addEventListener("pointerdown", (event) => {
  const quickTools = document.querySelector(".map-quick-tools");
  if (!quickTools || quickTools.contains(event.target)) return;
  closeMapQuickTools();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const hasOpenTool = Boolean(document.querySelector(".map-quick-tools details[open]"));
  if (!hasOpenTool) return;
  event.preventDefault();
  closeMapQuickTools();
});
els.sheetForm.addEventListener("submit", saveSheet);
els.chatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  sendChatMessage(els.chatText?.value || "");
});
els.voiceJoin?.addEventListener("click", toggleVoiceRoom);
els.voiceMute?.addEventListener("click", toggleVoiceMute);
els.voiceDeafen?.addEventListener("click", toggleVoiceDeafen);
els.voiceAttention?.addEventListener("click", () => sendVoiceEvent("attention"));
els.voiceRequestTalk?.addEventListener("click", () => sendVoiceEvent("request_talk"));
els.voiceMonitor?.addEventListener("click", toggleVoiceMonitor);
els.soundtrackForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  addSoundtrack(els.soundtrackUrl?.value || "");
});
els.soundtrackVolume?.addEventListener("input", () => {
  setSoundtrackVolume(els.soundtrackVolume.value, false);
});
els.soundtrackVolume?.addEventListener("change", () => {
  setSoundtrackVolume(els.soundtrackVolume.value, true);
});
els.soundtrackList?.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.playTrack) playSoundtrack(button.dataset.playTrack);
  if (button.dataset.removeTrack) removeSoundtrack(button.dataset.removeTrack);
});
els.soundtrackPlayer?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-soundtrack-command]");
  if (!button) return;
  const session = currentSession();
  const active = session?.soundtracks?.find((track) => track.active) || session?.soundtracks?.[0];
  sendSoundtrackCommand(button.dataset.soundtrackCommand, active?.id || "");
});
document.querySelector("#newSheet").addEventListener("click", clearSheetForm);
document.querySelector("#rollDice")?.addEventListener("click", () => performRoll(document.querySelector("#diceFormula")?.value || currentRollFormula()));
document.querySelector("#quickRoll")?.addEventListener("click", () => performRoll(document.querySelector("#quickFormula")?.value || currentRollFormula()));
els.crtDicePreset?.addEventListener("change", () => {
  if (els.crtFormula) els.crtFormula.value = els.crtDicePreset.value;
  if (els.rollResult) {
    els.rollResult.textContent = "Pronto para rolar.";
    els.rollResult.title = `Rolar ${els.crtDicePreset.value}`;
  }
});
els.rollResult?.addEventListener("click", () => performRoll(currentRollFormula()));
document.querySelector("#rpsButton")?.addEventListener("click", playRps);
document.querySelector("#clearRollLog")?.addEventListener("click", () => {
  state.rolls = [];
  if (els.diceStage) els.diceStage.innerHTML = "";
  renderRollLog();
  save();
});
document.querySelectorAll("[data-roll]").forEach((button) => {
  button.addEventListener("click", () => {
    if (els.crtFormula) els.crtFormula.value = button.dataset.roll;
    if (document.querySelector("#diceFormula")) document.querySelector("#diceFormula").value = button.dataset.roll;
    performRoll(button.dataset.roll);
  });
});

async function bootApp() {
  console.log("App iniciado");
  logSupabaseAvailability();
  load();
  if (state.activeTab === "configuracoes") state.activeTab = "mesa";
  if (!document.getElementById(state.activeTab)) state.activeTab = "mesa";
  await updateServerStatus();
  renderAll();
  if (state.currentUserId && currentUser()) {
    showPortal();
    startBackgroundDataLoad("sessao_salva");
  } else showLogin();
}

window.addEventListener("error", (event) => {
  console.error("Erro no login", event.error || event.message);
  if (!document.querySelector("#loginScreen")?.classList.contains("hidden")) {
    setAuthError(`Erro ao iniciar: ${event.error?.message || event.message}`);
  }
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Erro no login", event.reason);
  if (!document.querySelector("#loginScreen")?.classList.contains("hidden")) {
    setAuthError(`Erro ao conectar: ${event.reason?.message || event.reason}`);
  }
});

bootApp().catch((error) => {
  console.error("Erro no login", error);
  setAuthError(`Erro ao iniciar o app: ${error.message}`);
  showLogin();
});

