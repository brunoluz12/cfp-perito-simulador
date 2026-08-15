# -*- coding: utf-8 -*-
"""Bizuraço Prova — questões, parte 2: seções 6 a 10."""

Q = []


def q(sec, enun, alts, cor, just, nivel="dificil", prof=False):
    Q.append({
        "secao": sec, "enunciado": enun, "alternativas": alts,
        "resposta_correta": cor, "justificativa": just,
        "nivel": nivel, "prof": prof,
    })


# ============ 6. VESTÍGIOS BIOLÓGICOS ============

q(6, "São exemplos de vestígios biológicos, conforme a lista trabalhada na revisão:",
  {"A": "sangue, saliva, sêmen, urina, fezes, suor, cabelos e pelos, células epiteliais e tecidos moles.",
   "B": "sangue, saliva, sêmen, fibras têxteis, partículas de solo e resíduos de disparo de arma de fogo.",
   "C": "sangue, sêmen, urina, fragmentos de vidro, lascas de tinta automotiva e material particulado metálico.",
   "D": "sangue, saliva, cabelos, marcas de ferramenta e impressões papilares latentes reveladas no local."},
  "A",
  "A definição é ampla: tudo o que vem do organismo vivo, incluindo os tecidos moles, que são os órgãos. B, C e D contaminam a lista com microvestígios (fibras, solo, vidro, tinta), vestígios químicos (resíduos de disparo) e vestígios de outra natureza (marcas de ferramenta e impressões papilares), que não são material biológico.",
  nivel="medio")

q(6, "Sobre a importância do vestígio biológico, é correto afirmar que:",
  {"A": "presta-se apenas à materialidade, pois a individualização depende necessariamente de confronto papiloscópico.",
   "B": "presta-se à materialidade e, sobretudo, à autoria, e pode estar presente em qualquer tipo de crime.",
   "C": "presta-se à autoria em crimes contra a pessoa, sendo irrelevante em locais de crime contra o patrimônio.",
   "D": "presta-se à autoria somente quando encontrado em quantidade suficiente para exame de DNA nuclear."},
  "B",
  "O professor perguntou e respondeu: importante para a materialidade e mais ainda para a autoria; e pode haver biológico em qualquer crime, inclusive arrombamento. A restringe à materialidade. C exclui os crimes patrimoniais, quando o próprio material lista suor, sangue e saliva entre os vestígios de arrombamento. D condiciona ao DNA nuclear, ignorando que o mitocondrial também tem valor identificador.")

q(6, "O professor marcou de vermelho no slide a regra sobre embalagem de vestígio biológico. Segundo ela:",
  {"A": "vestígios secos podem ser acondicionados em saco plástico lacrado, pois a ausência de umidade afasta o risco de degradação.",
   "B": "vestígios secos devem ser acondicionados em embalagem permeável ao ar e opaca, ainda que já estejam secos.",
   "C": "vestígios secos devem ser acondicionados em recipiente plástico hermético e mantidos sob refrigeração a 4 °C.",
   "D": "vestígios secos dispensam cuidado especial de embalagem, bastando que o material esteja limpo e identificado."},
  "B",
  "A regra é essa, e o professor insistiu no advérbio: MESMO seco, a embalagem tem que ser permeável. A razão é que o ar contém água — fechado, forma-se abafamento e a bactéria degrada o material. A é justamente o erro que ele viu a turma cometer. C aplica ao seco o regime do úmido. D dispensa a exigência central da regra.",
  prof=True)

q(6, "Quando um vestígio biológico seco, acondicionado em envelope de papel, precisa ser transportado em envelope plástico de segurança com lacre, o procedimento correto é:",
  {"A": "furar o saco plástico, permitindo o fluxo de ar sem comprometer a segurança da embalagem.",
   "B": "substituir o envelope de papel por embalagem plástica, evitando dupla camada que dificulte a inspeção.",
   "C": "manter o saco íntegro e lacrado, adicionando sílica-gel em seu interior para absorver a umidade residual.",
   "D": "dispensar o envelope de segurança, já que o papel isoladamente satisfaz o requisito de permeabilidade."},
  "A",
  "O saco de lacre é furado justamente para preservar a permeabilidade sem quebrar a cadeia de custódia. B elimina a embalagem primária de papel, que é a que garante a permeabilidade. C mantém o abafamento e introduz um insumo não previsto. D dispensa a embalagem de segurança, que é o elemento de rastreio individualizado.")

q(6, "Sobre os materiais empregados na coleta de vestígios biológicos:",
  {"A": "basta que estejam limpos, aplicando-se aqui o mesmo padrão exigido para os vestígios químicos.",
   "B": "devem ser sempre limpos, novos ou estéreis, pelo risco de contaminação da amostra.",
   "C": "devem ser esterilizados no próprio local, imediatamente antes de cada coleta, com álcool a 70%.",
   "D": "devem ser de uso exclusivo do perito responsável, admitida a reutilização após higienização em laboratório."},
  "B",
  "Limpo não basta: exige-se material limpo, NOVO ou ESTÉRIL. A transporta para os biológicos o padrão dos químicos. C sugere esterilização improvisada em campo, o que não substitui material estéril de fábrica. D admite reutilização, incompatível com o risco de contaminação cruzada.")

q(6, "Assinale a alternativa que apresenta corretamente a regra de acondicionamento e preservação do vestígio biológico.",
  {"A": "Seco: papel permeável e opaco, temperatura ambiente ao abrigo da luz. Úmido ou líquido: plástico estéril, refrigerar e congelar.",
   "B": "Seco: plástico estéril, sob refrigeração. Úmido ou líquido: papel permeável, mantido em temperatura ambiente e ao abrigo da luz.",
   "C": "Seco e úmido: sempre embalagem de papel, diferenciando-se apenas pela temperatura de armazenamento aplicada a cada um.",
   "D": "Seco e úmido: sempre recipiente plástico hermético, diferenciando-se apenas pela necessidade de congelamento do úmido."},
  "A",
  "É a regra de ouro: o que pode secar vai em papel, à temperatura ambiente e protegido da luz; o que não pode secar vai em plástico estéril, refrigerado e depois congelado. B inverte os dois regimes. C uniformiza a embalagem em papel, inadequada para líquidos. D uniformiza em plástico hermético, que abafa o vestígio seco.")

q(6, "Sobre a coleta com suabe, assinale a alternativa correta.",
  {"A": "Na mancha seca umedece-se o suabe na própria amostra; na mancha úmida, umedece-se em água destilada estéril.",
   "B": "Na mancha úmida basta passar o suabe; na mancha seca, umedece-se o suabe em água destilada estéril antes de friccioná-lo.",
   "C": "Em ambos os casos o suabe deve ser umedecido em álcool absoluto, que preserva melhor o material genético.",
   "D": "Em ambos os casos o suabe deve ser acondicionado ainda úmido, para evitar a perda de células por ressecamento."},
  "B",
  "Amostra úmida: passa o suabe direto. Amostra seca: umedece com água destilada estéril, amolece e friccciona. A inverte os dois procedimentos. C introduz o álcool, que degrada o DNA. D contraria a regra de secar antes de acondicionar — salvo quando se usa porta-suabe, que dispensa a secagem prévia porque o material seca protegido em seu interior.")

q(6, "São fatores de degradação do DNA em local de crime:",
  {"A": "calor, umidade, luz solar ou ultravioleta, produtos químicos como o hipoclorito e contaminação bacteriana e fúngica.",
   "B": "calor, umidade e o simples decurso do tempo, que degrada o material genético independentemente do acondicionamento.",
   "C": "frio intenso, ressecamento e exposição prolongada ao ar, razão pela qual se recomenda vedação hermética.",
   "D": "luz solar e vibração durante o transporte, sendo os agentes microbiológicos irrelevantes para amostras já secas."},
  "A",
  "São os inimigos do DNA listados na aula. B erra no tempo: em condições adequadas o DNA se preserva por muito tempo — o tempo só é crítico quando o acondicionamento é inadequado. C inverte tudo, inclusive recomendando a vedação hermética, que é o erro combatido. D descarta a contaminação microbiológica, que é justamente o motivo da permeabilidade.")

q(6, "O caso do fantasma de Heilbronn, mencionado na revisão, ilustra que:",
  {"A": "perfis genéticos femininos apresentam maior taxa de coincidência espúria em bancos de dados de grande porte.",
   "B": "a contaminação pode ocorrer na produção do material de coleta, gerando coincidências entre cenas de crime sem relação entre si.",
   "C": "o DNA mitocondrial não permite individualização, razão por que não deve embasar vínculo entre locais distintos.",
   "D": "amostras coletadas por suabe perdem valor probatório após determinado período de armazenamento em temperatura ambiente."},
  "B",
  "O perfil coincidente em cerca de 40 cenas de crime em três países vinha de contaminação na fábrica dos suabes. A atribui o fenômeno a uma propriedade estatística inexistente. C traz uma afirmação sobre DNA mitocondrial que não é o objeto do caso. D desloca a explicação para o armazenamento, quando a contaminação foi anterior ao próprio uso.")

q(6, "Sobre a interpretação do achado de DNA em cena de crime, é correto afirmar que:",
  {"A": "encontrar o DNA de uma pessoa na cena não significa que ela cometeu o crime, dependendo do tipo de vestígio e da circunstância.",
   "B": "encontrar o DNA de uma pessoa na cena estabelece sua participação, cabendo à defesa demonstrar a hipótese de transferência secundária.",
   "C": "o achado só tem valor quando acompanhado de impressão papilar no mesmo suporte, o que confirma o contato direto.",
   "D": "o achado permite concluir pela autoria sempre que o perfil for obtido a partir de material com células nucleadas."},
  "A",
  "Foi advertência expressa da aula, e o critério do perito é fundamental para estabelecer a relevância do vestígio. B inverte o ônus e transforma o achado em prova de participação. C cria uma exigência de corroboração papiloscópica inexistente. D confunde a qualidade técnica do perfil com a conclusão sobre autoria, que é questão de contexto.")

q(6, "Sobre a coleta de pelos e a distinção entre os exames possíveis:",
  {"A": "a coleta é feita com pinça, com cuidado para não danificar o bulbo; com bulbo permite DNA nuclear, sem bulbo apenas mitocondrial.",
   "B": "a coleta é feita com fita adesiva, e a presença do bulbo é irrelevante, pois a haste concentra o material genético útil.",
   "C": "a coleta é feita com pinça, e a ausência do bulbo inviabiliza qualquer exame genético sobre o material recolhido.",
   "D": "a coleta é feita com suabe umedecido, devendo pelos de origens diferentes ser acondicionados em um mesmo envelope primário."},
  "A",
  "Pinça, preservando o bulbo, que é o que viabiliza o DNA nuclear; sem bulbo resta o mitocondrial. B erra o instrumento e nega a importância do bulbo. C acerta o instrumento mas exclui o mitocondrial, que continua possível. D erra o instrumento e ainda determina o acondicionamento conjunto, quando pelos de origens diferentes devem ser separados.")

q(6, "Distinga corretamente os exames realizados no cadáver:",
  {"A": "Perinecroscópico: realizado no IML pelo médico legista. Necroscópico: realizado no local pelo perito criminal.",
   "B": "Perinecroscópico: realizado no local pelo perito criminal. Necroscópico: realizado no IML pelo médico legista, podendo o perito acompanhar.",
   "C": "Ambos são realizados no local, cabendo o externo ao perito criminal e o interno ao médico legista designado.",
   "D": "Ambos são realizados no IML, diferenciando-se pelo momento: o perinecroscópico antecede e o necroscópico sucede a abertura das cavidades."},
  "B",
  "Perinecroscópico é no local, pelo perito criminal; necroscópico é no IML, pelo legista, com possibilidade de acompanhamento pelo perito. A inverte integralmente. C mantém os dois no local, quando o necroscópico exige o IML. D transfere ambos para o IML, esvaziando o exame de local.",
  nivel="medio")

# ============ 7. VESTÍGIOS FÍSICOS E VIDROS ============

q(7, "Na arrecadação de vestígios físicos, a ordem de prioridade é:",
  {"A": "em primeiro lugar a segurança das pessoas; em segundo, a segurança dos vestígios.",
   "B": "em primeiro lugar a integridade dos vestígios; em segundo, a segurança da equipe que os manipula.",
   "C": "em primeiro lugar a celeridade da coleta; em segundo, a preservação das condições originais do suporte.",
   "D": "em primeiro lugar a cadeia de custódia; em segundo, a segurança das pessoas presentes na cena."},
  "A",
  "A ordem é pessoas e depois vestígios. B inverte a prioridade, subordinando a segurança da equipe à do material. C substitui a segurança pela celeridade, contrariando a premissa de que a pressa é a principal fonte de erro. D coloca um procedimento formal acima da integridade física das pessoas.",
  nivel="medio")

q(7, "Sobre o acondicionamento de arma de fogo e seus elementos de munição, conforme a orientação dada na revisão:",
  {"A": "arma e munição devem ser acondicionadas na mesma embalagem, para preservar o vínculo entre elas.",
   "B": "arma e munição devem ser acondicionadas separadamente, e o transporte da arma é sempre com ela desmuniciada.",
   "C": "arma e munição podem seguir juntas, desde que a arma esteja travada e o carregador permaneça inserido.",
   "D": "arma e munição devem seguir juntas quando houver uma única arma, e separadas apenas em apreensões múltiplas."},
  "B",
  "O professor reconheceu que a apostila diz o contrário e foi expresso: não vai cair do jeito que está lá — arma e munição vão SEPARADAS, e a arma é transportada desmuniciada. A reproduz a redação da apostila, que ele afastou. C mantém o carregador inserido, contrariando o check de segurança. D cria uma distinção por número de armas que não existe.",
  prof=True)

q(7, "Encontrado projétil incrustado em parede de alvenaria, o procedimento correto é:",
  {"A": "removê-lo com pinça de pontas revestidas, evitando o contato metálico direto com a superfície do projétil.",
   "B": "removê-lo com chave de fenda e acondicioná-lo em envelope plástico, após a retirada dos resíduos aderidos.",
   "C": "cortar e escavar o suporte em volta, levando um pedaço do material junto com o projétil.",
   "D": "fotografá-lo em posição e deixá-lo no local, cabendo à autoridade policial providenciar a remoção posterior."},
  "C",
  "Trabalha-se no suporte: corta, escava e leva um pedaço da parede junto. A e B usam instrumentos que produzem ranhuras capazes de inviabilizar o confronto balístico, e B ainda remove as incrustações, que podem conter vestígio biológico. D transfere à autoridade uma providência que é técnica e cabe à perícia.",
  prof=True)

q(7, "Coletado o projétil, o acondicionamento adequado é:",
  {"A": "individualmente, envolto em algodão, em envelope de papel, e depois no saco de lacre.",
   "B": "em conjunto com os demais elementos metálicos recolhidos, para facilitar o confronto comparativo no laboratório.",
   "C": "em frasco de vidro com tampa rosqueável, que impede o atrito do projétil contra as paredes do recipiente.",
   "D": "em envelope plástico hermético, após a limpeza dos resíduos que possam mascarar as estrias de raiamento."},
  "A",
  "Individual, protegido por algodão, em papel e depois lacrado. B admite o contato com outros metais, que pode marcar o projétil e prejudicar o exame balístico. C não protege do impacto e não é o recipiente indicado. D determina a limpeza dos resíduos, que devem ser preservados por seu valor probatório.")

q(7, "Sobre a identificação e a etiquetagem dos vestígios físicos:",
  {"A": "a inscrição deve ser feita no próprio corpo do vestígio, garantindo que a identificação o acompanhe em qualquer manuseio.",
   "B": "deve-se evitar marcação no corpo do vestígio, fixando-se as etiquetas nos envelopes ou recipientes de acondicionamento.",
   "C": "a etiquetagem é dispensável quando o vestígio segue em envelope de segurança com numeração individualizada.",
   "D": "a etiqueta deve conter apenas o número do vestígio, vedada a inclusão de dados que permitam identificar o coletador."},
  "B",
  "Evita-se marcar o vestígio para preservar sua integridade; a etiqueta vai na embalagem. A é o erro que a regra combate. C dispensa a etiquetagem, quando o número do lacre não substitui os dados de origem, data e responsável. D suprime justamente o nome do coletador, que é dado exigido para a cadeia de custódia.")

q(7, "O estudo do padrão de rompimento de vidros permite determinar:",
  {"A": "o ponto de impacto, a direção da força do choque, a ordem dos impactos e o confronto de versões sobre o ocorrido.",
   "B": "o ponto de impacto e a massa exata do objeto arremessado, calculada pela extensão das fendas radiais formadas.",
   "C": "a direção do choque e o intervalo de tempo decorrido entre impactos sucessivos sobre a mesma superfície.",
   "D": "a ordem dos impactos e a identificação do calibre do projétil, obtida pelo diâmetro do orifício de transfixação."},
  "A",
  "São as quatro finalidades listadas. B inventa o cálculo de massa. C inventa a datação do intervalo entre impactos. D confunde: o calibre até pode ser estimado pelo diâmetro do orifício em anteparo, mas não é uma das finalidades do estudo do padrão de rompimento, e essa medição tem limitações próprias.")

q(7, "Sobre o cone de transfixação e as rupturas no vidro, assinale a alternativa correta.",
  {"A": "A base do cone fica na face que recebeu o choque; as radiais iniciam-se nessa mesma face, por concentração de tensão.",
   "B": "A base do cone fica na face oposta à do choque, ou seja, na saída; as radiais iniciam-se na face oposta à do impacto.",
   "C": "A base do cone fica na face oposta à do choque; as radiais iniciam-se na face do impacto, e as concêntricas, na face oposta.",
   "D": "A base do cone fica na face de entrada; as concêntricas formam-se antes das radiais, dividindo o vidro em setores triangulares."},
  "B",
  "Duas das três respostas que ele cobrou: a base do cone está na face oposta ao choque (na saída, onde há maior perda de massa) e as radiais começam do lado oposto ao impacto, submetido a maior tensão. A erra as duas. C acerta o cone mas inverte radiais e concêntricas. D erra o cone e ainda inverte a ordem de formação — as radiais vêm primeiro.",
  prof=True)

q(7, "Sobre as rupturas concêntricas ou espirais no vidro:",
  {"A": "formam-se antes das radiais e iniciam-se na face oposta à do impacto, sendo típicas dos vidros temperados.",
   "B": "formam-se depois das radiais e iniciam-se do lado do impacto, sendo frequentes nos vidros laminados.",
   "C": "formam-se simultaneamente às radiais e não permitem inferir o lado de onde partiu o choque contra a superfície.",
   "D": "formam-se depois das radiais e iniciam-se na face oposta à do impacto, do mesmo modo que as fendas radiais."},
  "B",
  "As concêntricas vêm depois das radiais e iniciam do lado da pancada — foi a terceira resposta cobrada. Aparecem com frequência em laminados, mais flexíveis que os comuns. A inverte a ordem, o lado e o tipo de vidro. C nega a inferência, que é justamente a utilidade pericial. D acerta a ordem mas repete o lado das radiais, perdendo a distinção entre elas.",
  prof=True)

q(7, "Sobre o mecanismo de formação das rupturas espirais, é correto afirmar que:",
  {"A": "os setores triangulares delimitados pelas radiais são empurrados no mesmo sentido do deslocamento do objeto, e as espirais surgem entre duas radiais já formadas.",
   "B": "as espirais surgem do centro para a periferia, à medida que o vidro recupera elasticamente a posição original após o impacto.",
   "C": "os setores triangulares delimitados pelas radiais são empurrados em sentido contrário ao do deslocamento do objeto, o que explica a curvatura característica das espirais.",
   "D": "as espirais decorrem exclusivamente da vibração residual do caixilho, sendo independentes da força aplicada no impacto."},
  "A",
  "É o mecanismo em três tempos: radiais dividem o vidro em setores, os setores são empurrados no sentido do deslocamento do objeto e, com a continuidade da força, formam-se as espirais entre duas radiais. B descreve um retorno elástico que não corresponde ao processo. C inverte o sentido do empurrão. D atribui o fenômeno ao caixilho, desligando-o da força do impacto.")

q(7, "Em uma vidraça com três impactos, verifica-se que as fendas radiais do impacto azul são interrompidas pelas do amarelo, e que as do amarelo são interrompidas pelas do vermelho. A ordem dos disparos foi:",
  {"A": "azul, amarelo e vermelho, pois a fenda que se interrompe é sempre a mais antiga da sequência analisada.",
   "B": "vermelho, amarelo e azul.",
   "C": "amarelo, vermelho e azul, já que o impacto intermediário é aquele cujas fendas interrompem e são interrompidas.",
   "D": "não é possível determinar a ordem apenas pelas radiais, sendo necessário examinar também as rupturas concêntricas."},
  "B",
  "As radiais do disparo posterior PARAM nas do anterior: quem barra é o mais antigo, quem para é o mais novo. Como as do vermelho barram todas, ele foi o primeiro; o amarelo barra o azul, sendo o segundo. A inverte a regra. C descreve corretamente a posição do intermediário, mas atribui essa posição ao amarelo em primeiro lugar, contradizendo os dados. D nega a possibilidade de determinação, que é justamente a utilidade do exame.",
  prof=True)

# ============ 8. MICROVESTÍGIOS E AJUSTE FÍSICO ============

q(8, "Sobre o conceito de microvestígio, assinale a alternativa correta.",
  {"A": "Depende de medida física absoluta, considerando-se microvestígio o material de dimensão submilimétrica.",
   "B": "Depende do contexto e da dificuldade de percepção, e não exclusivamente de uma medida física absoluta.",
   "C": "Corresponde a categoria autônoma, distinta dos vestígios físicos, químicos e biológicos, com regime próprio de coleta.",
   "D": "Abrange apenas os materiais invisíveis a olho nu, excluídos os que podem ser percebidos sem auxílio técnico."},
  "B",
  "O mesmo fragmento de vidro é visível num piso claro e imperceptível nos escombros de uma explosão — o que define é a perceptibilidade no contexto. A fixa um limite métrico que o material expressamente afasta. C erra a natureza: microvestígios SÃO vestígios físicos. D exclui os perceptíveis, quando a definição fala em difícil visualização, não em invisibilidade absoluta.")

q(8, "O professor cobrou expressamente a formulação do fundamento científico do exame de ajuste físico. Trata-se da premissa de que:",
  {"A": "materiais produzidos em série apresentam variações microscópicas de fabricação que os individualizam desde a origem.",
   "B": "eventos de separação, como quebras, cortes e rasgos, não são reproduzíveis e geram características individuais.",
   "C": "a comparação entre bordas separadas permite estabelecer a origem comum a partir de características de classe do material.",
   "D": "objetos submetidos à mesma combinação de forças tendem a romper segundo padrões previsíveis e comparáveis entre si."},
  "B",
  "É a frase que ele mandou gravar: a não reprodutibilidade do evento de separação é o que confere características INDIVIDUAIS. A desloca a individualização para a fabricação, quando o próprio exemplo das canecas idênticas mostra que o que individualiza é a separação. C reduz a conclusão a características de classe, que não individualizam. D afirma previsibilidade do rompimento, o exato contrário da premissa.",
  prof=True)

q(8, "Sobre a interpretação do resultado do exame de ajuste físico:",
  {"A": "a ausência de ajuste físico demonstra que os itens comparados têm origens diferentes.",
   "B": "a ausência de ajuste físico não implica que os itens comparados tenham se originado de fontes diferentes.",
   "C": "a perda de material ao longo da borda separada descarta, por si só, a possibilidade de ajuste físico positivo.",
   "D": "o ajuste positivo depende do realinhamento integral dos contornos macroscópicos das duas peças confrontadas."},
  "B",
  "É a pegadinha de negativa: ausência de ajuste não prova origens distintas. A afirma exatamente o que a regra nega. C é falsa porque a perda de material nem sempre descarta o ajuste. D exige realinhamento integral, quando o ajuste pode resultar de características que atravessam o limite de separação, como estrias e grãos de madeira, mesmo sem alinhamento pleno das bordas.",
  prof=True)

q(8, "Assinale a alternativa correta sobre as técnicas de coleta de microvestígios.",
  {"A": "A varredura a vácuo deve ser a primeira técnica empregada, por recuperar o maior volume de material da área examinada.",
   "B": "A varredura a vácuo deve ser empregada por último, por ser indiscriminada, sendo indicada em fendas profundas e áreas grandes.",
   "C": "O levantamento com fita adesiva é indicado para tintas e polímeros, cuja aderência ao adesivo facilita a posterior separação.",
   "D": "A coleta do item inteiro deve ser evitada, pois amplia o risco de contaminação durante o transporte até o laboratório."},
  "B",
  "O aspirador é indiscriminado e vem depois das demais técnicas, sendo útil em fendas profundas, áreas extensas ou quando já se passou muito tempo. A inverte a ordem de emprego. C contraria a advertência expressa: não usar adesivo em tinta ou polímeros, porque o adesivo lixivia e altera a química. D inverte a regra geral, que é preferir a coleta do item inteiro quando for fácil, pois a retirada é mais eficiente em laboratório.")

q(8, "Sobre os cuidados na coleta de microvestígios, é correto afirmar que:",
  {"A": "a iluminação oblíqua auxilia a visualizar partículas de superfície, e a coleta de brancos inclui amostra do suporte usado para coletar.",
   "B": "a iluminação frontal difusa é a mais indicada para localizar cabelos e fragmentos de vidro em superfícies têxteis.",
   "C": "a coleta de brancos limita-se à amostra padrão do material conhecido, dispensando amostra do suporte de coleta.",
   "D": "a busca por vestígios no corpo deve ocorrer sempre após a autópsia, quando as lesões já se encontram devidamente descritas pelo legista."},
  "A",
  "A luz oblíqua realça partículas superficiais, e os brancos incluem a amostra do próprio suporte de coleta, para descartar contaminação vinda do material do perito. B troca a iluminação oblíqua pela frontal difusa, que não realça relevo. C suprime justamente o branco do suporte. D inverte o momento: a busca no corpo, se feita, deve ocorrer ANTES da autópsia.")

q(8, "Sobre o acondicionamento de microvestígios e de itens molhados:",
  {"A": "os itens molhados devem ser secos ao ar, sem exposição a calor ou sol, salvo os destinados a exame de líquidos inflamáveis ou alvejante.",
   "B": "os itens molhados devem ser secos com auxílio de fonte de calor branda, que acelera o processo e reduz o risco microbiológico.",
   "C": "todos os itens molhados devem ser secos ao ar, sem exceção, antes de qualquer acondicionamento em embalagem primária.",
   "D": "os itens molhados devem ser acondicionados ainda úmidos em embalagem plástica hermética e encaminhados sob refrigeração."},
  "A",
  "A regra é secar ao ar sem calor nem sol, e a exceção é relevante: itens que serão examinados quanto a líquidos inflamáveis ou alvejante NÃO são secos, sob pena de perda da evidência. B introduz o calor, expressamente vedado. C nega a exceção. D generaliza o regime dos biológicos líquidos para todo item molhado.")

# ============ 9. DISPARO DE ARMA DE FOGO ============

q(9, "Sobre a matemática cobrada nos locais com disparo de arma de fogo, o professor foi expresso ao afirmar que:",
  {"A": "as questões envolvem cosseno e tangente, aplicados ao cálculo do ângulo de incidência sobre o anteparo atingido.",
   "B": "as questões envolvem semelhança de triângulos, não havendo cosseno nem tangente.",
   "C": "as questões envolvem o teorema de Pitágoras, aplicado à hipotenusa formada entre o orifício e o ponto de impacto.",
   "D": "as questões dispensam cálculo, bastando a leitura direta das medidas apresentadas no croqui do local."},
  "B",
  "Ele foi taxativo: não tem cosseno, não tem tangente — o que cai é semelhança de triângulos (e o seno, nas manchas de sangue). A e C indicam ferramentas que ele afastou. D nega a existência do cálculo, que é justamente o tipo de questão anunciado.",
  prof=True)

q(9, "Em um local de crime, um orifício de projétil no piso encontra-se a 20 m de um muro de 3 m de altura, que não apresenta orifícios. A 450 m além do muro há um prédio de 100 m. Considerando trajetória retilínea, a altura do disparo e a compatibilidade com o prédio são:",
  {"A": "70,5 m, sendo compatível com o prédio.",
   "B": "67,5 m, sendo compatível com o prédio, pois a base do triângulo maior corresponde à distância entre o muro e a edificação.",
   "C": "70,5 m, sendo incompatível, uma vez que a altura obtida ultrapassa o limite construtivo do prédio examinado.",
   "D": "3,0 m, pois a altura do disparo é limitada pela altura do muro que a trajetória precisou transpor no percurso."},
  "A",
  "Os dois triângulos partem do mesmo vértice, então a base maior é 20 + 450 = 470. De H/3 = 470/20 vem H = 70,5 m, inferior aos 100 m do prédio — logo, compatível. B usa B = 450, erro que o professor apontou expressamente. C acerta o cálculo mas erra a conclusão, pois 70,5 é menor que 100. D confunde a altura do muro com a altura do disparo.",
  prof=True)

q(9, "Na resolução do problema do muro por semelhança de triângulos, a altura do prédio:",
  {"A": "deve ser inserida na proporção, por constituir a altura do triângulo maior formado na representação gráfica.",
   "B": "não entra no cálculo, servindo apenas para verificar, ao final, se a altura encontrada é compatível com a edificação.",
   "C": "substitui a altura do muro na proporção, quando a trajetória passa acima da barreira sem atingi-la.",
   "D": "define a base do triângulo menor, que corresponde à projeção horizontal da fachada sobre o solo."},
  "B",
  "O professor insistiu: no primeiro momento a altura do prédio não importa; ela só serve depois, para checar se o H encontrado cabe ali. A é o erro que ele antecipou — inserir todos os valores impede achar a incógnita. C substitui a altura do muro, que é justamente a altura conhecida do triângulo menor. D confunde altura com base.",
  prof=True)

# ============ 10. MORTE VIOLENTA / PERINECROSCÓPICO ============

q(10, "As etapas do exame perinecroscópico, na ordem correta, são:",
  {"A": "exame das vestes; exame visual do cadáver; exame do cadáver sem vestes.",
   "B": "exame visual do cadáver; exame das vestes; exame do cadáver sem vestes.",
   "C": "exame visual do cadáver; exame do cadáver sem vestes; exame das vestes já removidas.",
   "D": "exame do local em torno do corpo; exame visual do cadáver; exame das vestes e do cadáver simultaneamente."},
  "B",
  "A ordem é visual, vestes e cadáver sem vestes. A antecipa as vestes ao exame visual. C remove as vestes antes de examiná-las na posição em que se encontram, o que descaracteriza escorrimentos e manchas. D acrescenta uma etapa inexistente e funde as duas últimas, perdendo a sequência.",
  prof=True)

q(10, "O professor perguntou se a principal função do exame perinecroscópico é levantar impressões digitais. A resposta correta é:",
  {"A": "sim, pois a identificação do cadáver é pressuposto de todas as demais conclusões periciais sobre o fato.",
   "B": "não; a função principal é a caracterização completa, buscando a causa e a dinâmica da morte, e o levantamento digital é parte disso.",
   "C": "não; a função principal é a coleta de material genético, cabendo a identificação datiloscópica ao papiloscopista no IML.",
   "D": "sim, quando o cadáver estiver sem documentos, hipótese em que a identificação assume prioridade sobre os demais exames."},
  "B",
  "O levantamento de impressões faz parte, mas a função principal é a caracterização completa, voltada à causa e à dinâmica da morte — vai muito além da identificação. A e D tratam a identificação como finalidade principal, ainda que D a condicione. C troca uma finalidade acessória por outra, a coleta genética, igualmente parcial diante do objetivo do exame.",
  prof=True)

q(10, "Assinale a alternativa que descreve corretamente o conteúdo das etapas do perinecroscópico.",
  {"A": "Na 1ª etapa descrevem-se cor da pele, cabelos, compleição, sexo, altura e fase cronológica; na 2ª, orifícios, manchas e conteúdo dos bolsos.",
   "B": "Na 1ª etapa descrevem-se as lesões por região anatômica; na 2ª, a posição do corpo e sua relação com os objetos do local.",
   "C": "Na 2ª etapa procede-se ao exame de todas as regiões anatômicas; na 3ª, à descrição das vestes já acondicionadas.",
   "D": "Na 1ª etapa realiza-se a coleta do material existente sob as unhas; na 3ª, a descrição das características físicas gerais e da fase cronológica do cadáver."},
  "A",
  "É a divisão correta: características físicas e posição na etapa visual; forma de acomodação das vestes, orifícios, manchas, outros vestígios e conteúdo dos bolsos na etapa das vestes. B desloca as lesões para a primeira etapa, quando elas pertencem à terceira. C e D embaralham conteúdos entre etapas, invertendo a lógica de progressão do exame.")

q(10, "O exame perinecroscópico é realizado no local, e não no instituto médico-legal, porque:",
  {"A": "a legislação processual veda a remoção do cadáver antes de concluído o exame externo pela autoridade policial.",
   "B": "permite preservar os vestígios e, sobretudo, relacionar o corpo com os demais vestígios da cena.",
   "C": "o médico legista somente pode iniciar o exame interno após a conclusão do exame externo por perito criminal.",
   "D": "as condições de iluminação e de acesso ao corpo são mais favoráveis no local do que em ambiente laboratorial."},
  "B",
  "A razão é a contextualização: lesões confrontadas com o instrumento presente na cena, com as manchas de sangue e com a posição do corpo. A inventa uma vedação legal. C cria uma condicionante procedimental inexistente. D é factualmente inverso, pois o ambiente controlado do IML oferece melhores condições técnicas — o que justifica o exame no local é o contexto, não o conforto.",
  prof=True)

q(10, "A análise conjunta do cadáver com os demais vestígios do local permite, entre outras conclusões:",
  {"A": "estabelecer se a vítima foi morta naquele local ou ali desovada, pela compatibilidade das manchas de sangue e dos livores com a posição do corpo.",
   "B": "determinar com precisão o horário do óbito, a partir da correlação entre a temperatura do corpo e a do ambiente.",
   "C": "identificar com segurança o autor do fato, sempre que houver material genético aproveitável sob as unhas da vítima em quantidade suficiente para exame.",
   "D": "definir a causa jurídica da morte, que decorre diretamente do quadro patológico verificado no exame externo."},
  "A",
  "Foi o ponto destacado: a incompatibilidade entre as manchas ou os livores e a posição do corpo indica desova. B afirma precisão incompatível com a cronotanatognose, que exige avaliação conjunta e nunca se baseia em um único sinal. C converte um indício em identificação de autoria. D confunde causa jurídica com causa médica.")

q(10, "Sobre o exame do cadáver ainda vestido, é correto afirmar que:",
  {"A": "as vestes devem ser removidas antes de qualquer registro, para que as lesões sejam fotografadas sem interposição de tecido.",
   "B": "o corpo é examinado primeiro com as vestes, para não descaracterizar escorrimentos e manchas de sangue.",
   "C": "as vestes só são examinadas no IML, cabendo ao perito de local apenas descrevê-las de forma sumária no laudo.",
   "D": "as manchas ainda líquidas devem ser coletadas antes de qualquer registro fotográfico, dado o risco de escorrimento."},
  "B",
  "Examina-se primeiro com as vestes, justamente para preservar escorrimentos e demais manchas. A antecipa a remoção e destrói esses padrões. C transfere ao IML um exame que integra a segunda etapa do perinecroscópico. D inverte a ordem entre registro e coleta: em manchas líquidas o registro deve ser feito ANTES de movimentar o corpo.")

q(10, "Nos termos do art. 164 do CPP e do art. 17 da IT 20/2013-DITEC/PF, os cadáveres:",
  {"A": "serão sempre fotografados na posição em que forem encontrados, bem como, na medida do possível, as lesões externas e os vestígios do local.",
   "B": "serão fotografados após a remoção das vestes, de modo que o registro documente integralmente a superfície corporal.",
   "C": "serão fotografados na posição em que forem encontrados apenas quando houver fundada suspeita de alteração do estado do local por terceiros.",
   "D": "serão fotografados pelo médico legista no momento da entrada no instituto médico-legal, com escala e identificação."},
  "A",
  "É a redação dos dispositivos, com o advérbio SEMPRE. B condiciona o registro à remoção das vestes, contrariando a exigência de fotografar na posição encontrada. C transforma a regra geral em hipótese excepcional. D transfere ao legista um registro que é do perito de local, no próprio local.")
