export interface LimaPoi {
  id: string;
  name: string;
  district: string;
  category: 'Aeropuerto' | 'Comercial' | 'Financiero' | 'Transporte' | 'Salud' | 'Educación' | 'Hito Vial';
  lat: number;
  lng: number;
  keywords: string[];
}

export const LIMA_POIS: LimaPoi[] = [
  // Aeropuerto y Terminales Terrestres
  {
    id: 'poi-airport-jorge-chavez',
    name: 'Aeropuerto Internacional Jorge Chávez',
    district: 'Callao',
    category: 'Aeropuerto',
    lat: -12.0219,
    lng: -77.1143,
    keywords: ['aeropuerto', 'jorge chavez', 'vuelos', 'terminal aereo', 'callao', 'lap']
  },
  {
    id: 'poi-terminal-plaza-norte',
    name: 'Gran Terminal Terrestre Plaza Norte',
    district: 'Independencia',
    category: 'Transporte',
    lat: -12.0069,
    lng: -77.0588,
    keywords: ['terminal', 'plaza norte', 'buses', 'independencia', 'panamericana']
  },
  {
    id: 'poi-terminal-javier-prado',
    name: 'Terminal Terrestre Javier Prado',
    district: 'La Victoria',
    category: 'Transporte',
    lat: -12.0886,
    lng: -77.0217,
    keywords: ['terminal javier prado', 'cruzero', 'oltursa', 'flores', 'la victoria']
  },
  {
    id: 'poi-terminal-atocongo',
    name: 'Terminal Terrestre Atocongo',
    district: 'San Juan de Miraflores',
    category: 'Transporte',
    lat: -12.1558,
    lng: -76.9814,
    keywords: ['terminal atocongo', 'sjm', 'sur', 'panamericana sur']
  },

  // Centros Comerciales Principales
  {
    id: 'poi-jockey-plaza',
    name: 'Jockey Plaza Shopping Center',
    district: 'Santiago de Surco',
    category: 'Comercial',
    lat: -12.0863,
    lng: -76.9763,
    keywords: ['jockey plaza', 'mall', 'surco', 'javier prado', 'tottus', 'falabella']
  },
  {
    id: 'poi-real-plaza-salaverry',
    name: 'Real Plaza Salaverry',
    district: 'Jesús María',
    category: 'Comercial',
    lat: -12.0898,
    lng: -77.0519,
    keywords: ['salaverry', 'real plaza', 'jesus maria', 'mall', 'zara']
  },
  {
    id: 'poi-megaplaza',
    name: 'MegaPlaza Norte',
    district: 'Independencia',
    category: 'Comercial',
    lat: -11.9942,
    lng: -77.0628,
    keywords: ['megaplaza', 'norte', 'independencia', 'panamericana', 'mall']
  },
  {
    id: 'poi-plaza-san-miguel',
    name: 'Plaza San Miguel',
    district: 'San Miguel',
    category: 'Comercial',
    lat: -12.0768,
    lng: -77.0809,
    keywords: ['plaza san miguel', 'la marina', 'universitaria', 'mall', 'wong']
  },
  {
    id: 'poi-larcomar',
    name: 'Larcomar Shopping Center',
    district: 'Miraflores',
    category: 'Comercial',
    lat: -12.1328,
    lng: -77.0302,
    keywords: ['larcomar', 'miraflores', 'malecon', 'marriot', 'costa verde']
  },
  {
    id: 'poi-real-plaza-puruchuco',
    name: 'Real Plaza Puruchuco',
    district: 'Ate',
    category: 'Comercial',
    lat: -12.0467,
    lng: -76.9317,
    keywords: ['puruchuco', 'ate', 'nicolas ayllon', 'carretera central', 'real plaza']
  },
  {
    id: 'poi-mall-del-sur',
    name: 'Mall del Sur',
    district: 'San Juan de Miraflores',
    category: 'Comercial',
    lat: -12.1550,
    lng: -76.9818,
    keywords: ['mall del sur', 'sjm', 'panamericana sur', 'alipio ponce']
  },
  {
    id: 'poi-mallplaza-bellavista',
    name: 'Mallplaza Bellavista',
    district: 'Callao',
    category: 'Comercial',
    lat: -12.0573,
    lng: -77.1105,
    keywords: ['mallplaza', 'bellavista', 'callao', 'colonial', 'oscar r benavides']
  },
  {
    id: 'poi-open-plaza-angamos',
    name: 'Open Plaza Angamos',
    district: 'Surquillo',
    category: 'Comercial',
    lat: -12.1121,
    lng: -77.0143,
    keywords: ['open plaza', 'angamos', 'tomas marsano', 'surquillo', 'tottus']
  },
  {
    id: 'poi-la-rambla-san-borja',
    name: 'La Rambla San Borja',
    district: 'San Borja',
    category: 'Comercial',
    lat: -12.0872,
    lng: -77.0041,
    keywords: ['la rambla', 'san borja', 'javier prado', 'aviacion', 'ripley']
  },
  {
    id: 'poi-real-plaza-centro-civico',
    name: 'Real Plaza Centro Cívico',
    district: 'Cercado de Lima',
    category: 'Comercial',
    lat: -12.0567,
    lng: -77.0367,
    keywords: ['centro civico', 'real plaza', 'sheraton', 'estacion central', 'lima centro']
  },

  // Centros Financieros y Negocios
  {
    id: 'poi-financiero-san-isidro',
    name: 'Centro Financiero San Isidro',
    district: 'San Isidro',
    category: 'Financiero',
    lat: -12.0945,
    lng: -77.0275,
    keywords: ['centro financiero', 'las begonias', 'san isidro', 'bcp', 'bbva', 'interbank']
  },
  {
    id: 'poi-parque-kennedy',
    name: 'Parque Kennedy / Óvalo de Miraflores',
    district: 'Miraflores',
    category: 'Hito Vial',
    lat: -12.1218,
    lng: -77.0298,
    keywords: ['parque kennedy', 'miraflores', 'ovalo miraflores', 'larco', 'diagonal']
  },
  {
    id: 'poi-plaza-mayor-lima',
    name: 'Plaza Mayor de Lima (Plaza de Armas)',
    district: 'Cercado de Lima',
    category: 'Hito Vial',
    lat: -12.0453,
    lng: -77.0308,
    keywords: ['plaza de armas', 'plaza mayor', 'palacio de gobierno', 'catedral', 'cercado']
  },
  {
    id: 'poi-centro-empresarial-real',
    name: 'Centro Empresarial Real',
    district: 'San Isidro',
    category: 'Financiero',
    lat: -12.0989,
    lng: -77.0366,
    keywords: ['empresarial real', 'victor andres belaunde', 'san isidro', 'golf']
  },
  {
    id: 'poi-circuito-magico-agua',
    name: 'Parque de la Reserva (Circuito Mágico del Agua)',
    district: 'Cercado de Lima',
    category: 'Hito Vial',
    lat: -12.0706,
    lng: -77.0336,
    keywords: ['circuito magico', 'parque de la reserva', 'fuentes', 'estadio nacional']
  },

  // Estaciones del Metropolitano y Metro Línea 1
  {
    id: 'poi-estacion-central-metro',
    name: 'Estación Central (Metropolitano)',
    district: 'Cercado de Lima',
    category: 'Transporte',
    lat: -12.0583,
    lng: -77.0363,
    keywords: ['estacion central', 'metropolitano', 'paseo de los heroes', 'centro civico']
  },
  {
    id: 'poi-estacion-canaval-moreyra',
    name: 'Estación Canaval y Moreyra (Metropolitano)',
    district: 'San Isidro',
    category: 'Transporte',
    lat: -12.0965,
    lng: -77.0245,
    keywords: ['canaval y moreyra', 'metropolitano', 'via expresa', 'san isidro']
  },
  {
    id: 'poi-estacion-javier-prado-metro',
    name: 'Estación Javier Prado (Metropolitano)',
    district: 'La Victoria / San Isidro',
    category: 'Transporte',
    lat: -12.0901,
    lng: -77.0253,
    keywords: ['estacion javier prado', 'metropolitano', 'via expresa']
  },
  {
    id: 'poi-estacion-angamos-metro',
    name: 'Estación Angamos (Metropolitano)',
    district: 'Surquillo / Miraflores',
    category: 'Transporte',
    lat: -12.1118,
    lng: -77.0232,
    keywords: ['estacion angamos', 'metropolitano', 'via expresa', 'surquillo']
  },
  {
    id: 'poi-estacion-benavides-metro',
    name: 'Estación Benavides (Metropolitano)',
    district: 'Miraflores',
    category: 'Transporte',
    lat: -12.1257,
    lng: -77.0221,
    keywords: ['estacion benavides', 'metropolitano', 'via expresa', 'miraflores']
  },
  {
    id: 'poi-estacion-la-cultura',
    name: 'Estación La Cultura (Metro Línea 1)',
    district: 'San Borja',
    category: 'Transporte',
    lat: -12.0877,
    lng: -77.0034,
    keywords: ['la cultura', 'metro linea 1', 'tren electrico', 'aviacion', 'javier prado']
  },
  {
    id: 'poi-estacion-gamarra',
    name: 'Estación Gamarra (Metro Línea 1)',
    district: 'La Victoria',
    category: 'Transporte',
    lat: -12.0673,
    lng: -77.0135,
    keywords: ['estacion gamarra', 'metro linea 1', 'emporio comercial', 'la victoria']
  },

  // Clínicas y Hospitales
  {
    id: 'poi-clinica-delgado',
    name: 'Clínica Delgado (Auna)',
    district: 'Miraflores',
    category: 'Salud',
    lat: -12.1147,
    lng: -77.0322,
    keywords: ['clinica delgado', 'auna', 'angamos', 'miraflores', 'salud']
  },
  {
    id: 'poi-clinica-anglo-americana',
    name: 'Clínica Anglo Americana',
    district: 'San Isidro',
    category: 'Salud',
    lat: -12.1039,
    lng: -77.0378,
    keywords: ['anglo americana', 'clinica', 'san isidro', 'salud']
  },
  {
    id: 'poi-clinica-san-felipe',
    name: 'Clínica San Felipe',
    district: 'Jesús María',
    category: 'Salud',
    lat: -12.0847,
    lng: -77.0506,
    keywords: ['san felipe', 'clinica', 'jesus maria', 'salud', 'gregorio escobedo']
  },
  {
    id: 'poi-hospital-rebagliati',
    name: 'Hospital Nacional Edgardo Rebagliati (EsSalud)',
    district: 'Jesús María',
    category: 'Salud',
    lat: -12.0789,
    lng: -77.0381,
    keywords: ['rebagliati', 'hospital', 'essalud', 'domingo cueto', 'jesus maria']
  },
  {
    id: 'poi-hospital-almenara',
    name: 'Hospital Guillermo Almenara (EsSalud)',
    district: 'La Victoria',
    category: 'Salud',
    lat: -12.0617,
    lng: -77.0175,
    keywords: ['almenara', 'hospital', 'essalud', 'grau', 'la victoria']
  },
  {
    id: 'poi-inen',
    name: 'Instituto Nacional de Enfermedades Neoplásicas (INEN)',
    district: 'Santiago de Surco',
    category: 'Salud',
    lat: -12.1104,
    lng: -76.9995,
    keywords: ['inen', 'neoplasicas', 'angamos este', 'surco', 'hospital']
  },

  // Universidades Principales
  {
    id: 'poi-pucp',
    name: 'Pontificia Universidad Católica del Perú (PUCP)',
    district: 'San Miguel',
    category: 'Educación',
    lat: -12.0700,
    lng: -77.0800,
    keywords: ['pucp', 'catolica', 'universidad', 'universitaria', 'san miguel']
  },
  {
    id: 'poi-unmsm',
    name: 'Universidad Nacional Mayor de San Marcos (UNMSM)',
    district: 'Cercado de Lima',
    category: 'Educación',
    lat: -12.0575,
    lng: -77.0825,
    keywords: ['san marcos', 'unmsm', 'ciudad universitaria', 'venezuela', 'cercado']
  },
  {
    id: 'poi-ulima',
    name: 'Universidad de Lima (U de Lima)',
    district: 'Santiago de Surco',
    category: 'Educación',
    lat: -12.0844,
    lng: -76.9714,
    keywords: ['universidad de lima', 'ulima', 'javier prado', 'surco', 'educacion']
  },
  {
    id: 'poi-upc-monterrico',
    name: 'UPC - Campus Monterrico',
    district: 'Santiago de Surco',
    category: 'Educación',
    lat: -12.1042,
    lng: -76.9631,
    keywords: ['upc', 'monterrico', 'primavera', 'surco', 'universidad']
  },
  {
    id: 'poi-upacifico',
    name: 'Universidad del Pacífico (UP)',
    district: 'Jesús María',
    category: 'Educación',
    lat: -12.0831,
    lng: -77.0494,
    keywords: ['universidad del pacifico', 'upacifico', 'salaverry', 'jesus maria']
  },

  // Óvalos y Cruces Viales Neurálgicos
  {
    id: 'poi-ovalo-higuereta',
    name: 'Óvalo Higuereta (Plaza Los Cabitos)',
    district: 'Santiago de Surco',
    category: 'Hito Vial',
    lat: -12.1319,
    lng: -76.9986,
    keywords: ['ovalo higuereta', 'cabitos', 'benavides', 'tomas marsano', 'surco']
  },
  {
    id: 'poi-ovalo-gutierrez',
    name: 'Óvalo Gutiérrez',
    district: 'Miraflores / San Isidro',
    category: 'Hito Vial',
    lat: -12.1109,
    lng: -77.0364,
    keywords: ['ovalo gutierrez', 'santa cruz', 'conquistadores', 'miraflores']
  },
  {
    id: 'poi-ovalo-monitor',
    name: 'Óvalo Monitor Huáscar',
    district: 'Surco / La Molina',
    category: 'Hito Vial',
    lat: -12.0842,
    lng: -76.9702,
    keywords: ['ovalo monitor', 'javier prado este', 'golf los incas', 'la molina']
  }
];
