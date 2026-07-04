// Ajusta as questões dos Resumos: equilibra comprimento das alternativas
// (remove a pista "maior alternativa = correta"), remove referências a letras
// nas justificativas e embaralha as letras com distribuição equilibrada.
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const files = ['crim_1.json', 'crim_2.json', 'pvat.json'];

// Novas alternativas (chaves = letras ORIGINAIS, antes do embaralhamento)
const alts = {
  2418: {
    "A": "imparcialidade, de natureza atitudinal, ligada à busca da verdade livre de preconceitos e sem atrelamento às partes.",
    "B": "clareza, de natureza atitudinal, ligada à redação do laudo de forma compreensível para os leigos do processo.",
    "C": "precisão, de natureza técnica, ligada à escolha de metodologia com margem de segurança adequada ao resultado.",
    "D": "rigor técnico-científico, de natureza técnica, ligado à adoção da melhor metodologia disponível."
  },
  2424: {
    "A": "administrativamente, auxiliar direto da jurisdição criminal; processualmente, servidor subordinado à gestão do órgão policial e à regulação técnica da DITEC.",
    "B": "administrativamente, servidor público policial vinculado à DITEC na regulação técnica; processualmente, auxiliar direto da jurisdição, sujeito ao impedimento e à suspeição dos arts. 275 a 281 do CPP.",
    "C": "administrativamente, membro do quadro de auxiliares permanentes do Poder Judiciário; processualmente, servidor policial submetido ao regime correcional da Corregedoria da Polícia Federal.",
    "D": "administrativamente, agente público dotado de autonomia plena, sem subordinação hierárquica; processualmente, auxiliar eventual da Justiça, sujeito apenas às regras de suspeição dos juízes."
  },
  2427: {
    "A": "a perícia opera como um apêndice da polícia judiciária, com fusão dos papéis analíticos e táticos no curso da investigação criminal.",
    "B": "o perito elabora a tese acusatória do caso, cabendo à equipe policial testá-la empiricamente nas diligências de campo subsequentes.",
    "C": "a perícia é ferramenta central de controle e validação da investigação, com sinergia entre o trabalho analítico e a investigação tática, sem fusão de papéis.",
    "D": "a integração científica pressupõe a subordinação metodológica do perito às hipóteses formuladas pela autoridade policial na investigação."
  },
  2432: {
    "A": "obrigatório, inserido logo antes da conclusão, destinado a justificar a metodologia e as técnicas empregadas nos exames realizados.",
    "B": "facultativo, inserido logo após o exame, destinado a consolidar as respostas aos quesitos formulados pela autoridade requisitante.",
    "C": "facultativo e de extrema importância, inserido logo após o preâmbulo, destinado a registrar fatos conjunturais da requisição ou do exame.",
    "D": "obrigatório, inserido logo após o objeto, destinado a descrever a cadeia de custódia de cada vestígio recebido para exame."
  },
  2437: {
    "A": "uma pessoa idônea, portadora de diploma de curso superior, dispensada de compromisso legal em razão da urgência do exame.",
    "B": "duas pessoas idôneas, portadoras de diploma de curso superior, que devem prestar compromisso de bem e fielmente desempenhar o encargo.",
    "C": "duas pessoas de reputação ilibada, com notório saber na área do exame, independentemente de escolaridade formal comprovada.",
    "D": "uma junta de três servidores públicos estáveis, preferencialmente da área policial, que devem prestar compromisso perante a autoridade."
  },
  2438: {
    "A": "o juiz nomeia perito de nível universitário, inscrito no conselho de classe, que atua sob compromisso e faz jus a honorários, facultada às partes a contratação de assistentes técnicos.",
    "B": "as partes indicam, de comum acordo, o perito do juízo, que atua sob compromisso e recebe honorários rateados em partes iguais, por determinação legal expressa.",
    "C": "o juiz requisita o exame ao diretor do instituto oficial, que distribui o trabalho conforme a carga e a área de formação dos peritos do quadro, remunerados pelo Estado.",
    "D": "o juiz nomeia dois profissionais idôneos de nível universitário, que atuam sob compromisso e são remunerados pelo Estado, facultada a escusa justificada."
  },
  2439: {
    "A": "converter o feito em diligência criminal, remetendo o exame à polícia judiciária competente para a lavratura do laudo respectivo.",
    "B": "nomear livremente qualquer profissional habilitado de nível universitário, vedada apenas a escolha de servidores dos estabelecimentos oficiais.",
    "C": "escolher, de preferência, técnicos dos estabelecimentos oficiais especializados, que devem aceitar o encargo se ausente justificativa, sob compromisso e com honorários.",
    "D": "designar junta formada por dois assistentes técnicos indicados pelas partes, sob a presidência do perito do juízo, todos sob compromisso."
  },
  2441: {
    "A": "o impedimento decorre de vínculos subjetivos e financeiros do perito com as partes, enquanto a suspeição decorre de fatos concretos, familiares e funcionais já documentados nos autos.",
    "B": "o parentesco até 2º grau com o advogado da parte gera suspeição relativa, por se tratar de vínculo de natureza afetiva meramente presumida.",
    "C": "o impedimento decorre de vínculos objetivos, como fatos concretos, família e atuação anterior, enquanto a suspeição decorre de vínculos subjetivos e financeiros, como amizade, interesse e dívidas.",
    "D": "ser credor ou devedor de qualquer das partes configura impedimento do perito, dada a objetividade documental e a natureza absoluta da relação de crédito."
  },
  2442: {
    "A": "o crime de falsa perícia admite as modalidades dolosa e culposa, alcançando tanto os peritos oficiais quanto os assistentes técnicos das partes.",
    "B": "os peritos respondem pelos crimes contra a fé pública, e a falsa perícia consuma-se independentemente de dolo, bastando a quebra do dever de cuidado.",
    "C": "o crime de falsa perícia exige dolo e alcança também os assistentes técnicos contratados pelas partes, por equiparação legal expressa.",
    "D": "os peritos respondem pelos crimes contra a Administração da Justiça; a falsa perícia exige dolo e os assistentes técnicos das partes ficam fora do seu alcance."
  },
  2448: {
    "A": "aquela produzida pelo exame e interpretação de vestígios materiais — a matéria-prima que só se torna prova material após examinada.",
    "B": "aquela representada por documentos que contêm o fato a ser provado, como cartas, contratos, escrituras e vídeos gravados em qualquer suporte.",
    "C": "aquela que demonstra por si só o fato a ser provado, dispensando raciocínio lógico externo ao próprio elemento de prova.",
    "D": "aquela derivada do conhecimento pessoal atribuído a um indivíduo, colhida por declarações formais no curso da instrução."
  },
  2454: {
    "A": "materiais, pois se baseiam em fatos consolidados no mundo físico, dotados de forte poder probatório e aptos ao exame pericial direto.",
    "B": "absolutos, pois permitem estabelecer relação direta e imediata entre as circunstâncias apuradas e a autoria delitiva.",
    "C": "circunstanciais, pois se baseiam em circunstâncias factuais provadas, comportamentos e motivações, com peso processual obtido pela indução lógica.",
    "D": "ilusórios, pois desprovidos de suporte em vestígios materiais passíveis de exame pericial e de confronto técnico."
  },
  2455: {
    "A": "seu peso torna-se absoluto quando corroborado por mais de uma testemunha idônea, contemporânea ao fato e compromissada em juízo.",
    "B": "seu valor está sempre em razão da maior ou menor afinidade de relação do fato com o crime, com o autor, ou com ambos, sem apoteose nem excomunhão.",
    "C": "constituem mera orientação investigativa, desprovida de aptidão para integrar o convencimento judicial na fase de sentença.",
    "D": "equivalem à prova plena quando convergentes entre si, autorizando a condenação com dispensa da prova material correspondente."
  },
  2457: {
    "A": "pelo menos 6 horas depois do óbito, salvo se os peritos, pela evidência dos sinais de morte, julgarem que possa ser feita antes.",
    "B": "pelo menos 12 horas depois do óbito, admitida antecipação por decisão fundamentada da autoridade requisitante do exame.",
    "C": "em até 6 horas contadas do óbito, para preservar os fenômenos cadavéricos transitórios de interesse médico-legal.",
    "D": "pelo menos 6 horas depois do óbito, regra inderrogável mesmo diante de sinais evidentes de morte, por imposição de ordem pública."
  },
  2459: {
    "A": "os laudos serão ilustrados sempre que conveniente, com conservação de parte do material analisado para eventual perícia complementar ou contraprova.",
    "B": "a ilustração dos laudos é obrigatória em todos os exames de laboratório, dispensada a guarda de material após a emissão do resultado definitivo.",
    "C": "os laudos serão ilustrados apenas mediante requisição expressa da autoridade, com descarte imediato do material analisado após a conclusão.",
    "D": "a ilustração é facultativa e restrita aos exames de maior complexidade, condicionando-se a contraprova à autorização judicial prévia."
  },
  2460: {
    "A": "será suspensa até a apreensão ou localização dos bens, lavrando-se termo circunstanciado de impossibilidade técnica nos autos.",
    "B": "será feita de forma indireta, com dados dos autos ou diligências, devendo o perito obrigatoriamente relatar o critério utilizado.",
    "C": "será feita por arbitramento judicial, limitando-se o perito a homologar tecnicamente o valor fixado pelo juízo competente.",
    "D": "será feita pela média das cotações de mercado do bem, dispensada a indicação do critério adotado na estimativa final."
  },
  2463: {
    "A": "sua origem e sua propriedade, com o rastreamento completo da cadeia de posse do objeto até o momento da apreensão.",
    "B": "sua natureza (qualidade) e sua eficiência, entendida como a aptidão para produzir o resultado e o estado de conservação.",
    "C": "sua letalidade e seu potencial ofensivo intrínseco, aferidos por ensaios comparativos padronizados de laboratório.",
    "D": "sua natureza (qualidade) e seu valor de mercado, este para fins de fixação do montante mínimo de reparação civil do dano."
  },
  2468: {
    "A": "é sequencial e própria de cada área pericial, reiniciando a cada exercício, com reserva do número na abertura dos exames.",
    "B": "é sequencial, comum a todas as áreas periciais, reinicia no primeiro dia de cada ano, com reserva do número no dia da liberação do documento.",
    "C": "é contínua e permanente, comum a todas as áreas periciais, com reserva do número no dia do início dos exames de cada caso.",
    "D": "é sequencial por unidade de criminalística, reiniciando a cada ano, com reserva do número na data do protocolo da requisição."
  },
  2469: {
    "A": "permitir que um assistente técnico reavalie os vestígios, dada a reprodutibilidade dos métodos, com meta de certificação total de laboratórios e processos.",
    "B": "uniformizar os capítulos do laudo em todas as áreas periciais, suprimindo a liberdade de formulação dos peritos responsáveis pelos exames.",
    "C": "vincular as conclusões periciais aos precedentes técnicos do Instituto Nacional de Criminalística, reduzindo divergências entre as unidades.",
    "D": "acelerar o atendimento das requisições urgentes, dispensando a descrição minuciosa dos materiais acautelados sob custódia."
  },
  2477: {
    "A": "o perito julga impossível obter o resultado caso qualquer hipótese alternativa fosse verdadeira, vedada ainda a expressão como fato irrefutável da natureza.",
    "B": "as duas proposições concorrentes apresentam razões de verossimilhança equivalentes entre si, exigindo o desempate técnico fundamentado.",
    "C": "a autoridade requisitante formula quesito direto e objetivo, que demanda resposta afirmativa ou negativa em termos taxativos.",
    "D": "o perito dispõe de confirmação por segundo examinador independente, hipótese que autoriza expressá-las como fato irrefutável da natureza."
  },
  2479: {
    "A": "o transporte do material à unidade de criminalística, em meio adequado à natureza física, biológica ou química do vestígio.",
    "B": "a documentação das ações realizadas no Termo de Coleta de Vestígio (TCV), com o registro da quantidade e da natureza.",
    "C": "o acondicionamento em embalagens de segurança padronizadas, separando-se os vestígios por características físicas, biológicas e químicas.",
    "D": "o registro imediato do material no Siscrim, com atribuição de numeração sequencial e designação do perito responsável."
  },
  2481: {
    "A": "pelo perito designado para o caso, mediante deslacre supervisionado pelo gestor e novo lacre ao final da conferência inicial.",
    "B": "pelo gestor da unidade, que rompe o lacre na presença de duas testemunhas e registra o ato em ficha de acompanhamento própria.",
    "C": "pela secretaria/protocolo, que confere os dados na embalagem externa, sem deslacrar, com registro imediato de eventuais inconsistências.",
    "D": "pela autoridade requisitante, no ato da entrega do material, com termo de transferência assinado pelo responsável pelo transporte."
  },
  2494: {
    "A": "pelo Diretor-Geral, com exclusividade, e pelo Diretor Técnico-Científico, também com exclusividade e caráter enunciativo.",
    "B": "pelos Diretores, em atuação conjunta, e pelo Diretor-Geral, com caráter regulamentar sobre métodos e rotinas técnicas das unidades.",
    "C": "pelo Diretor-Geral, com exclusividade, e por qualquer função de chefia ou direção, nos limites das respectivas atribuições regimentais.",
    "D": "pelo Ministro da Justiça, por delegação expressa, e pelo Diretor do Instituto Nacional de Criminalística, em matéria pericial."
  },
  2495: {
    "A": "ambas continuam sendo editadas normalmente, com competência concorrente entre os diretores, superintendentes e chefes das unidades.",
    "B": "deixaram de ser editadas desde 2022, permanecendo válidas as antigas; a IT, exclusiva dos Diretores, regula e uniformiza métodos técnicos.",
    "C": "foram revogadas em bloco em 2022, sendo substituídas pelas Orientações Técnicas expedidas pelo Diretor-Geral da Polícia Federal.",
    "D": "convertem-se automaticamente em Portarias após cinco anos de vigência, por regra expressa de consolidação normativa interna."
  },
  2497: {
    "A": "a conferência e suficiência do material e a análise dos quesitos quanto à pertinência e à possibilidade de resposta.",
    "B": "a definição da criticidade da requisição recebida e a reserva do número do futuro laudo no sistema de gestão.",
    "C": "a segunda conferência dos lacres do material e a designação formal do perito responsável pelo gestor da unidade.",
    "D": "a estimativa dos pontos de complexidade do exame e o agendamento das condições ambientais necessárias à sua realização."
  },
  2512: {
    "A": "cria a identidade do veículo no momento do emplacamento, vinculando-a de forma definitiva ao proprietário constante do registro.",
    "B": "constitui o identificador primário do veículo em circulação, corroborado pelo VIN e pelos códigos dos agregados relevantes.",
    "C": "apenas representa a identidade de forma ostensiva, ligando o veículo em circulação aos registros administrativos e à identificação estrutural.",
    "D": "possui a mesma hierarquia identificadora do VIN, por integrar o sistema integrado de identificação da regulamentação vigente."
  },
  2515: {
    "A": "em um ponto do garfo dianteiro de suspensão; e em um ponto de cada uma das longarinas que compõem o quadro.",
    "B": "em no mínimo dois pontos, na coluna de suporte da direção ou no chassi; e em no mínimo dois pontos distintos do chassi.",
    "C": "em ponto único situado sob o assento do condutor; e em ponto único da longarina direita, junto ao eixo traseiro.",
    "D": "em no mínimo três pontos do chassi ou da coluna de direção; e em no mínimo dois pontos do para-choque estrutural traseiro."
  },
  2517: {
    "A": "VIN; identificação de agregados relevantes; etiquetas autocolantes de segurança (ETA); marcações em vidros; plaquetas informativas; e identificação oculta expressa.",
    "B": "VIN; placas de identificação veicular; gravações em vidros; lacres de segurança; plaquetas informativas; e microgravações aleatórias no monobloco.",
    "C": "VIN; identificação de agregados; ETA; marcação dos pneus de série; plaquetas informativas; e identificação criptografada em módulo eletrônico.",
    "D": "VIN; número do motor e dos agregados; ETA; marcações em vidros; código de barras bidimensional; e identificação oculta facultativa."
  },
  2518: {
    "A": "local preferencial no lado esquerdo do chassi ou monobloco e caracteres com altura mínima de 7 mm para motocicletas, motonetas e triciclos.",
    "B": "local preferencial no lado direito do chassi ou monobloco e caracteres com altura mínima de 4 mm para ciclomotores, motonetas, motocicletas, triciclos e quadriciclos.",
    "C": "local obrigatório na torre do amortecedor do lado direito e caracteres com altura mínima de 4 mm para todos os veículos automotores.",
    "D": "local preferencial no assoalho dianteiro do monobloco e caracteres com altura mínima de 5 mm para os veículos de duas ou três rodas."
  },
  2523: {
    "A": "motocicletas e afins: sob o assento ou na porção dianteira; demais automotores: uma ETA na coluna da porta dianteira direita e outra no compartimento do motor, quando existir; reboques e semirreboques: em uma das longarinas, em local distinto das gravações do VIN.",
    "B": "motocicletas e afins: na coluna de suporte da direção; demais automotores: uma ETA em cada uma das colunas das portas dianteiras; reboques e semirreboques: junto à gravação principal do VIN, para conferência imediata em fiscalização de trânsito.",
    "C": "motocicletas e afins: no paralama traseiro ou sob o assento; demais automotores: uma ETA no para-brisa e outra no vidro traseiro; reboques e semirreboques: no engate de tração, mediante plaqueta metálica soldada à estrutura do quadro.",
    "D": "motocicletas e afins: somente sob o assento; demais automotores: uma ETA na coluna da porta dianteira esquerda e outra no assoalho do porta-malas; reboques e semirreboques: em ambas as longarinas, junto às gravações do VIN."
  },
  2524: {
    "A": "um dos para-brisas e um dos vidros traseiros, quando existentes, e pelo menos dois vidros de cada lado, excluídos os quebra-ventos.",
    "B": "todos os vidros do veículo, inclusive os quebra-ventos, quando existentes, vedada a substituição da marcação por etiqueta.",
    "C": "o para-brisa dianteiro e pelo menos um vidro de cada lado do veículo, incluídos os quebra-ventos e os vidros fixos traseiros.",
    "D": "um dos para-brisas e os dois vidros traseiros laterais, dispensadas as marcações nos vidros das portas dianteiras do veículo."
  },
  2525: {
    "A": "contém o VIN ou, alternativamente, o VIS, em local a critério do fabricante: monobloco, chassi, cabine ou, em ônibus e micro-ônibus, carroceria.",
    "B": "contém obrigatoriamente o VIN completo, gravado em local definido pela autoridade de trânsito e mantido sob sigilo industrial permanente.",
    "C": "contém o WMI e o VIS do fabricante, gravados exclusivamente no monobloco, em posição padronizada internacionalmente pela ISO.",
    "D": "contém o VIS do veículo, gravado em dois pontos simétricos do assoalho, com acesso restrito à rede autorizada da montadora."
  },
  2526: {
    "A": "passaram a ser obrigatórias apenas na Resolução de 2022; antes, algumas empresas já as usavam, sem obrigatoriedade, para controle de peças.",
    "B": "são obrigatórias desde a norma de 1988, como segunda gravação de segurança do VIN em local reservado do monobloco.",
    "C": "permanecem facultativas até hoje, constituindo diferencial de segurança adotado voluntariamente por algumas montadoras.",
    "D": "tornaram-se obrigatórias em 2022 somente para os veículos importados, dada a dificuldade de rastreamento internacional."
  },
  2527: {
    "A": "replicar a numeração no compartimento do motor por etiqueta ou plaqueta destrutível e resistente a intempéries, fixada em componente de difícil remoção.",
    "B": "gravar a numeração no cabeçote por micropercussão industrial, com selo de vistoria anual do órgão executivo de trânsito do registro.",
    "C": "afixar etiqueta autocolante de segurança no para-brisa dianteiro, contendo o número do motor e o VIS do veículo correspondente.",
    "D": "registrar a numeração exclusivamente no cadastro administrativo do registro, dispensada a marcação física de qualquer natureza."
  },
  2529: {
    "A": "os divisores físicos empregados na gravação do veículo devem ser reproduzidos fielmente na documentação, para permitir o confronto direto entre os suportes.",
    "B": "admitem-se divisores físicos no veículo, desde que inconfundíveis com caracteres alfanuméricos; na documentação, o VIN figura em linha única, contínua e sem separadores.",
    "C": "a gravação no veículo deve ocorrer sempre em linha única e contínua, admitindo-se na documentação a separação das seções do código por hífen.",
    "D": "os divisores físicos são vedados em qualquer suporte de gravação, pelo risco de confusão com os caracteres alfanuméricos do código."
  },
  2532: {
    "A": "fabricante; homologações (ex.: DOT/E code); tipo do vidro (laminado ou temperado); classificação de transparência (ex.: AS1); e códigos de data do vidro.",
    "B": "fabricante; VIN completo do veículo de destino; tipo do vidro; índice de refração nominal; e lote de produção da chapa de origem.",
    "C": "montadora do veículo; homologações internacionais; espessura nominal; classificação de dureza superficial; e ano-modelo do veículo.",
    "D": "fabricante; homologações nacionais; tipo do vidro; classificação de transparência; e placa de identificação do veículo de destino."
  },
  2534: {
    "A": "o scribing produz marcas profundas, suaves e contínuas com fresas de metal duro e cortadores, enquanto o laser atua sem contato físico e gera zona termicamente afetada muito limitada.",
    "B": "o scribing atua sem contato físico com a peça marcada, enquanto o laser exige pressão constante do cabeçote focalizador sobre o substrato metálico durante a gravação.",
    "C": "a micropercussão remove o material por feixe focalizado de alta energia, restringindo-se às superfícies planas do monobloco e do chassi dos veículos.",
    "D": "o laser gera extensa zona de deformação plástica subsuperficial, característica que favorece a restauração posterior por ataque químico controlado."
  },
  2540: {
    "A": "a área trabalhada a frio é mais dura que o metal ao redor, e a solução age diferencialmente nos cristais e limites de grão, alterando a reflexão da luz local.",
    "B": "o reagente dissolve seletivamente a camada de tinta e as limalhas depositadas nas cavidades, expondo o relevo residual da gravação original.",
    "C": "o calor da reação exotérmica provoca recristalização localizada do metal, com surgimento de protuberâncias sobre os caracteres originais.",
    "D": "a solução deposita íons metálicos nas regiões encruadas pela gravação, formando contraste galvânico visível sob iluminação oblíqua."
  },
  2541: {
    "A": "números obliterados em chapas de aço de baixa espessura, típicas de monoblocos, graças à ductilidade do material laminado a frio.",
    "B": "números obliterados em ferro fundido, normalmente blocos de motores, pela tensão residual presente abaixo da área deformada.",
    "C": "gravações a laser em ligas leves de alumínio, nas quais a zona termicamente afetada responde bem ao reaquecimento controlado.",
    "D": "gravações por micropercussão em superfícies côncavas ou convexas, inacessíveis às técnicas de polimento controlado."
  },
  2542: {
    "A": "endurecimento superficial da área marcada, com contraste imediato dos caracteres revelados, dispensando-se qualquer acabamento posterior.",
    "B": "relaxamento das tensões residuais e recristalização do metal, surgindo protuberância ao redor da deformação, com posterior lixamento suave.",
    "C": "fusão localizada das bordas dos caracteres originais, com preenchimento das cavidades remanescentes por material recristalizado.",
    "D": "contração diferencial da zona de deformação elástica, que expõe o relevo do código original sob iluminação rasante qualificada."
  },
  2543: {
    "A": "materiais com durezas diferentes são removidos em taxas diferenciadas, havendo relatos de sucesso até em números gravados a laser.",
    "B": "o abrasivo empregado reage quimicamente com a zona encruada da gravação, revelando o código pela mudança de coloração localizada.",
    "C": "a remoção uniforme de camadas superficiais expõe a gravação oculta de fábrica, replicada em profundidade pelo processo industrial.",
    "D": "o aquecimento gerado pelo atrito relaxa as tensões residuais internas, produzindo protuberâncias sobre os caracteres consumidos."
  },
  2545: {
    "A": "exclusivamente o estado aparente, constatável por inspeção visual qualificada, com quatro categorias obrigatórias: bom, regular, ruim e sucata.",
    "B": "o estado aparente e o funcional, mediante testes dinâmicos padronizados, com três categorias obrigatórias: bom, regular e sucata.",
    "C": "o estado mecânico integral, com desmontagens parciais autorizadas, e classificação em cinco categorias harmonizadas com a tabela FIPE.",
    "D": "exclusivamente o estado aparente do veículo, com classificação facultativa conforme a gravidade dos danos observados na vistoria."
  },
  2548: {
    "A": "por analogia com similares disponíveis no Brasil, por comparação proporcional com valores no país de origem, ou por outra metodologia justificada pelo perito.",
    "B": "unicamente pela conversão cambial do valor de tabela vigente no país de origem, acrescida dos tributos incidentes na importação definitiva.",
    "C": "pelo valor declarado na documentação aduaneira de internação, aplicando-se em seguida o deságio do estado de conservação apurado.",
    "D": "por arbitramento do órgão executivo de trânsito, mediante consulta formal encaminhada pelo perito responsável pela avaliação."
  },
  2553: {
    "A": "ausência de evidências de adulteração; adulteração confirmada com identificação da identidade real; adulteração confirmada sem identificação da original; e inconclusão.",
    "B": "autenticidade plena dos identificadores; adulteração parcial dos códigos; adulteração total com perda da identidade; e devolução por inviabilidade técnica do exame.",
    "C": "regularidade documental e estrutural; divergência meramente administrativa; adulteração confirmada dos identificadores; e restauração bem-sucedida do código.",
    "D": "ausência de adulteração aparente; adulteração presumida por incoerência de registros; adulteração confirmada pelo confronto; e remessa do caso para contraprova."
  },
  2556: {
    "A": "ETA ou plaqueta metálica destrutível, bem como etiqueta destrutível única com o ano de fabricação e o VIN ou o VIS.",
    "B": "somente etiqueta autocolante comum com o ano e o VIS, afixada na coluna da porta dianteira esquerda do veículo.",
    "C": "plaqueta removível parafusada com o ano e o VIN, para permitir substituição em caso de recaracterização do veículo.",
    "D": "etiqueta holográfica renovável a cada licenciamento anual, emitida e afixada pelo órgão executivo de trânsito."
  }
};

// Justificativas reescritas para eliminar referências a letras de alternativas
const justs = {
  2408: "A materialidade é o elemento objetivo do tipo penal: a ocorrência da conduta que a lei penal veda, a efetivação do crime no mundo real. Prová-la é provar que o crime de fato existiu. A circunstância conhecida e provada que, por indução, leva a outras é o conceito legal de indício.",
  2411: "O Delegado é o primeiro garantidor da legalidade da persecução penal preliminar e tem a obrigação de se dirigir ao local para providenciar o isolamento até a chegada da perícia. Produtor isento da prova material e fiador da cadeia de custódia são papéis do perito; a titularidade da tese acusatória é do Ministério Público.",
  2466: "Preâmbulo: número do laudo, título, nome dos peritos, nome do diretor/chefe que os designou e informações sobre a requisição (número, data, procedimento vinculado e autoridade requisitante). A narração do que foi examinado com métodos e justificativa é a Exposição e Discussão; a resposta objetiva aos quesitos é a Conclusão.",
  2476: "Razões de Verossimilhança: relação de probabilidade entre obter as observações caso a hipótese 1 seja verdadeira, versus a hipótese 2. Valores aproximados com margem de erro (ex.: 70 ± 5 km/h) são as Estimativas, típicas da interpretação investigativa.",
  2536: "Adulteração simples: um ou mais caracteres sofrem alteração em sua configuração inicial por rebatimento por sobreposição. A remoção total/parcial por abrasão com nova gravação é a regravação; a cobertura da gravação original por solda é o recobrimento, revelável por solvente e reagente Fry."
};

// PRNG determinístico (mulberry32)
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260704);
function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pool equilibrado de letras para a resposta correta
let all = [];
for (const f of files) {
  const qs = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  all.push([f, qs]);
}
const total = all.reduce((s, [, qs]) => s + qs.length, 0);
let pool = [];
while (pool.length < total) pool = pool.concat(shuffled(['A', 'B', 'C', 'D']));

let idx = 0;
for (const [f, qs] of all) {
  for (const q of qs) {
    if (alts[q.id]) q.alternativas = alts[q.id];
    if (justs[q.id]) q.justificativa = justs[q.id];
    // embaralha letras: correta vai para a letra do pool, distratores aleatórios
    const target = pool[idx++];
    const corrText = q.alternativas[q.resposta_correta];
    const otherTexts = shuffled(Object.entries(q.alternativas)
      .filter(([k]) => k !== q.resposta_correta).map(([, v]) => v));
    const novo = {};
    let oi = 0;
    for (const L of ['A', 'B', 'C', 'D']) {
      novo[L] = (L === target) ? corrText : otherTexts[oi++];
    }
    q.alternativas = novo;
    q.resposta_correta = target;
  }
  fs.writeFileSync(path.join(dir, f), JSON.stringify(qs, null, 2) + '\n');
}

// Relatório
let letras = { A: 0, B: 0, C: 0, D: 0 }, longest = 0, worst = [];
for (const [, qs] of all) {
  for (const q of qs) {
    letras[q.resposta_correta]++;
    const corr = q.alternativas[q.resposta_correta].length;
    const others = Object.entries(q.alternativas).filter(([k]) => k !== q.resposta_correta).map(([, v]) => v.length);
    const ratio = corr / Math.max(...others);
    const lens = Object.entries(q.alternativas).sort((a, b) => b[1].length - a[1].length);
    if (lens[0][0] === q.resposta_correta) longest++;
    if (ratio > 1.3) worst.push(q.id + '(' + ratio.toFixed(2) + ')');
  }
}
console.log('distribuição:', JSON.stringify(letras));
console.log('correta é a mais longa em', longest, 'de', total);
console.log('ratio>1.3:', worst.length, worst.join(' '));
