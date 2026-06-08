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
                            "aula": "TO M3.04 (3P, 3M)"
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
                            "aula": "PVAT M1.08 (1P)"
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
                            "aula": "PRO M2.02 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "APC M2.01 (10P, 8M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "LOC M2.01 (6P, 2M)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "DPP/TFP M1.06 (2P, 2M)"
                        }
                    ]
                },
                {
                    "dia": "02",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "PCEB M3.05 (3P, 3M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "PCEB M3.05 (3P, 3M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "DOC M1.08 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "AT M2.04 (10P, 2M)"
                        }
                    ]
                },
                {
                    "dia": "03",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT M4.04 (8P, 2M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "PVAT M1.09 (2P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "PRO M2.03 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "SOP M1.06 (10P)"
                        }
                    ]
                },
                {
                    "dia": "04",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "AT M2.05 (8P, 2M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DOC M1.09 (1P)"
                        }
                    ]
                },
                {
                    "dia": "06",
                    "diaSemana": "Segunda-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "LOC M2.02 (5P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "LOC M2.02 (5P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "PVAT M1.10 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "PRO M2.04 (1P)"
                        }
                    ]
                },
                {
                    "dia": "07",
                    "diaSemana": "Terça-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "DOC M1.10 (1P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "TO M1.07 (10P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "AT M4.05 (8P, 2M)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "PRO M2.05 (1P, 3M)"
                        }
                    ]
                },
                {
                    "dia": "08",
                    "diaSemana": "Quarta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "LOC M2.03 (6P, 4M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "LOC M2.03 (6P, 4M)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "IPO I M03.01 (2P, 1M)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "BBDF M1.10 (1P, 1M)"
                        }
                    ]
                },
                {
                    "dia": "09",
                    "diaSemana": "Quinta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "DPP/TFP M1.07 (2P, 2M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DOC M1.11 (1P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "IPO I M03.02 (2P, 1M)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "AT M2.06 (8P, 2M)"
                        }
                    ]
                },
                {
                    "dia": "10",
                    "diaSemana": "Sexta-Feira",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "SOP M1.07 (10P)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "TO M1.08 (10P)"
                        },
                        {
                            "horario": "13h50 a 15h30",
                            "aula": "AT M2.07 (8P, 2M)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "IPO I M03.03 (2P, 1M)"
                        },
                        {
                            "horario": "19h00 a 20h40",
                            "aula": "APC M1.01 (14P, 6M)"
                        },
                        {
                            "horario": "20h50 a 22h30",
                            "aula": "APC M1.01 (14P, 6M)"
                        }
                    ]
                },
                {
                    "dia": "11",
                    "diaSemana": "Sábado",
                    "blocos": [
                        {
                            "horario": "08h00 a 09h40",
                            "aula": "IPO I M03.04 (2P, 1M)"
                        },
                        {
                            "horario": "10h00 a 11h40",
                            "aula": "DOC M1.12 (1P)"
                        },
                        {
                            "horario": "15h50 a 17h30",
                            "aula": "AT M4.06 (8P, 2M)"
                        }
                    ]
                }
            ]
        }
    }
};
