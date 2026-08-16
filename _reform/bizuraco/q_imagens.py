# -*- coding: utf-8 -*-
"""Questoes COM IMAGEM do Bizuraco Prova — manchas de sangue.

O professor avisou que a prova tera foto nessa parte. Aqui a figura e o
enunciado: mostra-se a mancha e pergunta-se o que ela e.

Duas famílias:
  1) identificacao pura, com fotos que NAO estao no capitulo (slides de
     exercicio da aula), para nao ser memoria de legenda;
  2) leitura da dinamica, com as figuras que ja ilustram o capitulo.

As justificativas citam o CONTEUDO da alternativa, nunca a letra, para que a
letra correta possa ser distribuida sem reescrever texto.
"""

IMG = "materiais/LOC/img/"

Q = [
    # ---------- 1. identificacao do padrao (fotos novas) ----------
    dict(
        img="q_sangue_01_gotejadas.jpg", nivel="facil", letra="B",
        alt="Soleira de concreto com manchas de sangue isoladas, de contorno circular",
        legenda="Slide de exercício da aula de manchas de sangue.",
        enunciado="Observe a foto. Sobre a soleira depositaram-se manchas isoladas, de contorno predominantemente circular, sem alinhamento entre si, sem distribuição radial a partir de um ponto comum e sem escorrimento associado. Assinale a classificação desse padrão.",
        correta="Gotejadas, geradas isoladamente pela ação da gravidade.",
        erradas=[
            "Impactadas, distribuídas de forma radial a partir da origem.",
            "Cast-off, por dissociação do sangue de um objeto em movimento.",
            "Arterial, por projeção alternada do bombeamento cardíaco.",
        ],
        justificativa="Gotas isoladas, circulares, sem padrão de conjunto, é a definição de mancha GOTEJADA: geradas de forma isolada ou em sequência independente, unicamente pela ação da gravidade (o caso do corte no dedo pingando). O contorno circular indica queda perpendicular à superfície. A opção das impactadas exige um conjunto irradiando de uma origem, que a foto não mostra. A de cast-off exige a sequência em linha, que também não há. A arterial exige o escorrimento característico e a variação de volume da sístole/diástole, ausentes aqui.",
    ),
    dict(
        img="q_sangue_02_arterial.jpg", nivel="medio", letra="D",
        alt="Parede com conjuntos de manchas em arcos sucessivos e escorrimento abundante",
        legenda="Slide de exercício da aula de manchas de sangue.",
        enunciado="Na parede da foto veem-se conjuntos sucessivos de manchas dispostos em arcos, com variação nítida de volume entre um conjunto e outro, dos quais parte um escorrimento abundante. O mecanismo de formação compatível é o da mancha:",
        correta="arterial, com projeção alternada pela sístole e pela diástole.",
        erradas=[
            "gotejada, por queda livre de gotas isoladas sob ação da gravidade.",
            "impactada, por golpe desferido sobre uma fonte de sangue preexistente.",
            "por saturação, com absorção do sangue pela alvenaria da parede.",
        ],
        justificativa="O padrão é o da mancha ARTERIAL: além da gravidade atua o bombeamento cardíaco, e a alternância sístole/diástole projeta o sangue em alto volume com variação de intensidade da força — daí os arcos sucessivos de tamanhos diferentes. O escorrimento característico que desce de cada conjunto é o segundo elemento da definição, e o professor chamou esse padrão de muito distintivo. A opção das gotejadas descreve gotas isoladas por gravidade, incompatível com a projeção em arco. A das impactadas exigiria distribuição radial a partir de uma origem, não arcos repetidos. A da saturação pressupõe absorção pela superfície, e aqui o sangue escorreu sobre ela.",
    ),
    dict(
        img="q_sangue_03_castoff.jpg", nivel="medio", letra="A",
        alt="Pano branco com sequência alinhada e arqueada de manchas de sangue",
        legenda="Slide de exercício da aula de manchas de sangue.",
        enunciado="Sobre o pano da foto, as manchas formam uma sequência alinhada, em arco, cujos elementos passam de mais arredondados a mais alongados ao longo da linha. Esse perfil corresponde a manchas:",
        correta="de cast-off, isto é, espargimento de dissociação.",
        erradas=[
            "impactadas, de alta energia, com forte atomização.",
            "gotejadas, em sequência isolada e independente.",
            "alteradas por diluição, em razão de chuva recente.",
        ],
        justificativa="A assinatura do CAST-OFF é exatamente essa: sequência de manchas em LINHA que começa circular e termina elíptica. Ela se forma quando o sangue se desprende de um objeto que se movimenta (ou que sofre parada repentina do movimento) — a faca, o machado, o pedaço de pau. A opção das impactadas descreve um conjunto radial partindo de uma origem, e não uma linha. A das gotejadas exige queda por gravidade, sem alinhamento. A da diluição pressupõe água alterando manchas já formadas, o que produziria bordas desbotadas, não uma sequência ordenada.",
    ),
    dict(
        img="q_sangue_04_castoff_esquema.jpg", nivel="facil", letra="C",
        alt="Desenho de agressor girando um instrumento, com gotas de sangue se desprendendo em arco",
        legenda="Slide da aula — mecanismo de formação do padrão.",
        enunciado="O desenho reproduz o mecanismo em que o sangue se desprende de um objeto que se movimenta no meio circundante — ou que sofre parada repentina desse movimento — e vai impactar a superfície com perfil característico. Esse mecanismo produz manchas:",
        correta="de cast-off, também dito espargimento de dissociação.",
        erradas=[
            "impactadas, por golpe direto sobre a fonte de sangue.",
            "arteriais, por impulso alternado de sístole e diástole.",
            "por saturação, com absorção do sangue pela superfície.",
        ],
        justificativa="O desenho é o do CAST-OFF: o instrumento embebido em sangue é agitado, e a dissociação lança as gotas que se depositam em sequência. A opção das impactadas descreve outro mecanismo — o impacto sobre a fonte de sangue, que gera padrão radial. A arterial depende do bombeamento cardíaco da própria vítima, não do movimento de um objeto. A saturação nem é padrão de projeção: é modalidade de acúmulo, quando o sangue é absorvido pela superfície.",
    ),
    dict(
        img="q_sangue_05_impactadas.jpg", nivel="medio", letra="B",
        alt="Tapume de madeira coberto por pequenas manchas irradiando de uma origem, com poça no solo",
        legenda="Slide de exercício da aula de manchas de sangue.",
        enunciado="Na parte superior da foto — o tapume de madeira — o sangue aparece como um conjunto de pequenas manchas circulares e elípticas que se distribuem irradiando a partir de uma origem comum. Como se classifica esse conjunto?",
        correta="Impactadas, geradas por impacto sobre uma fonte de sangue.",
        erradas=[
            "Gotejadas, geradas de forma isolada pela ação da gravidade.",
            "Alteradas por contato, com o padrão borrado por alguém.",
            "Por saturação, com o sangue absorvido pelas ripas de madeira.",
        ],
        justificativa="O conjunto de manchas circulares e elípticas com formato RADIAL a partir da origem do impacto é a definição de mancha IMPACTADA — algum impacto sobre uma fonte de sangue fez muito sangue jorrar de uma vez (martelada, disparo). A opção das gotejadas descreve gotas isoladas por gravidade, sem conjunto radial. A da alteração por contato exige que alguém tenha pisado ou passado a mão numa mancha já formada, borrando-a. A da saturação exige absorção pela superfície, e no tapume o sangue ficou depositado sobre a madeira.",
    ),
    dict(
        img="q_sangue_06_impactadas_parede.jpg", nivel="dificil", letra="A",
        alt="Parede com respingos finos à esquerda e área extensa borrada com marcas de arrasto à direita",
        legenda="Slide de exercício da aula de manchas de sangue.",
        enunciado="A parede da foto reúne, à esquerda, um conjunto de manchas pequenas irradiando de uma origem e, à direita, uma extensa área em que o padrão aparece borrado, com marcas de arrasto. O professor alertou que uma mesma foto pode ter mais de uma classificação. Assinale a leitura correta da cena.",
        correta="Manchas impactadas à esquerda; alteradas por contato à direita.",
        erradas=[
            "Manchas gotejadas à esquerda e manchas por saturação à direita.",
            "Manchas arteriais à esquerda e manchas transferidas à direita.",
            "Manchas de cast-off à esquerda e manchas diluídas à direita.",
        ],
        justificativa="São duas classificações simultâneas, exatamente o cuidado que ele mandou ter no enunciado. À esquerda, o conjunto de manchas pequenas irradiando de uma origem é IMPACTADA. À direita, o padrão foi borrado depois de formado, com arrasto e sem que se reconheça a forma do objeto: alterada POR CONTATO. A opção da saturação exigiria absorção pela parede. A das transferidas exigiria que a mancha reproduzisse a forma do objeto (mão, solado), o que o borrão não permite. A da diluição exigiria água alterando a mancha, e a das arteriais/cast-off exigiria arcos ou sequência em linha, que a foto não mostra.",
    ),
    dict(
        img="q_sangue_07_transferida.jpg", nivel="facil", letra="D",
        alt="Piso de cerâmica com marcas de pés desenhadas em sangue",
        legenda="Slide de exercício da aula de manchas de sangue.",
        enunciado="O piso da foto registra marcas de pés em sangue, nas quais se reconhecem o contorno, o arco plantar e os dedos. Pelo critério de corte apresentado na revisão, essas manchas são classificadas como:",
        correta="alteradas por contato e transferidas pelo objeto.",
        erradas=[
            "alteradas por contato, apenas, sem transferência.",
            "impactadas com alteração posterior por diluição.",
            "por acúmulo, na modalidade saturação do piso.",
        ],
        justificativa="O critério é justamente esse: se pela mancha é possível IDENTIFICAR O OBJETO que causou a transferência — a forma da mão, do solado, do pé — ela é alterada por contato e TRANSFERIDA. Aqui se lê o pé inteiro, com dedos e arco plantar. A opção que fica só na alteração por contato serve para o caso em que a mancha apenas borrou, sem reproduzir forma reconhecível. A que fala em diluição exigiria água alterando o padrão. A da saturação exigiria absorção pela superfície, e a cerâmica não absorve.",
    ),
    dict(
        img="q_sangue_08_saturacao.jpg", nivel="medio", letra="C",
        alt="Camisa de tecido claro com grande área de sangue absorvida pelo tecido",
        legenda="Slide de exercício da aula de manchas de sangue.",
        enunciado="A camisa da vítima, na foto, apresenta uma grande área em que o sangue foi absorvido pelo tecido, e não apenas depositado sobre ele. Essa é a modalidade de mancha por acúmulo denominada:",
        correta="saturação, quando há absorção pela superfície.",
        erradas=[
            "poça, pelo acúmulo do sangue sobre a superfície.",
            "sangue sobre sangue, por deposições sucessivas.",
            "escorrimento, por percurso conforme a gravidade.",
        ],
        justificativa="SATURAÇÃO é a modalidade de acúmulo que ocorre sempre que há absorção pela superfície — e os casos mais comuns citados na revisão são exatamente o colchão e os panos grossos, aos quais a roupa se equipara. A poça é o acúmulo sobre uma superfície que não absorve. Sangue sobre sangue pressupõe uma mancha caindo sobre outra já existente, com respingos ao redor. Escorrimento é o percurso do sangue pela superfície seguindo a gravidade, e não a impregnação do tecido.",
    ),
    dict(
        img="q_sangue_09_poca.jpg", nivel="facil", letra="A",
        alt="Piso de banheiro com grande volume de sangue acumulado e escorrimento na parede",
        legenda="Slide de exercício da aula de manchas de sangue.",
        enunciado="No piso do banheiro da foto, o sangue se acumulou em grande volume, formando massa contínua sobre o revestimento cerâmico, sem ser absorvido por ele. Essa modalidade de mancha por acúmulo chama-se:",
        correta="poça, pelo acúmulo do sangue que cai em grande volume.",
        erradas=[
            "saturação, com absorção pelo material da superfície.",
            "sombra, pela ausência de sangue em parte do padrão.",
            "cast-off, por dissociação a partir de um objeto em movimento.",
        ],
        justificativa="POÇA é a definição direta: cai muito sangue e ele se acumula. O revestimento cerâmico não absorve, o que afasta a saturação — esta exige absorção pela superfície, como no colchão e nos panos grossos. A sombra não é causada pelo sangue, mas pela AUSÊNCIA dele, quando um objeto impediu a continuidade do padrão. O cast-off é padrão de projeção a partir de um objeto em movimento, não de acúmulo.",
    ),
    dict(
        img="q_sangue_10_sombra.jpg", nivel="dificil", letra="B",
        alt="Piso com respingos, gotejadas e uma faixa em arco sem sangue no centro",
        legenda="Slide da aula — a mesma cena aparece no capítulo com a região marcada.",
        enunciado="A foto mostra o piso de uma cena com gotejadas, respingos e uma mancha alterada por contato. Chama atenção uma faixa em arco, ao centro, na qual o padrão simplesmente não continua, embora haja manchas ao redor dela por todos os lados. A leitura correta dessa faixa é:",
        correta="havia ali um objeto que barrou o padrão: mancha sombra.",
        erradas=[
            "houve diluição por água naquela faixa específica do piso.",
            "trata-se de saturação, com absorção do sangue pelo piso.",
            "é o ponto de convergência das manchas impactadas da cena.",
        ],
        justificativa="A mancha SOMBRA não é causada pelo sangue, e sim pela AUSÊNCIA dele: um objeto estava no local, impediu a continuidade do padrão e foi removido depois — por isso a região limpa fica cercada de manchas. A opção da diluição exigiria água alterando manchas já formadas, o que desbota as bordas em vez de apagar uma faixa inteira com contorno definido. A da saturação exigiria absorção pelo piso, que é impermeável. A do ponto de convergência confunde: convergência é o ponto de onde as manchas partem, e não uma área sem sangue.",
    ),
    dict(
        img="q_sangue_11_escorrimento.jpg", nivel="medio", letra="D",
        alt="Parede com depósitos de sangue dos quais partem longas trilhas verticais",
        legenda="Slide de exercício da aula de manchas de sangue.",
        enunciado="Na parede da foto, a partir de vários pontos de deposição, o sangue percorreu a superfície de cima para baixo, deixando longas trilhas verticais. Esse padrão, na classificação apresentada, é o de:",
        correta="escorrimento, pelo percurso do sangue segundo a gravidade.",
        erradas=[
            "cast-off, por dissociação de um objeto em movimento.",
            "gotejamento, por queda livre de gotas isoladas na vertical.",
            "impactadas, pela projeção radial a partir de uma origem.",
        ],
        justificativa="ESCORRIMENTO é o sangue percorrendo a superfície a partir da área de deposição, seguindo a ação da gravidade — exatamente as trilhas verticais da foto. A opção do cast-off exigiria uma sequência de manchas em linha, projetadas por um objeto. A do gotejamento trata de gotas que caem e se depositam, não de sangue que corre sobre a superfície. A das impactadas exigiria conjunto irradiando de uma origem comum.",
    ),
    dict(
        img="q_sangue_12_trajeto.jpg", nivel="dificil", letra="B",
        alt="Croqui de residência com trilha de manchas alongadas ligando um cômodo a outro",
        legenda="Slide da aula — croqui de distribuição das manchas na residência.",
        enunciado="O croqui reproduz uma residência em que, além da mancha extensa junto ao corpo, há uma sequência de manchas alongadas e espaçadas com regularidade, distribuídas ao longo de um percurso que atravessa a sala e alcança outro cômodo. O que esse conjunto autoriza concluir?",
        correta="Que houve deslocamento de uma fonte de sangue pelo interior da casa.",
        erradas=[
            "Que o padrão é de cast-off, produzido por instrumento agitado durante o percurso.",
            "Que o sangue foi diluído por água ao longo de todo o corredor da casa.",
            "Que se trata de sombra, pela ausência de sangue em parte do trajeto.",
        ],
        justificativa="Manchas alongadas, espaçadas com regularidade e alinhadas ao longo de um caminho descrevem uma fonte de sangue EM DESLOCAMENTO: é a leitura de direção de transporte, que permite reconstruir a movimentação realizada no local após o ferimento. A opção do cast-off não se sustenta porque o espargimento de dissociação produz sequências curtas em linha ou arco, ligadas ao golpe, e não uma rota que percorre cômodos inteiros. A da diluição exigiria água alterando as manchas. A da sombra exigiria uma região SEM sangue cercada de padrão, e não manchas distribuídas ao longo do trajeto.",
    ),

    # ---------- 2. leitura da dinamica (figuras do capitulo) ----------
    dict(
        img="sangue_03_gotejadas_superficie.jpg", nivel="medio", letra="C",
        alt="Quatro manchas de sangue fotografadas com régua sobre superfícies diferentes",
        legenda="Figura do capítulo — influência da superfície.",
        enunciado="As quatro fotos mostram manchas produzidas em condições semelhantes sobre superfícies diferentes (papel liso, jornal, papelão e concreto). O que explica a diferença de borda entre elas?",
        correta="A rugosidade da superfície, que rompe a tensão das bordas.",
        erradas=[
            "A variação do ângulo de impacto entre uma superfície e outra.",
            "O tempo decorrido desde a deposição, que altera cor e forma.",
            "A energia do impacto, que atomiza o sangue em gotículas menores.",
        ],
        justificativa="A tensão das bordas da gota é rompida pelas IRREGULARIDADES da superfície de impacto (ou pela energia da velocidade de queda) — por isso a mesma gota expande suavemente no papel liso e sai serrilhada, com espículas, no concreto. É a pegadinha que o professor destacou: o serrilhado é da superfície e não prova, por si, impacto. A opção do ângulo altera a ELIPSE (largura × comprimento), não o serrilhado da borda. A do tempo diz respeito à cor, que informa a data. A da energia explica o tamanho das gotículas nas impactadas, não a borda de uma gota isolada.",
    ),
    dict(
        img="sangue_04_superficie_esquema.png", nivel="facil", letra="A",
        alt="Esquema comparando gota em superfície lisa e gota em superfície irregular",
        legenda="Figura do capítulo — esquema comparativo.",
        enunciado="O esquema compara a gota que atinge uma superfície lisa e a que atinge uma superfície irregular. Assinale a alternativa compatível com o que está representado.",
        correta="Na superfície lisa a gota expande suavemente; na irregular, a borda se rompe.",
        erradas=[
            "Na superfície lisa a gota se fragmenta em satélites; na irregular, fica circular.",
            "Em ambas o formato final é idêntico, pois depende apenas do ângulo de queda.",
            "Na superfície irregular a mancha resulta sempre menor do que na lisa.",
        ],
        justificativa="É o que o esquema mostra e o que a aula afirma: em superfície lisa a gota EXPANDE SUAVEMENTE; em superfície irregular a tensão das bordas é rompida pelas irregularidades, aparecendo as espículas e as gotas satélites. A opção que inverte os dois comportamentos contraria o desenho. A que diz que o formato é idêntico ignora a influência da superfície, que é o tema da figura. A que garante mancha sempre menor na superfície irregular inventa uma regra de tamanho que não existe — o que muda é a borda.",
    ),
    dict(
        img="sangue_05_direcao_cauda.jpg", nivel="medio", letra="D",
        alt="Mancha de sangue ampliada com setas amarelas sobre as espículas e a cauda",
        legenda="Figura do capítulo — detalhe ampliado de uma mancha no piso.",
        enunciado="A ampliação destaca, com setas, as espículas e a cauda de uma mancha de sangue. Que informação essa característica fornece ao perito?",
        correta="O sentido em que a gota se deslocava ao atingir a superfície.",
        erradas=[
            "A altura de queda da gota desde a fonte até a superfície.",
            "O tempo decorrido entre a deposição da mancha e o exame.",
            "O volume total de sangue perdido pela vítima naquele ambiente.",
        ],
        justificativa="A cauda e as espículas apontam para onde a gota estava indo: dão a DIREÇÃO do deslocamento. É a partir dessa leitura, feita em várias manchas, que se traçam as retas e se chega ao ponto de convergência. A opção da altura de queda depende do diâmetro e do padrão da mancha, não da cauda. A do tempo decorrido é informação da COR (lise celular, oxidação do heme). A do volume perdido não se extrai da morfologia de uma mancha — a dimensão indica a intensidade das lesões, o que é coisa diferente.",
    ),
    dict(
        img="sangue_06_direcao_transporte.jpg", nivel="medio", letra="C",
        alt="Esquema de pessoa parada e pessoa em movimento com o formato das gotas de cada situação",
        legenda="Figura do capítulo — direção de transporte.",
        enunciado="O esquema opõe uma pessoa parada e uma pessoa em deslocamento, com o formato das gotas produzidas em cada situação. Assinale a conclusão correta.",
        correta="Quem se desloca deixa manchas alongadas, com cauda no sentido da marcha.",
        erradas=[
            "A pessoa parada produz manchas alongadas, com cauda no sentido da marcha.",
            "A pessoa em deslocamento produz manchas circulares.",
            "O formato da mancha não muda com o deslocamento; muda só a quantidade delas.",
        ],
        justificativa="É a leitura de direção de transporte: quem sangra PARADO deixa manchas circulares (queda perpendicular, sem componente horizontal); quem sangra EM DESLOCAMENTO deixa manchas alongadas, com a cauda apontando o sentido da marcha. A opção que atribui as manchas alongadas a quem está parado inverte o esquema. A que dá manchas circulares a quem se desloca faz a mesma inversão. A que nega qualquer mudança de formato contraria o objetivo da figura, que é justamente relacionar o perfil da mancha à movimentação.",
    ),
    dict(
        img="sangue_07_angulo_seno.jpg", nivel="dificil", letra="B",
        alt="Diagrama do ângulo de impacto de uma gota com a fórmula do seno",
        legenda="Figura do capítulo — largura é o cateto oposto; comprimento, a hipotenusa.",
        enunciado="O diagrama relaciona a forma da mancha ao ângulo de impacto. Considerando a fórmula ali apresentada e o recado do professor sobre a matemática que cai, o ângulo de impacto é obtido a partir de:",
        correta="seno do ângulo = largura ÷ comprimento da mancha.",
        erradas=[
            "cosseno do ângulo = largura ÷ comprimento da mancha.",
            "tangente do ângulo = comprimento ÷ largura da mancha.",
            "seno do ângulo = comprimento ÷ largura da mancha.",
        ],
        justificativa="No triângulo do diagrama, a LARGURA da mancha é o cateto oposto ao ângulo e o COMPRIMENTO é a hipotenusa; logo sen θ = largura ÷ comprimento, e θ = arc sen (largura/comprimento). Casa com o que ele disse na parte de matemática: não tem cosseno, não tem tangente — o que cai é semelhança de triângulos e, para manchas de sangue, o seno. As opções do cosseno e da tangente trocam a função trigonométrica. A que inverte a razão colocaria o resultado acima de 1 sempre que a mancha fosse alongada, o que sequer teria arco seno.",
    ),
    dict(
        img="sangue_08_bordas.jpg", nivel="medio", letra="D",
        alt="Manchas com o contorno elíptico correto marcado em tracejado, ignorando espículas e cauda",
        legenda="Figura do capítulo — seleção das bordas.",
        enunciado="As fotos mostram, em tracejado, o contorno que o perito deve considerar ao medir a mancha para calcular o ângulo. Qual é o procedimento correto?",
        correta="Traçar a elipse ignorando as espículas e a cauda, sobre o corpo da mancha.",
        erradas=[
            "Traçar a elipse por fora das espículas e da cauda, abarcando todo o depósito.",
            "Medir apenas a maior espícula, que representa a direção do deslocamento.",
            "Medir a mancha em qualquer direção, pois o resultado do seno não se altera.",
        ],
        justificativa="A medição usa o corpo da mancha: a elipse é traçada IGNORANDO as espículas e a cauda, como mostra o tracejado das fotos. Incluir a cauda alonga artificialmente o comprimento, diminui a razão largura/comprimento e falseia para menos o ângulo calculado — por isso a opção de traçar por fora está errada. A de medir a maior espícula confunde leitura de direção com medição de ângulo. A de medir em qualquer direção ignora que largura e comprimento são eixos definidos da elipse, e não medidas quaisquer.",
    ),
    dict(
        img="sangue_12_backspatter.jpg", nivel="medio", letra="A",
        alt="Desenho de disparo encostado na cabeça com projeções para trás e para a frente",
        legenda="Figura do capítulo — efeito backspatter.",
        enunciado="O desenho representa um disparo de arma de fogo à queima-roupa. Como se denomina a projeção de sangue que retorna no sentido do atirador e da arma?",
        correta="Backspatter, projetado contra o atirador e a arma.",
        erradas=[
            "Forwardspatter, projetado no sentido de saída do disparo.",
            "Cast-off, por dissociação a partir do cano da arma.",
            "Escorrimento, pelo percurso do sangue na superfície.",
        ],
        justificativa="No disparo há duas projeções: o FORWARDSPATTER, que segue à frente na direção do tiro, e o BACKSPATTER, que retorna contra o atirador e contra a arma — é ele que fundamenta a discussão do relato de caso do suicídio simulado, porque a ausência de sangue nas mãos ou na arma contraria a versão. A opção do forwardspatter nomeia justamente a projeção oposta. A do cast-off exigiria um objeto embebido em sangue sendo agitado. A do escorrimento trata do sangue correndo sobre a superfície por gravidade.",
    ),
    dict(
        img="sangue_02_cor.jpg", nivel="facil", letra="C",
        alt="Duas manchas de sangue, uma vermelho-viva e outra amarronzada",
        legenda="Figura do capítulo — mancha 1 e mancha 2.",
        enunciado="As duas manchas da foto foram encontradas na mesma cena: a mancha 1 é vermelho-viva e a mancha 2, amarronzada. Que informação essa diferença fornece?",
        correta="A data aproximada de formação de cada uma das manchas.",
        erradas=[
            "A dinâmica do evento que produziu cada uma das manchas.",
            "A intensidade das lesões sofridas pela vítima na cena.",
            "O ângulo de impacto das gotas sobre aquela superfície.",
        ],
        justificativa="A COR responde à DATA: com o tempo ocorrem a lise celular e a oxidação do heme, e o vermelho-vivo vai escurecendo até o amarronzado. Na tríade da aula, cada característica responde a uma pergunta diferente — a cor dá a data, a FORMA dá a dinâmica e a DIMENSÃO dá a intensidade das lesões. Por isso as opções da dinâmica e da intensidade atribuem à cor o papel da forma e da dimensão. A do ângulo de impacto depende da razão largura/comprimento da mancha, e não da coloração.",
    ),
    dict(
        img="sangue_01_classificacao.png", nivel="medio", letra="B",
        alt="Organograma das manchas de sangue dividido em regulares e irregulares",
        legenda="Figura do capítulo — organograma da classificação.",
        enunciado="No organograma de classificação apresentado na aula, as manchas dividem-se em regulares e irregulares. Assinale a alternativa que aloca corretamente os padrões.",
        correta="Cast-off é regular; escorrimento é irregular.",
        erradas=[
            "Escorrimento é regular; cast-off é irregular.",
            "Acúmulo é regular; mancha impactada é irregular.",
            "Alteradas são regulares; arterial é irregular.",
        ],
        justificativa="No organograma, as REGULARES são gotejadas, arterial, cast-off e impactada — aquelas em que o próprio sangue produziu o padrão. As IRREGULARES são alteradas (contato, diluída, sombra), acúmulo (sangue sobre sangue, poça, saturação) e escorrimento. Logo o cast-off é regular e o escorrimento, irregular. A opção que troca os dois inverte o quadro. A que põe o acúmulo entre as regulares e a impactada entre as irregulares faz a mesma inversão. A que classifica as alteradas como regulares e a arterial como irregular também contraria os dois ramos.",
    ),
    dict(
        img="sangue_16_sangue_sobre_sangue.jpg", nivel="medio", letra="D",
        alt="Manchas centrais espessas e escuras cercadas de respingos que partem delas",
        legenda="Figura do capítulo — manchas por acúmulo.",
        enunciado="As fotos mostram uma mancha central espessa e mais escura, cercada de respingos que partem dela própria. O padrão corresponde à modalidade de acúmulo denominada:",
        correta="sangue sobre sangue, por deposições sucessivas.",
        erradas=[
            "poça, pela acumulação em depressão da superfície.",
            "saturação, por absorção do sangue pelo substrato.",
            "sombra, pela ausência de sangue em parte da área.",
        ],
        justificativa="SANGUE SOBRE SANGUE é a modalidade em que já havia mancha no lugar e caiu outra por cima: o centro fica espesso e mais escuro, e o novo impacto projeta respingos a partir da mancha antiga — exatamente o que as fotos mostram. A poça é o simples acúmulo de grande volume, sem os respingos periféricos partindo do centro. A saturação exige absorção pela superfície. A sombra não é causada por sangue, e sim pela ausência dele numa região que um objeto protegeu.",
    ),
    dict(
        img="sangue_11_impactadas.jpg", nivel="dificil", letra="C",
        alt="Parede com grande padrão radial de respingos de sangue partindo de um ponto",
        legenda="Figura do capítulo — manchas impactadas.",
        enunciado="Comparando duas fotografias de manchas impactadas produzidas por disparo de arma de fogo, uma exibe gotículas minúsculas, com aspecto de spray, e a outra exibe manchas pequenas, porém visivelmente maiores. Sobre a energia envolvida, é correto afirmar que:",
        correta="a de gotículas minúsculas resulta de MAIOR energia, por maior atomização.",
        erradas=[
            "a de gotículas minúsculas resulta de MENOR energia, pois houve menos projeção.",
            "as duas resultam da mesma energia; o que muda é a distância até a superfície.",
            "a de manchas maiores resulta de maior energia, pois o diâmetro acompanha a força.",
        ],
        justificativa="A regra que ele repetiu duas vezes: MAIOR energia → maior ATOMIZAÇÃO → MENORES os diâmetros das manchas resultantes. Atomizar é dividir em partículas menores, então o aspecto de spray denuncia a maior energia. A opção que associa gotículas minúsculas a menor energia inverte a regra, e é a pegadinha clássica do assunto — a afirmação 'maior energia produz manchas maiores' foi listada como ERRADA na revisão. A que iguala as energias ignora a variável que determina o tamanho. A que atribui maior energia às manchas maiores repete a mesma inversão.",
    ),
]
