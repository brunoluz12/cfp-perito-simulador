# -*- coding: utf-8 -*-
"""Bizuraço Prova — questões, parte 3: seções 11 a 15."""

Q = []


def q(sec, enun, alts, cor, just, nivel="dificil", prof=False):
    Q.append({
        "secao": sec, "enunciado": enun, "alternativas": alts,
        "resposta_correta": cor, "justificativa": just,
        "nivel": nivel, "prof": prof,
    })


# ============ 11. MANCHAS DE SANGUE ============

q(11, "O professor afirmou que, para trabalhar manchas de sangue, é indispensável primeiro:",
  {"A": "identificar e classificar corretamente as manchas, pois sem isso não se estabelece a dinâmica do evento.",
   "B": "confirmar a natureza hemática do material por teste presuntivo, antes de qualquer inferência morfológica.",
   "C": "medir o ângulo de impacto de todas as manchas visíveis, para só então definir o ponto de convergência.",
   "D": "coletar material para exame de DNA, já que a classificação morfológica depende do perfil genético obtido."},
  "A",
  "Ele foi direto: sem saber identificar e classificar, você morre na praia e não faz a dinâmica. B trata de um exame de constatação que não é o pressuposto da leitura morfológica cobrada. C inverte a ordem: a medição de ângulos pressupõe a classificação prévia dos padrões. D condiciona a morfologia ao DNA, que são exames independentes.",
  prof=True)

q(11, "Sobre o formato das questões de manchas de sangue, o professor esclareceu que:",
  {"A": "só haverá questões descritivas, pois imagens não são reproduzidas com fidelidade suficiente no caderno de prova.",
   "B": "pode haver foto, descrição ou ambas, e na prova em computador é possível dar zoom, sendo as fotos coloridas.",
   "C": "haverá exclusivamente fotografias, todas inéditas, produzidas especificamente para a avaliação final da disciplina.",
   "D": "as imagens serão apresentadas em escala de cinza, para não favorecer candidatos com melhor acuidade cromática."},
  "B",
  "Ele disse que pode ter foto, descrição, pode ter tudo, e destacou a vantagem do zoom e das fotos coloridas na prova em computador. A e C absolutizam um único formato. D afirma escala de cinza, contrariando a informação de que as fotos são coloridas.",
  prof=True)

q(11, "Assinale a alternativa que associa corretamente o padrão de mancha ao seu mecanismo de formação.",
  {"A": "Gotejada: formada pela ação da gravidade; arterial: pelo bombeamento cardíaco, com alternância entre sístole e diástole.",
   "B": "Gotejada: formada pelo desprendimento de sangue de instrumento em movimento; arterial: pela ação exclusiva da gravidade.",
   "C": "Impactada: formada pela absorção do sangue por superfície porosa; cast-off: por impacto sobre uma fonte de sangue.",
   "D": "Cast-off: formada pela ação da gravidade sobre gota isolada; impactada: pelo escorrimento a partir da área de lesão."},
  "A",
  "Gotejada tem a gravidade como única força atuante; a arterial soma o bombeamento cardíaco, com variação de intensidade entre sístole e diástole. B troca gotejada com cast-off e reduz a arterial à gravidade. C confunde impactada com saturação e cast-off com impactada. D atribui ao cast-off o mecanismo da gotejada e à impactada o do escorrimento.")

q(11, "A mancha de sangue do tipo cast-off (espargimento de dissociação) caracteriza-se por:",
  {"A": "conjunto radial de manchas a partir de um ponto de origem, formado por impacto sobre fonte de sangue.",
   "B": "sequência de manchas em linha, que começa circular e termina elíptica, formada pelo desprendimento de instrumento.",
   "C": "mancha única e alongada, formada pelo escorrimento do sangue ao longo de superfície vertical, sob ação da gravidade.",
   "D": "conjunto de manchas elípticas acompanhado de escorrimento característico, típico de lesão em vaso de grande calibre."},
  "B",
  "O cast-off vem do sangue que se desprende de um instrumento em movimento ou por parada repentina, formando sequência linear que começa circular e termina elíptica. A descreve a impactada. C descreve o escorrimento. D descreve o padrão arterial.")

q(11, "Sobre as manchas alteradas, assinale a alternativa correta.",
  {"A": "A alteração por contato só é reconhecida quando reproduz a forma do objeto; caso contrário, classifica-se como mancha por acúmulo.",
   "B": "Quando a mancha permite identificar o objeto que causou a transferência, classifica-se como alterada por contato e transferida.",
   "C": "A mancha do tipo sombra decorre do acúmulo de sangue ao redor de objeto interposto, que retém o material em suas bordas.",
   "D": "A alteração por diluição pressupõe a ação humana deliberada de lavagem, não abrangendo a ação da chuva sobre o local."},
  "B",
  "Se a mancha reproduz a forma do objeto — mão, solado, instrumento — é alterada por contato E transferida; se apenas borrou, é só alterada por contato. A cria uma reclassificação para acúmulo que não existe. C inverte a sombra, que decorre da AUSÊNCIA de sangue no ponto onde o objeto impediu a deposição. D exclui a chuva, que é justamente o exemplo dado de diluição.")

q(11, "São classificadas como manchas por acúmulo:",
  {"A": "sangue sobre sangue, poça, saturação e escorrimento.",
   "B": "sangue sobre sangue, poça, sombra e transferência por contato.",
   "C": "poça, saturação, impactada e padrão arterial com escorrimento associado.",
   "D": "saturação, escorrimento, gotejamento em sequência e espargimento por dissociação do instrumento."},
  "A",
  "São as quatro do grupo, sendo a saturação a que decorre da absorção pela superfície (colchão, panos grossos). B inclui sombra e transferência, que são manchas ALTERADAS. C inclui impactada e arterial, que são regulares. D inclui gotejamento e cast-off, também do grupo das regulares.")

q(11, "Comparando duas manchas impactadas produzidas por disparos de arma de fogo, aquela cujas gotículas são visivelmente menores, com aspecto de spray, indica:",
  {"A": "menor energia, pois a redução do diâmetro decorre da perda de velocidade do projétil antes do impacto.",
   "B": "maior energia, pois quanto maior a energia, maior a atomização e menores os diâmetros das manchas.",
   "C": "maior distância do disparo, sendo a energia envolvida irrelevante para o tamanho das gotículas formadas.",
   "D": "maior volume de sangue na fonte atingida, o que fragmenta o material em partículas de menor diâmetro."},
  "B",
  "É a regra que ele repetiu duas vezes: maior energia, maior atomização, menores as manchas. A inverte a relação. C substitui a energia pela distância, que não é o fator determinante da atomização. D atribui o efeito ao volume de sangue, quando o que fragmenta é a energia transferida.",
  prof=True)

q(11, "Ao classificar manchas de sangue a partir de uma fotografia, deve-se atentar para que:",
  {"A": "cada imagem admite uma única classificação, devendo o perito optar pelo padrão predominante na cena retratada.",
   "B": "uma mesma imagem pode apresentar mais de uma classificação simultânea, como impactada com alteração por contato.",
   "C": "a classificação depende da confirmação laboratorial da natureza hemática, sendo provisória qualquer leitura feita no local.",
   "D": "manchas em superfícies irregulares não são classificáveis, pois a textura do suporte descaracteriza o padrão original."},
  "B",
  "Ele mostrou imagens com classificação múltipla — uma impactada que também tinha alteração por contato, e uma cena em que a remoção da rede revelaria uma sombra. A impõe exclusividade inexistente. C condiciona a leitura morfológica ao laboratório. D exclui as superfícies irregulares, quando a influência da superfície é justamente um dos elementos de análise.",
  prof=True)

q(11, "Sobre o que se pode inferir do estudo morfológico das manchas de sangue:",
  {"A": "posição da vítima e do agressor, movimentação após o ferimento, intensidade do traumatismo e movimentos durante o golpe.",
   "B": "posição da vítima, tempo decorrido desde o óbito e identificação do instrumento utilizado na agressão.",
   "C": "intensidade do traumatismo e tipo sanguíneo da vítima, obtido pela coloração apresentada pelas manchas mais recentes.",
   "D": "movimentação após o ferimento e número exato de golpes desferidos, calculado pela quantidade de padrões de cast-off."},
  "A",
  "São as quatro inferências listadas. B inclui a datação do óbito, que é da cronotanatognose, e a identificação do instrumento, que a morfologia apenas sugere. C afirma a determinação do tipo sanguíneo pela cor, o que não ocorre — a cor indica a idade da mancha. D afirma um número exato de golpes, que o padrão não permite estabelecer.")

q(11, "Sobre as características das manchas e a informação que cada uma fornece:",
  {"A": "a cor indica a dinâmica; a forma, a data da mancha; a dimensão, a posição relativa da vítima.",
   "B": "a cor indica a data da mancha; a forma, a dinâmica; a dimensão, a intensidade das lesões.",
   "C": "a cor indica a intensidade das lesões; a forma, a data; a dimensão, a distância percorrida pela gota.",
   "D": "a cor indica a origem arterial ou venosa; a forma, a altura de queda; a dimensão, a superfície de impacto."},
  "B",
  "A cor evolui com a lise celular e a oxidação do heme, revelando a idade da mancha; a forma revela a dinâmica; a dimensão, a intensidade das lesões. A, C e D embaralham essas correspondências, atribuindo a cada característica uma informação que pertence a outra.")

# ============ 12. CRIMES CONTRA O PATRIMÔNIO ============

q(12, "Sobre a quantidade e a natureza dos vestígios nos locais de crime contra o patrimônio:",
  {"A": "o roubo produz quantidade significativa de vestígios pelo contato direto com a vítima; o furto, escassez, pela ação furtiva.",
   "B": "o roubo produz escassez de vestígios, pela rapidez da ação; o furto com arrombamento produz quantidade significativa.",
   "C": "ambos produzem quantidade equivalente de vestígios, variando apenas a natureza do material predominante em cada um.",
   "D": "o dano produz escassez de vestígios, ao passo que roubo e furto se equiparam quanto ao volume de material recuperável."},
  "B",
  "O roubo é ação rápida e dinâmica, com poucos vestígios; o arrombamento envolve acesso forçado, circulação e subtração, gerando muitos. A inverte integralmente. C nega a distinção, que é justamente o contraste cobrado. D desloca a comparação para o dano, cujos vestígios próprios são a destruição e as marcas de ferramenta.",
  prof=True)

q(12, "São vestígios tipicamente encontrados em local de furto com arrombamento:",
  {"A": "marcas de arrombamento e de ferramentas, fragmentos de vidro, pegadas, marcas de escalada e vestígios biológicos.",
   "B": "apenas marcas de ferramenta e fragmentos de vidro, sendo os biológicos próprios dos crimes contra a pessoa.",
   "C": "cordas de contenção das vítimas, projéteis deflagrados e registros de videomonitoramento das vias públicas.",
   "D": "pichações e grafismos não autorizados, além de mobiliário propositalmente destruído pelos agentes no interior do imóvel."},
  "A",
  "É o rol do arrombamento, que inclui os biológicos (suor, sangue, saliva, urina, fezes). B exclui os biológicos, contrariando a resposta dada em aula de que pode haver biológico em qualquer crime. C lista vestígios típicos de roubo. D lista vestígios típicos de dano.")

q(12, "Sobre as marcas de ferramenta em locais de arrombamento:",
  {"A": "são dos tipos compressão, cisalhamento, impacto e repetição, e podem chegar a individualizar a ferramenta utilizada.",
   "B": "são dos tipos por impressão, por depósito e por desenho, permitindo apenas indicar a classe do instrumento empregado.",
   "C": "não admitem moldagem, devendo ser documentadas exclusivamente por fotografia com escala e por descrição narrativa.",
   "D": "prestam-se somente a demonstrar o rompimento de obstáculo, sem aptidão para vincular o vestígio a instrumento determinado."},
  "A",
  "São os quatro tipos, e o valor probatório vai além de indicar o tipo: pode individualizar a ferramenta. B usa a classificação das marcas de SOLADO e limita o alcance probatório. C nega a moldagem, que integra as formas de registro. D reduz a prova ao rompimento de obstáculo, desconsiderando a possibilidade de individualização.")

q(12, "Sobre as marcas de solados encontradas em local de crime:",
  {"A": "classificam-se em compressão, cisalhamento e impacto, e prestam-se exclusivamente a incriminar o suspeito confrontado.",
   "B": "classificam-se em por impressão, por depósito e por desenho, e podem incriminar ou eliminar um suspeito.",
   "C": "permitem determinar o número de participantes, mas não auxiliam no estabelecimento da dinâmica do evento delituoso.",
   "D": "quando encontradas fora do solo, indicam contaminação da cena por terceiros que ingressaram após o fato."},
  "B",
  "São os três tipos, e o valor probatório é duplo: pode incriminar OU eliminar. A usa a classificação das marcas de ferramenta e ignora a função de exclusão. C nega a contribuição à dinâmica, que é expressamente listada. D inverte o significado: pegada fora do solo é indicativa de ESCALADA.")

q(12, "Durante a busca completa em local de furto, a disposição geral do ambiente deve ser observada porque:",
  {"A": "ambiente em completa desordem indica busca exaustiva pelo bem, e ambiente excessivamente organizado pode indicar conhecimento prévio.",
   "B": "ambiente em completa desordem indica ação de mais de um agente, e ambiente organizado, ação de agente isolado.",
   "C": "ambiente em completa desordem indica simulação do delito pela própria vítima, sendo a organização sinal de autenticidade.",
   "D": "a disposição do mobiliário é irrelevante para o laudo, por constituir circunstância subjetiva não passível de aferição técnica."},
  "A",
  "É a leitura cobrada, e deve ser consignada em laudo. B converte a desordem em número de agentes, o que ela não permite concluir. C salta para a hipótese de autofraude sem suporte. D nega valor pericial a um dado objetivo da cena.")

q(12, "Sobre a análise de sistemas de CFTV em locais de crime contra o patrimônio:",
  {"A": "deve ser feita ao final dos trabalhos, para que as imagens confirmem os vestígios já levantados pela equipe.",
   "B": "deve ser feita antes de iniciar a busca por vestígios, conferindo-se a sincronização temporal do relógio do DVR ou NVR.",
   "C": "restringe-se às câmeras internas do imóvel periciado, por serem as únicas com cobertura útil da área de interesse.",
   "D": "dispensa a verificação do relógio do equipamento, cuja precisão é garantida pela sincronização automática com a rede."},
  "B",
  "A recomendação é checar o CFTV ANTES da busca, porque as imagens direcionam a coleta para as superfícies efetivamente tocadas; e a confiabilidade cronológica depende da conferência do relógio do DVR. A inverte o momento e perde esse direcionamento. C exclui as câmeras das adjacências, que frequentemente cobrem os acessos. D dispensa a conferência que é justamente o cuidado central.")

q(12, "Sobre os crimes contra o patrimônio e suas qualificadoras, assinale a alternativa correta.",
  {"A": "No furto, o rompimento de obstáculo é causa de aumento de pena; no roubo, o emprego de arma de fogo é qualificadora.",
   "B": "No furto, o rompimento de obstáculo é qualificadora; no roubo, o emprego de arma de fogo aumenta a pena em dois terços.",
   "C": "No furto praticado durante o repouso noturno, a pena é aumentada de um terço; no roubo, o concurso de pessoas qualifica o crime.",
   "D": "No dano, a violência à pessoa é causa de aumento; no furto, o emprego de chave falsa é circunstância meramente agravante."},
  "B",
  "O rompimento de obstáculo é qualificadora do furto (art. 155, §4º, I) e a arma de fogo no roubo aumenta a pena de dois terços (art. 157, §2º-A, I). A troca os institutos entre os dois tipos. C erra a fração do repouso noturno, que é de metade, e classifica o concurso como qualificadora do roubo, quando é causa de aumento. D trata a violência no dano como aumento, sendo qualificadora, e rebaixa a chave falsa a agravante, sendo qualificadora do furto.")

q(12, "Sobre o elemento subjetivo nos crimes contra o patrimônio examinados:",
  {"A": "furto, roubo e dano admitem a modalidade culposa quando o prejuízo decorre de conduta manifestamente descuidada.",
   "B": "não existe furto culposo, nem roubo culposo, nem se admite o dano na modalidade culposa.",
   "C": "apenas o dano admite a forma culposa, dada a possibilidade de deterioração acidental de coisa alheia.",
   "D": "apenas o furto admite a forma culposa, na hipótese de apropriação de coisa alheia por erro sobre a titularidade."},
  "B",
  "Os três exigem dolo. A generaliza a culpa aos três. C e D abrem exceções inexistentes; no caso de D, a hipótese descrita configuraria erro de tipo ou apropriação indébita, e não furto culposo.")

q(12, "O exame pericial em local de dano deve buscar estabelecer:",
  {"A": "o mecanismo de produção do dano, a intensidade da ação, o instrumento utilizado, a extensão dos prejuízos e a compatibilidade com a dinâmica apresentada.",
   "B": "apenas a extensão dos prejuízos, cuja quantificação econômica é o objeto próprio do exame de constatação de dano.",
   "C": "o mecanismo de produção do dano e a identificação do autor, que decorre necessariamente do confronto entre as marcas de ferramenta encontradas no local.",
   "D": "a intenção do agente ao produzir o dano, aferida pela extensão da destruição em relação ao valor total do bem atingido."},
  "A",
  "São os cinco pontos que o exame deve estabelecer. B reduz o exame à quantificação. C acrescenta a identificação do autor como consequência necessária, quando o confronto de marcas pode, no máximo, individualizar o instrumento. D atribui à perícia a aferição de intenção, que é matéria jurídica.")

# ============ 13. REPRODUÇÃO SIMULADA ============

q(13, "O professor perguntou se a reprodução simulada é prova pericial pura. A resposta e sua justificativa são:",
  {"A": "não é prova pericial pura, porque trabalha com elementos subjetivos, que são as versões apresentadas pelos envolvidos.",
   "B": "não é prova pericial pura, porque é presidida pela autoridade policial, e não pelo perito criminal responsável.",
   "C": "é prova pericial pura, pois se materializa em laudo assinado por peritos oficiais após confronto com os vestígios.",
   "D": "é prova pericial pura quando houver laudo de local anterior, e mista quando realizada sem exame prévio da cena."},
  "A",
  "A razão é a presença de elementos subjetivos — as versões. B troca a justificativa por uma questão de presidência do ato. C afirma a pureza a partir da forma (laudo e peritos), ignorando a natureza do material trabalhado. D cria uma gradação que não existe.",
  prof=True)

q(13, "Na reprodução simulada, podem apresentar versão:",
  {"A": "a vítima, o acusado, a testemunha e o policial que atendeu a ocorrência.",
   "B": "a vítima, o acusado e a testemunha, por serem os atores da infração.",
   "C": "a vítima, o acusado, a testemunha e o perito que examinou o local anteriormente.",
   "D": "somente o acusado e a testemunha, uma vez que a versão da vítima já consta do termo de declarações do inquérito."},
  "B",
  "São apenas os três atores da infração. O professor foi eliminando: tem versão do perito? Não. De juízes? Não. A e C acrescentam, respectivamente, o policial e o perito, que não são atores da infração. D exclui a vítima, cuja versão é justamente uma das que se confrontam.",
  prof=True)

q(13, "A base legal da reprodução simulada é o art. 7º do CPP, segundo o qual a autoridade policial:",
  {"A": "deverá proceder à reprodução simulada dos fatos sempre que houver versões conflitantes entre os envolvidos.",
   "B": "poderá proceder à reprodução simulada dos fatos, desde que esta não contrarie a moralidade ou a ordem pública.",
   "C": "poderá proceder à reprodução simulada, condicionada à concordância expressa do acusado e de seu defensor.",
   "D": "deverá proceder à reprodução simulada antes do encerramento do inquérito, nos crimes que deixam vestígios."},
  "B",
  "O dispositivo é facultativo (poderá) e traz a ressalva da moralidade e da ordem pública. A e D transformam a faculdade em dever. C acrescenta um requisito de concordância que não consta do artigo — embora ninguém possa ser obrigado a participar, a lei não condiciona o ato a essa anuência formal.")

q(13, "Se, no dia da reprodução simulada, o envolvido apresentar versão diferente daquela que consta do inquérito, o perito deve:",
  {"A": "suspender o ato e comunicar a autoridade policial, para que decida sobre o prosseguimento da diligência.",
   "B": "exigir que o depoente mantenha a versão do inquérito, sob pena de nulidade do exame já iniciado.",
   "C": "anotar, testar e prosseguir com a versão apresentada naquele momento, relatando tudo, batendo ou não com o inquérito.",
   "D": "encerrar a participação daquele envolvido e prosseguir apenas com os demais, cujas versões permaneçam íntegras."},
  "C",
  "Ele desenvolveu o ponto: pode mudar, não se pode obrigar a manter, e o procedimento continua — anota, testa, relata e segue com a versão daquele momento. A e D interrompem indevidamente o ato. B impõe uma obrigação de manter a versão que não existe e inventa hipótese de nulidade.",
  prof=True)

q(13, "Durante a execução da reprodução simulada, quanto à veracidade das versões, é correto afirmar que:",
  {"A": "o perito deve consignar no local, ao final de cada encenação, se a versão apresentada é verdadeira ou falsa.",
   "B": "o perito não emite juízo de veracidade no local; a valoração ocorre depois, na análise e no confronto com os vestígios.",
   "C": "o perito deve confrontar imediatamente o depoente com as contradições identificadas, para obter a retificação da versão.",
   "D": "a veracidade é presumida em favor da vítima e da testemunha, admitindo-se dúvida apenas quanto à versão do acusado."},
  "B",
  "Foi taxativo: não é no local que se vê isso — a valoração é posterior. O perito pode pedir confirmação (é isso mesmo que está no seu depoimento?), mas não emite juízo ali. A antecipa a valoração. C transforma o ato em interrogatório de confronto. D cria presunções de veracidade por posição processual.",
  prof=True)

q(13, "A inconstância do depoente, que apresenta versões diferentes em momentos distintos:",
  {"A": "deve ser desconsiderada, aproveitando-se apenas a última versão apresentada, por ser a mais próxima da encenação.",
   "B": "afeta a credibilidade da versão e deve ser consignada, sendo material de análise no confronto posterior.",
   "C": "acarreta a exclusão daquele depoente do exame, por comprometer a confiabilidade de todo o procedimento realizado.",
   "D": "somente é relevante quando se tratar do acusado, cuja mudança de versão indica tentativa de dissimulação."},
  "B",
  "A inconstância é dado de análise e deve ser registrada. A descarta informação relevante. C exclui o depoente, quando o correto é seguir com ele. D restringe a relevância ao acusado, sendo o critério aplicável a qualquer depoente.")

q(13, "São condições que devem ser obedecidas na reprodução simulada:",
  {"A": "horário, mesmas armas, reproduções sonoras, roupas, veículos, condições do tempo e perfil das pessoas.",
   "B": "horário e local, sendo indiferentes as roupas e os veículos, por não influírem na dinâmica reproduzida.",
   "C": "presença obrigatória do juiz e do promotor, além da identidade de horário e das condições climáticas do dia do fato.",
   "D": "identidade absoluta de todas as condições, sendo vedada a realização do exame quando alguma delas não puder ser reproduzida."},
  "A",
  "É o rol das condições, incluindo o perfil dos atores (sexo, cor, compleição, idade). B despreza roupas e veículos, cujos tipos e cores importam para questões de reconhecimento. C torna obrigatória a presença de juiz e promotor, quando o planejamento prevê reunião com representantes da acusação e da defesa. D exige identidade absoluta, quando a regra é que, não sendo possível reproduzir uma condição, ela deve ser considerada na análise final.")

q(13, "Sobre a atribuição da equipe de peritos na reprodução simulada, as funções são:",
  {"A": "questionar e acompanhar depoimentos; operar as fotografias; fazer anotações, desenhos e medições; realizar a filmagem em vídeo.",
   "B": "presidir o ato; conduzir os depoentes; registrar as imagens; redigir o termo de declarações a ser juntado ao inquérito.",
   "C": "questionar os depoentes; coletar vestígios remanescentes; confrontar as versões; concluir sobre a autoria do delito.",
   "D": "acompanhar os depoimentos; operar as fotografias; realizar a filmagem; decidir sobre a manutenção da versão do inquérito."},
  "A",
  "São as quatro funções previstas. B atribui à equipe a presidência do ato e a redação de termo, que são da autoridade policial. C inclui a conclusão sobre autoria, que não é objeto do ato. D substitui a função de anotações e medições por uma decisão sobre a versão, que ninguém pode impor ao depoente.")

q(13, "O objetivo central da reprodução simulada é:",
  {"A": "obter a confissão do acusado mediante a reconstituição detalhada dos atos executórios da infração.",
   "B": "confrontar as informações subjetivas, isto é, as versões, com os vestígios do local periciado.",
   "C": "substituir o exame de local não realizado à época, produzindo laudo com o mesmo valor probatório do original.",
   "D": "reconstituir a cena para fins didáticos e de treinamento, sem finalidade probatória autônoma no processo penal."},
  "B",
  "O objetivo central é o confronto versões × vestígios. A converte o ato em meio de obtenção de confissão. C descreve o objetivo SECUNDÁRIO — servir de alternativa quando não houve exame de local —, e ainda equipara indevidamente seu valor ao do exame original. D nega a finalidade probatória do exame.")

# ============ 14. LAUDO PERICIAL ============

q(14, "Nos termos da Portaria DITEC/PF nº 1.192/2022, art. 24, são itens OBRIGATÓRIOS do laudo:",
  {"A": "preâmbulo, histórico, objeto, exame e conclusão.",
   "B": "preâmbulo, objeto, objetivo, exame e conclusão.",
   "C": "preâmbulo, resumo, objeto, objetivo e conclusão.",
   "D": "preâmbulo, objeto, objetivo, histórico, exame e conclusão."},
  "B",
  "São os cinco do §1º. A e D incluem o histórico entre os obrigatórios, sendo ele FACULTATIVO — inversão que o professor sinalizou como armadilha. C inclui o resumo, também facultativo, e suprime o exame, que é o capítulo principal do laudo.",
  prof=True)

q(14, "São itens FACULTATIVOS do laudo pericial:",
  {"A": "resumo, sumário e histórico, exigindo-se o sumário nos laudos com mais de 30 páginas ou de complexidade que o justifique.",
   "B": "resumo, sumário e anexos, exigindo-se o sumário nos laudos com mais de 50 páginas ou de complexidade elevada.",
   "C": "histórico, considerações técnico-periciais e dinâmica do evento, que integram o corpo do laudo apenas quando pertinentes.",
   "D": "resumo, histórico e conclusão, esta última dispensável quando os exames não permitirem diagnóstico categórico."},
  "A",
  "São os três do §2º, com o parâmetro de 30 páginas para o sumário. B troca o histórico por anexos — que não são propriamente seção do laudo — e erra o número de páginas. C lista subdivisões do capítulo Exame como se fossem itens autônomos facultativos. D inclui a conclusão, que é obrigatória: mesmo sem diagnóstico categórico, deve constar a impossibilidade e seus motivos.")

q(14, "Realizada entrevista com vizinhos na chegada ao local, essa informação será consignada em qual parte do laudo?",
  {"A": "No exame, junto à descrição do ambiente externo e das rotas de acesso identificadas.",
   "B": "No histórico.",
   "C": "Na conclusão, como elemento de corroboração das respostas aos quesitos formulados.",
   "D": "Na dinâmica do evento, por integrar a reconstrução cronológica dos fatos apurados."},
  "B",
  "O histórico reúne as informações da ocorrência e as providências iniciais, e é ali que entram as entrevistas. A desloca para o exame, que trata da caracterização do local e dos vestígios. C leva à conclusão informação subjetiva, que não embasa conclusão pericial. D coloca na dinâmica, que se constrói a partir dos vestígios e dos exames complementares.",
  prof=True)

q(14, "A dinâmica do evento, no laudo de local, consiste em:",
  {"A": "narrar a versão apresentada pela vítima e pelas testemunhas, ordenando cronologicamente os fatos por elas relatados.",
   "B": "contextualizar e correlacionar as informações do levantamento de local com os resultados dos exames complementares, formando a convicção sobre como o delito ocorreu.",
   "C": "descrever minuciosamente cada vestígio encontrado, com suas dimensões e posição relativa no croqui elaborado.",
   "D": "apresentar todas as hipóteses tecnicamente possíveis para o fato, sem eleger qualquer delas, cabendo à autoridade requisitante a escolha da versão mais provável."},
  "B",
  "É a definição que o professor mandou decorar. A constrói a dinâmica sobre versões, quando ela se assenta em vestígios e exames. C descreve a caracterização dos vestígios, que antecede a dinâmica. D nega a formação de convicção, que é justamente o núcleo do conceito.",
  prof=True)

q(14, "Sobre o preâmbulo do laudo pericial:",
  {"A": "a numeração é sequencial, comum a todas as áreas e unidades de criminalística, e reinicia no primeiro dia de cada ano.",
   "B": "a numeração é própria de cada área de perícia e mantém continuidade entre os exercícios, sem reinício anual.",
   "C": "deve conter a descrição do local examinado e as condições de isolamento verificadas na chegada da equipe.",
   "D": "deve conter as respostas aos quesitos, antecipando a conclusão para facilitar a leitura pelo destinatário do laudo."},
  "A",
  "A numeração é sequencial, comum a todas as áreas e unidades, e recomeça em 1º de janeiro. B nega tanto a unicidade quanto o reinício anual. C descreve conteúdo do exame e do histórico. D antecipa a conclusão, que tem capítulo próprio.")

q(14, "O capítulo Exame do laudo de local pode ser subdividido em:",
  {"A": "local, sistemas de segurança, vestígios, exames complementares, considerações técnico-periciais, análise e interpretação dos vestígios e dinâmica do evento.",
   "B": "preâmbulo, histórico, objeto e objetivo dos exames, conforme a complexidade do local periciado e a extensão do trabalho de campo realizado pela equipe.",
   "C": "descrição narrativa, croqui e registro fotográfico, correspondentes aos três métodos de documentação empregados.",
   "D": "materialidade, autoria e dinâmica, correspondentes aos três objetivos a serem alcançados pelo exame pericial."},
  "A",
  "São as subdivisões possíveis do capítulo principal. B lista outros itens do laudo, que não são subdivisões do exame. C confunde as subdivisões com os métodos de documentação. D usa os objetivos da reprodução simulada como estrutura do capítulo.")

q(14, "Quando os peritos não reúnem elementos suficientes para um diagnóstico conclusivo:",
  {"A": "o laudo deve ser devolvido à autoridade requisitante sem o capítulo de conclusão, aguardando-se a produção de novos elementos pela investigação.",
   "B": "deve constar do laudo a impossibilidade de conclusão categórica e seus motivos, admitida também a conclusão parcial que exclua hipóteses.",
   "C": "os peritos devem apresentar a hipótese mais provável, ainda que sem suporte integral nos vestígios documentados.",
   "D": "o laudo deve concluir pela inexistência do fato, dada a ausência de comprovação técnica dos elementos alegados."},
  "B",
  "A conclusão é obrigatória, mas pode ser negativa ou parcial: registram-se a impossibilidade e os motivos (escassez de vestígios, falta de preservação), e, quando possível, excluem-se hipóteses. A suprime a seção obrigatória. C admite conclusão sem suporte nos vestígios. D transforma ausência de prova em prova de inexistência.")

q(14, "Sobre o prazo e a requisição do laudo pericial, é correto afirmar que:",
  {"A": "o prazo é de dez dias, prorrogável em casos excepcionais a requerimento dos peritos, e o exame é requisitado ao diretor da repartição.",
   "B": "o prazo é de trinta dias, improrrogável, e o exame é requisitado diretamente ao perito criminal designado para a diligência.",
   "C": "o prazo é de dez dias, improrrogável, sendo a inobservância causa de nulidade do laudo eventualmente apresentado.",
   "D": "o prazo é de dez dias, prorrogável uma única vez por igual período, mediante autorização do juiz da causa."},
  "A",
  "É o art. 160, parágrafo único, combinado com o art. 178: dez dias prorrogáveis, e requisição ao diretor da repartição — na PF, o chefe do SETEC ou do NUTEC. B erra prazo e destinatário. C nega a prorrogação e inventa nulidade. D cria um limite de prorrogação que o CPP não estabelece, justamente por se tratar de matéria técnica.")

# ============ 15. PEGADINHAS E DIVERGÊNCIAS ============

q(15, "Assinale a alternativa INCORRETA sobre o acondicionamento de vestígios.",
  {"A": "Vestígio biológico seco pode ser acondicionado em saco plástico lacrado, desde que identificado.",
   "B": "Líquido de pH básico deve ser acondicionado em frasco de plástico, sem exceção.",
   "C": "Projétil deve ser acondicionado individualmente, envolto em algodão, em envelope de papel.",
   "D": "Embalagem de vestígio químico precisa estar limpa, mas não precisa ser estéril."},
  "A",
  "A afirmação de A é falsa e por isso é a resposta: mesmo seco, o vestígio biológico exige embalagem permeável ao ar, e o saco de lacre deve ser furado. B, C e D reproduzem corretamente as regras de acondicionamento de químicos básicos, de projéteis e o padrão de limpeza exigido dos químicos.")

q(15, "Assinale a alternativa INCORRETA sobre os padrões de ruptura em vidros e a leitura de manchas de sangue.",
  {"A": "As rupturas radiais no vidro iniciam-se na face oposta àquela que recebeu o choque.",
   "B": "A base do cone de transfixação localiza-se na face oposta àquela do impacto recebido.",
   "C": "Quanto maior a energia que atinge a fonte de sangue, maiores são os diâmetros das manchas resultantes.",
   "D": "As rupturas radiais formadas pelo segundo impacto são interrompidas por aquelas formadas no primeiro."},
  "C",
  "C é a incorreta e, portanto, a resposta: maior energia produz maior atomização e manchas MENORES. A, B e D reproduzem corretamente, respectivamente, o início das radiais na face oposta, a posição da base do cone na saída e o critério de determinação da ordem dos impactos.")

q(15, "Sobre a divergência entre a apostila e a orientação dada em revisão quanto às etapas do processamento:",
  {"A": "a apostila agrupa o roteiro em seis blocos e a revisão adota sete etapas, com a documentação como quarta etapa.",
   "B": "a apostila adota sete etapas e a revisão as reduziu a seis, fundindo a documentação com a coleta de vestígios.",
   "C": "não há divergência: ambas adotam seis etapas, diferindo apenas quanto à nomenclatura da etapa de fixação.",
   "D": "a apostila adota oito etapas, incluindo a elaboração do laudo como etapa final do processamento do local."},
  "A",
  "A apostila agrupa em seis (preparação, chegada, busca completa, coleta, reunião final e liberação) e a numeração de sete etapas destaca a documentação entre a busca e a coleta. B inverte a divergência. C nega sua existência. D acrescenta o laudo ao roteiro do local, quando ele é posterior ao processamento.")

q(15, "Assinale a alternativa INCORRETA sobre a atuação pericial no local de crime.",
  {"A": "O isolamento do local pode ser feito com fita, cordas, cones ou cavaletes.",
   "B": "A prova pericial prevalece sobre a prova testemunhal, por ser a rainha das provas.",
   "C": "A perícia deve reavaliar o perímetro de isolamento encontrado, ampliando-o ou reduzindo-o.",
   "D": "Na busca inicial não vai toda a equipe, cabendo-a em regra ao perito-chefe."},
  "B",
  "B é a incorreta e, por isso, a resposta: apesar do apelido, não há hierarquia legal entre as provas. A, C e D reproduzem corretamente as orientações sobre meios de isolamento, dever de reavaliação do perímetro e execução da busca inicial pelo chefe da equipe.")
