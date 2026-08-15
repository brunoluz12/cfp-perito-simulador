# -*- coding: utf-8 -*-
"""Bizuraço Prova — parte 4: fecha as lacunas apontadas pela auditoria de cobertura."""

Q = []


def q(sec, enun, alts, cor, just, nivel="dificil", prof=False):
    Q.append({
        "secao": sec, "enunciado": enun, "alternativas": alts,
        "resposta_correta": cor, "justificativa": just,
        "nivel": nivel, "prof": prof,
    })


# --- lacuna: conceito legal de vestígio (art. 158-A, §3º) ---
q(1, "O art. 158-A, §3º, do CPP, incluído pela Lei 13.964/2019, define vestígio como:",
  {"A": "todo objeto ou material bruto, visível ou latente, constatado ou recolhido, que se relaciona à infração penal.",
   "B": "todo objeto materialmente apreendido pela autoridade policial e submetido a exame pericial no curso do inquérito.",
   "C": "todo elemento visível deixado no local do crime, excluídos os materiais latentes, que dependem de revelação técnica.",
   "D": "todo indício que, uma vez periciado e interpretado, permita ao perito concluir sobre a autoria e a materialidade."},
  "A",
  "É a redação legal, e o ponto sensível é a expressão VISÍVEL OU LATENTE, além de abranger o constatado e o recolhido. B condiciona o conceito à apreensão, quando o vestígio pode ser apenas constatado. C exclui o latente, exatamente o oposto do texto. D confunde vestígio com indício já valorado, quando o vestígio é o material bruto, anterior à interpretação.")

# --- lacuna: classificação quanto à natureza do fato ---
q(1, "São exemplos de classificação dos locais quanto à natureza do fato:",
  {"A": "furto, roubo, dano, acidente de trânsito, morte violenta, explosão, incêndio, laboratório clandestino e garimpo ilegal.",
   "B": "locais idôneos, inidôneos, imediatos e mediatos, conforme o estado de preservação e a extensão geográfica examinada.",
   "C": "locais internos, externos, urbanos e rurais, conforme a natureza do ambiente em que o exame pericial será realizado.",
   "D": "locais de execução, de resultado, de planejamento e de ocultação, conforme a fase do iter criminis nele desenvolvida."},
  "A",
  "A classificação por natureza do fato lista os tipos de ocorrência, incluindo ainda plantio de drogas, desmatamento, extração ilegal de madeira, cativeiro, tráfico de animais silvestres e achado de ossada. B mistura as classificações por preservação e por extensão. C usa um critério de ambiente. D descreve os locais de interesse da polícia, que é outra classificação.",
  nivel="medio")

# --- lacuna: o que levar ao local (EPI e materiais) ---
q(2, "Sobre o material a ser levado ao local de crime, assinale a alternativa correta.",
  {"A": "Os EPIs resumem-se a luvas e máscara, sendo os demais itens dispensáveis em locais abertos e ventilados.",
   "B": "Entre os EPIs estão luvas, máscara, touca, óculos de segurança, protetores para calçado e jaleco descartável.",
   "C": "O tripé e o detector de metais são itens de uso exclusivo de equipes especializadas, não integrando o material padrão.",
   "D": "O giz e os marcadores de vestígio foram substituídos pelo registro digital, não constando mais da relação de materiais."},
  "B",
  "É a relação de EPI. A reduz indevidamente o rol. C exclui tripé e detector de metais, ambos listados no material de apoio, registro e documentação — e o tripé é justamente o item essencial da fotografia noturna. D afirma uma substituição que não ocorreu: giz branco e colorido e marcadores de vestígio continuam na relação.",
  nivel="medio")

# --- lacuna: divisão da equipe (4 funções no local) ---
q(2, "Na divisão de tarefas da equipe de processamento do local, cabe ao perito encarregado de catalogar os vestígios:",
  {"A": "tomar as medidas de posicionamento e plotar cada vestígio no croqui do local examinado.",
   "B": "fazer a descrição correta do que for encontrado e conferir com o fotógrafo se o vestígio já foi registrado.",
   "C": "estabelecer a cadeia de comando com as demais instituições presentes e decidir sobre a liberação do local.",
   "D": "planejar o levantamento fotográfico e preencher o controle das fotografias produzidas durante os exames."},
  "B",
  "O catalogador descreve o encontrado e confere com o fotógrafo, sendo recomendado não economizar na escrita. A é a função do responsável pelo croqui. C é do perito-chefe. D é do fotógrafo.")

# --- lacuna: preservação por temperatura, incluindo tubo com EDTA ---
q(6, "Sobre as temperaturas de preservação dos vestígios biológicos, é correto afirmar que:",
  {"A": "sangue colhido em tubo com EDTA é refrigerado a 4 °C; tecidos moles e fluidos líquidos são congelados a −20 °C.",
   "B": "sangue colhido em tubo com EDTA é congelado a −20 °C; tecidos moles são mantidos sob refrigeração a 4 °C.",
   "C": "todo material biológico deve ser congelado a −20 °C, inclusive o já seco e acondicionado em envelope de papel.",
   "D": "todo material biológico deve ser refrigerado a 4 °C, admitido o congelamento apenas para ossos e peças dentárias."},
  "A",
  "São as duas temperaturas: 4 °C para o sangue em EDTA e −20 °C para tecidos moles, fluidos líquidos, cabelos e pelos, evitando degelo. B inverte as duas. C estende o congelamento ao vestígio seco, que deve ficar em temperatura ambiente, ao abrigo da luz. D suprime o congelamento dos tecidos moles e o desloca para ossos e dentes, que na verdade seguem o regime do material seco.")

# --- lacuna: transporte do projétil no cano da arma ---
q(7, "Sobre o transporte de projéteis e elementos de munição relacionados a uma arma apreendida:",
  {"A": "o projétil pode ser transportado no interior do cano da arma, o que preserva o vínculo entre os dois vestígios.",
   "B": "o projétil não pode ser transportado no interior do cano da arma, devendo seguir em embalagem própria e individual.",
   "C": "o projétil deve ser transportado no interior do cano apenas quando houver uma única arma apreendida no local.",
   "D": "o projétil deve ser transportado junto às cápsulas deflagradas, em embalagem única identificada pelo número do lacre."},
  "B",
  "O professor levantou justamente essa hipótese para afastá-la: na prova, não. O projétil vai individualizado, envolto em algodão e em envelope de papel. A e C admitem o transporte no cano, que pode produzir marcas e comprometer o confronto balístico. D reúne projétil e cápsulas na mesma embalagem, com risco de os metais se marcarem mutuamente.",
  prof=True)

# --- lacuna: sinais de violência, de luta e reação de defesa ---
q(10, "Durante o exame do cadáver, a distinção entre os achados é a seguinte:",
  {"A": "sinal de violência é qualquer lesão sofrida pela vítima; sinal de luta indica contato entre vítima e agressor; reação de defesa decorre da tentativa de evitar os golpes.",
   "B": "sinal de violência é apenas a lesão grave; sinal de luta é o desalinhamento do mobiliário; reação de defesa é a fuga registrada por vestígios de pegadas.",
   "C": "sinal de violência e sinal de luta são sinônimos; a reação de defesa é presumida sempre que houver lesões nos membros superiores da vítima.",
   "D": "sinal de violência é a lesão produzida por instrumento; sinal de luta é a produzida pelo próprio corpo do agressor; reação de defesa é a produzida por terceiros."},
  "A",
  "São as três noções distintas, e o material é expresso ao dizer que se entende por sinal de violência TODA e QUALQUER lesão, mesmo as mais simples. B restringe o sinal de violência às lesões graves e desloca os demais conceitos. C funde violência e luta e transforma a reação de defesa em presunção. D cria uma distinção por instrumento que não corresponde aos conceitos.")

# --- lacuna: dano (art. 163) e latrocínio ---
q(12, "Sobre o crime de dano e as formas qualificadas dos crimes patrimoniais:",
  {"A": "o dano do art. 163 do CP é punido com detenção de um a seis meses ou multa, e o roubo com resultado morte, com reclusão de 24 a 30 anos.",
   "B": "o dano do art. 163 do CP é punido com reclusão de um a quatro anos, e o roubo com resultado morte, com reclusão de 20 a 30 anos.",
   "C": "o dano do art. 165 do CP é punido com detenção de seis meses a três anos, e o roubo com resultado morte, com reclusão de 15 a 30 anos.",
   "D": "o dano do art. 163 do CP é punido com detenção de um a seis meses, e o roubo com lesão corporal grave, com reclusão de 24 a 30 anos."},
  "A",
  "São a pena simples do dano e a do latrocínio. B converte a detenção do dano em reclusão e reduz o mínimo do latrocínio. C erra o artigo do dano e informa a pena da forma qualificada como se fosse a simples. D acerta o dano mas atribui ao resultado lesão corporal grave a pena do resultado morte — a lesão grave é de 7 a 18 anos.")

# --- lacuna: ferramentas nomeadas no arrombamento ---
q(12, "Entre os vestígios materiais tipicamente arrecadados em locais de furto qualificado por rompimento de obstáculo, incluem-se:",
  {"A": "as ferramentas empregadas na violação e suas respectivas marcas, como pé-de-cabra, chave de fenda, alicate e maçarico.",
   "B": "apenas as marcas deixadas nas superfícies violadas, uma vez que as ferramentas costumam ser levadas pelos autores.",
   "C": "as ferramentas empregadas, cuja análise permite datar com precisão o momento em que o obstáculo foi rompido.",
   "D": "os equipamentos de segurança violados, sendo irrelevante a arrecadação de ferramentas abandonadas pelos agentes."},
  "A",
  "Ferramentas e marcas integram o rol do arrombamento, com esses exemplos. B afirma que as ferramentas sempre são levadas, quando objetos abandonados constam expressamente da lista de vestígios. C atribui às ferramentas uma capacidade de datação precisa que elas não têm. D descarta a arrecadação de ferramentas, que é justamente o que pode individualizar o instrumento.")

# --- lacuna: citação de Locard sobre o depoimento escrito ---
q(13, "A epígrafe de Edmond Locard citada no encerramento do tema da reprodução simulada — o depoimento escrito é um cadáver mumificado — serve para ilustrar que:",
  {"A": "o depoimento escrito perde a riqueza do relato original, o que justifica revivê-lo no local, com os atores da infração.",
   "B": "o depoimento escrito não tem valor probatório, devendo ser substituído pela reprodução simulada sempre que possível.",
   "C": "o depoimento escrito deve ser transcrito integralmente no laudo pericial, para preservar seu conteúdo original.",
   "D": "o depoimento escrito prevalece sobre a versão apresentada no dia da reprodução, por ter sido colhido com formalidade."},
  "A",
  "A citação sustenta a razão de ser do exame: reviver a narrativa no local, quadro a quadro. B salta para a negação do valor probatório do depoimento, o que a frase não afirma. C converte a citação em regra de redação do laudo. D inverte o sentido: se o depoente muda a versão, testa-se também a nova, sem prevalência automática da escrita.")

# --- lacuna: divergência 6 x 7 etapas, com o número em algarismo ---
q(15, "Assinale a alternativa INCORRETA sobre pontos em que a orientação da revisão diverge da apostila.",
  {"A": "A apostila agrupa o processamento em 6 blocos, enquanto a revisão trabalha com 7 etapas numeradas.",
   "B": "Na revisão, a documentação aparece como etapa 4, situada entre a busca de vestígios e a coleta.",
   "C": "A apostila determina que arma e munição sigam separadas, e a revisão orienta acondicioná-las juntas.",
   "D": "A tabela de tempo de exposição da apostila corre em sentido invertido em relação à utilizada em aula."},
  "C",
  "C é a incorreta e, por isso, a resposta: a divergência é exatamente a oposta — a apostila manda acondicionar arma e cartuchos na mesma embalagem e o professor orientou SEPARAR. A, B e D reproduzem corretamente as demais divergências apontadas.")
