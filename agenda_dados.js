// ==========================================
// BANCO DE DADOS DA AGENDA DO CURSO (PAUTA)
// ==========================================

const agendaDados = {
    "cargos": [
        {
            "id": "pcf",
            "nome": "Perito Criminal Federal"
        }
    ],
    "meses": [
        {
            "id": "05-2026",
            "nome": "Maio de 2026"
        },
        {
            "id": "06-2026",
            "nome": "Junho de 2026"
        },
        {
            "id": "07-2026",
            "nome": "Julho de 2026"
        },
        {
            "id": "08-2026",
            "nome": "Agosto de 2026"
        }
    ],
    "pautas": {
        "pcf": {
            "05-2026": [
                {
                    "dia": "18",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "EVENTO - Abertura"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "EVENTO - Aula Magna"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "EVENTO - Instrução Execução Curso"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "CRI M1.01 (1P)"
                        }
                    ]
                },
                {
                    "dia": "19",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "CRI M1.02 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "BBDF M1.01 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "AT M1.01 (4P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "IPO I M01.01 (1P)"
                        }
                    ]
                },
                {
                    "dia": "20",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "TEAP M1.01 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "CRI M1.03 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "BBDF M1.02 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "CRI M1.04 (1P)"
                        }
                    ]
                },
                {
                    "dia": "21",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT M1.02 (8P, 2M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "IPO I M01.02 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "IPO I M02.01 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "CRI M1.05 (1P)"
                        }
                    ]
                },
                {
                    "dia": "22",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "PVAT M1.01 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "AT M1.03 (12P, 2M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "CRI M1.06 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "IPO I M02.02 (1P)"
                        }
                    ]
                },
                {
                    "dia": "23",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "TO M1.01 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "CRI M2.01 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "IPO I M02.03 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "CRI M2.02 (1P)"
                        }
                    ]
                },
                {
                    "dia": "25",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT M1.04 (10P, 2M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "BBDF M1.03 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "PVAT M1.02 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "IPO I M02.04 (1P)"
                        }
                    ]
                },
                {
                    "dia": "26",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "TO M1.02 (10P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "IPO I M04.01 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "CRI M3.01 (2P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "CRI M3.02 (2P)"
                        }
                    ]
                },
                {
                    "dia": "27",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "CRI M3.03 (2P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "TO M3.01 (1P, 3M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "IPO I M04.02 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "AT M1.05 (8P, 2M)"
                        }
                    ]
                },
                {
                    "dia": "28",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "IPO I M05.01 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "EVENTO - Palestra DG"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "AT M1.06 (8P, 2M)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "SOP M1.01 (10P)"
                        }
                    ]
                },
                {
                    "dia": "29",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "IPO I M05.02 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "TO M2.01 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "PVAT M1.03 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "BBDF M1.04 (1P)"
                        }
                    ]
                },
                {
                    "dia": "30",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "DPP/TFP M1.01 (2P, 2M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "IPO I M05.03 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "IPO I M05.04 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "AT M1.07 (8P, 2M)"
                        }
                    ]
                }
            ],
            "06-2026": [
                {
                    "dia": "01",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "TO M3.02 (3P, 3M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "PRO M1.01 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "CRI M3.04 (2P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "CRI M3.04 (2P)"
                        }
                    ]
                },
                {
                    "dia": "02",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "PCEB M1.01 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "PCEB M1.01 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "DOC M1.01 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "AT M1.08 (8P, 2M)"
                        }
                    ]
                },
                {
                    "dia": "03",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "PRO M1.02 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "TEAP M2.02 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "PCEB M1.02 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "PCEB M1.02 (1P)"
                        }
                    ]
                },
                {
                    "dia": "04",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "DPP/TFP M1.02 (2P, 2M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "SOP M1.02 (10P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "CRI M3.04 (2P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "PRO M1.03 (1P)"
                        }
                    ]
                },
                {
                    "dia": "05",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT M1.09 (8P, 2M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "PRO M1.04 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "LOC M1.01 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "CRI M4.01 (1P)"
                        }
                    ]
                },
                {
                    "dia": "06",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "CRI M4.02 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "LOC M1.02 (1P)"
                        }
                    ]
                },
                {
                    "dia": "08",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "LOC M1.03 (6P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "TO M1.03 (10P, 20M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "AT M1.10 (8P, 2M)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "DOC M1.02 (1P)"
                        }
                    ]
                },
                {
                    "dia": "09",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "PCEB M1.03 (2P, 1M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "PCEB M1.03 (2P, 1M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "CRI M4.03 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "ISDC M4.01 (2P)"
                        }
                    ]
                },
                {
                    "dia": "10",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "SOP M1.03 (10P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "CRI M4.04 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "PCEB M3.01 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "LOC M1.04 (4P)"
                        }
                    ]
                },
                {
                    "dia": "11",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "DOC M1.03 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DPP/TFP M1.03 (2P, 2M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "PVAT M1.04 (5P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "PVAT M1.04 (5P)"
                        }
                    ]
                },
                {
                    "dia": "12",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "LOC M1.05 (2P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "PVAT M1.05 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "AT M4.01 (4P, 1M)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "PCEB M2.01 (2P)"
                        }
                    ]
                },
                {
                    "dia": "13",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "PCEB M3.02 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DOC M1.04 (1P)"
                        }
                    ]
                },
                {
                    "dia": "15",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "PCEB M3.03 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "LOC M1.06 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "TO M1.04 (10P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "BBDF M1.05 (1P)"
                        }
                    ]
                },
                {
                    "dia": "16",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT M1.11 (8P, 2M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "PRO M1.05 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "IPO I M06.01 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "PCEB M2.02 (2P)"
                        }
                    ]
                },
                {
                    "dia": "17",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "DPP/TFP M1.04 (2P, 2M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "AT M1.12 (8P, 2M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "BBDF M1.06 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "PVAT M1.06 (1P)"
                        }
                    ]
                },
                {
                    "dia": "18",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "IPO I M07.01 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "AT M1.13 (8P, 2M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "LOC M1.07 (6P, 4M)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "TO M1.05 (10P, 10M)"
                        }
                    ]
                },
                {
                    "dia": "19",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "PRO M1.06 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "SOP M1.04 (10P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "BBDF M1.07 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "AT M4.02 (8P, 2M)"
                        }
                    ]
                },
                {
                    "dia": "20",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "TO M3.03 (3P, 3M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DOC M1.05 (1P)"
                        }
                    ]
                },
                {
                    "dia": "22",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "PCEB M2.03 (2P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "PVAT M1.07 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "IPO I M08.01 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "AT M2.01 (10P, 2M)"
                        }
                    ]
                },
                {
                    "dia": "23",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "LOC M1.08 (6P, 4M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "LOC M1.08 (6P, 4M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "DO M1.01 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "IPO I M09.01 (1P)"
                        }
                    ]
                },
                {
                    "dia": "24",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "IPO I M10.01 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "AT M2.02 (8P, 2M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "BBDF M1.08 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "DOC M1.06 (4P, 4M)"
                        }
                    ]
                },
                {
                    "dia": "25",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "PCEB M3.04 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "PRO M1.07 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "IPO I M10.02 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "PVAT M1.08 (1P)"
                        }
                    ]
                },
                {
                    "dia": "26",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "SOP M1.05 (10P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "IPO I M11.01 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "AT M4.03 (8P, 2M)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "DPP/TFP M1.05 (2P, 2M)"
                        }
                    ]
                },
                {
                    "dia": "27",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "IPO I M12.01 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "BBDF M1.09 (1P, 1M)"
                        }
                    ]
                },
                {
                    "dia": "29",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "IPO I Prova (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "AT M2.03 (8P, 2M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "DOC M1.07 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "TO M1.06 (10P, 10M)"
                        }
                    ]
                },
                {
                    "dia": "30",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "PCEB M2.04 (2P, 2M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "PCEB M2.04 (2P, 2M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "PRO M2.01 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "TO M3.04 (3P, 3M)"
                        }
                    ]
                }
            ],
            "07-2026": [
                {
                    "dia": "01",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "PPC - MERC (6)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "APC - CSIM (2)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "DOC (16)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "DPP 1 (6)"
                        },
                        {
                            "horario": "Extra",
                            "aula": "TFP 01 (6)"
                        }
                    ]
                },
                {
                    "dia": "02",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "PCEB - BF (10)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "PCEB - BF (12)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "PVAT (22)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "AT - PIST 2 (8)"
                        }
                    ]
                },
                {
                    "dia": "03",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT - FUZ 1 (8)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DOC (18)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "IPO - E-POL (2)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "SOP (12)"
                        }
                    ]
                },
                {
                    "dia": "04",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT - PIST 2 (10)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DOC (20)"
                        }
                    ]
                },
                {
                    "dia": "06",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "VF (4)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "IPO - E-POL (4)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "LOCINTER (18)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "LOCINTER (20)"
                        }
                    ]
                },
                {
                    "dia": "07",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "DOC (22)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "TO - ABO (14)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "AT - FUZ 1 (10)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "IPO - E-POL (6)"
                        },
                        {
                            "horario": "17h50 a 19h30",
                            "aula": "APC - RPS (2)"
                        },
                        {
                            "horario": "Extra",
                            "aula": "APC - RPS (4)"
                        }
                    ]
                },
                {
                    "dia": "08",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "PPC - MERC (8)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "PPC - MERC (10)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "LOCINTER (22)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "DPP 1 (7)"
                        },
                        {
                            "horario": "Extra",
                            "aula": "TFP 01 (7)"
                        }
                    ]
                },
                {
                    "dia": "09",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "IPO - E-POL (8)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DOC (24)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "TEAP - INTP (2)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "AT - PIST 2 (12)"
                        }
                    ]
                },
                {
                    "dia": "10",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "SOP (14)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "TO - ABO (16)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "AT - PIST 2 (14)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "TEAP - INTP (4)"
                        }
                    ]
                },
                {
                    "dia": "11",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "DO (4)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DO (6)"
                        }
                    ]
                },
                {
                    "dia": "13",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "APC - CSIM (4)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "APC - CSIM (6)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "TEAP - AAMI (2)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "IF (2)"
                        }
                    ]
                },
                {
                    "dia": "14",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "DOC (26)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DOC (28)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "TO - UDF (4)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "TO - UDF (6)"
                        },
                        {
                            "horario": "17h50 a 19h30",
                            "aula": "MESDEB (4)"
                        }
                    ]
                },
                {
                    "dia": "15",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "DOC (30)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "LOCINTER (24)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "IF (4)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "AT - PIST 2 (16)"
                        }
                    ]
                },
                {
                    "dia": "16",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "ISDC-CDS (2)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "SOP (16)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "TO - UDF (8)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "IF (6)"
                        }
                    ]
                },
                {
                    "dia": "17",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "DPP 1 (8)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "AT - FUZ 1 (12)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "ISDC-CDS (4)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "TO - ABO (18)"
                        },
                        {
                            "horario": "Extra",
                            "aula": "TFP 01 (8)"
                        }
                    ]
                },
                {
                    "dia": "18",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "LOCINTER (26)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "AT - PIST 2 (18)"
                        }
                    ]
                },
                {
                    "dia": "20",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT - PIST 2 (20)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DPP 1 (9)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "DO (8)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "DO (10)"
                        },
                        {
                            "horario": "Extra",
                            "aula": "TFP 01 (9)"
                        }
                    ]
                },
                {
                    "dia": "21",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "TEAP-NIH (2)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "IF (8)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "ISDC-CDS (6)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "IF (10)"
                        }
                    ]
                },
                {
                    "dia": "22",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "APC - CSIM (8)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "APC - CSIM (10)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "TEAP-NIH (4)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "AT - PIST 2 (22)"
                        },
                        {
                            "horario": "Extra",
                            "aula": "APC - CSIM (12)"
                        }
                    ]
                },
                {
                    "dia": "23",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT - FUZ 1 (14)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DPP 1 (10)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "TEAP-NIH (6)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "TO - ABO (20)"
                        },
                        {
                            "horario": "Extra",
                            "aula": "TFP 01 (10)"
                        }
                    ]
                },
                {
                    "dia": "24",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "BBDF (18)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "TEAP-NIH (8)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "LOCINTER (28)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "LOCINTER (30)"
                        }
                    ]
                },
                {
                    "dia": "25",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "VE (2)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "TO - ABO (22)"
                        }
                    ]
                },
                {
                    "dia": "27",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "IF (12)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "ISDC-ERE (2)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "LOCINTER (32)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "LOCINTER (34)"
                        }
                    ]
                },
                {
                    "dia": "28",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "TEAP - AAMI (4)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "AT - SUB MP5 (2)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "TEAP - AAMI (6)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "DPP 1 (11)"
                        },
                        {
                            "horario": "Extra",
                            "aula": "TFP 01 (11)"
                        }
                    ]
                },
                {
                    "dia": "29",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "LOCINTER (36)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "LOCINTER (38)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "BBDF (20)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "TEAP - CDS (2)"
                        }
                    ]
                },
                {
                    "dia": "30",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "TO - ABO (24)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "LOCINTER (40)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "AT - PIST 3 (2)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "IF (14)"
                        }
                    ]
                },
                {
                    "dia": "31",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "ISDC-ERE (4)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "AT - FUZ 2 (2)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "LOCINTER (42)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "LOCINTER (44)"
                        }
                    ]
                }
            ],
            "08-2026": [
                {
                    "dia": "01",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT - SUB MP5 (4)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "TO - ABO (26)"
                        }
                    ]
                },
                {
                    "dia": "03",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT - PIST 3 (4)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "LOCINTER (46)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "LOCINTER (48)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "TEAP - CDS (4)"
                        }
                    ]
                },
                {
                    "dia": "04",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "IF (16)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DPP 1 (12)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "AT - SUB MP5 (6)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "IF (18)"
                        },
                        {
                            "horario": "Extra",
                            "aula": "TFP 01 (12)"
                        }
                    ]
                },
                {
                    "dia": "05",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "LOCINTER (50)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "LOCINTER (52)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "AT - PIST 3 (6)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "IF (20)"
                        }
                    ]
                },
                {
                    "dia": "06",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT - SUB MP5 (8)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "IF (22)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "LOCINTER (54)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "LOCINTER (56)"
                        }
                    ]
                },
                {
                    "dia": "07",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT - FUZ 2 (4)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "IF (24)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "LOCINTER (58)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "LOCINTER (60)"
                        }
                    ]
                },
                {
                    "dia": "08",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "LOCINTER (62)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "TEAP - CDS (6)"
                        }
                    ]
                },
                {
                    "dia": "10",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "VE (4)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "TO - ABO (28)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "LOCINTER (64)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "LOCINTER (66)"
                        },
                        {
                            "horario": "17h50 a 19h30",
                            "aula": "LOCINTER (68)"
                        }
                    ]
                },
                {
                    "dia": "11",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "TEAP - GE (4)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "ISDC-IS (2)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "ISDC-IS (4)"
                        }
                    ]
                },
                {
                    "dia": "12",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "VF (6)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "AT - SOBP (2)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "ISDC-IS (6)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "ISDC-IS (8)"
                        }
                    ]
                },
                {
                    "dia": "13",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT - FUZ 2 (6)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DPP 1 (13)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "TEAP - BA (4)"
                        },
                        {
                            "horario": "Extra",
                            "aula": "TFP 01 (13)"
                        }
                    ]
                },
                {
                    "dia": "14",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT - SOBP (4)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "ISDC-PSI (4)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "AT - PIST FI (2)"
                        }
                    ]
                },
                {
                    "dia": "17",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "VE - LOC (Prova)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "JEC M1.01 (10P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "JEC M1.10 (14P, 2M)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "JEC M1.13 (14P, 1M)"
                        }
                    ]
                },
                {
                    "dia": "18",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "JEC M1.16 (1P, 1M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "JEC M1.02 (10P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "JEC M1.03 (10P, 1M)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "JEC M1.04 (10P, 1M)"
                        }
                    ]
                },
                {
                    "dia": "19",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "JEC M1.05 (10P, 1M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "JEC M1.06 (10P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "JEC M1.07 (10P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "JEC M1.08 (10P, 2M)"
                        }
                    ]
                },
                {
                    "dia": "20",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "JEC M1.09 (14P, 1M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "JEC M1.11 (14P, 1M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "JEC M1.12 (14P, 2M)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "JEC M1.14 (14P, 1M)"
                        }
                    ]
                },
                {
                    "dia": "21",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "JEC M1.15 (14P, 2M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "JEC M1.17 (1P, 1M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "JEC M1.18 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "JEC M1.19 (1P)"
                        }
                    ]
                },
                {
                    "dia": "22",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "JEC M1.20 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "JEC M1.21 (2P)"
                        }
                    ]
                },
                {
                    "dia": "25",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT M8.03 (8P, 12M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "TEAP M1.03 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "DPP/TFP M1.14 (8P, 2M)"
                        }
                    ]
                },
                {
                    "dia": "26",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "EVENTO - Escolha de Vagas (1/2)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "EVENTO - Escolha de Vagas (2/2)"
                        }
                    ]
                },
                {
                    "dia": "28",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "EVENTO - Formatura (1/2)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "EVENTO - Formatura (2/2)"
                        }
                    ]
                }
            ]
        }
    }
};
