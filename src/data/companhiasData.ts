export interface CompanhiaBpmItem {
  cidade: string;
  companhia: string;
}

export interface BatalhaoCompanhias {
  upm: string;
  sede: string;
  companhias: CompanhiaBpmItem[];
  observacao?: string;
}

export interface CpaiCompanhiasGroup {
  cpai: string;
  batalhoes: BatalhaoCompanhias[];
}

export const COMPANHIAS_PDF_URL =
  '/assets/aistudio/INFORMA__O_CIA_DOS_BPMS_-_Google_Planilhas_e3b46233.pdf';

/**
 * Dados completos extraídos do documento oficial:
 * "INFORMAÇÃO CIA DOS BPMS" (CPAI-1 ao CPAI-9)
 */
export const COMPANHIAS_POR_CPAI: CpaiCompanhiasGroup[] = [
  {
    cpai: 'CPAI-1',
    batalhoes: [
      {
        upm: '15º BPM',
        sede: 'BACABAL',
        companhias: [
          { cidade: 'Bacabal', companhia: '15º BPM - Sede' },
          { cidade: 'São Luís Gonzaga do Maranhão', companhia: '1ª CIA/15º BPM' },
          { cidade: "Olho d'Água das Cunhãs", companhia: '2ªCIA/1º Pelotão' },
          { cidade: 'Conceição do Lago-Açu', companhia: 'DPM' },
          { cidade: 'Lago Verde', companhia: 'DPM' }
        ]
      },
      {
        upm: '19º BPM',
        sede: 'PEDREIRAS',
        companhias: [
          { cidade: 'Pedreiras', companhia: '19º BPM - SEDE' },
          { cidade: 'Trizidela Do Vale', companhia: '2º PELOTÃO' },
          { cidade: 'Bernardo Do Mearim', companhia: '6º PELOTÃO' },
          { cidade: 'Igarapé Grande', companhia: '3º PELOTÃO' },
          { cidade: 'Poção De Pedras', companhia: '5º PELOTÃO' },
          { cidade: 'Esperantinópolis', companhia: '4º PELOTÃO' },
          { cidade: 'Lima Campos', companhia: '1º PELOTÃO' }
        ]
      },
      {
        upm: '23º BPM',
        sede: 'SÃO MATEUS',
        companhias: [
          { cidade: 'Alto Alegre Do Maranhão', companhia: '3ºCIA/23ºBPM' },
          { cidade: 'São Mateus Do Maranhão', companhia: 'SEDE DO 23ºBPM' },
          { cidade: 'Matões Do Norte', companhia: '1ºPEL/2ºCIA DO 23ºBPM' },
          { cidade: 'Miranda Do Norte', companhia: '2ºCIA/23ºBPM' },
          { cidade: 'Cantanhede', companhia: '5ºCIA/23ºBPM' },
          { cidade: 'Pirapemas', companhia: '1ºPEL/5ºCIA/23ºBPM' }
        ]
      },
      {
        upm: '39º BPM',
        sede: 'LAGO DA PEDRA',
        companhias: [
          { cidade: 'Lago Da Pedra', companhia: '39º BPM - SEDE' },
          { cidade: 'Lago Do Junco', companhia: 'DPM' },
          { cidade: 'Lago Dos Rodrigues', companhia: '4ºCIA/39ºBPM' },
          { cidade: 'Bom Lugar', companhia: 'DPM' },
          { cidade: 'Lagoa Grande Do Ma', companhia: 'DPM' },
          { cidade: 'Paulo Ramos', companhia: 'DPM' },
          { cidade: 'Marajá Do Sena', companhia: 'DPM' },
          { cidade: 'Vitorino Freire', companhia: '3ºCIA/39ºBPM' },
          { cidade: 'Altamira Do Ma', companhia: 'DPM' },
          { cidade: 'Brejo De Areia', companhia: 'DPM' }
        ]
      }
    ]
  },
  {
    cpai: 'CPAI-2',
    batalhoes: [
      {
        upm: '5º BPM',
        sede: 'BARRA DO CORDA',
        companhias: [
          { cidade: 'Barra Do Corda (GOE e FT)', companhia: '3ªCIA' },
          { cidade: 'Jenipapo Dos Vieiras', companhia: 'DPM' },
          { cidade: 'Itaipava Do Grajaú', companhia: 'DPM' },
          { cidade: 'Fernando Falcão', companhia: 'DPM' },
          { cidade: 'São Roberto', companhia: 'DPM' },
          { cidade: 'São Raimundo Do Doca Bezerra', companhia: 'DPM' }
        ]
      },
      {
        upm: '18º BPM',
        sede: 'PRES. DUTRA',
        companhias: [
          { cidade: 'Presidente Dutra (FT)', companhia: '1ª CIA' },
          { cidade: 'Governador Eugenio Barros', companhia: '6º CIA' },
          { cidade: 'São Jose dos Basílios', companhia: 'DPM' },
          { cidade: 'Governador Luis Rocha', companhia: 'DPM' },
          { cidade: 'Capinzal do Norte', companhia: 'DPM' },
          { cidade: 'Dom Pedro', companhia: '3º CIA' },
          { cidade: 'Gonçalves Dias', companhia: 'DPM' },
          { cidade: 'Governador Archer', companhia: 'DPM' },
          { cidade: 'Graça Aranha', companhia: 'DPM' },
          { cidade: 'Joselândia', companhia: 'DPM' },
          { cidade: 'Santa Filomena do Maranhão', companhia: 'DPM' },
          { cidade: 'Santo Antônio dos Lopes', companhia: '2ª CIA' },
          { cidade: 'São Domingos do Maranhão', companhia: '4ª CIA' },
          { cidade: 'Senador Alexandre Costa', companhia: 'DPM' },
          { cidade: 'Tuntum', companhia: '5ª CIA' }
        ]
      },
      {
        upm: '33º BPM',
        sede: 'COLINAS',
        companhias: [
          { cidade: 'Buriti Bravo', companhia: 'DPM' },
          { cidade: 'Colinas', companhia: '1º CIA' },
          { cidade: 'Fortuna', companhia: 'DPM' },
          { cidade: 'Jatobá', companhia: 'DPM' },
          { cidade: 'Mirador', companhia: 'DPM' },
          { cidade: 'Sucupira do Norte', companhia: 'DPM' }
        ]
      },
      {
        upm: '37º BPM',
        sede: 'GRAJAÚ',
        companhias: [
          { cidade: 'Grajaú (FT)', companhia: 'DPM' },
          { cidade: 'Arame', companhia: '1º PEL' },
          { cidade: 'Formosa Da Serra Negra', companhia: '2º PEL' }
        ]
      }
    ]
  },
  {
    cpai: 'CPAI-3',
    batalhoes: [
      {
        upm: '3º BPM',
        sede: 'IMPERATRIZ',
        companhias: [
          { cidade: 'Imperatriz', companhia: 'Sede / 3º BPM' }
        ]
      },
      {
        upm: '12º BPM',
        sede: 'ESTREITO',
        companhias: [
          { cidade: 'Porto Franco', companhia: '3ª CIA' },
          { cidade: 'Estreito', companhia: '1ª CIA' },
          { cidade: 'Carolina', companhia: '2ª CIA' },
          { cidade: 'São João Do Paraíso', companhia: 'DPM' },
          { cidade: 'Campestre', companhia: 'DPM' },
          { cidade: 'Ribamar Fiquene', companhia: 'DPM' },
          { cidade: 'Lajeado Novo', companhia: 'DPM' }
        ]
      },
      {
        upm: '14º BPM',
        sede: 'IMPERATRIZ',
        companhias: [
          { cidade: 'Imperatriz', companhia: 'CPRP' },
          { cidade: 'João Lisboa', companhia: 'DPM' },
          { cidade: 'Senador La Roque', companhia: 'DPM' },
          { cidade: 'Davinópolis', companhia: 'DPM' }
        ]
      },
      {
        upm: '26º BPM',
        sede: 'AÇAILÂNDIA',
        companhias: [
          { cidade: 'AÇAILÂNDIA', companhia: '3ª CIA' },
          { cidade: 'AÇAILÂNDIA', companhia: 'DPM SUDELÂNDIA' },
          { cidade: 'ITINGA', companhia: '2ª CIA' }
        ]
      },
      {
        upm: '30º BPM',
        sede: 'BURITICUPU',
        companhias: [
          { cidade: 'BURITICUPU', companhia: 'SEDE' },
          { cidade: 'BOM JESUS DAS SELVAS', companhia: '2ª CIA' }
        ]
      },
      {
        upm: '32º BPM',
        sede: 'CIDELÂNDIA',
        companhias: [
          { cidade: 'CIDELÂNDIA', companhia: '1ª CIA' },
          { cidade: 'SÃO FRANCISCO DO BREJÃO', companhia: '2ª CIA' },
          { cidade: 'VILA NOVA DOS MARTÍRIOS', companhia: '3ª CIA' },
          { cidade: 'SÃO PEDRO DA ÁGUA BRANCA', companhia: '4ª CIA' }
        ]
      },
      {
        upm: '34º BPM',
        sede: 'AMARANTE',
        companhias: [
          { cidade: 'AMARANTE', companhia: 'SEDE' },
          { cidade: 'BURITIRANA', companhia: '1ª CIA' },
          { cidade: 'SÍTIO NOVO', companhia: '2ª CIA' },
          { cidade: 'MONTES ALTOS', companhia: 'DPM' }
        ]
      },
      {
        upm: '1º EPMONT',
        sede: 'IMPERATRIZ',
        companhias: [
          { cidade: 'IMPERATRIZ', companhia: '1º EPMONT' }
        ]
      },
      {
        upm: '2º BMT',
        sede: 'IMPERATRIZ',
        companhias: [
          { cidade: 'IMPERATRIZ', companhia: '2º BMT' }
        ]
      }
    ]
  },
  {
    cpai: 'CPAI-4',
    batalhoes: [
      {
        upm: '2º BPM',
        sede: 'CAXIAS',
        companhias: [
          { cidade: 'Caxias', companhia: '1ª CIA' },
          { cidade: 'Aldeias Altas', companhia: 'DPM' },
          { cidade: 'Nazaré Do Bruno', companhia: 'DPM' },
          { cidade: 'BAÚ', companhia: 'DPM' },
          { cidade: 'BREJINHO', companhia: 'DPM' },
          { cidade: 'São João Do Sóter', companhia: 'DPM' }
        ]
      },
      {
        upm: '17º BPM',
        sede: 'CODÓ',
        companhias: [
          { cidade: 'Codó', companhia: '-' },
          { cidade: 'Timbiras', companhia: '3ºPEL' },
          { cidade: 'KM 17', companhia: 'DPM' },
          { cidade: 'POVOADO CAJAZEIRAS', companhia: 'DPM' }
        ]
      },
      {
        upm: '24º BPM',
        sede: 'COROATÁ',
        companhias: [
          { cidade: 'Coroatá', companhia: '1ª CIA' },
          { cidade: 'Peritoró', companhia: '2ª CIA' }
        ]
      },
      {
        upm: '48º BPM',
        sede: 'CAXIAS',
        observacao: 'Unidade em regulamentação (sem companhias detalhadas na planilha)',
        companhias: []
      }
    ]
  },
  {
    cpai: 'CPAI-5',
    batalhoes: [
      {
        upm: '10º BPM',
        sede: 'PINHEIRO',
        companhias: [
          { cidade: 'Pinheiro (FT e GOE)', companhia: '1ª Cia' },
          { cidade: 'Presidente Sarney', companhia: '4º GP PM/1ª Cia' },
          { cidade: 'Pedro do Rosário', companhia: '3º GP PM/1ª Cia' },
          { cidade: 'Santa Helena', companhia: '2ª Cia' },
          { cidade: 'Turilândia', companhia: '3º Pel/2ª Cia' },
          { cidade: 'Turiaçu', companhia: '4º GP PM/2ª Cia' },
          { cidade: 'São Bento', companhia: '3ª Cia' },
          { cidade: 'Bacurituba', companhia: '3º GP PM/3ª Cia' }
        ]
      },
      {
        upm: '25º BPM',
        sede: 'CURURUPU',
        companhias: [
          { cidade: 'Cururupu', companhia: '1ª CIA' },
          { cidade: 'Serrano do Maranhão', companhia: '2ª CIA' },
          { cidade: 'Bacuri', companhia: '3ª CIA' },
          { cidade: 'Apicum-Açu', companhia: '4ª CIA' }
        ]
      },
      {
        upm: '36º BPM',
        sede: 'VIANA',
        companhias: [
          { cidade: 'Viana', companhia: '1º CIA' },
          { cidade: 'Vitória do Mearim', companhia: '3ª CIA' },
          { cidade: 'Arari', companhia: '3ª CIA' },
          { cidade: 'Cajari', companhia: '3ª CIA' },
          { cidade: 'Penalva', companhia: '4ª CIA' },
          { cidade: 'Matinha', companhia: '4ª CIA' },
          { cidade: 'Olinda Nova do Maranhão', companhia: '4ª CIA' },
          { cidade: 'São Vicente Férrer', companhia: '2ª CIA' },
          { cidade: 'São João Batista', companhia: '2ª CIA' },
          { cidade: 'Cajapió', companhia: '2ª CIA' }
        ]
      },
      {
        upm: '41º BPM',
        sede: 'MIRINZAL',
        companhias: [
          { cidade: 'Mirinzal', companhia: '1º CIA' },
          { cidade: 'Guimarães', companhia: '2ª CIA' },
          { cidade: 'Central', companhia: '3ª CIA' },
          { cidade: 'Cedral', companhia: '4ª CIA' },
          { cidade: 'Porto Rico', companhia: '5ª CIA' }
        ]
      },
      {
        upm: '45º BPM',
        sede: 'BEQUIMÃO',
        companhias: [
          { cidade: 'Bequimão', companhia: '1ª CIA' },
          { cidade: 'Alcântara (Cujupe)', companhia: '2ª CIA (1º PEL)' },
          { cidade: 'Peri Mirim', companhia: '3ª CIA' },
          { cidade: 'Palmeirândia', companhia: '4ª CIA' }
        ]
      }
    ]
  },
  {
    cpai: 'CPAI-6',
    batalhoes: [
      {
        upm: '4º BPM',
        sede: 'BALSAS',
        companhias: [
          { cidade: 'BALSAS - GOE', companhia: 'CPE' },
          { cidade: 'BALSAS - MARIA DA PENHA', companhia: 'CPE' },
          { cidade: 'BALSAS - FT', companhia: 'CPE' },
          { cidade: 'BALSAS - RP', companhia: '1º CIA' },
          { cidade: 'BALSAS - PROERD', companhia: 'CPE' },
          { cidade: 'RIACHÃO', companhia: '2º PEL' },
          { cidade: 'ALTO PARNAÍBA', companhia: '1º PEL' },
          { cidade: 'TASSO FRAGOSO', companhia: 'DPM' },
          { cidade: 'SÃO PEDRO DOS CRENTES', companhia: 'CPM' },
          { cidade: 'FORTALEZA DOS NOGUEIRAS', companhia: '2º CIA' },
          { cidade: 'FEIRA NOVA', companhia: 'DPM' },
          { cidade: 'NOVA COLINAS', companhia: 'DPM' }
        ]
      },
      {
        upm: '46º BPM',
        sede: 'S. R. DAS MANGABEIRAS',
        companhias: [
          { cidade: 'S. R. MANGABEIRAS', companhia: 'SEDE 46ºBPM' },
          { cidade: 'LORETO', companhia: '1ºPEL(DPM)' },
          { cidade: 'SAMBAIBA', companhia: '1ºPEL(DPM)' },
          { cidade: 'S. FELIX DE BALSAS', companhia: '2ºPEL(DPM)' },
          { cidade: 'S. DOMINGOS DO AZEITÃO', companhia: '2ºPEL(DPM)' },
          { cidade: 'BENEDITO LEITE', companhia: '2ºPEL(DPM)' }
        ]
      }
    ]
  },
  {
    cpai: 'CPAI-7',
    batalhoes: [
      {
        upm: '16º BPM',
        sede: 'CHAPADINHA',
        companhias: [
          { cidade: 'Chapadinha', companhia: '1º CIA' },
          { cidade: 'Urbano Santos', companhia: '5º CIA' },
          { cidade: 'São B. Rio Preto', companhia: 'DPM DA 5º CIA' },
          { cidade: 'Belágua', companhia: 'DPM DA 5º CIA' },
          { cidade: 'Mata Roma', companhia: 'DPM 3º CIA' },
          { cidade: 'Anapurus', companhia: '3º CIA' },
          { cidade: 'Brejo', companhia: '4º CIA' },
          { cidade: 'Magalhães De Almeida', companhia: 'DPM DA 2º CIA' },
          { cidade: 'Milagres Do Ma', companhia: 'DPM 4º CIA' },
          { cidade: 'Santa Quitéria', companhia: 'DPM 4º CIA' },
          { cidade: 'Santana Do Ma', companhia: 'DPM 2º CIA' },
          { cidade: 'São Bernardo', companhia: '2º CIA' }
        ]
      },
      {
        upm: '27º BPM',
        sede: 'ROSÁRIO',
        companhias: [
          { cidade: 'Rosário', companhia: '1ªCIA' },
          { cidade: 'Santa Rita', companhia: '2ªCIA' },
          { cidade: 'Bacabeira', companhia: '1º PEL DA 2ª CIA' },
          { cidade: 'Morros', companhia: '3ª CIA' },
          { cidade: 'Axixá', companhia: '1º PEL DA 3ª CIA' },
          { cidade: 'Icatu', companhia: '2º PEL DA 3ª CIA' },
          { cidade: 'Itatuaba/Icatu', companhia: '3º PEL DA 3ª CIA' },
          { cidade: 'Presidente Juscelino', companhia: '4ª CIA' },
          { cidade: 'Cachoeira Grande', companhia: '1º PEL DA 4ª CIA' }
        ]
      },
      {
        upm: '28º BPM',
        sede: 'ITAPECURU',
        companhias: [
          { cidade: 'Itapecuru Mirim', companhia: '1ª CIA' },
          { cidade: 'Vargem Grande', companhia: '3ª CIA' },
          { cidade: 'Nina Rodrigues', companhia: '2º PEL DA 3ª CIA' },
          { cidade: 'Presidente Vargas', companhia: '3º PEL DA 3ª CIA' },
          { cidade: 'Anajatuba', companhia: '4ª CIA' }
        ]
      }
    ]
  },
  {
    cpai: 'CPAI-8',
    batalhoes: [
      {
        upm: '7º BPM',
        sede: 'PINDARÉ',
        companhias: [
          { cidade: 'Pindaré Mirim (CPU)', companhia: '1ª CIA' },
          { cidade: 'Monção', companhia: 'DPM/1ª CIA' },
          { cidade: 'Igarapé Meio', companhia: 'DPM/1ª CIA' },
          { cidade: 'Santa Inês (FT)', companhia: '2ª CIA' },
          { cidade: 'Bela Vista', companhia: 'DPM/2ª CIA' },
          { cidade: 'Pio XII', companhia: 'DPM/2ª CIA' },
          { cidade: 'Satubinha', companhia: 'DPM/2ª CIA' },
          { cidade: 'Bom Jardim', companhia: '3ª CIA' },
          { cidade: 'São João do Caru', companhia: 'DPM/3ª CIA' },
          { cidade: 'Santa Luzia', companhia: '4ª CIA' },
          { cidade: 'Alto Alegre do Pindaré', companhia: 'DPM/4ª CIA' },
          { cidade: 'Tufilândia', companhia: 'DPM/4ª CIA' },
          { cidade: 'Força Tática', companhia: 'PELOTÃO/2ª CIA' }
        ]
      },
      {
        upm: '29º BPM',
        sede: 'ZÉ DOCA',
        companhias: [
          { cidade: 'Zé Doca', companhia: '1ª CIA' },
          { cidade: 'Gov. Newton Bello', companhia: 'DPM/1ª CIA' },
          { cidade: 'Araguanã', companhia: 'DPM/1ª CIA' },
          { cidade: 'Nova Olinda do Maranhão', companhia: 'DPM/2ª CIA' },
          { cidade: 'Santa Luzia do Paruá', companhia: '2ª CIA' },
          { cidade: 'Presidente Médici', companhia: 'DPM/2ª CIA' },
          { cidade: 'Centro do Guilherme', companhia: 'DPM/2ª CIA' },
          { cidade: 'Maranhãozinho', companhia: 'DPM/2ª CIA' }
        ]
      },
      {
        upm: '31º BPM',
        sede: 'GOV. N. FREIRE',
        companhias: [
          { cidade: 'Governador Nunes Freire', companhia: '1ª CIA' },
          { cidade: 'Maracaçumé', companhia: 'DPM/1ª CIA' },
          { cidade: 'Centro Novo', companhia: 'DPM/1ª CIA' },
          { cidade: 'Boa Vista do Gurupí', companhia: '2ª CIA' },
          { cidade: 'Junco Do Maranhão', companhia: 'DPM/2ª CIA' },
          { cidade: 'Amapá do Maranhão', companhia: 'DPM/2ª CIA' },
          { cidade: 'Carutapera', companhia: '3ª CIA' },
          { cidade: 'Luis Domingues', companhia: 'DPM/3ª CIA' },
          { cidade: 'Godofredo Viana', companhia: 'DPM/3ª CIA' },
          { cidade: 'Cândido Mendes', companhia: 'DPM/3ª CIA' }
        ]
      }
    ]
  },
  {
    cpai: 'CPAI-9',
    batalhoes: [
      {
        upm: '11º BPM',
        sede: 'TIMON',
        companhias: [
          { cidade: 'Timon', companhia: '1ª E 2ª CIAS' },
          { cidade: 'Parnarama', companhia: '3ª CIA' },
          { cidade: 'Matões', companhia: '4ª CIA' }
        ]
      },
      {
        upm: '35º BPM',
        sede: 'S. J. DOS PATOS',
        companhias: [
          { cidade: 'SÃO JOÃO DOS PATOS - FT', companhia: '1º Pel' },
          { cidade: 'BARÃO DE GRAJAÚ', companhia: '2º Pel' },
          { cidade: 'SÃO FRANCISCO DO MARANHÃO', companhia: '2º Pel (DPM)' },
          { cidade: 'SUCUPIRA DO RIACHÃO', companhia: '1º Pel (DPM)' },
          { cidade: 'PARAIBANO', companhia: '4º Pel (DPM)' },
          { cidade: 'LAGOA DO MATO', companhia: '4º Pel (DPM)' },
          { cidade: 'NOVA IORQUE', companhia: '3º Pel (DPM)' },
          { cidade: 'PASTOS BONS', companhia: '3º Pel' },
          { cidade: 'PASSAGEM FRANCA', companhia: '4º Pel' }
        ]
      },
      {
        upm: '44º BPM',
        sede: 'COELHO NETO',
        companhias: [
          { cidade: 'Coelho Neto', companhia: '1ª Cia' },
          { cidade: 'Buriti', companhia: '2ª Cia' },
          { cidade: 'Duque Bacelar', companhia: '2ª Cia (DPM)' },
          { cidade: 'Afonso Cunha', companhia: '1ª Cia (DPM)' }
        ]
      },
      {
        upm: '1ª CIMT - TIMON',
        sede: 'TIMON',
        companhias: [
          { cidade: 'Timon', companhia: 'NÃO POSSUI' }
        ]
      },
      {
        upm: '47º BPM',
        sede: 'TIMON',
        companhias: [
          { cidade: 'Timon-MA (Sede)', companhia: '1ª CIA' },
          { cidade: 'Timon-MA (Bairro Vila do BEC)', companhia: '2ª CIA' }
        ]
      }
    ]
  }
];
