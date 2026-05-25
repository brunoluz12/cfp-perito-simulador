// ==========================================
// BANCO DE DADOS DA AGENDA DO CURSO (PAUTA)
// ==========================================

const agendaDados = {
    cargos: [
        { id: "pcf", nome: "Perito Criminal Federal" }
    ],
    meses: [
        { id: "05-2026", nome: "Maio de 2026" },
        { id: "06-2026", nome: "Junho de 2026" }
    ],
    pautas: {
        "pcf": {
            "05-2026": [
                {
                    dia: "18",
                    diaSemana: "Segunda-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "AA(2)" },
                        { horario: "10:00 a 11:40", aula: "AMAG(2)" },
                        { horario: "13:50 a 15:30", aula: "IEC(2)" },
                        { horario: "15:50 a 17:30", aula: "CRI - mDG(2)" }
                    ]
                },
                {
                    dia: "19",
                    diaSemana: "Terça-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "CRI - mDG(4)" },
                        { horario: "10:00 a 11:40", aula: "BBDF(2)" },
                        { horario: "13:50 a 15:30", aula: "AT - PIST 1(2)" },
                        { horario: "15:50 a 17:30", aula: "IPO-mBTIP(2)" }
                    ]
                },
                {
                    dia: "20",
                    diaSemana: "Quarta-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "TEAP - BAP(2)" },
                        { horario: "10:00 a 11:40", aula: "CRI - mDG(6)" },
                        { horario: "13:50 a 15:30", aula: "BBDF(4)" },
                        { horario: "15:50 a 17:30", aula: "CRI - mDG(8)" }
                    ]
                },
                {
                    dia: "21",
                    diaSemana: "Quinta-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "AT - PIST 1(4)" },
                        { horario: "10:00 a 11:40", aula: "IPO-mBTIP(4)" },
                        { horario: "13:50 a 15:30", aula: "IPO-mIPO(2)" },
                        { horario: "15:50 a 17:30", aula: "CRI - mDG(10)" }
                    ]
                },
                {
                    dia: "22",
                    diaSemana: "Sexta-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "PVAT(2)" },
                        { horario: "10:00 a 11:40", aula: "AT - PIST 1(6)" },
                        { horario: "13:50 a 15:30", aula: "CRI - mDG(12)" },
                        { horario: "15:50 a 17:30", aula: "IPO-mIPO(4)" }
                    ]
                },
                {
                    dia: "23",
                    diaSemana: "Sábado",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "TO - ABO(2)" },
                        { horario: "10:00 a 11:40", aula: "CRI - mCC(2)" },
                        { horario: "13:50 a 15:30", aula: "IPO-mIPO(6)" },
                        { horario: "15:50 a 17:30", aula: "CRI - mCC(4)" }
                    ]
                },
                {
                    dia: "24",
                    diaSemana: "Domingo",
                    blocos: [
                        { horario: "Integral", aula: "Domingo Livre", destaque: true }
                    ]
                },
                {
                    dia: "25",
                    diaSemana: "Segunda-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "AT - PIST 1(8)" },
                        { horario: "10:00 a 11:40", aula: "BBDF(6)" },
                        { horario: "13:50 a 15:30", aula: "PVAT(4)" },
                        { horario: "15:50 a 17:30", aula: "IPO-mIPO(8)" }
                    ]
                },
                {
                    dia: "26",
                    diaSemana: "Terça-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "TO - ABO(4)" },
                        { horario: "10:00 a 11:40", aula: "IPO-mMIPO(2)" },
                        { horario: "13:50 a 15:30", aula: "CRI - mSISCRIM(2)" },
                        { horario: "15:50 a 17:30", aula: "CRI - mSISCRIM(4)" }
                    ]
                },
                {
                    dia: "27",
                    diaSemana: "Quarta-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "CRI - mSISCRIM(6)" },
                        { horario: "10:00 a 11:40", aula: "TO - ONAV(2)" },
                        { horario: "13:50 a 15:30", aula: "IPO-mMIPO(4)" },
                        { horario: "15:50 a 17:30", aula: "AT - PIST 1(10)" }
                    ]
                },
                {
                    dia: "28",
                    diaSemana: "Quinta-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "IPO-mEGI(2)" },
                        { horario: "10:00 a 11:40", aula: "IPO-mEGI(4)" },
                        { horario: "13:50 a 15:30", aula: "AT - PIST 1(12)" },
                        { horario: "15:50 a 17:30", aula: "SOP(2)" }
                    ]
                },
                {
                    dia: "29",
                    diaSemana: "Sexta-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "IPO-mEGI(6)" },
                        { horario: "10:00 a 11:40", aula: "TO - UDF(2)" },
                        { horario: "13:50 a 15:30", aula: "PVAT(6)" },
                        { horario: "15:50 a 17:30", aula: "BBDF(8)" }
                    ]
                },
                {
                    dia: "30",
                    diaSemana: "Sábado",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "DPP 1(1)" },
                        { horario: "10:00 a 11:40", aula: "AT - PIST 1(14)" },
                        { horario: "13:50 a 15:30", aula: "TO - ONAV(4)" },
                        { horario: "15:50 a 17:30", aula: "IPO-mEGI(8)" },
                        { horario: "17:50 a 19:30 (Extra)", aula: "TFP 01(1)" }
                    ]
                },
                {
                    dia: "31",
                    diaSemana: "Domingo",
                    blocos: [
                        { horario: "Integral", aula: "Domingo Livre", destaque: true }
                    ]
                }
            ],
            "06-2026": [
                // === SEMANA 3 (01/06 a 07/06) ===
                {
                    dia: "01",
                    diaSemana: "Segunda-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "DOC M1.01 (1P)" },
                        { horario: "10:00 a 11:40", aula: "PRO M1.01 (1P)" },
                        { horario: "13:50 a 15:30", aula: "CRI M3.04 (2P)" },
                        { horario: "15:50 a 17:30", aula: "CRI M3.04 (2P)" },
                        { horario: "19:00 a 20:40 (Extra)", aula: "AT M1.07 (8P, 2M)" }
                    ]
                },
                {
                    dia: "02",
                    diaSemana: "Terça-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "PCEB M1.01 (1P)" },
                        { horario: "10:00 a 11:40", aula: "PCEB M1.01 (1P)" },
                        { horario: "13:50 a 15:30", aula: "DOC M1.02 (1P)" },
                        { horario: "15:50 a 17:30", aula: "AT M1.08 (8P, 2M)" }
                    ]
                },
                {
                    dia: "03",
                    diaSemana: "Quarta-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "PRO M1.02 (1P)" },
                        { horario: "10:00 a 11:40", aula: "EVENTO - Palestra DG" },
                        { horario: "13:50 a 15:30", aula: "PCEB M1.02 (1P)" },
                        { horario: "15:50 a 17:30", aula: "PCEB M1.03 (1P)" }
                    ]
                },
                {
                    dia: "04",
                    diaSemana: "Quinta-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "DPP/TFP M1.02 (2P, 2M)" },
                        { horario: "10:00 a 11:40", aula: "DOC M1.03 (1P)" },
                        { horario: "13:50 a 15:30", aula: "CRI M3.04 (2P)" },
                        { horario: "15:50 a 17:30", aula: "PRO M1.03 (1P)" }
                    ]
                },
                {
                    dia: "05",
                    diaSemana: "Sexta-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "AT M1.09 (8P, 2M)" },
                        { horario: "10:00 a 11:40", aula: "PRO M1.04 (1P)" },
                        { horario: "13:50 a 15:30", aula: "LOC M1.01 (1P)" },
                        { horario: "15:50 a 17:30", aula: "CRI M4.01 (1P)" }
                    ]
                },
                {
                    dia: "06",
                    diaSemana: "Sábado",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "CRI M4.02 (1P)" },
                        { horario: "10:00 a 11:40", aula: "LOC M1.02 (1P)" },
                        { horario: "13:50 a 15:30", aula: "AT M1.10 (8P, 2M)" }
                    ]
                },
                {
                    dia: "07",
                    diaSemana: "Domingo",
                    blocos: [
                        { horario: "Integral", aula: "Domingo Livre", destaque: true }
                    ]
                },
                // === SEMANA 4 (08/06 a 14/06) ===
                {
                    dia: "08",
                    diaSemana: "Segunda-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "LOC M1.03 (6P)" },
                        { horario: "10:00 a 11:40", aula: "PRO M1.05 (1P)" },
                        { horario: "13:50 a 15:30", aula: "AT M1.11 (8P, 2M)" },
                        { horario: "15:50 a 17:30", aula: "DOC M1.04 (1P)" }
                    ]
                },
                {
                    dia: "09",
                    diaSemana: "Terça-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "PCEB M1.03 (2P, 1M)" },
                        { horario: "10:00 a 11:40", aula: "PCEB M1.03 (2P, 1M)" },
                        { horario: "13:50 a 15:30", aula: "CRI M4.03 (1P)" },
                        { horario: "15:50 a 17:30", aula: "ISDC M4.01 (2P)" }
                    ]
                },
                {
                    dia: "10",
                    diaSemana: "Quarta-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "DOC M1.05 (1P)" },
                        { horario: "10:00 a 11:40", aula: "CRI M4.04 (1P)" },
                        { horario: "13:50 a 15:30", aula: "PCEB M3.01 (1P)" },
                        { horario: "15:50 a 17:30", aula: "LOC M1.04 (4P)" }
                    ]
                },
                {
                    dia: "11",
                    diaSemana: "Quinta-feira",
                    blocos: [
                        { horario: "10:00 a 11:40", aula: "DPP/TFP M1.03 (2P, 2M)" },
                        { horario: "13:50 a 15:30", aula: "PVAT M1.04 (5P)" },
                        { horario: "15:50 a 17:30", aula: "PVAT M1.04 (5P)" },
                        { horario: "19:00 a 20:40 (Extra)", aula: "AT M1.12 (8P, 2M)" }
                    ]
                },
                {
                    dia: "12",
                    diaSemana: "Sexta-feira",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "LOC M1.05 (2P)" },
                        { horario: "10:00 a 11:40", aula: "PVAT M1.05 (1P)" },
                        { horario: "13:50 a 15:30", aula: "AT M1.04 (4P, 1M)" },
                        { horario: "15:50 a 17:30", aula: "PCEB M2.01 (2P)" }
                    ]
                },
                {
                    dia: "13",
                    diaSemana: "Sábado",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "PCEB M3.02 (1P)" },
                        { horario: "10:00 a 11:40", aula: "AT M1.13 (8P, 2M)" }
                    ]
                },
                {
                    dia: "14",
                    diaSemana: "Domingo",
                    blocos: [
                        { horario: "08:00 a 09:40", aula: "AT M2.01 (10P, 2M)" }
                    ]
                }
            ]
        }
    }
};
