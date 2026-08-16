# -*- coding: utf-8 -*-
"""Cap. 4 do LOC — Etapas de processamento do local.

O professor foi enfatico: tem que saber TUDO das etapas. O capitulo tinha so
12 questoes (ids 1343-1352, 2159-2160), que cobriam: ordem das etapas,
tipo de local/crime, oportunidade unica (a pressa), limite das entrevistas no
laudo, marcar-e-nao-coletar, linha cruzada, espiral, amostra controle do
carpete, checklist da reuniao final, liberacao e o resumo dos padroes de busca.

Este lote cobre o que sobrou — cada item de 4.1 a 4.6 — sem repetir familia de
fato ja coberta. Uma questao por familia, preferindo as densas.
"""

REF = {
    "prep": "PDF LOC, p. 29-31",
    "cheg": "PDF LOC, p. 31-33",
    "busca": "PDF LOC, p. 33-36",
    "coleta": "PDF LOC, p. 36-37",
    "final": "PDF LOC, p. 37",
}

Q = [
    # ================= 4.1 PREPARAÇÃO =================
    dict(
        letra="C", nivel="facil", ref="prep",
        enunciado="A primeira etapa do processamento é a preparação. Sobre o momento em que ela se inicia e a sua finalidade, é correto afirmar que:",
        correta="começa quando o perito toma conhecimento do local e visa reunir os recursos humanos e materiais dos exames.",
        erradas=[
            "começa com a chegada da equipe ao local e se destina a reavaliar o perímetro de isolamento já montado.",
            "começa com a requisição da autoridade e se esgota na escolha do meio de transporte a ser utilizado.",
            "começa após a busca inicial do perito-chefe e se destina a distribuir as tarefas entre os membros da equipe.",
        ],
        justificativa="A preparação antecede todo o trabalho: inicia-se quando o perito criminal toma conhecimento do local e consiste em tomar as providências para aglutinar os recursos humanos e materiais necessários à realização dos exames. A opção que a faz começar na chegada confunde as duas primeiras etapas — a reavaliação do perímetro é da reunião preliminar, já no local. A que a esgota na escolha do transporte reduz a etapa a um de seus oito itens. A que a coloca depois da busca inicial inverte a ordem: a busca inicial já pertence à etapa de chegada ao local.",
    ),
    dict(
        letra="A", nivel="facil", ref="prep",
        enunciado="Ainda na preparação, o perito procura obter a localização da cena — endereço, coordenadas e pontos de referência. Essa informação serve para:",
        correta="agilizar a chegada e definir o tipo de transporte a ser solicitado.",
        erradas=[
            "definir o padrão de busca que será adotado na varredura da área.",
            "estimar a hora provável da liberação do local à autoridade policial.",
            "dimensionar o perímetro de isolamento que os policiais devem montar.",
        ],
        justificativa="O material atribui à localização da cena duas utilidades: ajudar a uma chegada mais rápida ao local e definir o tipo de transporte a ser solicitado. A opção do padrão de busca erra o item: o padrão se escolhe no local, conforme o tamanho da área e o número de pessoas disponíveis. A da hora de liberação inventa uma finalidade — a liberação é a última etapa e não se estima na preparação. A do perímetro confunde com a reunião preliminar, em que o perímetro encontrado é reavaliado, e com a atuação do primeiro policial que chega.",
    ),
    dict(
        letra="D", nivel="medio", ref="prep",
        enunciado="Os pedidos de perícia chegam em horários variados e, muitas vezes, o perito sabe pouco do que o espera quanto às condições de isolamento e preservação. A providência recomendada pelo material para essa situação é:",
        correta="obter o telefone do solicitante e manter com ele um contato informal.",
        erradas=[
            "aguardar a confirmação escrita da autoridade sobre as condições do isolamento antes de deslocar a equipe.",
            "deslocar-se imediatamente, já que qualquer informação prévia sobre o isolamento seria de fonte não técnica.",
            "solicitar que a autoridade amplie preventivamente o perímetro até o dobro da área originalmente isolada.",
        ],
        justificativa="O material é direto: é produtivo obter o maior número de informações possível com o policial que fez a solicitação, e uma ajuda muito grande é conseguir o telefone dele para um contato informal, no qual muitas dúvidas são sanadas e transtornos futuros evitados. A opção da confirmação escrita cria uma formalidade que a apostila não exige e atrasa o deslocamento. A que dispensa a informação prévia contraria toda a lógica da preparação. A da ampliação preventiva ao dobro inventa um número: a reavaliação do perímetro é feita no local e pode levar tanto a ampliar quanto a diminuir.",
    ),
    dict(
        letra="B", nivel="medio", ref="prep",
        enunciado="Há situações em que a urgência da chegada ao local se sobrepõe ao planejamento, prejudicando a etapa de preparação. Segundo o material, esse prejuízo pode ser minimizado:",
        correta="enviando parte da equipe para avaliar a cena enquanto a outra parte providencia materiais e equipamentos, em contato estreito.",
        erradas=[
            "deslocando toda a equipe de imediato e retornando à base depois da busca inicial para buscar o que faltar.",
            "postergando o atendimento até que a preparação se complete, já que só existe uma chance de processar o local.",
            "delegando a busca inicial ao policial responsável pelo isolamento, enquanto a equipe permanece na base concluindo a preparação dos materiais.",
        ],
        justificativa="A solução apresentada é a divisão da equipe: uma parte vai avaliar a cena e as condições e a outra providencia materiais e equipamentos, mantendo-se ambas em estreito contato, o que facilita justamente a preparação do que será necessário. A opção de ir toda a equipe e voltar depois desperdiça tempo e contraria o princípio de providenciar o material antes de chegar. A de postergar o atendimento inverte a premissa: a urgência é a razão de se agir. A de delegar a busca inicial ao policial contraria a regra de que essa busca cabe ao perito encarregado do local.",
    ),
    dict(
        letra="A", nivel="medio", ref="prep",
        enunciado="Sobre o material e o equipamento necessários ao processamento, é correto afirmar que:",
        correta="o tipo de exame e os prováveis vestígios definem o que separar, e o material deve ser providenciado antes de se chegar ao local.",
        erradas=[
            "o material é padronizado para todos os locais, cabendo à equipe complementá-lo no próprio local conforme os vestígios que forem surgindo durante a busca completa.",
            "a definição do material cabe ao laboratório de destino, que informa à equipe os frascos e embalagens após receber a comunicação da coleta realizada.",
            "a separação do material é feita na chegada, depois da busca inicial, quando já se conhece a cena e se pode dimensionar com precisão o que será usado.",
        ],
        justificativa="É o núcleo da preparação: o tipo de exame a ser realizado e os prováveis vestígios a serem coletados definem os materiais e equipamentos a providenciar, e isso deve ser feito ANTES de chegar ao local — não o fazendo, o processamento fica prejudicado por atraso ou por falta de equipamento adequado. Planejar é o ponto crucial dessa etapa. A opção do material padronizado nega a influência do tipo de local. A que transfere a definição ao laboratório inverte o fluxo, que é anterior à coleta. A que desloca a separação para depois da busca inicial coloca na etapa de chegada o que é próprio da preparação.",
    ),
    dict(
        letra="D", nivel="facil", ref="prep",
        enunciado="O material apresenta uma lista do que pode ser necessário na quase totalidade dos locais. Assinale o item que NÃO consta dessa relação.",
        correta="Kit de reagentes para teste preliminar de sangue e de drogas.",
        erradas=[
            "Trena, régua ou outra escala para fotografia e marcadores de vestígio.",
            "Suabe e porta-suabe, lacre, pinças e embalagens variadas de papel e plástico.",
            "EPI, como luvas, propé, touca, máscara e macacão tipo tyvek.",
        ],
        justificativa="A lista da apostila reúne fita de isolamento, prancheta, papel branco e milimetrado, lápis, caneta, etiquetas, pincel atômico, máquina fotográfica com cartão, bateria e carregador, tripé, régua ou escala, trena, marcadores de vestígio, embalagens variadas, lacre, pinças, fita adesiva, suabe e porta-suabe, lanterna, lupa, caixa de ferramentas e EPI. Os kits de teste preliminar não figuram nessa relação de itens gerais — testes preliminares são tratados na parte de vestígios, e materiais específicos de cada tipo de local, como a pipeta e os frascos do laboratório clandestino, são providenciados conforme o tipo de crime.",
    ),
    dict(
        letra="C", nivel="facil", ref="prep",
        enunciado="Sobre o transporte de pessoal na etapa de preparação, o material adverte que não se deve ir ao local sem um meio eficiente de transporte. A razão apontada é:",
        correta="conferir autonomia à perícia para decidir o tempo necessário aos exames.",
        erradas=[
            "impedir que a equipe dependa de viatura da unidade que solicitou a perícia.",
            "permitir o transporte dos vestígios coletados em compartimento separado da equipe.",
            "assegurar o cumprimento do prazo legal de dez dias para a entrega do laudo pericial.",
        ],
        justificativa="A justificativa dada é a autonomia: sem transporte próprio e eficiente, quem decide quando a perícia vai embora é o carona, e não o perito — o que colide com a ideia de que o local só pode ser processado uma vez e sem pressa. A opção da viatura da unidade solicitante toca no assunto, mas não é a razão declarada. A do compartimento separado trata de acondicionamento de vestígio, tema de outra etapa. A do prazo de dez dias importa uma regra do laudo pericial que nada tem a ver com a escolha do transporte.",
    ),
    dict(
        letra="B", nivel="medio", ref="prep",
        enunciado="Quanto aos meios de comunicação, o material recomenda providenciá-los entre a equipe que vai ao local e a base — Superintendência Regional ou INC. Em cenas de grande extensão, recomenda ainda que:",
        correta="cada membro da equipe tenha rádio, para interação em tempo real durante os exames.",
        erradas=[
            "a comunicação com a base seja feita apenas pelo perito-chefe, para preservar a cadeia única de comando.",
            "os celulares sejam desligados, evitando que sinais de radiofrequência interfiram nos equipamentos de coleta.",
            "a equipe se reúna a cada hora no ponto de entrada, suprindo a comunicação por rádio nas áreas sem sinal.",
        ],
        justificativa="Em cena de crime grande, a recomendação é que os membros da equipe de processamento possuam rádio que propicie comunicação eficiente durante os exames, possibilitando interação em tempo real entre todos quanto às observações que forem surgindo. A opção que concentra a comunicação no chefe confunde cadeia de comando com canal de rádio — a cadeia única de comando existe, mas não restringe a comunicação interna. A do desligamento de celulares inventa uma interferência que o material não menciona. A das reuniões horárias cria um procedimento inexistente.",
    ),
    dict(
        letra="D", nivel="medio", ref="prep",
        enunciado="A perícia é acionada para um local envolvendo artefato explosivo, em área de grande extensão. Conforme as orientações da preparação, a conduta esperada do perito é:",
        correta="acionar apoio de pessoal especializado e montar equipe compatível com o tamanho da cena.",
        erradas=[
            "aguardar a desativação do artefato para só então iniciar a preparação dos materiais dos exames.",
            "reduzir a equipe ao mínimo indispensável, diminuindo o número de pessoas expostas ao risco na área.",
            "delegar o processamento à unidade especializada em explosivos, à qual cabe também o exame de local.",
        ],
        justificativa="O tipo de local/crime é o dado que indica com que tipo de ajuda se poderá contar: tratando-se de explosivos, é bom contar com o apoio de pessoal com conhecimentos especializados em bombas. E, dependendo do tamanho da cena, deve-se solicitar ajuda para montar uma equipe — o material diz expressamente que não se deve tentar resolver tudo sozinho. A opção de aguardar a desativação para só então preparar o material inverte a ordem, pois a preparação é anterior ao deslocamento. A de reduzir a equipe contraria o dimensionamento pelo tamanho da cena. A que transfere todo o processamento à unidade especializada confunde apoio técnico com substituição do exame de local.",
    ),

    # ================= 4.2 CHEGADA AO LOCAL =================
    dict(
        letra="A", nivel="medio", ref="cheg",
        enunciado="Sobre o deslocamento da equipe até o local de crime, o material observa que esse tempo pode ser aproveitado para:",
        correta="trocar impressões sobre o que se pode encontrar, definir estratégias, distribuir tarefas e, se ainda não houver, escolher o chefe da equipe.",
        erradas=[
            "redigir a parte preambular do laudo, adiantando o histórico com os dados já conhecidos do pedido de perícia.",
            "colher por telefone as entrevistas das testemunhas, que depois não poderão ser ouvidas dentro do perímetro isolado.",
            "definir o padrão de busca que será obrigatoriamente seguido no local, evitando discussões metodológicas na presença dos policiais e das autoridades.",
        ],
        justificativa="No deslocamento a equipe pode iniciar um intercâmbio sobre o que poderá encontrar e sobre as melhores estratégias de condução dos trabalhos, podendo já distribuir tarefas; e, se ainda não houver um chefe de equipe, esse é um bom momento para escolhê-lo. A opção da redação do laudo antecipa etapa posterior aos exames. A das entrevistas por telefone contraria o desenho da etapa: elas são feitas no local, com quem lá estava, e podem ser colhidas por qualquer membro da equipe. A que fixa o padrão de busca de forma obrigatória ignora que ele depende da cena, avaliada depois da chegada.",
    ),
    dict(
        letra="C", nivel="medio", ref="cheg",
        enunciado="Ao chegar, o perito designado chefe de equipe deve assumir o local de maneira formal, segura e clara. Sobre esse ato, é correto afirmar que:",
        correta="ele comunica a chegada ao responsável pelo local e pede que os policiais do isolamento permaneçam em seus postos.",
        erradas=[
            "ele dispensa os policiais que fizeram o isolamento, já que a cena passa ao controle exclusivo da perícia.",
            "ele depende de autorização escrita do delegado, sem a qual a equipe não pode transpor o perímetro isolado.",
            "ele se dirige primeiro às testemunhas, para registrar as versões antes que o contato entre elas altere os relatos.",
        ],
        justificativa="Assumir o local significa esclarecer aos policiais presentes que a cena passa ao controle da perícia; para isso, o chefe se dirige ao responsável pelo local, comunica-lhe a chegada da perícia, enfatiza aos policiais que fizeram o isolamento que CONTINUEM em seus postos e os alerta sobre a necessidade de cooperação em algumas etapas do processamento. A opção que dispensa os policiais contraria justamente esse ponto. A da autorização escrita cria formalidade inexistente. A que dá prioridade às testemunhas troca a ordem: as entrevistas podem ocorrer em paralelo aos preparativos, mas o ato de assumir o local é dirigido ao responsável pela cena.",
    ),
    dict(
        letra="B", nivel="medio", ref="cheg",
        enunciado="Pressões para que a perícia seja rápida existirão, e o perito deve saber contorná-las. Sobre como o material orienta a lidar com isso ao assumir o local, é correto afirmar que:",
        correta="convém explicar desde o início que o trabalho não será rápido e como ele será conduzido, o que reduz a ansiedade e cria cooperação.",
        erradas=[
            "convém estabelecer com a autoridade um horário-limite para a entrega do local, comprometendo-se a concluir os exames dentro dele.",
            "convém iniciar pelas áreas em que a presença policial é mais incômoda, liberando-as parcialmente à medida que forem processadas.",
            "convém remover do perímetro todos os policiais e autoridades presentes, eliminando a origem das pressões sobre a equipe pericial.",
        ],
        justificativa="A recomendação é comunicativa: esclarecer a policiais, autoridades e demais presentes que o trabalho não será feito rapidamente, dada a importância de uma coleta eficiente para todo o processo penal, e fazer uma breve exposição de como os trabalhos serão conduzidos — isso cria espírito de cooperação e reduz a ansiedade de quem já espera há algum tempo. O perito deve otimizar seus trabalhos, mas sem prejuízo da qualidade técnica. A opção do horário-limite entrega o controle do tempo, o oposto do que se busca. A da liberação parcial por áreas não é prevista: a liberação é etapa final e formal. A da remoção de todos ignora que os policiais do isolamento devem permanecer em seus postos.",
    ),
    dict(
        letra="D", nivel="dificil", ref="cheg",
        enunciado="Assim que chega, antes de reunir a equipe, o perito procede a uma reavaliação do perímetro de isolamento encontrado. Sobre essa reavaliação, é correto afirmar que:",
        correta="pode resultar tanto na ampliação quanto na redução do perímetro, conforme o caso.",
        erradas=[
            "só pode resultar em ampliação, pois reduzir o perímetro já montado exporia vestígios ainda não examinados.",
            "é feita depois da busca inicial, quando o perito-chefe já percorreu a rota de entrada e conhece a extensão da cena.",
            "cabe ao policial que primeiro chegou ao local, único que conhece as condições em que a cena foi encontrada.",
        ],
        justificativa="Até a chegada, as informações vinham de terceiros por telefone ou rádio; no local, a cena pode ser presenciada e mais bem avaliada. Por isso, assim que se chega, procede-se à reavaliação do perímetro encontrado e, dependendo do caso, solicita-se que ele seja AMPLIADO OU DIMINUÍDO — as duas direções são possíveis. A opção que admite só a ampliação é a pegadinha típica. A que a desloca para depois da busca inicial inverte a sequência, já que a reunião preliminar, fruto dessa avaliação, antecede a busca inicial. A que atribui a reavaliação ao primeiro policial confunde quem monta o isolamento com quem, tecnicamente, o redimensiona.",
    ),
    dict(
        letra="A", nivel="medio", ref="cheg",
        enunciado="Sobre a reunião preliminar, promovida pelo perito-chefe logo após assumir o local, é correto afirmar que:",
        correta="é informal, reúne todos os membros da equipe, serve para ouvir sugestões e avaliar a segurança, e nela se distribuem as tarefas ainda não definidas.",
        erradas=[
            "é formal e restrita aos peritos, devendo ser reduzida a termo e anexada ao laudo como registro das decisões metodológicas tomadas no início dos trabalhos.",
            "destina-se a ouvir as testemunhas e as pessoas presentes antes da chegada da perícia, colhendo delas a versão preliminar do ocorrido.",
            "ocorre ao final da busca inicial, quando o perito-chefe já pode apresentar aos demais o plano definitivo de varredura da cena.",
        ],
        justificativa="A reunião preliminar é informal, feita com todos os membros da equipe logo após assumir o local; nela todos podem e devem oferecer seu ponto de vista sobre a cena, o que ajuda a direcionar os trabalhos e a avaliar a segurança da equipe; se as tarefas ainda não tiverem sido distribuídas, é nela que se distribuem. A opção que a torna formal e a reduz a termo inventa exigência documental. A que a confunde com as entrevistas troca o público: entrevistas são com testemunhas e presentes, não com a equipe. A que a coloca depois da busca inicial inverte a ordem — a reunião preliminar vem antes.",
    ),
    dict(
        letra="C", nivel="medio", ref="cheg",
        enunciado="Ainda na chegada, realiza-se a busca inicial. Sobre quem a executa e para que ela serve, é correto afirmar que:",
        correta="cabe ao perito encarregado do local e visa conhecer melhor a cena e planejar a busca completa.",
        erradas=[
            "cabe a toda a equipe simultaneamente e visa localizar e marcar os vestígios mais evidentes da cena.",
            "cabe ao perito mais experiente da equipe e visa colher as amostras que possam se degradar com o tempo.",
            "cabe ao policial que assumiu o isolamento e visa confirmar à perícia que nenhum vestígio foi alterado.",
        ],
        justificativa="A busca inicial é preliminar e cabe ao perito encarregado do local: ela visa conhecer melhor a cena em questão e planejar a busca mais detalhada e completa. Enquanto o chefe a realiza, os demais membros preparam-se para suas tarefas — por isso a opção que envolve toda a equipe está errada. A que fala em colher amostras confunde busca inicial com coleta, que só ocorre depois de o vestígio ser posicionado, fotografado e descrito. A que atribui a busca ao policial do isolamento transfere ao leigo uma avaliação técnica.",
    ),
    dict(
        letra="B", nivel="dificil", ref="cheg",
        enunciado="O material aponta um cuidado principal para a realização da busca inicial. Trata-se de:",
        correta="estabelecer a rota de entrada e saída, que passará a ser usada por todos os que precisarem entrar.",
        erradas=[
            "registrar fotograficamente a cena no estado em que foi encontrada, antes de qualquer deslocamento de objetos.",
            "delimitar os quadrantes em que a área será dividida, distribuindo um perito responsável para cada um deles.",
            "identificar os vestígios perecíveis, que deverão ser coletados antes dos demais para evitar sua degradação.",
        ],
        justificativa="O principal cuidado apontado é estabelecer a ROTA DE ENTRADA E SAÍDA, que deve então ser usada por todos que necessitarem entrar no local; ela é escolhida de modo a minimizar ao máximo os possíveis danos aos vestígios materiais presentes. As demais opções descrevem procedimentos que existem no processamento — documentação fotográfica, divisão por quadrantes e cuidado com vestígios perecíveis —, mas nenhuma delas é o cuidado que o material associa especificamente à busca inicial. A divisão em quadrantes, em particular, é um padrão da busca completa, e não da preliminar.",
    ),
    dict(
        letra="D", nivel="facil", ref="cheg",
        enunciado="Entre os procedimentos da chegada ao local está o estabelecimento de uma cadeia de comando. Segundo o material, essa cadeia deve ser:",
        correta="única, para dinamizar e tornar os trabalhos mais eficientes.",
        erradas=[
            "dupla, separando o comando técnico da perícia do comando operacional da autoridade policial no local.",
            "rotativa entre os peritos, de modo que cada um responda pela etapa correspondente à sua especialidade.",
            "definida pelo delegado que preside o inquérito, a quem cabe indicar o perito responsável pelos trabalhos.",
        ],
        justificativa="O material é sucinto e direto: o estabelecimento de uma cadeia ÚNICA de comando quanto ao processamento do local ajuda a dinamizar e a tornar os trabalhos mais eficientes. A opção da cadeia dupla contraria a unicidade. A rotativa por especialidade fragmenta o comando justamente no que a regra quer evitar. A que entrega a indicação ao delegado desloca para a autoridade uma escolha que a própria equipe faz — inclusive já no deslocamento, se ainda não houver chefe.",
    ),
    dict(
        letra="A", nivel="medio", ref="cheg",
        enunciado="Sobre quem pode realizar as entrevistas na etapa de chegada ao local e em que momento, é correto afirmar que:",
        correta="podem ser feitas por qualquer membro da equipe, inclusive durante os preparativos e a busca inicial.",
        erradas=[
            "devem ser feitas pelo perito-chefe, por serem ele o responsável formal pelo local perante a autoridade.",
            "devem aguardar o término da busca completa, para que a versão ouvida não contamine a procura dos vestígios.",
            "cabem exclusivamente à autoridade policial, que depois repassa à perícia o teor do que foi apurado.",
        ],
        justificativa="As entrevistas com possíveis testemunhas ou com pessoas que estavam no local antes da chegada dos peritos podem ser realizadas por QUALQUER membro da equipe, inclusive enquanto são efetivados os preparativos e a busca inicial — o que agiliza os trabalhos. A opção que as reserva ao chefe contraria essa abertura e ainda o retira da busca inicial, que lhe compete. A que as adia para depois da busca completa anula sua função, que é justamente direcionar e agilizar a procura. A que as entrega apenas à autoridade ignora que o material as descreve como procedimento da equipe pericial no local.",
    ),

    # ================= 4.3 BUSCA COMPLETA =================
    dict(
        letra="C", nivel="medio", ref="busca",
        enunciado="Sobre a postura esperada do perito que participa da busca completa, o material recomenda que ele seja cauteloso, observador e esteja com a mente o mais livre possível. Quanto à existência de uma ideia prévia sobre o fato, a orientação é que o perito:",
        correta="pode ter uma preconcepção, desde que apto a mudar a direção da análise diante de nova evidência.",
        erradas=[
            "não pode formular qualquer hipótese antes do término da busca, sob pena de comprometer a imparcialidade.",
            "deve fixar a hipótese mais provável e a ela se ater, para não dispersar a atenção durante a varredura da área.",
            "deve adotar a hipótese sugerida pelas entrevistas, por ser a única informação disponível antes dos exames.",
        ],
        justificativa="O texto admite possuir uma preconcepção do fato na mente, mas exige estar, ao mesmo tempo, apto a reconhecer uma mudança de direção nas análises frente a uma nova evidência. A opção que veda qualquer hipótese é mais rígida do que o material. A que manda fixar-se na hipótese mais provável elimina exatamente a abertura à nova evidência. A que adota a versão das entrevistas ignora que elas servem para direcionar e agilizar, mas que só os vestígios fundamentam as conclusões. Vale lembrar também que preocupações alheias ao local atrapalham a busca, porque muitas vezes se procuram vestígios pequenos e microvestígios.",
    ),
    dict(
        letra="B", nivel="medio", ref="busca",
        enunciado="Uma equipe precisa processar uma residência ampla, com vários cômodos, e opta por dividir a área em setores, atribuindo cada um a um grupo. Sobre esse padrão de busca, é correto afirmar que:",
        correta="é a busca por quadrante, e dentro de cada quadrante pode ser interessante aplicar outra metodologia de busca.",
        erradas=[
            "é a busca por quadrante, que exige a divisão da cena em exatamente quatro setores de área equivalente.",
            "é a busca em linha cruzada, em que cada grupo percorre um setor em direção perpendicular à do grupo vizinho.",
            "é a busca em espiral, que se aplica sempre que a cena possui divisórias internas separando os ambientes.",
        ],
        justificativa="A busca por quadrante é utilizada quando se necessita dividir a cena de crime em quadrantes e realizar uma busca em cada um; e, dependendo da situação, pode ser interessante aplicar OUTRA metodologia de busca dentro de cada quadrante — é esse o detalhe cobrado. A opção que exige exatamente quatro setores de área equivalente inventa um requisito numérico. A da linha cruzada troca de padrão: nela, a mesma área é varrida duas vezes, a segunda em direção perpendicular à primeira. A que generaliza a espiral para qualquer cena com divisórias ignora o critério real da espiral, que é área pequena com poucas pessoas.",
    ),
    dict(
        letra="D", nivel="medio", ref="busca",
        enunciado="Entre as premissas básicas para a realização de uma busca, o material afirma que um vestígio material nunca pode ser demasiadamente documentado. Sobre essa premissa, é correto afirmar que:",
        correta="o único fator que limita a documentação é o tempo que se pode dedicar a ela.",
        erradas=[
            "o excesso de registros pode prejudicar a análise posterior, por isso se documenta apenas o essencial de cada vestígio.",
            "a documentação deve cessar quando o vestígio já estiver fotografado e posicionado no croqui, sendo redundante o que vier depois.",
            "a premissa vale apenas para os vestígios que serão encaminhados ao laboratório, dispensando-se registro dos demais.",
        ],
        justificativa="A premissa é literal: quanto mais soubermos sobre o vestígio, melhor será, e não há como pensar que ele foi documentado excessivamente de modo a prejudicar sua análise — o ponto-chave limitante é o TEMPO que se pode dedicar a essa tarefa. A opção que admite prejuízo pelo excesso nega a premissa. A que fixa um ponto de parada na fotografia e no croqui cria um limite que o texto não estabelece, já que anotações e outras formas de documentação continuam úteis. A que restringe a premissa aos vestígios encaminhados contraria a lógica: também os que ficam a cargo da autoridade são fotografados e discriminados na documentação.",
    ),
    dict(
        letra="A", nivel="dificil", ref="busca",
        enunciado="Ainda entre as premissas básicas da busca, o material distingue o modo de examinar as áreas visíveis e as áreas escondidas ou dissimuladas. Assinale a alternativa que reproduz corretamente essa distinção e as demais premissas.",
        correta="Busca cautelosa nas áreas visíveis, para evitar perda ou contaminação, e busca vigorosa nas áreas escondidas ou dissimuladas; conduz-se do geral para o específico.",
        erradas=[
            "Busca vigorosa nas áreas visíveis, onde está a maioria dos vestígios, e busca cautelosa nas escondidas; conduz-se do específico para o geral.",
            "Busca cautelosa em ambas, já que a diferença entre área visível e dissimulada só é conhecida ao final da varredura; conduz-se do geral para o específico.",
            "Busca vigorosa em ambas, pois a melhor maneira de conduzir uma busca é a mais rápida; conduz-se do específico para o geral.",
        ],
        justificativa="As premissas são quatro: o vestígio nunca é documentado demais; conduza a busca DO GERAL PARA O ESPECÍFICO; só existe uma chance de processar o local adequadamente, procedendo-se a busca CAUTELOSA nas áreas visíveis, de modo a evitar perda ou contaminação; e promova busca VIGOROSA por áreas escondidas ou dissimuladas. As opções que invertem os adjetivos, ou o sentido geral→específico, contrariam o texto. E a que afirma ser a melhor busca a mais rápida inverte a advertência da apostila, segundo a qual normalmente a melhor maneira de conduzir uma busca é a mais difícil e a que mais consome tempo.",
    ),
    dict(
        letra="C", nivel="facil", ref="busca",
        enunciado="Encontrado um vestígio material durante a busca, ele deve ser marcado. Além de permitir que seja descrito, fotografado e assinalado no croqui, a marcação tem outra função apontada pelo material:",
        correta="evitar que outras pessoas, que não o viram, venham a destruí-lo ou prejudicá-lo.",
        erradas=[
            "individualizar o vestígio na cadeia de custódia, substituindo a etiqueta de identificação da embalagem.",
            "indicar a ordem cronológica em que os vestígios foram produzidos durante a dinâmica do fato.",
            "delimitar o quadrante em que o vestígio se encontra, para orientar a divisão da área na busca completa.",
        ],
        justificativa="O material diz que cada vestígio material, quando encontrado, deverá ser marcado, pois isso evitará que outras pessoas que não o viram possam destruí-lo ou prejudicá-lo — é uma função de proteção física, somada à de permitir descrição, fotografia e croqui. Existem diversos tipos de marcadores, e seu uso depende de cada caso. A opção que faz o marcador substituir a etiqueta confunde dois momentos: a identificação com etiqueta é do acondicionamento. A da ordem cronológica atribui ao marcador uma leitura de dinâmica que ele não faz. A da delimitação de quadrante troca marcador por divisão de área.",
    ),
    dict(
        letra="B", nivel="dificil", ref="busca",
        enunciado="Segundo o material, os padrões de busca apresentados têm dois objetivos declarados. São eles:",
        correta="minimizar a contaminação dos vestígios e promover uma forma organizada de encontrar as evidências.",
        erradas=[
            "reduzir o tempo de permanência da equipe no local e padronizar o registro fotográfico dos vestígios encontrados.",
            "distribuir uniformemente as tarefas entre os membros da equipe e documentar a área efetivamente percorrida.",
            "garantir a cobertura integral da área e dispensar o croqui quando toda a cena tiver sido varrida com o mesmo padrão.",
        ],
        justificativa="O texto fecha o tópico dizendo que os padrões apresentados visam promover um acesso à cena de crime de maneira a MINIMIZAR A CONTAMINAÇÃO dos vestígios e a promover uma FORMA ORGANIZADA de encontrar as evidências — e, antes, que visam cobrir a área questionada e facilitar o trabalho de encontrar os vestígios. A opção que fala em reduzir o tempo contraria a advertência de que a melhor busca costuma ser a que mais consome tempo. A da distribuição de tarefas descreve a reunião preliminar. A que dispensa o croqui contraria a regra de assinalar nele todo vestígio encontrado.",
    ),

    # ================= 4.4 COLETA DE VESTÍGIOS =================
    dict(
        letra="D", nivel="medio", ref="coleta",
        enunciado="Nem todos os vestígios encontrados são levados pela equipe pericial. Sobre o destino dos vestígios após a documentação, é correto afirmar que:",
        correta="alguns são coletados pelo próprio perito e outros, apenas fotografados e discriminados na documentação, ficam a cargo do delegado para a apreensão.",
        erradas=[
            "todos os vestígios documentados devem ser coletados pela perícia, que responde pela integridade do material até a entrega ao laboratório de destino.",
            "os vestígios não coletados pela perícia são liberados junto com o local, cabendo ao proprietário a guarda dos bens que permanecerem na cena.",
            "a definição do que será coletado cabe ao delegado, que na reunião final indica à equipe os itens a serem encaminhados a exame.",
        ],
        justificativa="O material distingue os dois destinos: alguns vestígios serão coletados e levados pelo próprio perito, como amostras de material ou objetos que serão submetidos a exames posteriores; outros serão fotografados e discriminados na documentação, mas deixados a cargo do DELEGADO para proceder à apreensão. A opção que manda coletar tudo apaga essa distinção. A que os dá por liberados com o local ignora que a apreensão pela autoridade é justamente o destino previsto. A que entrega ao delegado a definição do que coletar inverte os papéis — na liberação é o perito-chefe quem informa quais materiais devem ser apreendidos e encaminhados.",
    ),
    dict(
        letra="A", nivel="facil", ref="coleta",
        enunciado="Antes da coleta, o perito deve observar as orientações institucionais vigentes. Havendo dúvida quanto aos procedimentos de coleta, o material orienta:",
        correta="consultar as diretrizes e recomendações técnicas expedidas pelo INC, disponíveis nos meios oficiais.",
        erradas=[
            "consultar a autoridade policial requisitante, a quem cabe definir a forma de coleta dos vestígios do local.",
            "adotar o procedimento mais conservador possível, coletando o vestígio integralmente em qualquer hipótese.",
            "suspender a coleta e registrar a dúvida no laudo, encaminhando o vestígio no estado em que foi encontrado.",
        ],
        justificativa="O texto remete expressamente às diretrizes e recomendações técnicas expedidas pelo INC, disponíveis nos meios oficiais, referentes aos procedimentos de coleta. A opção que remete à autoridade requisitante transfere ao leigo uma definição técnica. A que manda sempre coletar o item integralmente confunde a preferência pelo vestígio integral, que existe, com uma regra absoluta — o próprio material reconhece que nem sempre é possível, por dificuldade de transporte ou impossibilidade técnica. A que manda suspender a coleta cria um procedimento inexistente e desperdiça a oportunidade única do local.",
    ),
    dict(
        letra="C", nivel="dificil", ref="coleta",
        enunciado="Sendo necessária amostragem para encaminhamento a laboratório, o material exige metodologia adequada. Em caso de dúvida sobre a amostragem, o perito deve:",
        correta="consultar as recomendações técnicas da área ou contatar quem fará os exames, para orientar-se quanto a quantidade, tamanho e necessidade de controle.",
        erradas=[
            "coletar a maior quantidade possível do material, já que o excesso de amostra nunca prejudica a análise laboratorial.",
            "encaminhar o item por inteiro, ainda que isso exija a remoção de estruturas fixas do imóvel onde o vestígio se encontra.",
            "dividir a amostra em três porções idênticas, destinando uma ao exame pericial, outra à contraprova requerida pela defesa e a terceira ao arquivo do instituto.",
        ],
        justificativa="A amostragem deve ser em quantidade e número suficientes; havendo dúvida, o perito deve consultar as recomendações técnicas da área ou contatar o pessoal responsável pelos futuros exames, para receber orientação quanto a quantidade e tamanho das amostras e necessidade de amostras controle. A opção do 'quanto mais melhor' substitui a metodologia por força bruta. A que impõe encaminhar o item por inteiro ignora as impossibilidades de transporte e técnicas reconhecidas no texto. A das três porções idênticas inventa uma regra de contraprova e arquivo que o capítulo não estabelece.",
    ),
    dict(
        letra="B", nivel="medio", ref="coleta",
        enunciado="O material afirma existir uma preferência geral quanto à forma de encaminhar o vestígio a exame. Assinale a alternativa que a enuncia corretamente, com a respectiva ressalva.",
        correta="O melhor vestígio é o que pode ser encaminhado integralmente, pois fornece mais informação; nem sempre isso é possível, por dificuldade de transporte ou impossibilidade técnica.",
        erradas=[
            "O melhor vestígio é o coletado por amostragem, pois reduz o volume transportado; a remessa integral só se admite quando o suporte for de pequenas dimensões.",
            "O melhor vestígio é o fotografado em detalhe no local, pois preserva o contexto em que foi encontrado; a remessa física só se justifica quando o exame depender de reagentes químicos.",
            "O melhor vestígio é o recortado do suporte junto com a amostra controle; a remessa integral é vedada quando o suporte pertencer a terceiro de boa-fé.",
        ],
        justificativa="A regra geral enunciada é que o melhor vestígio é aquele que pode ser encaminhado de forma INTEGRAL para os exames, porque fornecerá maior quantidade de informações ao perito que o analisará; mas isso nem sempre é possível, seja por dificuldades de transporte, seja por impossibilidades técnicas — e é aí que entram o recorte do suporte e a amostra controle. A opção que eleva a amostragem a preferência inverte a regra. A que substitui a remessa pela fotografia confunde documentação com coleta. A que veda a remessa integral por pertencer o suporte a terceiro cria uma restrição jurídica que o capítulo não prevê.",
    ),

    # ================= 4.5 e 4.6 =================
    dict(
        letra="D", nivel="dificil", ref="final",
        enunciado="Na reunião final, o entendimento global da equipe é o de que tudo o que era necessário foi feito. Segundo o material, o passo seguinte é:",
        correta="o chefe da equipe conduzir uma busca final pelo local, para certificar-se das condições antes da entrega.",
        erradas=[
            "a equipe iniciar imediatamente a entrega formal do local ao delegado ou policial encarregado.",
            "o chefe da equipe repetir o padrão de busca inicialmente adotado, agora em direção perpendicular à primeira varredura.",
            "a equipe recolher os marcadores de vestígio e refazer o croqui, atualizando-o com os itens efetivamente coletados.",
        ],
        justificativa="Respondida afirmativamente a pergunta-pauta, o chefe da equipe conduzirá uma BUSCA FINAL pelo local, para se certificar das condições dele antes da entrega; só depois é que se parte para a etapa de liberação. A opção que vai direto à entrega pula essa busca final. A que manda repetir a varredura em direção perpendicular importa a definição da busca em linha cruzada, que é um padrão da busca completa e não o procedimento da reunião final. A do recolhimento de marcadores e refazimento do croqui inventa um procedimento — o croqui é preenchido durante a busca, à medida que os vestígios são assinalados.",
    ),
    dict(
        letra="A", nivel="dificil", ref="cheg",
        enunciado="Um perito é acionado às 3h para um homicídio em via pública. Ao chegar, encontra o perímetro isolado por policiais militares, curiosos próximos à fita e o delegado pedindo pressa. Considerando a ordem dos procedimentos da etapa de chegada ao local, o que ele faz, nessa sequência?",
        correta="Assume formalmente o local, reavalia o perímetro, reúne a equipe e então procede à busca inicial.",
        erradas=[
            "Procede à busca inicial, assume formalmente o local, reavalia o perímetro e ao final reúne a equipe.",
            "Reúne a equipe, procede à busca inicial, assume formalmente o local e por último reavalia o perímetro.",
            "Reavalia o perímetro, procede à busca inicial, reúne a equipe e só então assume formalmente o local.",
        ],
        justificativa="A etapa de chegada tem ordem própria: assumir o local de maneira formal, segura e clara, comunicando-se ao responsável; reavaliar o perímetro encontrado, ampliando-o ou reduzindo-o; promover a reunião preliminar com toda a equipe, fruto dessa avaliação; e então realizar a busca inicial, que planeja a busca completa e fixa a rota de entrada e saída. As demais opções deslocam a busca inicial para antes da reunião preliminar ou postergam o ato de assumir o local, que é o primeiro — sem ele a cena ainda não está sob controle da perícia. Quanto à pressa do delegado, a resposta é explicar que o trabalho não será rápido, e não abreviar etapas.",
    ),
    dict(
        letra="B", nivel="dificil", ref="prep",
        enunciado="A perícia é acionada para um laboratório clandestino de refino de drogas, com produtos químicos à vista. Sobre o que a etapa de preparação exige nesse caso, é correto afirmar que:",
        correta="o tipo de local indica os vestígios prováveis e leva a separar equipamento de coleta e frascos apropriados, como pipetas, antes do deslocamento.",
        erradas=[
            "o material de coleta padrão é suficiente, devendo os frascos específicos ser requisitados ao laboratório depois de identificadas as substâncias no local.",
            "a preparação se limita ao dimensionamento da equipe e à escolha do transporte, pois os produtos químicos só podem ser manipulados pelo setor de química forense.",
            "a coleta de substâncias químicas dispensa embalagem específica, bastando o acondicionamento em envelope de papel devidamente lacrado e identificado.",
        ],
        justificativa="É o próprio exemplo da apostila: no caso de um laboratório clandestino de drogas onde existam produtos químicos, é importante ter equipamento de coleta, como pipeta, e frascos apropriados de embalagem — e o material deve ser providenciado ANTES de chegar ao local, sob pena de o processamento ficar prejudicado por atraso ou por falta de equipamento adequado. A opção que remete os frascos ao laboratório depois inverte o momento. A que limita a preparação à equipe e ao transporte ignora o item material e equipamento. A do envelope de papel aplica a substâncias químicas um acondicionamento que não lhes serve.",
    ),
    dict(
        letra="C", nivel="dificil", ref="prep",
        enunciado="Sobre a etapa de preparação do processamento de um local de crime, assinale a alternativa INCORRETA.",
        correta="A obtenção de informações adicionais sobre o local é etapa dispensável, por se basear em relatos de terceiros que não serão avaliados no laudo.",
        erradas=[
            "A preparação começa quando o perito toma conhecimento do local e se destina a aglutinar os recursos humanos e materiais necessários aos exames.",
            "O tipo de local e de crime orienta os vestígios esperados, o material a separar e o apoio especializado a solicitar, além do dimensionamento da equipe.",
            "Quando a urgência do exame se sobrepõe ao planejamento, uma parte da equipe pode avaliar a cena enquanto a outra providencia os materiais e equipamentos.",
        ],
        justificativa="A alternativa incorreta é a que dispensa a obtenção de informações adicionais: o material diz o oposto — trata-se de etapa muito importante, que NÃO pode ser descartada, realizada quase que intuitivamente, na qual se buscam informações de maneira sistematizada e organizada. Confunde-se aí com outra regra, verdadeira mas de contexto diverso: a de que as informações subjetivas colhidas em entrevistas não são objeto de avaliação no laudo, o que não retira delas a utilidade de direcionar e agilizar os trabalhos. As demais alternativas reproduzem corretamente o início e a finalidade da preparação, o papel do tipo de local/crime e a solução para os casos de urgência.",
    ),
    dict(
        letra="A", nivel="dificil", ref="busca",
        enunciado="Sobre a busca completa e os seus padrões, assinale a alternativa INCORRETA.",
        correta="Localizado o vestígio, ele deve ser coletado de imediato pelo integrante que o encontrou, para não se perder com o prosseguimento da varredura.",
        erradas=[
            "Na busca em linha, os profissionais se posicionam a dois braços de distância e uma pessoa-base comanda o deslocamento do conjunto.",
            "A busca em linha cruzada é mais completa e mais trabalhosa, pois repete a varredura numa direção perpendicular à primeira.",
            "A busca em espiral se inicia na periferia e contorna a cena até o ponto central, onde em geral se encontra a maioria dos vestígios.",
        ],
        justificativa="A alternativa incorreta é a que manda coletar de imediato: o material afirma expressamente que os vestígios NÃO devem ser coletados assim que encontrados — devem ser marcados, para poderem ser descritos, fotografados e ter sua posição anotada no croqui; na busca em linha, inclusive, quem encontra grita 'alto' para que toda a linha pare e aguarde a marcação. A coleta só ocorre depois que o vestígio foi posicionado, fotografado e, se possível, descrito. As demais alternativas reproduzem corretamente a formação da linha, a natureza da linha cruzada e o sentido da espiral.",
    ),
]
