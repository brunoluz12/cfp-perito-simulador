# -*- coding: utf-8 -*-
"""Bizuraço Prova — questões, parte 1: seções 1 a 5."""

Q = []


def q(sec, enun, alts, cor, just, nivel="dificil", prof=False):
    Q.append({
        "secao": sec, "enunciado": enun, "alternativas": alts,
        "resposta_correta": cor, "justificativa": just,
        "nivel": nivel, "prof": prof,
    })


# ============ 1. BASE LEGAL ============

q(1, "O professor abriu a revisão perguntando qual o artigo do CPP que dá sustentação legal à realização da perícia. Assinale a alternativa que reproduz corretamente o comando desse dispositivo.",
  {"A": "Art. 158 — quando a infração deixar vestígios, será indispensável o exame de corpo de delito, direto ou indireto, não podendo supri-lo a confissão do acusado.",
   "B": "Art. 158 — quando a infração deixar vestígios, o exame de corpo de delito poderá ser dispensado se houver confissão do acusado corroborada por prova testemunhal idônea.",
   "C": "Art. 159 — o exame de corpo de delito será indispensável sempre que a infração deixar vestígios, admitida a supressão mediante acordo entre as partes no curso da instrução.",
   "D": "Art. 169 — quando a infração deixar vestígios, será indispensável o exame de corpo de delito, cabendo à autoridade policial decidir sobre sua realização em cada caso concreto."},
  "A",
  "É o art. 158 do CPP, com a cláusula final que o professor destacou: a confissão NÃO supre o exame de corpo de delito. B inverte exatamente essa cláusula, admitindo a dispensa por confissão. C troca o número do artigo (159 trata da qualificação do perito) e inventa a hipótese de acordo entre as partes. D também erra o artigo (169 trata da preservação do local) e transforma um dever legal em juízo discricionário da autoridade.",
  prof=True)

q(1, "Durante a revisão o professor perguntou se existe hierarquia entre as informações objetivas (vestígios) e as subjetivas (depoimentos). Sobre o tema, é correto afirmar que:",
  {"A": "há hierarquia legal, pois a perícia é reconhecida no ordenamento como prova de maior peso, cedendo apenas diante de confissão judicial espontânea.",
   "B": "não há hierarquia legal entre elas, embora a perícia seja tradicionalmente chamada de rainha das provas.",
   "C": "há hierarquia apenas na fase de inquérito, invertendo-se a precedência quando o feito chega à fase judicial de instrução.",
   "D": "não há hierarquia, razão pela qual o perito deve fundamentar suas conclusões tanto nos vestígios quanto nas versões colhidas em entrevista.",
  },
  "B",
  "O professor antecipou a armadilha: apesar do apelido de rainha das provas, LEGALMENTE não há hierarquia entre as provas. A afirma exatamente o contrário. C cria uma inversão por fase processual que não existe. D acerta a premissa (não há hierarquia) mas erra a conclusão: o perito conclui SOMENTE a partir dos vestígios; as informações subjetivas apenas direcionam os trabalhos e não são objeto de avaliação no laudo.",
  prof=True)

q(1, "Sobre o tratamento das informações subjetivas colhidas no local de crime, assinale a alternativa correta.",
  {"A": "Servem para direcionar e agilizar os trabalhos, mas não são objeto de avaliação no laudo, que se apoia nos vestígios.",
   "B": "Devem ser transcritas na conclusão do laudo sempre que confirmadas por ao menos duas testemunhas presenciais do fato.",
   "C": "Substituem a busca por vestígios quando prestadas por policiais que atenderam a ocorrência antes da chegada da equipe pericial.",
   "D": "Não podem ser colhidas pelo perito, pois a tomada de declarações é atribuição exclusiva da autoridade policial no inquérito."},
  "A",
  "As entrevistas ajudam a encontrar e contextualizar os vestígios, mas o perito só conclui a partir do material objetivo. B inventa um requisito de duas testemunhas e desloca o conteúdo para a conclusão. C é falsa: nada substitui a busca por vestígios. D é falsa: as entrevistas podem ser realizadas por qualquer membro da equipe pericial, inclusive durante os preparativos.")

q(1, "Considerando o conceito ampliado de local de crime (Eraldo Rabelo) e a definição da IN 297/2024-DG/PF, assinale a alternativa correta.",
  {"A": "O local restringe-se ao ponto exato da consumação, pois é ali que se concentram os vestígios úteis à materialidade.",
   "B": "O local abrange os atos preliminares e posteriores à consumação, mas apenas quando praticados no mesmo imóvel do fato principal.",
   "C": "O local abrange todos os lugares em que, aparente, necessária ou presumivelmente, tenham sido praticados atos materiais preliminares ou posteriores diretamente relacionados ao delito.",
   "D": "O local corresponde exatamente à área delimitada pela fita de isolamento no atendimento inicial, cabendo ao primeiro policial que chegar à cena fixar em definitivo essa extensão."},
  "C",
  "É a definição de Rabelo: o raio se estende para abranger o planejamento, a execução e o que ocorreu depois. A restringe indevidamente ao ponto de consumação. B acrescenta um limite territorial (mesmo imóvel) que não existe no conceito. D confunde o conceito jurídico de local com a delimitação física do isolamento, que é provisória e deve ser reavaliada pela perícia.")

q(1, "Assinale a alternativa que distingue corretamente local imediato e local mediato.",
  {"A": "Imediato é o de maior concentração de vestígios, onde ocorreu o evento; mediato são as adjacências, havendo continuidade geográfica entre eles.",
   "B": "Imediato é o periciado no mesmo dia do fato; mediato é aquele examinado posteriormente, quando já houve alteração das condições originais.",
   "C": "Imediato é a área sob isolamento físico; mediato é a área externa liberada ao público, sem interesse para a busca de vestígios.",
   "D": "Imediato é o local do resultado naturalístico; mediato é o local dos atos executórios, ainda que separados por descontinuidade geográfica."},
  "A",
  "A distinção é espacial: o imediato é onde o evento ocorreu e concentra os vestígios; o mediato são as adjacências, com continuidade geográfica entre ambos. B cria um critério temporal inexistente. C é falsa porque o mediato pode conter vestígios relevantes e não se confunde com área liberada. D inverte os conceitos e ainda nega a continuidade geográfica, que é justamente um elemento da definição.")

q(1, "Quanto à preservação, os locais de crime classificam-se em:",
  {"A": "primários e secundários, conforme neles tenha ocorrido a execução ou apenas o resultado do delito.",
   "B": "idôneos ou não violados e inidôneos ou violados, conforme tenham ou não sido perturbados antes da chegada dos peritos.",
   "C": "preservados e liberados, conforme a autoridade policial já tenha ou não formalizado a entrega do local à perícia.",
   "D": "internos e externos, conforme o exame recaia sobre edificações ou sobre vias públicas e áreas abertas ao entorno."},
  "B",
  "Idôneo (não violado) é o preservado tal como deixado pelo agente; inidôneo (violado) é o perturbado ou devassado após o fato e antes da chegada dos peritos. A, C e D descrevem outras classificações — respectivamente quanto à relação com o fato, quanto à fase do trabalho e quanto à natureza do ambiente — nenhuma delas ligada ao critério de preservação.")

# ============ 2. ROTEIRO DE PROCESSAMENTO ============

q(2, "Assinale a alternativa que apresenta as etapas do processamento do local na ordem trabalhada na revisão.",
  {"A": "Preparação; chegada ao local; documentação; busca de vestígios; coleta e acondicionamento; reunião final; liberação.",
   "B": "Preparação; chegada ao local; busca de vestígios; documentação; coleta e acondicionamento; reunião final; liberação.",
   "C": "Chegada ao local; preparação; busca de vestígios; coleta e acondicionamento; documentação; reunião final; liberação.",
   "D": "Preparação; chegada ao local; busca de vestígios; coleta e acondicionamento; documentação; liberação; reunião final."},
  "B",
  "A sequência é: preparação, chegada, busca, documentação, coleta, reunião final e liberação. A inverte busca e documentação — não se documenta o que ainda não foi encontrado. C coloca a preparação depois da chegada, quando ela antecede o deslocamento. D coloca a coleta antes da documentação e ainda inverte reunião final e liberação: a conferência precede a entrega do local.")

q(2, "O professor usou a amostra controle como exemplo do tipo de pegadinha que a banca faz com as etapas. Sobre ela, é correto afirmar que:",
  {"A": "é colhida na etapa de coleta, e a regra geral é sempre coletá-la, pois no local nem sempre se sabe se será necessária.",
   "B": "é colhida na etapa de documentação, simultaneamente ao registro fotográfico e ao posicionamento do vestígio no croqui.",
   "C": "é colhida na etapa de busca, assim que identificado o suporte impregnado, para evitar que a área seja alterada.",
   "D": "é dispensável quando o vestígio principal for encaminhado integralmente ao laboratório, mas obrigatória em qualquer recorte parcial de suporte."},
  "A",
  "A amostra controle pertence à etapa de COLETA — foi exatamente esse deslocamento de etapa que o professor apontou como pegadinha. B e C transferem o procedimento para etapas anteriores. D descreve corretamente a lógica do controle (necessário quando o suporte não vai inteiro), mas erra ao apresentá-la como dispensa: como no local não se sabe de antemão, a regra é sempre coletar.",
  prof=True)

q(2, "Sobre o isolamento do local, conforme cobrado na revisão, assinale a alternativa correta.",
  {"A": "Deve ser feito obrigatoriamente com fita de isolamento padronizada, único meio que confere validade jurídica à delimitação da área.",
   "B": "Pode ser feito com fita, cordas, cones ou cavaletes, e cabe à perícia reavaliar o perímetro encontrado, ampliando-o ou reduzindo-o.",
   "C": "É atribuição exclusiva do perito criminal federal, que o executa antes de qualquer outra providência ao chegar à cena.",
   "D": "Uma vez estabelecido pelo primeiro policial no local, não pode ser alterado pela perícia, sob pena de comprometer a cadeia de custódia."},
  "B",
  "O professor perguntou duas vezes: não precisa ser fita — cordas, cones e cavaletes servem. E a função da perícia é REAVALIAR o isolamento já feito. A cria uma exclusividade da fita que não existe. C inverte os papéis: quem isola primeiro é normalmente a PM ou o corpo de bombeiros. D é falsa justamente porque reavaliar o perímetro é dever da perícia, e não ofensa à cadeia de custódia.",
  prof=True)

q(2, "Sobre a busca inicial e a busca completa, assinale a alternativa correta.",
  {"A": "Ambas são realizadas por toda a equipe, diferenciando-se apenas pelo padrão de varredura adotado em cada uma delas.",
   "B": "A busca inicial é realizada com os padrões de busca; a completa dispensa padrão, por já se conhecer a distribuição dos vestígios.",
   "C": "A busca inicial cabe ao perito-chefe e visa a planejar a busca detalhada, definindo a rota de entrada e saída a ser usada por todos.",
   "D": "A busca inicial é feita pelo papiloscopista, a quem compete o primeiro reconhecimento das superfícies aptas a reter impressões papilares."},
  "C",
  "O professor perguntou: vai todo mundo na busca inicial? Não — geralmente só o chefe. O cuidado central é fixar a rota de entrada e saída. A contraria essa resposta. B inverte: os padrões de busca são da etapa completa. D atribui a busca inicial ao papiloscopista, cuja atuação é o levantamento papiloscópico, realizado na etapa de coleta e coordenado com a perícia.",
  prof=True)

q(2, "Encerrados os exames, a entrega formal do local é feita:",
  {"A": "pelo perito-chefe ao delegado ou policial encarregado, geralmente de forma verbal, devendo ser consignada em laudo.",
   "B": "por qualquer membro da equipe ao responsável pelo imóvel, mediante termo escrito assinado por duas testemunhas presentes.",
   "C": "pelo perito-chefe ao papiloscopista, que permanece no local para concluir o levantamento das impressões remanescentes.",
   "D": "pelo delegado à perícia, invertendo-se a responsabilidade pelo local a partir do momento da liberação formal."},
  "A",
  "A liberação é feita pelo perito-chefe ao delegado ou policial encarregado; ainda que verbal, deve constar do laudo. B erra o destinatário e inventa a exigência de termo com testemunhas. C é falsa: o levantamento papiloscópico ocorre durante a etapa de coleta, não após a liberação. D inverte o sentido da entrega — a perícia devolve o local à autoridade, e não o contrário.",
  prof=True)

q(2, "Relacione corretamente o padrão de busca à situação em que é indicado.",
  {"A": "Espiral: área extensa com muitas pessoas, avançando da periferia para o centro sob comando de uma pessoa-base.",
   "B": "Linha cruzada: área pequena com poucas pessoas, repetindo-se a varredura em direção perpendicular à primeira.",
   "C": "Quadrante: área extensa e com muitas pessoas disponíveis, vedada a aplicação de outra metodologia de varredura dentro de cada setor delimitado.",
   "D": "Linha: área extensa com quantidade suficiente de pessoas, posicionadas a dois braços de distância, sob comando de uma pessoa-base.",
  },
  "D",
  "A busca em linha é a indicada para área extensa com muitas pessoas, com o espaçamento de dois braços e uma pessoa-base comandando o deslocamento. A atribui à espiral as características da linha — a espiral é para área pequena e poucas pessoas. B inverte igualmente: a linha cruzada é a repetição perpendicular da busca em linha, própria de áreas extensas. C acerta o contexto do quadrante, mas erra ao vedar outra metodologia dentro de cada quadrante, o que é expressamente admitido.")

q(2, "Ao encontrar um vestígio durante a busca, o procedimento correto é:",
  {"A": "coletá-lo imediatamente e acondicioná-lo, evitando que terceiros o destruam antes do registro fotográfico.",
   "B": "marcá-lo, para que possa ser descrito, fotografado e ter sua posição anotada no croqui, coletando-o somente depois.",
   "C": "interromper a busca e submetê-lo de imediato ao exame preliminar cabível, registrando o resultado no formulário de local.",
   "D": "deixá-lo no lugar sem qualquer marcação, para não interferir na leitura do conjunto durante a etapa de documentação."},
  "B",
  "É pegadinha clássica: o vestígio não é coletado assim que encontrado. Marca-se, descreve-se, fotografa-se e plota-se no croqui; a coleta vem depois. A antecipa a coleta e perde o contexto. C interrompe indevidamente a busca e antecipa exames. D erra no oposto: a marcação é justamente o que impede que outras pessoas destruam o vestígio.")

q(2, "São premissas básicas da busca de vestígios, conforme a revisão:",
  {"A": "conduzir do específico para o geral; economizar tempo nas áreas visíveis; concentrar esforços nos pontos indicados por testemunhas.",
   "B": "conduzir do geral para o específico; proceder com cautela nas áreas visíveis; buscar vigorosamente em áreas escondidas ou dissimuladas.",
   "C": "conduzir do geral para o específico; documentar apenas os vestígios que se mostrem desde logo relevantes para a hipótese investigada.",
   "D": "repetir a busca sempre que necessário, já que o local pode ser reprocessado em novas diligências caso algo tenha escapado."},
  "B",
  "As premissas são: do geral para o específico, busca cautelosa nas áreas visíveis e busca vigorosa nas dissimuladas. A inverte o sentido e sugere economia de tempo. C erra ao filtrar a documentação por relevância aparente — a regra é que um vestígio nunca é documentado em excesso. D contraria a premissa central de que só existe UMA chance de processar o local adequadamente.")

q(2, "Na reunião final, antes da liberação, a equipe confere se:",
  {"A": "a documentação está preenchida, tudo foi fotografado e plotado, a coleta e as amostras controle foram feitas, os vestígios estão embalados e identificados e há meios de transporte adequados.",
   "B": "o laudo já se encontra redigido em sua versão preliminar, se os quesitos formulados pela autoridade foram integralmente respondidos e se a conclusão foi submetida à conferência do perito supervisor da unidade.",
   "C": "os exames complementares foram solicitados aos setores especializados e seus prazos de resposta foram formalmente acordados.",
   "D": "a autoridade policial confirmou a tipificação provisória do delito, de modo a orientar a redação do tópico de dinâmica dos fatos."},
  "A",
  "São os seis itens de conferência da reunião final, todos relativos ao trabalho de campo. B antecipa a redação do laudo, que é posterior. C trata de providências de laboratório, não da conferência do local. D é falsa porque a tipificação não condiciona o trabalho pericial, que se assenta nos vestígios.",
  nivel="medio")

q(2, "Sobre a etapa de preparação, é correto afirmar que:",
  {"A": "inicia-se com a chegada da equipe ao local, quando finalmente é possível avaliar as reais condições de trabalho.",
   "B": "antecede o deslocamento e abrange informações sobre a cena, tipo de local, condições do isolamento, urgência, material, transporte e comunicação.",
   "C": "resume-se à conferência do material de coleta, já que as demais providências dependem de dados que só existem no local.",
   "D": "pode ser suprimida nos casos urgentes, hipótese em que a equipe se desloca e improvisa os materiais disponíveis na unidade mais próxima."},
  "B",
  "A preparação antecede tudo e reúne recursos humanos e materiais, a partir de informações sobre localização, tipo de crime, isolamento, urgência, equipamento, transporte e comunicação. A desloca o início da etapa. C reduz indevidamente seu alcance. D é a mais capciosa: na urgência a etapa fica prejudicada, mas o próprio material recomenda mitigar isso enviando parte da equipe à frente enquanto a outra providencia os meios — e não suprimir o planejamento.")

# ============ 3. DOCUMENTAÇÃO ============

q(3, "São métodos de documentação do local de crime:",
  {"A": "descrição narrativa, croqui e registro fotográfico.",
   "B": "descrição narrativa, croqui e levantamento papiloscópico das superfícies de contato.",
   "C": "croqui, registro fotográfico e coleta das amostras controle dos suportes examinados.",
   "D": "descrição narrativa, registro fotográfico e reconstituição preliminar da dinâmica no próprio local."},
  "A",
  "São exatamente três: narrativa, croqui e fotografia — esta última podendo ser complementada por filmagem. B substitui a fotografia pelo levantamento papiloscópico, que é coleta, não documentação. C substitui a narrativa pela amostra controle, que também é coleta. D substitui o croqui por uma reconstituição, que é exame autônomo e posterior.")

q(3, "Sobre a descrição narrativa, assinale a alternativa correta.",
  {"A": "Deve ser feita obrigatoriamente por escrito, para que possa ser anexada ao laudo com valor de documento.",
   "B": "Deve ser deixada para o momento da redação do laudo, quando o perito dispõe de condições adequadas de trabalho.",
   "C": "Pode ser escrita, gravada em áudio ou em áudio e vídeo, e a melhor oportunidade para realizá-la é na própria cena.",
   "D": "Deve limitar-se aos vestígios efetivamente coletados, evitando-se o registro de elementos que não serão objeto de exame."},
  "C",
  "A narrativa admite as três formas e deve ser feita na cena — o material é expresso ao dizer que ali está a melhor oportunidade e o melhor lugar. A cria uma exigência de forma escrita que não existe. B contraria diretamente a recomendação, e é justamente o erro que o material adverte (confiar na memória). D restringe indevidamente: a descrição abrange tudo o que for encontrado, pois em princípio nenhum item é insignificante.")

q(3, "O professor pediu foco especial na triangulação. Sobre esse método, assinale a alternativa correta.",
  {"A": "Posiciona o vestígio pela distância a dois referenciais fixos e perenes; objeto puntual exige uma triangulação e objeto grande, duas.",
   "B": "Posiciona o vestígio pela distância a um referencial fixo somada ao ângulo medido a partir do norte magnético com auxílio de bússola.",
   "C": "Posiciona o vestígio por medidas ortogonais tomadas a partir de uma linha base, sendo indicado quando os vestígios se alinham em uma direção.",
   "D": "Posiciona o vestígio por duas medidas tomadas de paredes perpendiculares entre si, o que o torna método próprio de ambientes fechados."},
  "A",
  "São os três pontos cobrados: dois referenciais fixos, que precisam ser perenes; objeto puntual pede uma triangulação, objeto grande pede duas (uma em cada extremidade), fornecendo posição e dimensão. B descreve as coordenadas polares. C descreve o método da linha base. D descreve as coordenadas cartesianas.",
  prof=True)

q(3, "Assinale a alternativa que associa corretamente o método de croqui à sua situação típica de emprego.",
  {"A": "Coordenadas cartesianas — áreas abertas nas quais é difícil estabelecer um segundo referencial fixo.",
   "B": "Coordenadas polares — áreas abertas, admitindo-se referencial artificial e medida angular a partir dos pontos cardeais.",
   "C": "Linha base — ambientes fechados, tomando-se as duas paredes perpendiculares como eixos de referência.",
   "D": "Triangulação — vestígios concentrados em uma mesma direção, medidos ortogonalmente a partir de uma trena esticada."},
  "B",
  "As polares servem às áreas abertas, admitem referencial artificial (haste metálica localizável por detector de metais) e medida angular geralmente a partir do norte. A atribui às cartesianas o contexto das polares. C atribui à linha base o contexto das cartesianas. D atribui à triangulação o contexto da linha base.")

q(3, "Quanto ao registro fotográfico de cada vestígio, a recomendação geral é de no mínimo três fotografias. São elas:",
  {"A": "uma panorâmica do ambiente, uma do vestígio com escala e uma do vestígio já acondicionado em sua embalagem lacrada.",
   "B": "uma do vestígio contextualizado, uma em close sem escala e uma em close com escala.",
   "C": "uma do vestígio contextualizado, uma em close com escala e uma tomada em posição oblíqua para realce do relevo.",
   "D": "uma do acesso ao local, uma do vestígio contextualizado e uma em close com escala e identificação do fotógrafo."},
  "B",
  "São as três: contextualizada, close SEM escala e close COM escala. A foto sem escala é recomendada porque já houve casos de a escala ser colocada sobre vestígios menores ainda não percebidos. A, C e D substituem justamente essa foto sem escala por outras tomadas, perdendo a razão técnica da regra.")

q(3, "Pegadas, impressões papilares e marcas de pneus devem ser fotografadas:",
  {"A": "com a câmera em posição ortogonal ao suporte, para evitar distorção das medidas.",
   "B": "com a câmera inclinada a aproximadamente 45 graus, para que a luz realce o relevo da marca.",
   "C": "com uso de flash automático, que uniformiza a iluminação e padroniza a exposição entre as tomadas.",
   "D": "ao meio-dia, quando a incidência vertical da luz solar elimina sombras que possam mascarar detalhes."},
  "A",
  "A câmera vai perpendicular (ortogonal) ao suporte; fotografar em ângulo distorce as medidas e inviabiliza o confronto. B confunde com a posição do FLASH, que é mantido a cerca de 45 graus quando necessário — a câmera permanece perpendicular. C é o oposto da recomendação: o flash automático satura e achata o vestígio. D também inverte: o meio-dia satura a marca, sendo preferíveis a manhã e o fim da tarde.")

q(3, "Segundo a Instrução Técnica 20/2013-DITEC/PF, assinale a alternativa correta.",
  {"A": "Os vestígios devem ser fotografados após a coleta, em ambiente controlado, onde a iluminação pode ser padronizada.",
   "B": "A documentação fotográfica deve orientar-se do específico para o geral, partindo do detalhe do vestígio para o conjunto da cena.",
   "C": "Os vestígios devem ser fotografados no local em que foram encontrados, antes de sua coleta, e o memorial deve ir do geral para o específico.",
   "D": "O memorial fotográfico é facultativo, cabendo ao perito supervisor decidir sobre sua produção conforme a complexidade do local."},
  "C",
  "Reúne o art. 20 (fotografar no local, antes da coleta) e o art. 21, §1º (do geral para o específico). A inverte o momento do registro. B inverte o sentido da progressão. D é falsa: o art. 21 determina que os peritos DEVERÃO produzir o memorial fotográfico.")

# ============ 4. FOTOGRAFIA ============

q(4, "As três regulagens que compõem o triângulo da exposição são:",
  {"A": "abertura do diafragma, tempo de exposição e sensibilidade ISO do sensor.",
   "B": "abertura do diafragma, distância focal da objetiva e sensibilidade ISO do sensor.",
   "C": "tempo de exposição, balanço de branco e profundidade de campo da objetiva empregada.",
   "D": "abertura do diafragma, tempo de exposição e resolução do sensor expressa em megapixels."},
  "A",
  "O triângulo é diafragma, obturador (tempo) e ISO. B troca o tempo pela distância focal, que altera o ângulo de visão, não a exposição. C troca duas: o balanço de branco corrige a temperatura de cor e a profundidade de campo é consequência da abertura. D troca o ISO pela resolução, que não tem relação com a quantidade de luz registrada.",
  nivel="medio")

q(4, "Considere o tempo de exposição de 1/15 e a abertura f/8. Para corrigir uma fotografia tremida, o perito alterou o tempo para 1/125, mantendo o ISO. Para conservar a mesma intensidade luminosa, a abertura deverá ser ajustada para:",
  {"A": "f/22, pois o encurtamento do tempo exige o fechamento proporcional do diafragma.",
   "B": "f/16, correspondente ao deslocamento de dois pontos na escala de números f.",
   "C": "f/11, mantendo-se próxima da abertura original por se tratar de variação moderada.",
   "D": "f/2.8."},
  "D",
  "De 1/15 para 1/125 são três cliques (1/30, 1/60, 1/125), com perda de luz. Compensa-se abrindo três cliques: f/8 → f/5.6 → f/4 → f/2.8. A e B fecham o diafragma, agravando a perda de luz em vez de compensá-la. C reduz o deslocamento a um único ponto e ainda no sentido errado.",
  prof=True)

q(4, "O fotômetro indicou, com ISO 100, a regulagem de 1/1000 e f/8. Mantido o ISO e alterada a velocidade para 1/250, a abertura deverá ser ajustada para:",
  {"A": "f/16.",
   "B": "f/4, pois a redução da velocidade do obturador precisa ser acompanhada da abertura do diafragma.",
   "C": "f/8, uma vez que a variação do tempo de exposição não repercute na abertura necessária.",
   "D": "f/22, correspondente ao deslocamento de três pontos no sentido do fechamento do diafragma."},
  "A",
  "De 1/1000 para 1/250 são dois cliques com ganho de luz; compensa-se fechando dois: f/8 → f/11 → f/16. B abre o diafragma, somando luz a um ajuste que já aumentou a luz. C nega a compensação, que é justamente o objeto da questão. D erra a contagem: são dois pontos, não três.")

q(4, "Com ISO 400, a regulagem indicada foi 1/250 e f/11. Mantido o ISO e alterada a abertura para f/5,6, a velocidade do obturador deverá ser ajustada para:",
  {"A": "1/125, acompanhando a abertura do diafragma com o alongamento do tempo de exposição.",
   "B": "1/1000.",
   "C": "1/250, pois a alteração da abertura é compensada automaticamente pelo fotômetro da câmera.",
   "D": "1/500, correspondente ao deslocamento de um ponto na escala de tempo de exposição."},
  "B",
  "De f/11 para f/5.6 são dois cliques com ganho de luz; compensa-se acelerando dois: 1/250 → 1/500 → 1/1000. A alonga o tempo, somando ainda mais luz. C supõe compensação automática, o que não ocorre no modo manual proposto. D acerta o sentido, mas desloca apenas um ponto.")

q(4, "Com ISO 400, 1/250 e f/11, o fotógrafo altera o ISO para 200 e a abertura para f/5,6. Para manter a mesma luminosidade, a velocidade deverá ser:",
  {"A": "1/250, pois as alterações de ISO e de abertura se anulam integralmente entre si.",
   "B": "1/125, já que a redução do ISO exige maior tempo de exposição do sensor à luz.",
   "C": "1/500.",
   "D": "1/1000, correspondente à soma dos dois pontos ganhos na abertura com o ponto perdido no ISO."},
  "C",
  "Reduzir o ISO de 400 para 200 custa 1 ponto de luz; abrir de f/11 para f/5.6 ganha 2. O saldo é +1, compensado acelerando um ponto: 1/250 → 1/500. A supõe anulação, mas os efeitos não têm a mesma magnitude. B ignora o ganho maior vindo do diafragma. D soma os deslocamentos em vez de compensar o saldo líquido.")

q(4, "Sobre as escalas de tempo de exposição e de abertura, o professor advertiu que a tabela da apostila corre em sentido invertido em relação à que utilizou em aula. A conclusão correta é:",
  {"A": "a lógica de compensação se inverte conforme a tabela adotada, devendo o candidato memorizar as duas convenções possíveis.",
   "B": "a lógica é a mesma; deve-se ler o sentido da tabela apresentada e raciocinar pelo saldo de luz, sem memorizar o lado.",
   "C": "a tabela da apostila contém erro material, razão pela qual deve ser desconsiderada em favor da série clássica de valores.",
   "D": "as duas tabelas são equivalentes apenas quando o ISO permanece fixo, hipótese em que qualquer sentido de leitura conduz ao mesmo resultado."},
  "B",
  "Ele foi explícito: a apostila pode estar invertida, mas a lógica é a mesma. A regra segura é ler o sentido da tabela que vier e raciocinar pelo saldo de luz. A sugere memorizar lados, exatamente o que ele desaconselhou. C trata como erro o que é apenas convenção de apresentação. D condiciona a equivalência ao ISO fixo, o que não altera o fato de cada passo dobrar ou reduzir a luz pela metade.",
  prof=True)

q(4, "Em fotografia noturna ou de baixa iluminação, é correto afirmar que:",
  {"A": "o tempo de exposição é alto, o que exige estabilização por tripé, sob pena de a imagem sair tremida.",
   "B": "o tempo de exposição é baixo, compensando-se a perda de luz com o fechamento adicional do diafragma.",
   "C": "o aumento do ISO dispensa a estabilização, pois a maior sensibilidade do sensor encurta o tempo de captura.",
   "D": "deve-se privilegiar o flash automático, que congela a cena e elimina a necessidade de apoio para a câmera."},
  "A",
  "Pouca luz exige tempo de exposição alto e, por consequência, tripé — foi o ponto que o professor mandou não esquecer. B inverte o tempo e ainda fecha o diafragma, reduzindo mais a luz. C é capciosa: o ISO pode ser elevado, mas gera ruído e não substitui a estabilização. D contraria as recomendações de uso do flash, que não resolve a iluminação geral de um ambiente amplo.",
  prof=True)

q(4, "Sobre o ISO, assinale a alternativa correta.",
  {"A": "Valores elevados são indicados para ambientes claros, pois reduzem o risco de superexposição do sensor.",
   "B": "Valores muito elevados provocam ruído, que se manifesta como pequenos grãos ou pontos coloridos indesejados.",
   "C": "Sua alteração não interfere na exposição, limitando-se a definir a resolução final do arquivo gerado.",
   "D": "Valores baixos são indicados para ambientes com pouca luz, por prolongarem a captação do sensor."},
  "B",
  "ISO alto gera ruído — a advertência que o professor repetiu ao tratar da fotografia noturna. A inverte a indicação: valores baixos (100-200) é que servem a ambientes claros. C nega a participação do ISO na exposição, sendo ele um dos três vértices do triângulo. D inverte novamente: pouca luz pede ISO elevado, não baixo.")

q(4, "Sobre a abertura do diafragma e a profundidade de campo, assinale a alternativa correta.",
  {"A": "Quanto maior o número f, maior a abertura do diafragma e menor a profundidade de campo obtida.",
   "B": "Quanto menor a abertura (número f maior), maior a profundidade de campo e mais nítida a fotografia.",
   "C": "A profundidade de campo depende exclusivamente da distância focal, sendo indiferente à abertura empregada.",
   "D": "Quanto menor o número f, maior a profundidade de campo, o que recomenda f/22 para retratos com fundo desfocado."},
  "B",
  "Diafragma mais fechado (número f maior) resulta em maior zona de nitidez. A inverte a relação entre número f e abertura — número f maior significa abertura MENOR. C nega a influência da abertura, que é o fator determinante. D inverte a relação e ainda contradiz o exemplo que apresenta, pois f/22 é abertura pequena e produz muita profundidade, não fundo desfocado.")

q(4, "É correto afirmar sobre os números f que:",
  {"A": "f/1.4 representa abertura maior que f/32, pois o número f é um divisor: quanto maior o número, menor a abertura.",
   "B": "f/32 representa abertura maior que f/1.4, acompanhando a progressão crescente da escala numérica dos números f.",
   "C": "a escala de números f é linear, de modo que f/8 admite o dobro da luz admitida por f/4.",
   "D": "os números f indicam o tempo em que o diafragma permanece aberto, medido em frações de segundo."},
  "A",
  "É a explicação que o professor deu para justificar o sentido da tabela: f é fração, então dividir por 1,4 dá diâmetro maior que dividir por 32. B inverte. C erra duas vezes: a escala não é linear e f/8 admite METADE da luz de f/5.6, não o dobro da de f/4. D confunde diafragma com obturador.")

# ============ 5. VESTÍGIOS QUÍMICOS ============

q(5, "Na coleta de vestígios químicos líquidos, medido o pH, a regra de acondicionamento é:",
  {"A": "pH ácido em frasco de plástico e pH básico em frasco de vidro, sendo o ácido fluorídrico a única exceção admitida.",
   "B": "pH ácido em frasco de vidro, com exceção do ácido fluorídrico, e pH básico em frasco de plástico, sem exceção.",
   "C": "pH ácido e pH básico em frasco de vidro âmbar, diferenciando-se apenas a largura da boca do recipiente utilizado.",
   "D": "pH ácido em frasco de vidro e pH básico em saco plástico vedado com fita adesiva de boa qualidade."},
  "B",
  "É a regra central: ácido (ou neutro) vai em vidro, exceto o ácido fluorídrico, que ataca o vidro e vai em plástico; básico vai em plástico, sem exceção. A inverte os dois lados da regra. C ignora a distinção por pH. D acerta o ácido, mas admite saco plástico para o básico, quando a exigência é de FRASCO — ponto que o professor destacou como pegadinha.",
  prof=True)

q(5, "O professor advertiu que a banca costuma explorar um detalhe do acondicionamento de líquido de pH básico. Trata-se de:",
  {"A": "a substituição do frasco de plástico por saco plástico, que não atende à exigência normativa.",
   "B": "a exigência de que o frasco de plástico tenha boca estreita, sendo inadequado o de boca larga.",
   "C": "a necessidade de refrigerar o frasco imediatamente após a coleta, sob pena de alteração do pH.",
   "D": "a obrigatoriedade de que o frasco seja estéril, e não apenas limpo, como ocorre com os demais químicos."},
  "A",
  "A pegadinha é exatamente essa: tem que ser FRASCO de plástico, não saquinho. B trata da boca do frasco, detalhe que o professor disse não interferir no acerto. C inventa uma exigência de refrigeração inexistente para químicos. D transporta para os químicos a exigência de esterilidade, que é dos biológicos.",
  prof=True)

q(5, "Quanto à embalagem, a diferença entre vestígios químicos e biológicos é que:",
  {"A": "ambos exigem embalagem estéril, diferindo apenas quanto à permeabilidade ao ar exigida para os biológicos.",
   "B": "os químicos exigem embalagem estéril e os biológicos, apenas limpa, dado o risco de reação com o material coletado.",
   "C": "os químicos exigem embalagem limpa, enquanto os biológicos exigem material limpo, novo ou estéril.",
   "D": "os químicos dispensam qualquer requisito de limpeza, desde que o frasco seja quimicamente compatível com a substância."},
  "C",
  "Para os químicos basta a embalagem limpa; para os biológicos, limpa não basta — o material tem que ser novo ou estéril, pelo risco de contaminação. A estende a esterilidade aos químicos. B inverte inteiramente os dois regimes. D dispensa a limpeza, que é requisito mesmo nos químicos.")

q(5, "Segundo a IT 006/2006-DITEC/PF, agrupado o material por semelhança física, o número de unidades a amostrar é:",
  {"A": "todas as unidades se n < 10; dez unidades aleatórias se 10 ≤ n ≤ 100; raiz de n, arredondada para cima, se n > 100.",
   "B": "dez unidades aleatórias se n < 10; todas as unidades se 10 ≤ n ≤ 100; raiz de n, arredondada para baixo, se n > 100.",
   "C": "todas as unidades se n < 10; raiz de n se 10 ≤ n ≤ 100; dez unidades aleatórias se n > 100.",
   "D": "metade das unidades em qualquer faixa, respeitado o mínimo de dez amostras por grupo formado."},
  "A",
  "É a progressão correta, com o arredondamento da raiz para o inteiro superior. B inverte as duas primeiras faixas e ainda arredonda para baixo. C troca os critérios das duas últimas faixas. D substitui a regra por um percentual fixo que não existe na instrução técnica.")

q(5, "São casos especiais de amostragem de produtos líquidos:",
  {"A": "mistura heterogênea em recipiente transparente, coletando-se três pontos; recipiente opaco, coletando-se uma amostra de cada fase visível.",
   "B": "mistura heterogênea em recipiente transparente, coletando-se uma amostra de cada fase; recipiente opaco, coletando-se ao menos três pontos.",
   "C": "qualquer líquido, coletando-se sempre da superfície, por ser a região de maior concentração dos componentes voláteis.",
   "D": "qualquer líquido, encaminhando-se sempre o recipiente original integralmente, vedada a retirada de alíquotas."},
  "B",
  "No recipiente transparente é possível ver as fases e amostrar cada uma; no opaco, sem essa visão, coletam-se pelo menos três pontos (superfície, meio e fundo). A troca os dois procedimentos entre si. C generaliza indevidamente a coleta de superfície. D veda a alíquota, quando a regra geral é preservar parte do conteúdo para contraprova.")

q(5, "As quantidades mínimas recomendadas de amostra são:",
  {"A": "100 g para sólidos de 1 a 10 kg; 200 mL para líquidos de 1 a 10 L; no mínimo 1 L por unidade de combustível.",
   "B": "200 g para sólidos de 1 a 10 kg; 100 mL para líquidos de 1 a 10 L; no mínimo 500 mL por unidade de combustível.",
   "C": "50 g para sólidos de 1 a 10 kg; 100 mL para líquidos de 1 a 10 L; no mínimo 2 L por unidade de combustível.",
   "D": "100 g para sólidos e 100 mL para líquidos em qualquer faixa, dispensada regra própria para combustíveis."},
  "A",
  "São os três números da tabela. B inverte os valores de sólido e líquido e reduz o mínimo de combustível. C reduz o sólido e dobra o combustível. D uniformiza os valores e suprime a regra específica do combustível, que tem mínimo próprio por unidade.",
  nivel="medio")
