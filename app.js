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
  map: { name: "Base da equipe", cols: 16, rows: 12, darkness: 58, lightsOn: true, cellSize: 56, gridOpacity: 38, gridColor: "#debc79", background: defaultMapBackground(), fog: defaultFog(), marks: [], tool: "move" },
  tokens: [],
  sheets: [],
  rolls: [],
  selectedToken: null
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
  quickGridOpacity: document.querySelector("#quickGridOpacity"),
  quickGridColor: document.querySelector("#quickGridColor"),
  quickLightsOn: document.querySelector("#quickLightsOn"),
  quickDarkness: document.querySelector("#quickDarkness"),
  mapTool: document.querySelector("#mapTool"),
  fogEnabled: document.querySelector("#fogEnabled"),
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
  npcName: document.querySelector("#npcName"),
  npcColor: document.querySelector("#npcColor"),
  npcHp: document.querySelector("#npcHp"),
  npcType: document.querySelector("#npcType"),
  npcHidden: document.querySelector("#npcHidden"),
  lightsOn: document.querySelector("#lightsOn"),
  darkness: document.querySelector("#darkness"),
  sheetForm: document.querySelector("#sheetForm"),
  crisisSheet: document.querySelector("#crisisSheet"),
  sheetList: document.querySelector("#sheetList"),
  masterShield: document.querySelector("#masterShield"),
  missionsApp: document.querySelector("#missionsApp"),
  chatLog: document.querySelector("#chatLog"),
  chatForm: document.querySelector("#chatForm"),
  chatText: document.querySelector("#chatText"),
  syncStatus: document.querySelector("#syncStatus"),
  rollResult: document.querySelector("#rollResult"),
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

function load() {
  const saved = localStorage.getItem("mesa-arcana");
  if (saved) {
    Object.assign(state, JSON.parse(saved));
  } else {
    state.tokens = [];
    state.sheets = [];
  }
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

function createCampaignRecord(nome, mestreId) {
  const id = crypto.randomUUID();
  const campaignName = nome || "Campanha sem nome";
  const session = createSessionRecord(id, 1, "Arquivo inicial", "Arquivo aberto para a primeira sessao.", blankMap("Mapa inicial"));
  const inviteCode = `CAMP-${Math.floor(1000 + Math.random() * 9000)}`;
  return {
    id,
    nome: campaignName,
    mestreId,
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
    revealed: []
  };
}

function normalizeMap(map = {}) {
  const fog = { ...defaultFog(), ...(map.fog || {}) };
  return {
    name: map.name || "Mapa inicial",
    cols: clamp(Number(map.cols), 6, 30),
    rows: clamp(Number(map.rows), 6, 24),
    darkness: clamp(Number(map.darkness ?? 50), 0, 90),
    lightsOn: map.lightsOn !== false,
    cellSize: clamp(Number(map.cellSize ?? 56), 34, 88),
    gridOpacity: clamp(Number(map.gridOpacity ?? 38), 0, 100),
    gridColor: map.gridColor || "#debc79",
    background: { ...defaultMapBackground(), ...(map.background || {}) },
    fog: {
      enabled: fog.enabled === true,
      revealed: Array.isArray(fog.revealed) ? Array.from(new Set(fog.revealed)) : []
    },
    marks: Array.isArray(map.marks) ? map.marks.filter((mark) => Number.isFinite(Number(mark.x)) && Number.isFinite(Number(mark.y))).map((mark) => ({
      x: clamp(Number(mark.x), 0, Number(map.cols || 16) - 1),
      y: clamp(Number(mark.y), 0, Number(map.rows || 12) - 1),
      type: mark.type === "door" ? "door" : "wall",
      open: mark.open === true
    })) : [],
    tool: ["move", "reveal", "hide", "wall", "door", "erase"].includes(map.tool) ? map.tool : "move"
  };
}

function blankMap(name = "Mapa inicial") {
  return normalizeMap({ name, cols: 16, rows: 12, darkness: 50, lightsOn: true });
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

function supabaseClient() {
  return window.arquivosSupabase || null;
}

function setSyncStatus(message, isError = false) {
  if (els.syncStatus) {
    els.syncStatus.textContent = message;
    els.syncStatus.classList.toggle("sync-error", isError);
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

function upsertLocalAccount(account) {
  const safeAccount = {
    id: account.id,
    username: account.username || account.email || "agente",
    email: account.email || "",
    password: account.password || "",
    role: account.role || "player",
    sheetIds: Array.isArray(account.sheetIds) ? account.sheetIds : [],
    campaignIds: Array.isArray(account.campaignIds) ? account.campaignIds : [],
    online: account.online === true
  };
  const existing = state.accounts.findIndex((item) => item.id === safeAccount.id || item.email?.toLowerCase() === safeAccount.email.toLowerCase());
  if (existing >= 0) state.accounts[existing] = { ...state.accounts[existing], ...safeAccount };
  else state.accounts.push(safeAccount);
  return state.accounts.find((item) => item.id === safeAccount.id);
}

function normalizeCampaignRecord(campaign = {}) {
  const inviteCode = campaign.codigoConvite || campaign.codigo_convite || campaign.inviteCode || campaign.invite_code || `CAMP-${Math.floor(1000 + Math.random() * 9000)}`;
  const safe = {
    id: campaign.id || crypto.randomUUID(),
    nome: campaign.nome || campaign.name || "Campanha sem nome",
    mestreId: campaign.mestreId || campaign.owner_id || campaign.ownerId || "",
    jogadores: Array.isArray(campaign.jogadores) ? campaign.jogadores : [],
    personagens: Array.isArray(campaign.personagens) ? campaign.personagens : [],
    sessoes: Array.isArray(campaign.sessoes) && campaign.sessoes.length ? campaign.sessoes : [createSessionRecord(campaign.id || crypto.randomUUID(), 1, "Arquivo inicial", "Arquivo aberto para a primeira sessao.", blankMap("Mapa inicial"))],
    inviteCode,
    codigoConvite: inviteCode
  };
  safe.sessoes = safe.sessoes.map((session, index) => ({
    ...createSessionRecord(safe.id, index + 1, session.titulo || `Sessao ${index + 1}`, session.resumo || "", normalizeMap(session.mapa || session.map || blankMap(session.titulo || "Mapa inicial"))),
    ...session,
    campaignId: safe.id,
    numero: Number(session.numero || index + 1),
    codigoArquivo: session.codigoArquivo || formatArquivoNumber(Number(session.numero || index + 1)),
    mapa: normalizeMap(session.mapa || session.map || {}),
    tokens: Array.isArray(session.tokens) ? session.tokens : [],
    anotacoes: Array.isArray(session.anotacoes) ? session.anotacoes : [],
    pistas: Array.isArray(session.pistas) ? session.pistas : [],
    chat: Array.isArray(session.chat) ? session.chat : [],
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

  setSyncStatus("Criando acesso online...");
  const existingUsers = await safeSelect("usuarios", "id, username, email");
  if (existingUsers.some((account) => account.username?.toLowerCase() === cleanUser.toLowerCase())) throw new Error("Esse usuario ja existe.");
  if (existingUsers.some((account) => account.email?.toLowerCase() === cleanEmail)) throw new Error("Esse email ja esta cadastrado.");

  const { data, error } = await client.auth.signUp({
    email: cleanEmail,
    password,
    options: { data: { username: cleanUser } }
  });
  if (error) throw new Error(remoteErrorMessage(error));
  const userId = data.user?.id || crypto.randomUUID();
  const accountData = {
    id: userId,
    username: cleanUser,
    email: cleanEmail,
    role: "player",
    sheetIds: [],
    campaignIds: [],
    online: true
  };
  await saveOnlineUser(accountData);
  const account = upsertLocalAccount(accountData);
  state.currentUserId = account.id;
  await loadOnlineWorkspace();
  setSyncStatus("Acesso online criado.");
  return account;
}

async function loginAccountOnline(username, password) {
  const identifier = username.trim();
  const client = supabaseClient();
  if (!client) throw new Error("Supabase nao carregou.");
  setSyncStatus("Entrando online...");
  let email = identifier;
  let usernameLabel = identifier;
  if (!isValidEmail(identifier)) {
    const { data, error } = await client.from("usuarios").select("*").ilike("username", identifier).limit(1);
    if (error) throw new Error(remoteErrorMessage(error));
    const userRow = data?.[0];
    if (!userRow?.email) throw new Error("Usuario nao encontrado no Supabase.");
    email = userRow.email;
    usernameLabel = userRow.username || identifier;
  }

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(remoteErrorMessage(error));
  const authUser = data.user;
  const userRows = await safeSelect("usuarios", "*");
  const userRow = userRows.find((row) => row.id === authUser.id || row.email?.toLowerCase() === email.toLowerCase());
  const account = upsertLocalAccount({
    id: authUser.id,
    username: userRow?.username || authUser.user_metadata?.username || usernameLabel,
    email: authUser.email || email,
    role: userRow?.role || userRow?.payload?.role || "player",
    sheetIds: userRow?.sheet_ids || userRow?.payload?.sheetIds || [],
    campaignIds: userRow?.campaign_ids || userRow?.payload?.campaignIds || [],
    online: true
  });
  state.currentUserId = account.id;
  await loadOnlineWorkspace();
  setSyncStatus("Dados online carregados.");
  return account;
}

async function saveOnlineUser(user = currentUser()) {
  const client = supabaseClient();
  if (!client || !user || user.id === "admin-master") return;
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role || "player",
    sheet_ids: user.sheetIds || [],
    campaign_ids: user.campaignIds || [],
    payload: user,
    updated_at: new Date().toISOString()
  };
  const { error } = await client.from("usuarios").upsert(payload, { onConflict: "id" });
  if (error) throw new Error(`usuarios: ${remoteErrorMessage(error)}`);
}

async function loadOnlineWorkspace() {
  const client = supabaseClient();
  const user = currentUser();
  if (!client || !user || user.id === "admin-master") return;
  onlineLoadRunning = true;
  try {
    setSyncStatus("Carregando arquivos online...");
    const [campaignRows, sheetRows, inventoryRows, noteRows, rollRows] = await Promise.all([
      safeSelect("campanhas"),
      safeSelect("personagens"),
      safeSelect("inventario"),
      safeSelect("anotacoes"),
      safeSelect("rolagens")
    ]);

    const remoteCampaigns = campaignRows
      .map((row) => normalizeCampaignRecord({ ...(row.payload || {}), ...row }))
      .filter((campaign) => campaign.mestreId === user.id || campaign.jogadores.includes(user.id) || (user.campaignIds || []).includes(campaign.id) || user.role === "admin");
    const remoteSheets = sheetRows
      .map((row) => normalizeSheet(row.payload || row))
      .filter((sheet) => sheet.player === user.username || (user.sheetIds || []).includes(sheet.id) || sheetRows.some((row) => row.id === sheet.id && row.user_id === user.id));

    state.campaigns = mergeById(state.campaigns, remoteCampaigns).map(normalizeCampaignRecord);
    state.sheets = mergeById(state.sheets, remoteSheets).map(normalizeSheet);

    const onlineSheetIds = sheetRows.filter((row) => row.user_id === user.id).map((row) => row.id).filter(Boolean);
    user.sheetIds = mergeUnique([...(user.sheetIds || []), ...onlineSheetIds, ...remoteSheets.map((sheet) => sheet.id)]);
    const onlineCampaignIds = campaignRows
      .filter((row) => row.owner_id === user.id || row.mestre_id === user.id || row.payload?.mestreId === user.id || row.payload?.jogadores?.includes(user.id))
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

    if (!state.activeSheetId && user.sheetIds?.length) state.activeSheetId = user.sheetIds[0];
    if (!state.activeCampaignId && user.campaignIds?.length) state.activeCampaignId = user.campaignIds[0];
    const campaign = currentCampaign();
    if (campaign && !state.activeSessionId) state.activeSessionId = campaign.sessoes[0]?.id || null;
    syncCurrentSession();
    localStorage.setItem("mesa-arcana", JSON.stringify(state));
  } finally {
    onlineLoadRunning = false;
  }
}

function queueOnlineSave() {
  if (onlineLoadRunning) return;
  const user = currentUser();
  if (!supabaseClient() || !user || user.id === "admin-master") return;
  window.clearTimeout(onlineSaveTimer);
  onlineSaveTimer = window.setTimeout(() => {
    saveOnlineState().catch((error) => {
      setSyncStatus(`Backup local salvo. Supabase falhou: ${error.message}`, true);
    });
  }, 900);
}

function userCampaignsForSave(user) {
  if (!user) return [];
  return state.campaigns.filter((campaign) => campaign.mestreId === user.id || user.role === "admin" || (user.campaignIds || []).includes(campaign.id) || (campaign.jogadores || []).includes(user.id));
}

function userSheetsForSave(user) {
  if (!user) return [];
  return state.sheets.filter((sheet) => (user.sheetIds || []).includes(sheet.id));
}

function listItemsFromText(text) {
  return String(text || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function saveOnlineState() {
  const client = supabaseClient();
  const user = currentUser();
  if (!client || !user || user.id === "admin-master" || onlineSaveRunning) return;
  onlineSaveRunning = true;
  try {
    syncCurrentSession();
    await saveOnlineUser(user);
    const now = new Date().toISOString();
    const campaigns = userCampaignsForSave(user).map((campaign) => ({
      id: campaign.id,
      owner_id: campaign.mestreId,
      mestre_id: campaign.mestreId,
      nome: campaign.nome,
      invite_code: campaign.inviteCode,
      codigo_convite: campaign.codigoConvite || campaign.inviteCode,
      objetivo_atual: currentSession()?.mission || campaign.sessoes?.[0]?.mission || "",
      local_atual: state.map?.name || "",
      payload: normalizeCampaignRecord(campaign),
      updated_at: now
    }));
    const sheets = userSheetsForSave(user).map((sheet) => ({
      id: sheet.id,
      user_id: user.id,
      campanha_id: state.campaigns.find((campaign) => (campaign.personagens || []).includes(sheet.id))?.id || null,
      nome: sheet.name,
      payload: normalizeSheet(sheet),
      updated_at: now
    }));
    if (campaigns.length) {
      const { error } = await client.from("campanhas").upsert(campaigns, { onConflict: "id" });
      if (error) throw new Error(`campanhas: ${remoteErrorMessage(error)}`);
    }
    if (sheets.length) {
      const { error } = await client.from("personagens").upsert(sheets, { onConflict: "id" });
      if (error) throw new Error(`personagens: ${remoteErrorMessage(error)}`);
    }

    for (const sheet of userSheetsForSave(user)) {
      await client.from("inventario").delete().eq("personagem_id", sheet.id).eq("user_id", user.id);
      const items = listItemsFromText(sheet.inventory);
      if (items.length) {
        const { error } = await client.from("inventario").insert(items.map((name) => ({
          user_id: user.id,
          personagem_id: sheet.id,
          nome: name,
          payload: { name, inventoryText: sheet.inventory, stats: catalogStats[name] || null, savedAt: now },
          updated_at: now
        })));
        if (error) throw new Error(`inventario: ${remoteErrorMessage(error)}`);
      }
      await client.from("anotacoes").delete().eq("personagem_id", sheet.id).eq("user_id", user.id);
      if (sheet.notes || sheet.appearance || sheet.personality || sheet.history || sheet.objective) {
        const { error } = await client.from("anotacoes").insert({
          user_id: user.id,
          personagem_id: sheet.id,
          campanha_id: state.campaigns.find((campaign) => (campaign.personagens || []).includes(sheet.id))?.id || null,
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
        campanha_id: state.activeCampaignId,
        personagem_id: state.activeSheetId,
        formula: roll.formula,
        resultado: String(roll.displayTotal || roll.total || ""),
        payload: { ...roll, created_at: now },
        created_at: now
      })), { onConflict: "id" });
      if (error) throw new Error(`rolagens: ${remoteErrorMessage(error)}`);
    }
    setSyncStatus("Sincronizado com Supabase.");
  } finally {
    onlineSaveRunning = false;
  }
}

function createCampaignForCurrentUser(name) {
  const user = currentUser();
  if (!user) throw new Error("Faca login primeiro.");
  const campaign = createCampaignRecord(name || "Nova campanha", user.id);
  state.campaigns.push(campaign);
  user.role = user.role === "admin" ? "admin" : "master";
  user.campaignIds = Array.from(new Set([...(user.campaignIds || []), campaign.id]));
  state.activeCampaignId = campaign.id;
  state.activeSessionId = campaign.sessoes[0].id;
  addActiveSheetToCampaign(campaign);
  seedSessionTokensFromSheets(campaign, campaign.sessoes[0]);
  applySessionToTable(campaign.sessoes[0]);
  return campaign;
}

function createSheetForCurrentUser(name) {
  const user = currentUser();
  if (!user) throw new Error("Faca login primeiro.");
  user.sheetIds = user.sheetIds || [];
  if (user.sheetIds.length >= 5) throw new Error("Limite de 5 fichas por conta atingido.");
  const sheet = normalizeSheet(blankSheet(name || `Agente ${user.sheetIds.length + 1}`, user.username));
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
  setSyncStatus(`Buscando convite ${clean} no Supabase...`);
  const { data, error } = await client
    .from("campanhas")
    .select("*")
    .or(`codigo_convite.eq.${clean},invite_code.eq.${clean}`)
    .limit(1);
  if (error) {
    setSyncStatus(`Nao consegui buscar convite online: ${remoteErrorMessage(error)}`, true);
    return null;
  }
  const row = data?.[0];
  return row ? normalizeCampaignRecord({ ...(row.payload || {}), ...row }) : null;
}

async function joinCampaignWithInvite(code) {
  const user = currentUser();
  if (!user) throw new Error("Faca login primeiro.");
  const clean = normalizeInviteCode(code);
  if (!clean) throw new Error("Informe o codigo do convite.");
  let campaign = state.campaigns.find((item) => campaignMatchesInvite(item, clean));
  if (!campaign) {
    const onlineCampaign = await findCampaignByInviteOnline(clean);
    if (onlineCampaign) campaign = upsertLocalCampaign(onlineCampaign);
  }
  if (!campaign) throw new Error("Convite nao encontrado.");
  campaign.jogadores = Array.from(new Set([...(campaign.jogadores || []), user.id]));
  user.campaignIds = Array.from(new Set([...(user.campaignIds || []), campaign.id]));
  state.activeCampaignId = campaign.id;
  state.activeSessionId = campaign.sessoes.find((session) => session.visibleToPlayers)?.id || campaign.sessoes[0]?.id;
  linkActiveSheetToCampaign(campaign);
  await saveOnlineState();
  return campaign;
}

function linkActiveSheetToCampaign(campaign) {
  const sheet = activeUserSheet();
  if (!campaign) throw new Error("Campanha nao encontrada.");
  if (!sheet?.id) throw new Error("Crie ou selecione uma ficha antes de vincular.");
  addActiveSheetToCampaign(campaign);
  seedSessionTokensFromSheets(campaign, currentSession());
}

function addActiveSheetToCampaign(campaign) {
  const sheet = activeUserSheet();
  if (!campaign || !sheet?.id) return false;
  campaign.personagens = Array.from(new Set([...(campaign.personagens || []), sheet.id]));
  return true;
}

function sheetsLinkedToCampaign(campaign) {
  return (campaign?.personagens || [])
    .map((id) => state.sheets.find((sheet) => sheet.id === id))
    .filter(Boolean)
    .map(normalizeSheet);
}

function tokenFromSheet(sheet, index = 0) {
  return {
    id: crypto.randomUUID(),
    sheetId: sheet.id,
    name: sheet.name || `Agente ${index + 1}`,
    type: "player",
    label: sheet.className || "Personagem",
    color: index % 2 ? "#8b5cf6" : "#2f7ed8",
    light: inventoryVisionBonus(sheet),
    hidden: false,
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
  const text = normalizeKey(`${sheet.inventory || ""} ${sheet.notes || ""}`);
  if (text.includes("lanterna tatica")) return 6;
  if (text.includes("lanterna")) return 5;
  if (text.includes("sinalizador")) return 4;
  return 3;
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

function save() {
  syncCurrentSession();
  localStorage.setItem("mesa-arcana", JSON.stringify(state));
  queueOnlineSave();
}

function syncCurrentSession() {
  const session = currentSession();
  if (!session) return;
  session.mapa = { ...state.map };
  session.tokens = state.tokens.map((token) => ({ ...token }));
  session.logs = state.rolls.slice(0, 10);
}

function renderAll() {
  renderControls();
  renderGrid();
  renderTokenList();
  renderMasterShield();
  renderMissionsView();
  renderChatView();
  renderCrisisSheet();
  renderSheets();
  renderRollLog();
  renderInventoryView();
  renderNotesView();
  renderCampaignFiles();
  window.archiveUI?.render(state);
  save();
}

function renderControls() {
  state.map = normalizeMap(state.map);
  els.mapName.value = state.map.name;
  els.gridCols.value = state.map.cols;
  els.gridRows.value = state.map.rows;
  els.lightsOn.checked = state.map.lightsOn;
  els.darkness.value = state.map.darkness;
  if (els.quickGridCols) els.quickGridCols.value = state.map.cols;
  if (els.quickGridRows) els.quickGridRows.value = state.map.rows;
  if (els.quickCellSize) els.quickCellSize.value = state.map.cellSize;
  if (els.quickGridOpacity) els.quickGridOpacity.value = state.map.gridOpacity;
  if (els.quickGridColor) els.quickGridColor.value = state.map.gridColor;
  if (els.quickLightsOn) els.quickLightsOn.checked = state.map.lightsOn;
  if (els.quickDarkness) els.quickDarkness.value = state.map.darkness;
  if (els.mapTool) els.mapTool.value = state.map.tool || "move";
  if (els.fogEnabled) els.fogEnabled.checked = state.map.fog?.enabled === true;
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
  document.documentElement.style.setProperty("--cell-size", `${state.map.cellSize}px`);
  els.battlefield.style.setProperty("--cols", state.map.cols);
  els.battlefield.style.setProperty("--rows", state.map.rows);
  els.battlefield.style.setProperty("--darkness", state.map.darkness / 100);
  els.battlefield.style.setProperty("--grid-opacity", state.map.gridOpacity / 100);
  els.battlefield.style.setProperty("--grid-color", state.map.gridColor);
  els.battlefield.style.setProperty("--grid-line-color", hexToRgba(state.map.gridColor, state.map.gridOpacity / 100));
  els.battlefield.innerHTML = "";
  renderMapBackground();

  for (let y = 0; y < state.map.rows; y += 1) {
    for (let x = 0; x < state.map.cols; x += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = cellClass(x, y);
      cell.dataset.x = x;
      cell.dataset.y = y;
      const mark = mapMarkAt(x, y);
      if (mark) {
        cell.dataset.mark = mark.type;
        if (mark.open) cell.dataset.open = "true";
      }
      cell.addEventListener("click", () => handleMapCellClick(x, y));
      els.battlefield.append(cell);
    }
  }

  state.tokens.filter((token) => state.currentMode === "master" || !token.hidden).forEach((token) => {
    const piece = document.createElement("div");
    piece.className = `token${state.selectedToken === token.id ? " selected" : ""}${token.hidden ? " token-hidden" : ""}${token.type === "npc" ? " npc-token" : ""}`;
    piece.style.left = `calc(${token.x} * var(--cell-size))`;
    piece.style.top = `calc(${token.y} * var(--cell-size))`;
    piece.style.background = token.color;
    piece.style.color = token.color;
    piece.textContent = initials(token.name);
    piece.title = `${token.name} | luz ${token.light}${token.hidden ? " | invisivel" : ""}`;
    piece.draggable = true;
    piece.addEventListener("click", (event) => {
      event.stopPropagation();
      state.selectedToken = token.id;
      renderAll();
    });
    piece.addEventListener("dragstart", (event) => {
      state.selectedToken = token.id;
      event.dataTransfer.setData("text/plain", token.id);
    });
    els.battlefield.append(piece);
  });
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

function cellClass(x, y) {
  const classes = ["cell"];
  const mark = mapMarkAt(x, y);
  if (mark) classes.push(mark.type === "door" ? (mark.open ? "door-open" : "door-closed") : "wall-cell");
  if (state.map.fog?.enabled) {
    const revealed = isFogRevealed(x, y);
    if (!revealed && state.currentMode !== "master") classes.push("fog-hidden");
    if (!revealed && state.currentMode === "master") classes.push("fog-master");
    if (revealed) classes.push("fog-revealed");
  }
  if (!state.map.lightsOn) return classes.join(" ");
  const lit = state.tokens
    .filter((token) => state.currentMode === "master" || !token.hidden)
    .some((token) => distance(token.x, token.y, x, y) <= Number(token.light) && !isSightBlocked(token.x, token.y, x, y));
  classes.push(lit ? "lit" : "dark");
  return classes.join(" ");
}

function cellKey(x, y) {
  return `${x},${y}`;
}

function isFogRevealed(x, y) {
  return state.map.fog?.revealed?.includes(cellKey(x, y));
}

function mapMarkAt(x, y) {
  return state.map.marks?.find((mark) => mark.x === x && mark.y === y) || null;
}

function blocksSight(x, y) {
  const mark = mapMarkAt(x, y);
  return mark?.type === "wall" || (mark?.type === "door" && !mark.open);
}

function isSightBlocked(ax, ay, bx, by) {
  const cells = lineCells(ax, ay, bx, by).slice(1, -1);
  return cells.some(([x, y]) => blocksSight(x, y));
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

function revealFogAt(x, y, radius = 1) {
  state.map.fog = { ...defaultFog(), ...(state.map.fog || {}) };
  const revealed = new Set(state.map.fog.revealed || []);
  for (let yy = y - radius; yy <= y + radius; yy += 1) {
    for (let xx = x - radius; xx <= x + radius; xx += 1) {
      if (xx >= 0 && yy >= 0 && xx < state.map.cols && yy < state.map.rows) revealed.add(cellKey(xx, yy));
    }
  }
  state.map.fog.revealed = Array.from(revealed);
}

function hideFogAt(x, y, radius = 1) {
  state.map.fog = { ...defaultFog(), ...(state.map.fog || {}) };
  const hide = new Set();
  for (let yy = y - radius; yy <= y + radius; yy += 1) {
    for (let xx = x - radius; xx <= x + radius; xx += 1) hide.add(cellKey(xx, yy));
  }
  state.map.fog.revealed = (state.map.fog.revealed || []).filter((key) => !hide.has(key));
}

function handleMapCellClick(x, y) {
  const tool = state.map.tool || "move";
  if (tool === "move") {
    moveSelectedToken(x, y);
    return;
  }
  if (tool === "reveal") revealFogAt(x, y, 1);
  if (tool === "hide") hideFogAt(x, y, 1);
  if (tool === "wall") upsertMapMark(x, y, "wall");
  if (tool === "door") {
    const existing = mapMarkAt(x, y);
    if (existing?.type === "door") existing.open = !existing.open;
    else upsertMapMark(x, y, "door");
  }
  if (tool === "erase") {
    removeMapMark(x, y);
    hideFogAt(x, y, 0);
  }
  renderAll();
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
  if (!token) return;
  token.x = x;
  token.y = y;
  renderAll();
}

function renderTokenList() {
  els.tokenList.innerHTML = "";
  state.tokens.filter((token) => state.currentMode === "master" || !token.hidden).forEach((token) => {
    const row = document.createElement("div");
    row.className = `token-item${token.hidden ? " hidden-token-row" : ""}`;
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(token.name)}</strong>
        <small>${escapeHtml(token.label || (token.type === "npc" ? "NPC/Criatura" : "Personagem"))} | ${token.x + 1},${token.y + 1}${token.hidden ? " | invisivel" : ""}</small>
      </div>
      <span>PV ${escapeHtml(token.hp ?? "?")} / ${escapeHtml(token.hpMax ?? "?")}<br>Luz ${escapeHtml(token.light)}</span>
    `;
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "master-only";
    toggle.textContent = token.hidden ? "Mostrar" : "Ocultar";
    toggle.addEventListener("click", () => {
      token.hidden = !token.hidden;
      renderAll();
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "master-only";
    remove.textContent = "Remover";
    remove.addEventListener("click", () => {
      state.tokens = state.tokens.filter((item) => item.id !== token.id);
      renderAll();
    });
    row.append(toggle, remove);
    els.tokenList.append(row);
  });
}

function renderMasterShield() {
  if (!els.masterShield) return;
  const campaign = currentCampaign();
  const linked = sheetsLinkedToCampaign(campaign);
  if (!linked.length) {
    els.masterShield.innerHTML = `<p>Nenhuma ficha vinculada.</p>`;
    return;
  }
  els.masterShield.innerHTML = linked.map((sheet) => {
    const token = state.tokens.find((item) => item.sheetId === sheet.id);
    return `
      <article class="shield-agent">
        <b>${escapeHtml(sheet.name || "Agente")}</b>
        <span>${escapeHtml(sheet.className || "Sem classe")} | ${escapeHtml(sheet.nex || "5%")}</span>
        <div class="shield-bars">
          ${shieldBar("PV", sheet.hp, sheet.hpMax, "#a82924")}
          ${shieldBar("PE", sheet.pe, sheet.peMax, "#d08a22")}
          ${shieldBar("SAN", sheet.san, sheet.sanMax, "#7c3bd1")}
        </div>
        <small>Def ${escapeHtml(sheet.defense ?? 10)} | Luz ${escapeHtml(token?.light ?? inventoryVisionBonus(sheet))} | ${token ? `Token ${token.x + 1},${token.y + 1}` : "Sem token"}</small>
      </article>
    `;
  }).join("");
}

function shieldBar(label, current, max, color) {
  const safeMax = Math.max(Number(max) || 1, 1);
  const safeCurrent = Math.max(0, Number(current) || 0);
  const pct = Math.max(0, Math.min(100, (safeCurrent / safeMax) * 100));
  return `<label><span>${label} ${escapeHtml(safeCurrent)} / ${escapeHtml(safeMax)}</span><i style="--bar:${pct}%;--bar-color:${color}"></i></label>`;
}

function addToken(source = "sidebar") {
  const quick = source === "quick";
  const nameInput = quick ? els.quickTokenName : els.tokenName;
  const colorInput = quick ? els.quickTokenColor : els.tokenColor;
  const lightInput = quick ? els.quickTokenLight : els.tokenLight;
  const name = nameInput?.value.trim() || `Token ${state.tokens.length + 1}`;
  state.tokens.push({
    id: crypto.randomUUID(),
    name,
    type: "token",
    label: "Token",
    color: colorInput?.value || "#c83b2f",
    light: clamp(Number(lightInput?.value ?? 3), 0, 10),
    hidden: false,
    x: Math.floor(state.map.cols / 2),
    y: Math.floor(state.map.rows / 2)
  });
  if (nameInput) nameInput.value = "";
  renderAll();
}

function addNpcToken() {
  const name = els.npcName?.value.trim() || `NPC ${state.tokens.length + 1}`;
  const hp = clamp(Number(els.npcHp?.value || 20), 1, 999);
  state.tokens.push({
    id: crypto.randomUUID(),
    name,
    type: "npc",
    label: els.npcType?.value.trim() || "NPC/Criatura",
    color: els.npcColor?.value || "#7b241c",
    light: 0,
    hidden: els.npcHidden?.checked === true,
    hp,
    hpMax: hp,
    x: Math.floor(state.map.cols / 2),
    y: Math.floor(state.map.rows / 2)
  });
  if (els.npcName) els.npcName.value = "";
  renderAll();
}

function renderCrisisSheet() {
  if (!els.crisisSheet) return;
  const sheet = ensureActiveSheet();
  const skills = parseSkills(sheet);
  const attacks = splitLines(sheet.attacks);
  const abilities = splitLines(sheet.abilities);
  const inventory = splitLines(sheet.inventory);
  const rituals = splitLines(sheet.rituals);
  els.crisisSheet.innerHTML = `
    <section class="dossier-sheet">
      <div class="paper-clip clip-a"></div>
      <div class="paper-clip clip-b"></div>
      <div class="file-stamp">Confidencial</div>
      <div class="barcode-card"><span>Arquivo pessoal</span><i></i><b></b></div>

      <div class="dossier-left">
        <div class="dossier-identity">
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
          <label class="nex-field">Exp / NEX <span><input data-sheet-field="nex" value="${escapeAttr(sheet.nex || "0%")}" /><button type="button" data-open-catalog="nex">Catalogo</button></span></label>
          <label>Pontos de atributo <input data-sheet-field="peRound" type="number" value="${sheet.peRound}" /></label>
        </div>

        <div class="vitals-grid">
          ${paperStatBox("PV", "Pontos de vida", "hp", "hpMax", sheet.hp, sheet.hpMax)}
          ${paperStatBox("Energia", "Pontos de energia", "pe", "peMax", sheet.pe, sheet.peMax)}
          <label class="paper-stat"><b>Defesa</b><small>10 + AGI</small><input data-sheet-field="defense" type="number" value="${sheet.defense}" /></label>
          <label class="paper-stat"><b>Protecao</b><small>Reducao de dano</small><input data-sheet-field="block" type="number" value="${sheet.block}" /></label>
          ${paperStatBox("Sanidade", "Resistencia mental", "san", "sanMax", sheet.san, sheet.sanMax)}
          <label class="paper-stat"><b>Esquiva</b><small>Ajuste defensivo</small><input data-sheet-field="dodge" type="number" value="${sheet.dodge}" /></label>
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
        ${renderLineList(abilities, "Nenhum talento cadastrado", "abilities")}
      </div>

      <div class="bottom-panel equipment-panel">
        <div class="section-title mini-title">Equipamentos</div>
        <button class="paper-add" type="button" data-add-line="inventory">Adicionar</button>
        ${renderLineList(inventory, "Nenhum equipamento cadastrado", "inventory")}
      </div>

      <div class="bottom-panel rituals-panel">
        <div class="section-title mini-title">Rituais</div>
        <button class="paper-add" type="button" data-add-line="rituals">Adicionar</button>
        ${renderLineList(rituals, "Nenhum ritual cadastrado", "rituals")}
      </div>

      <div class="rules-panel">
        <div><b>Treinamento</b><p>Destreinado +0, treinado +2, veterano +4, especialista +6, mestre +8.</p></div>
        <div><b>Como testar</b><p>Role dados iguais ao atributo e some bonus, treino e outros.</p></div>
        <div><b>Regras rapidas</b><p>Maior resultado vence. Critico: resultado 20 natural.</p></div>
        <label><b>Anotacoes</b><textarea data-sheet-field="notes">${escapeHtml(sheet.notes)}</textarea></label>
      </div>
    </section>
  `;

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

  els.crisisSheet.querySelectorAll("[data-add-line]").forEach((button) => {
    button.addEventListener("click", () => openCatalog(button.dataset.addLine));
  });

  els.crisisSheet.querySelectorAll("[data-open-catalog]").forEach((button) => {
    button.addEventListener("click", () => openCatalog(button.dataset.openCatalog));
  });

  els.crisisSheet.querySelectorAll("[data-remove-line]").forEach((button) => {
    button.addEventListener("click", () => removeSheetLine(button.dataset.removeLine, Number(button.dataset.index)));
  });
}

function openCatalog(field) {
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
  return {
    nex: catalog.nex,
    role: catalog.origins,
    className: catalog.classes,
    inventory: catalog.inventory,
  }[field] || [];
}

function catalogTitle(field) {
  return {
    nex: "Catalogo de NEX",
    role: "Catalogo de origens",
    className: "Catalogo de classes",
    pathName: "Catalogo de trilhas",
    abilities: "Talentos / Habilidades",
    inventory: "Equipamentos",
    rituals: "Rituais"
  }[field] || "Catalogo";
}

function addCatalogEntry(field, entry) {
  const sheet = ensureActiveSheet();
  if (isSheetChoiceField(field)) {
    sheet[field] = entry.name;
    const selectedPath = catalog.paths.find((path) => normalizeKey(path.name) === normalizeKey(sheet.pathName));
    if (field === "className" && normalizeKey(selectedPath?.className) !== normalizeKey(entry.name)) {
      sheet.pathName = "";
    }
    renderAll();
    return;
  }
  const safeDesc = entry.desc.replace(/[,;\n]/g, " ");
  const line = `${entry.name} | ${catalogMetaText(entry)} - ${safeDesc}`.replace(/[,;\n]/g, " ");
  sheet[field] = splitLines(sheet[field]).concat(line).join("\n");
  renderAll();
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
  if (catalog.origins.includes(entry)) {
    return [
      `Pericias: ${entry.skills || "-"}`,
      `Talento: ${entry.talent || "-"}`
    ];
  }
  if (catalog.classes.includes(entry)) {
    return [`Classe: ${entry.name}`];
  }
  if (catalog.nex.includes(entry)) {
    return [`NEX: ${entry.name}`];
  }
  if (catalog.paths.includes(entry)) {
    return [
      `Classe: ${entry.className || "-"}`,
      `Trilha: ${entry.name}`
    ];
  }
  if (catalog.inventory.includes(entry)) {
    return [
      `Tipo: ${stats.category || entry.type}`,
      `Volume: ${stats.volume ?? "-"}`,
      `Dano: ${stats.damage || "-"}`,
      stats.range ? `Alcance: ${stats.range}` : "",
      stats.defense ? `Defesa: ${stats.defense}` : "",
      stats.bonus ? `Uso: ${stats.bonus}` : ""
    ].filter(Boolean);
  }
  if (catalog.rituals.includes(entry)) {
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
  const rows = attacks.length ? attacks : ["Novo ataque 1d20"];
  return rows.slice(0, 6).map((item) => `<tr><td>${escapeHtml(item)}</td><td>1d20</td><td>${escapeHtml(item.match(/\d*d\d+/i)?.[0] || "-")}</td><td>20</td><td>Curto</td><td>-</td><td><button type="button" data-roll-text="${escapeAttr(item)}">Rolar</button></td></tr>`).join("");
}

function renderLineList(lines, emptyText, field) {
  if (!lines.length) return `<ul class="paper-lines"><li class="paper-line-empty">${escapeHtml(emptyText)}</li></ul>`;
  return `<ul class="paper-lines">${lines.slice(0, 8).map((item, index) => `<li><span>${escapeHtml(item)}</span><button type="button" data-remove-line="${escapeAttr(field)}" data-index="${index}">Remover</button></li>`).join("")}</ul>`;
}

function parseInventoryItem(raw) {
  const name = String(raw || "").split("|")[0].split(" - ")[0].trim();
  const entry = catalog.inventory.find((item) => normalizeKey(item.name) === normalizeKey(name));
  const stats = catalogStats[entry?.name || name] || {};
  return { raw, name: entry?.name || name || "Item sem nome", entry, stats };
}

function inventoryItemDescription(item) {
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
  return details[item.name] || item.entry?.desc || "Item registrado manualmente na ficha. Complete a descricao conforme a decisao do mestre e o contexto da cena.";
}

function inventoryItemMeta(item) {
  const stats = item.stats || {};
  return [
    ["Tipo", stats.category || item.entry?.type || "Manual"],
    ["Volume", stats.volume ?? "-"],
    ["Dano", stats.damage || "-"],
    ["Alcance", stats.range || "-"],
    ["Defesa", stats.defense || "-"],
    ["Bonus", stats.bonus || stats.defense || (stats.damage && stats.damage !== "-" ? "Possui uso ofensivo, sem bonus fixo automatico." : "Nao possui bonus mecanico fixo.")]
  ];
}

function inventoryItemCard(raw, index) {
  const item = parseInventoryItem(raw);
  return `
    <article class="inventory-card">
      <div class="inventory-photo-wrap">
        ${catalogThumb(item.entry || { name: item.name, type: "Item" })}
        <span>Foto aproximada</span>
      </div>
      <div class="inventory-card-body">
        <div class="inventory-card-head">
          <h3>${escapeHtml(item.name)}</h3>
          <button type="button" data-inventory-remove="${index}">Remover</button>
        </div>
        <dl class="inventory-meta">
          ${inventoryItemMeta(item).map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
        </dl>
        <p>${escapeHtml(inventoryItemDescription(item))}</p>
      </div>
    </article>
  `;
}

function renderInventoryView() {
  const container = document.querySelector("#inventoryApp");
  if (!container) return;
  const sheet = ensureActiveSheet();
  const items = splitLines(sheet.inventory);
  container.innerHTML = `
    <div class="inventory-summary">
      <b>${escapeHtml(sheet.name || "Ficha ativa")}</b>
      <span>${items.length} item(ns) registrados</span>
    </div>
    ${items.length ? `<div class="inventory-list detailed">${items.map((item, index) => inventoryItemCard(item, index)).join("")}</div>` : `<p>Nenhum equipamento cadastrado na ficha.</p>`}
    <div class="inventory-actions">
      <button type="button" data-tab="fichas">Abrir ficha</button>
      <button type="button" data-inventory-add>Adicionar pelo catalogo</button>
      <button type="button" data-save-file>Salvar arquivo</button>
    </div>
  `;
  container.querySelectorAll("[data-inventory-remove]").forEach((button) => {
    button.addEventListener("click", () => removeSheetLine("inventory", Number(button.dataset.inventoryRemove)));
  });
  container.querySelector("[data-inventory-add]")?.addEventListener("click", () => openCatalog("inventory"));
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
    </article>
  `;
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
  const lines = splitLines(sheet[field]);
  lines.splice(index, 1);
  sheet[field] = lines.join("\n");
  renderAll();
}

function updateActiveSheet(field, value, numeric = false, rerender = true) {
  const sheet = ensureActiveSheet();
  sheet[field] = numeric ? Number(value) : value;
  if (rerender) renderAll();
  else save();
}

function updateSkillMod(skill, field, value, rerender = true) {
  const sheet = ensureActiveSheet();
  sheet.skillMods = sheet.skillMods || {};
  sheet.skillMods[skill] = { ...(sheet.skillMods[skill] || {}), [field]: value };
  if (rerender) renderAll();
  else save();
}

function adjustSheetNumber(field, delta) {
  const sheet = ensureActiveSheet();
  sheet[field] = numberOr(sheet[field], 0) + delta;
  renderAll();
}

function addSheetLine(field) {
  const label = {
    attacks: "Novo ataque 1d20",
    abilities: "Nova habilidade",
    rituals: "Novo ritual 1d20",
    inventory: "Novo item"
  }[field] || "Novo";
  const value = window.prompt("Adicionar:", label);
  if (!value) return;
  const sheet = ensureActiveSheet();
  sheet[field] = splitLines(sheet[field]).concat(value).join("\n");
  renderAll();
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
  let index = state.sheets.findIndex((sheet) => sheet.id === state.activeSheetId);
  if (ownedIds.length && (index < 0 || !ownedIds.includes(state.sheets[index].id))) {
    index = state.sheets.findIndex((sheet) => sheet.id === ownedIds[0]);
  }
  if (index < 0) index = 0;
  if (!state.sheets[index]) state.sheets[index] = blankSheet("Novo agente", user?.username || "Local");
  state.sheets[index] = normalizeSheet(state.sheets[index]);
  state.activeSheetId = state.sheets[index].id;
  return state.sheets[index];
}

function activeUserSheet() {
  const user = currentUser();
  if (!user) return null;
  user.sheetIds = user.sheetIds || [];
  if (!user.sheetIds.length) return null;
  let index = state.sheets.findIndex((sheet) => sheet.id === state.activeSheetId && user.sheetIds.includes(sheet.id));
  if (index < 0) index = state.sheets.findIndex((sheet) => sheet.id === user.sheetIds[0]);
  if (index < 0) return null;
  state.sheets[index] = normalizeSheet(state.sheets[index]);
  state.activeSheetId = state.sheets[index].id;
  return state.sheets[index];
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
  return String(text || "").split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
}

function resizeGrid() {
  state.map.name = els.mapName.value.trim() || "Mapa sem nome";
  state.map.cols = clamp(Number(els.gridCols.value), 6, 30);
  state.map.rows = clamp(Number(els.gridRows.value), 6, 24);
  state.tokens.forEach((token) => {
    token.x = Math.min(token.x, state.map.cols - 1);
    token.y = Math.min(token.y, state.map.rows - 1);
  });
  renderAll();
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
  state.sheets.forEach((sheet) => {
    const safeSheet = normalizeSheet(sheet);
    const card = document.createElement("article");
    card.className = "sheet-card";
    card.innerHTML = `
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
  renderAll();
}

function normalizeSheet(sheet) {
  return {
    id: sheet.id || crypto.randomUUID(),
    name: sheet.name || "",
    player: sheet.player || "Local",
    role: sheet.role || "",
    className: sheet.className || "",
    pathName: sheet.pathName || "",
    nex: sheet.nex || "",
    rank: sheet.rank || "",
    movement: numberOr(sheet.movement, 9),
    peRound: numberOr(sheet.peRound, 1),
    hp: numberOr(sheet.hp, 16),
    hpMax: numberOr(sheet.hpMax, sheet.hp || 16),
    pe: numberOr(sheet.pe, 2),
    peMax: numberOr(sheet.peMax, sheet.pe || 2),
    san: numberOr(sheet.san, 12),
    sanMax: numberOr(sheet.sanMax, sheet.san || 12),
    defense: numberOr(sheet.defense, sheet.ac || 10),
    block: numberOr(sheet.block, 0),
    dodge: numberOr(sheet.dodge, 0),
    agi: attrOr(sheet.agi, sheet.dex ? Math.max(1, Math.round(sheet.dex / 5)) : 1),
    str: attrOr(sheet.str, 1),
    int: attrOr(sheet.int, 1),
    pre: attrOr(sheet.pre, sheet.cha ? Math.max(1, Math.round(sheet.cha / 5)) : 1),
    vig: attrOr(sheet.vig, sheet.con ? Math.max(1, Math.round(sheet.con / 5)) : 1),
    skills: sheet.skills || "",
    skillMods: sheet.skillMods || {},
    attacks: sheet.attacks || "",
    abilities: sheet.abilities || "",
    rituals: sheet.rituals || "",
    inventory: sheet.inventory || "",
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
    switchTab("mesa");
    playDiceSound();
    animateDiceRoll(result);
    window.setTimeout(() => {
      els.rollResult.textContent = result.rollMode === "d20-test" ? `Resultado final: ${result.finalTotal}` : result.displayTotal;
    }, 780);
    state.rolls.unshift({ ...result, id: crypto.randomUUID(), at: new Date().toLocaleTimeString("pt-BR") });
    state.rolls = state.rolls.slice(0, 12);
    renderRollLog();
    save();
  } catch (error) {
    els.rollResult.textContent = error.message;
  }
}

function playDiceSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const now = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
  gain.connect(context.destination);
  [120, 170, 95, 210].forEach((frequency, index) => {
    const osc = context.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(frequency, now + index * 0.045);
    osc.connect(gain);
    osc.start(now + index * 0.045);
    osc.stop(now + 0.1 + index * 0.06);
  });
  window.setTimeout(() => context.close(), 650);
}

function animateDiceRoll(result) {
  els.diceStage.innerHTML = "";
  const stageRect = els.diceStage.getBoundingClientRect();
  const width = Math.max(stageRect.width, 320);
  const height = Math.max(stageRect.height, 240);
  const visibleDice = result.dice.slice(0, 18);

  visibleDice.forEach((die, index) => {
    const node = document.createElement("div");
    const dieSize = die.sides <= 6 ? 58 : die.sides >= 12 ? 66 : 62;
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

  const total = document.createElement("div");
  total.className = "dice-total persistent-total";
  const headline = result.rollMode === "d20-test" ? result.displayTotal : result.rollMode === "rps" ? result.displayTotal : "Resultados";
  total.innerHTML = `<strong>${escapeHtml(headline)}</strong><span>${escapeHtml(result.formula)} | ${escapeHtml(result.detail)}</span>`;
  els.diceStage.append(total);
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
  els.diceStage.innerHTML = `
    <div class="rps-duel">
      <div><span>Investigador</span><b>${a}</b></div>
      <strong>${winner}</strong>
      <div><span>Oponente</span><b>${b}</b></div>
    </div>
  `;
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
  document.querySelector("#loginScreen")?.classList.remove("hidden");
  document.querySelector("#portalScreen")?.classList.add("hidden");
  document.querySelector("#appShell")?.classList.add("hidden");
  document.body.classList.remove("sheet-area");
}

function showPortal() {
  document.querySelector("#loginScreen")?.classList.add("hidden");
  document.querySelector("#portalScreen")?.classList.remove("hidden");
  document.querySelector("#appShell")?.classList.add("hidden");
  document.body.classList.remove("sheet-area");
  renderPortal();
}

function showApp(mode = state.currentMode || "player") {
  state.currentMode = mode;
  document.querySelector("#loginScreen")?.classList.add("hidden");
  document.querySelector("#portalScreen")?.classList.add("hidden");
  document.querySelector("#appShell")?.classList.remove("hidden");
  document.body.classList.toggle("sheet-area", mode === "sheet");
  if (mode === "sheet") state.activeTab = ["fichas", "inventario", "anotacoes"].includes(state.activeTab) ? state.activeTab : "fichas";
  renderAll();
  switchTab(state.activeTab || "mesa");
}

function renderPortal() {
  const user = currentUser();
  const campaigns = document.querySelector("#portalCampaigns");
  const sheets = document.querySelector("#portalSheets");
  const badge = document.querySelector("#portalUserBadge");
  const limit = document.querySelector("#sheetLimitInfo");
  const inviteInput = document.querySelector("#inviteCode");
  if (!user) return;
  const inviteFromHash = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("convite");
  if (inviteInput && inviteFromHash && !inviteInput.value) inviteInput.value = inviteFromHash;
  if (badge) badge.textContent = `${user.username} | ${user.role === "admin" ? "ADM MASTER" : user.role === "master" ? "MESTRE" : "JOGADOR"}`;
  if (limit) limit.textContent = `Limite: ${(user.sheetIds || []).length}/5 fichas por conta.`;
  const visibleCampaigns = state.campaigns.filter((campaign) => campaign.mestreId === user.id || user.role === "admin" || (user.campaignIds || []).includes(campaign.id) || (campaign.jogadores || []).includes(user.id));
  if (campaigns) {
    campaigns.innerHTML = visibleCampaigns.length ? visibleCampaigns.map((campaign) => `
      <article class="archive-file-card">
        <b>${escapeHtml(campaign.nome)}</b>
        <p>Mestre: ${escapeHtml(state.accounts.find((account) => account.id === campaign.mestreId)?.username || "desconhecido")}</p>
        <span>${campaign.sessoes.length} arquivo(s) | ${campaign.personagens?.length || 0} ficha(s) vinculada(s) | Convite: ${escapeHtml(campaign.inviteCode)}</span>
        <small>${escapeHtml(campaignSheetNames(campaign) || "Nenhuma ficha vinculada ainda.")}</small>
        <div>
          ${campaign.mestreId === user.id || user.role === "admin" ? `<button type="button" data-portal-open="${escapeAttr(campaign.id)}" data-mode="master">Mestre</button>` : ""}
          <button type="button" data-portal-open="${escapeAttr(campaign.id)}" data-mode="player">Jogador</button>
          <button type="button" data-link-sheet="${escapeAttr(campaign.id)}">Levar ficha ativa</button>
        </div>
      </article>
    `).join("") : `<p>Nenhuma campanha vinculada.</p>`;
  }
  if (sheets) {
    const owned = state.sheets.filter((sheet) => (user.sheetIds || []).includes(sheet.id));
    sheets.innerHTML = owned.length ? owned.map((sheet) => `
      <article class="archive-file-card">
        <b>${escapeHtml(sheet.name || "Agente")}</b>
        <p>${escapeHtml(sheet.className || "Sem classe")} | ${escapeHtml(sheet.nex || "5%")}</p>
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
    });
  });
  document.querySelectorAll("[data-link-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      const campaign = state.campaigns.find((item) => item.id === button.dataset.linkSheet);
      try {
        linkActiveSheetToCampaign(campaign);
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
    button.addEventListener("click", () => {
      if (!window.confirm("Apagar esta ficha salva?")) return;
      const id = button.dataset.deleteSheet;
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
}

function campaignSheetNames(campaign) {
  return (campaign.personagens || [])
    .map((id) => state.sheets.find((sheet) => sheet.id === id)?.name)
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
}

function setSignupError(message) {
  const error = document.querySelector("#signupError");
  if (error) error.textContent = message || "";
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

function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabId));
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active-view", view.id === tabId));
  document.querySelector("#viewTitle").textContent = {
    mesa: "Mapa de combate",
    fichas: "Ficha do agente",
    inventario: "Inventario",
    anotacoes: "Anotacoes",
    missoes: "Missoes",
    biblioteca: "Arquivos da campanha",
    configuracoes: "Configuracoes",
    dados: "Rolador de dados"
  }[tabId] || "Arquivo";
  window.archiveUI?.render(state);
  save();
}

document.querySelectorAll("[data-tab]").forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

document.querySelector("#loginForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    try {
      await loginAccountOnline(document.querySelector("#loginUser").value, document.querySelector("#loginPassword").value);
    } catch (onlineError) {
      console.warn("[Supabase] Login online falhou, tentando backup local.", onlineError);
      loginAccount(document.querySelector("#loginUser").value, document.querySelector("#loginPassword").value);
      setSyncStatus("Login local ativo. Supabase nao carregou este acesso.", true);
    }
    setAuthError("");
    showPortal();
  } catch (error) {
    setAuthError(error.message);
  }
});

document.querySelector("#createAccess")?.addEventListener("click", () => {
  showSignup();
});

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
  } catch (error) {
    setSignupError(error.message);
  }
});

document.querySelector("#inviteAccess")?.addEventListener("click", async () => {
  try {
    try {
      await loginAccountOnline(document.querySelector("#loginUser").value, document.querySelector("#loginPassword").value);
    } catch (onlineError) {
      console.warn("[Supabase] Convite com login online falhou, tentando local.", onlineError);
      loginAccount(document.querySelector("#loginUser").value, document.querySelector("#loginPassword").value);
    }
    const code = window.prompt("Codigo do convite:", "");
    if (code) await joinCampaignWithInvite(code);
    setAuthError("");
    showPortal();
  } catch (error) {
    setAuthError(`${error.message} Para entrar com convite, faca login ou crie acesso com email.`);
  }
});

document.querySelector("#logoutButton")?.addEventListener("click", () => {
  supabaseClient()?.auth?.signOut?.();
  state.currentUserId = null;
  save();
  showLogin();
});

document.querySelector("#backPortal")?.addEventListener("click", () => {
  showPortal();
});

document.querySelector("#saveFileButton")?.addEventListener("click", saveCurrentFile);

document.querySelector("#createCampaignButton")?.addEventListener("click", async () => {
  try {
    createCampaignForCurrentUser(document.querySelector("#newCampaignName").value.trim() || "Nova campanha");
    save();
    await saveOnlineState();
    renderPortal();
  } catch (error) {
    window.alert(error.message);
  }
});

document.querySelector("#createSheetButton")?.addEventListener("click", async () => {
  try {
    createSheetForCurrentUser(document.querySelector("#newSheetName").value.trim() || "Novo agente");
    save();
    await saveOnlineState();
    state.activeTab = "fichas";
    showApp("sheet");
  } catch (error) {
    window.alert(error.message);
  }
});

document.querySelector("#joinCampaignButton")?.addEventListener("click", async () => {
  try {
    await joinCampaignWithInvite(document.querySelector("#inviteCode").value);
    save();
    renderPortal();
  } catch (error) {
    window.alert(error.message);
  }
});

document.querySelector("#openMasterPanel")?.addEventListener("click", () => {
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
  showApp("master");
});

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
  if (token) {
    token.x = x;
    token.y = y;
    renderAll();
  }
});

document.querySelector("#resizeGrid").addEventListener("click", resizeGrid);
document.querySelector("#addToken").addEventListener("click", addToken);
document.querySelector("#quickResizeGrid")?.addEventListener("click", () => {
  state.map.cols = clamp(Number(els.quickGridCols?.value || state.map.cols), 6, 30);
  state.map.rows = clamp(Number(els.quickGridRows?.value || state.map.rows), 6, 24);
  state.map.cellSize = clamp(Number(els.quickCellSize?.value || state.map.cellSize), 34, 88);
  state.map.gridOpacity = clamp(Number(els.quickGridOpacity?.value ?? state.map.gridOpacity), 0, 100);
  state.map.gridColor = els.quickGridColor?.value || state.map.gridColor;
  els.gridCols.value = state.map.cols;
  els.gridRows.value = state.map.rows;
  state.tokens.forEach((token) => {
    token.x = Math.min(token.x, state.map.cols - 1);
    token.y = Math.min(token.y, state.map.rows - 1);
  });
  state.map.marks = (state.map.marks || []).filter((mark) => mark.x < state.map.cols && mark.y < state.map.rows);
  state.map.fog.revealed = (state.map.fog.revealed || []).filter((key) => {
    const [x, y] = key.split(",").map(Number);
    return x < state.map.cols && y < state.map.rows;
  });
  renderAll();
});
document.querySelector("#quickAddToken")?.addEventListener("click", () => addToken("quick"));
document.querySelector("#quickAddNpc")?.addEventListener("click", addNpcToken);
els.mapTool?.addEventListener("change", () => {
  state.map.tool = els.mapTool.value;
  renderAll();
});
els.fogEnabled?.addEventListener("change", () => {
  state.map.fog = { ...defaultFog(), ...(state.map.fog || {}), enabled: els.fogEnabled.checked };
  renderAll();
});
document.querySelector("#revealAllFog")?.addEventListener("click", () => {
  state.map.fog = { ...defaultFog(), ...(state.map.fog || {}), enabled: true };
  const revealed = [];
  for (let y = 0; y < state.map.rows; y += 1) {
    for (let x = 0; x < state.map.cols; x += 1) revealed.push(cellKey(x, y));
  }
  state.map.fog.revealed = revealed;
  renderAll();
});
document.querySelector("#hideAllFog")?.addEventListener("click", () => {
  state.map.fog = { ...defaultFog(), ...(state.map.fog || {}), enabled: true, revealed: [] };
  renderAll();
});
els.mapImageInput?.addEventListener("change", () => uploadMapBackground(els.mapImageInput.files?.[0]));
document.querySelector("#fitMapImage")?.addEventListener("click", fitMapBackground);
document.querySelector("#centerMapImage")?.addEventListener("click", centerMapBackground);
document.querySelector("#removeMapImage")?.addEventListener("click", removeMapBackground);
document.querySelector("#lockMapImage")?.addEventListener("click", () => {
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
  input?.addEventListener("input", () => updateMapBackground(field, Number(input.value)));
});
document.querySelector("#clearMap").addEventListener("click", () => {
  state.tokens = [];
  renderAll();
});
els.lightsOn.addEventListener("change", () => {
  state.map.lightsOn = els.lightsOn.checked;
  renderAll();
});
els.darkness.addEventListener("input", () => {
  state.map.darkness = Number(els.darkness.value);
  renderAll();
});
els.quickLightsOn?.addEventListener("change", () => {
  state.map.lightsOn = els.quickLightsOn.checked;
  els.lightsOn.checked = state.map.lightsOn;
  renderAll();
});
els.quickDarkness?.addEventListener("input", () => {
  state.map.darkness = Number(els.quickDarkness.value);
  els.darkness.value = state.map.darkness;
  renderAll();
});
els.sheetForm.addEventListener("submit", saveSheet);
els.chatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  sendChatMessage(els.chatText?.value || "");
});
document.querySelector("#newSheet").addEventListener("click", clearSheetForm);
document.querySelector("#rollDice").addEventListener("click", () => performRoll(document.querySelector("#diceFormula").value));
document.querySelector("#quickRoll").addEventListener("click", () => performRoll(document.querySelector("#quickFormula").value));
document.querySelector("#rpsButton")?.addEventListener("click", playRps);
document.querySelector("#clearRollLog")?.addEventListener("click", () => {
  state.rolls = [];
  els.diceStage.innerHTML = "";
  renderRollLog();
  save();
});
document.querySelectorAll("[data-roll]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#diceFormula").value = button.dataset.roll;
    performRoll(button.dataset.roll);
  });
});

async function bootApp() {
  load();
  if (!document.getElementById(state.activeTab)) state.activeTab = "mesa";
  const client = supabaseClient();
  if (client) {
    try {
      const { data } = await client.auth.getSession();
      const authUser = data?.session?.user;
      if (authUser) {
        upsertLocalAccount({
          id: authUser.id,
          username: authUser.user_metadata?.username || authUser.email?.split("@")[0] || "agente",
          email: authUser.email || "",
          role: currentUser()?.role || "player",
          sheetIds: currentUser()?.sheetIds || [],
          campaignIds: currentUser()?.campaignIds || [],
          online: true
        });
        state.currentUserId = authUser.id;
        await loadOnlineWorkspace();
      }
    } catch (error) {
      setSyncStatus(`Nao consegui restaurar sessao online: ${error.message}`, true);
    }
  }
  renderAll();
  if (state.currentUserId && currentUser()) showPortal();
  else showLogin();
}

bootApp();

