// ==========================================
// BANCO DE DADOS DA AGENDA DO CURSO (PAUTA)
// ==========================================

const agendaDados = {
    cargos: [
        { id: "pcf", nome: "Perito Criminal Federal" }
    ],
    meses: [
        { id: "05-2026", nome: "Maio de 2026" }
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
            ]
        }
    }
};
