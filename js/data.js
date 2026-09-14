// ============================================
// DATA - Datos de cursos y estudiantes
// Asistencia 3D - Logos Academy
// ============================================

const COURSES = {
  "Economia_3BGU": {
    label: "Economía 3BGU",
    color: "#2563eb",
    students: [
      { num: 1, name: "AGUILERA TERRANOVA ALEJANDRO NICOLAS" },
      { num: 2, name: "ANDRADE GAROFALO EDUARDO NICOLAS" },
      { num: 3, name: "BRIONES PONCE OLENKA ELIZABETH" },
      { num: 4, name: "CABRERA ALVEAR KAMILA ALEJANDRA" },
      { num: 5, name: "FLORES SANCHEZ PAULINA ALEJANDRA" },
      { num: 6, name: "GARCÉS CABEZAS FIORELLA MICHELLE" },
      { num: 7, name: "GARCIA GALARZA FRANCISCO XAVIER" },
      { num: 8, name: "GARRIDO LUNA MARTYN VICENTE" },
      { num: 9, name: "GAUNA CHÁVEZ VALERIE DENISSE" },
      { num: 10, name: "GOMEZ MARRIOTT ESTEFANO" },
      { num: 11, name: "GUEDES LOOR RENATA VICTORIA" },
      { num: 12, name: "IÑIGUEZ FAJARDO ISABELLA VALENTINA" },
      { num: 13, name: "ITURRALDE CUMBA SANTIAGO ANDRES" },
      { num: 14, name: "PERALTA AVILA SAMANTHA AGELENE" },
      { num: 15, name: "PLUA JARRIN CESAR EDUARDO" },
      { num: 16, name: "POZO CAJAS DAVID" },
      { num: 17, name: "TEJADA RUÍZ EMILY" },
      { num: 18, name: "TORRES MALDONADO EMILIA ALEJANDRA" },
      { num: 19, name: "VELASCO SANTOS ALISSON ALESSANDRA" },
      { num: 20, name: "VIZCAINO MACANCELA AMIR ANTONIO" },
      { num: 21, name: "ZAMBRANO RIVERA DIANA ESTEFANIA" },
      { num: 22, name: "ZAMORA RODRIGUEZ GABRIEL ADRIAN" },
      { num: 23, name: "ZAMORA WONG KYLIE VALERIA" },
      { num: 24, name: "ZUÑIGA BETTY DOMENICA VALENTINA" }
    ]
  },
  "Economia_2BGU": {
    label: "Economía 2BGU",
    color: "#7c3aed",
    students: [
      { num: 1, name: "ALBÁN ALTAMIRANO GIANELLA" },
      { num: 2, name: "ASPIAZU SOTOMAYOR CAMILA" },
      { num: 3, name: "BARÓN MEJÍA JULIÁN" },
      { num: 4, name: "CAMPUZANO SALAZAR JUAN JOSÉ" },
      { num: 5, name: "CHALÉN HERRERA VICENTE" },
      { num: 6, name: "DE LA CRUZ NARANJO MATEO" },
      { num: 7, name: "FLOR LEÓN JACINTO" },
      { num: 8, name: "GRANDA CONSTANTINE XAVIER" },
      { num: 9, name: "GUERRERO HERDOÍZA IVANNA" },
      { num: 10, name: "MARTÍNEZ LUNA MATÍAS" },
      { num: 11, name: "MENDIBURO CEDEÑO ADRIÁN" },
      { num: 12, name: "MOLANO CASTRO EMMANUEL" },
      { num: 13, name: "MURILLO CHÁVEZ SERGIO" },
      { num: 14, name: "ORTIZ EGAS SEBASTIÁN" },
      { num: 15, name: "ORTIZ MONTENEGRO CARLOS" },
      { num: 16, name: "PABÓN RENGIFO VALESKA" },
      { num: 17, name: "ROMERO MONCADA JUAN MARTÍN" },
      { num: 18, name: "SIERRA TOALA ERNESTO" },
      { num: 19, name: "STARK ROMÁN ALEJANDRA" },
      { num: 20, name: "TAMAYO BONILLA DOMENICA" },
      { num: 21, name: "VIZCAINO BONILLA JULIO" },
      { num: 22, name: "VIZHÑAY VÉLEZ VALERIA" }
    ]
  },
    "Economia_IB": {
    label: "Economía IB",
    color: "#ec4899",
    students: [
      { num: 1, name: "BRIONES PONCE OLENKA ELIZABETH" },
      { num: 2, name: "GARCÉS CABEZAS FIORELLA MICHELLE" },
      { num: 3, name: "GARCIA GALARZA FRANCISCO XAVIER" },
      { num: 4, name: "GAUNA CHÁVEZ VALERIE DENISSE" },
      { num: 5, name: "GOMEZ MARRIOTT ESTEFANO" },
      { num: 6, name: "GUEDES LOOR RENATA VICTORIA" },
      { num: 7, name: "PLUA JARRIN CESAR EDUARDO" },
      { num: 8, name: "TEJADA RUÍZ EMILY" },
      { num: 9, name: "TORRES MALDONADO EMILIA ALEJANDRA" },
      { num: 10, name: "VELASCO SANTOS ALISSON ALESSANDRA" },
      { num: 11, name: "VIZCAINO MACANCELA AMIR ANTONIO" },
      { num: 12, name: "ZUÑIGA BETTY DOMENICA VALENTINA" }
    ]
  },
      "Historia_1BGU_A": {
    label: "Historia 1BGU A",
    color: "#059669",
    students: [
      { num: 1, name: "ALBAN ALTAMIRANO IVANNA FERNANDA" },
      { num: 2, name: "ARTEAGA PLAZA MARIA EMILIA" },
      { num: 3, name: "BEJAR JIMENEZ HELENA VICTORIA" },
      { num: 4, name: "CADENA RUIZ ABIGAIL" },
      { num: 5, name: "CARDENAS ASTUDILLO JUAN ALEJANDRO" },
      { num: 6, name: "CARRILLO PEREZ MIGUEL ADRIAN" },
      { num: 7, name: "CASTILLO RAMIREZ MARCO ANTONIO" },
      { num: 8, name: "CHONG QUI PEÑAFIEL MARIA EMILIA" },
      { num: 9, name: "DEL SALTO PALACIOS MA. DEL MAR" },
      { num: 10, name: "DIAZ VELIZ EDUARDO ANTONIO" },
      { num: 11, name: "ESTRADA VERA ARIANA ISABEL" },
      { num: 12, name: "FARFAN LEÓN LUCIANA SOFÍA" },
      { num: 13, name: "FERNANDEZ GONZABAY AMANDA ANNABELLA" },
      { num: 14, name: "FIALLOS CONSTANTE BRUNO GABRIEL" },
      { num: 15, name: "GALEFSKI MERINO ALANIS BELEN" },
      { num: 16, name: "GARATE ANDRADE MANUEL ISAIAS" },
      { num: 17, name: "LEON HIDALGO JORGE ENRIQUE" },
      { num: 18, name: "MEDINA GOMEZ NICOLAS MARTIN" },
      { num: 19, name: "MEDINA MOREJON FABIANNA NICOLE" },
      { num: 20, name: "MOHR MOSCOL LUCAS AGUSTIN" },
      { num: 21, name: "MONCADA TAPIA PEDRO ARTURO" },
      { num: 22, name: "MONTIEL CEDEÑO RUTH PAULETTE" },
      { num: 23, name: "NAVIA ALCIVAR MIGUEL IVAN" },
      { num: 24, name: "SALAZAR CAMPUZANO THELMO SAMUEL" },
      { num: 25, name: "VARGAS CARVAJAL MATIAS ADRIAN" }
    ]
  },
    "Historia_1BGU_B": {
    label: "Historia 1BGU B",
    color: "#d97706",
    students: [
      { num: 1, name: "CARDENAS VASQUEZ VALENTINA RAPHAELA" },
      { num: 2, name: "DARQUEA GUERRERO ISABELLA" },
      { num: 3, name: "DVORQUEZ SAMAN EITAN" },
      { num: 4, name: "ENCALADA ZAMBRANO PATRICK OLIVIER" },
      { num: 5, name: "FLORES SANCHEZ VALENTINA" },
      { num: 6, name: "GARCÉS CABEZAS DOMÉNICA ISABELLA" },
      { num: 7, name: "GONZALEZ LOPEZ ISABELLA ALEJANDRA" },
      { num: 8, name: "GONZALEZ VELASCO ESTEFANÍA" },
      { num: 9, name: "HIDALGO DROUET SAMANTHA" },
      { num: 10, name: "HOYOS ESPIN AMANDA LIA" },
      { num: 11, name: "LABRE GALARZA RAFAELLA" },
      { num: 12, name: "MOSCOSO MARTINEZ ALICIA MARIA" },
      { num: 13, name: "MUECKAY SALVATIERRA LUCAS XAVIER" },
      { num: 14, name: "NAHT MUÑOZ DOMENICA ANTONELLA" },
      { num: 15, name: "NARANJO OJEDA MAIHA" },
      { num: 16, name: "ORTIZ CABRERA DYLAN ANTONIO" },
      { num: 17, name: "RODRIGUEZ RUIZ DANNA VALERIA" },
      { num: 18, name: "SANTA CRUZ CERÓN MATTÍAS NICCOLO" },
      { num: 19, name: "SOLORZANO SEBASTIAN" },
      { num: 20, name: "TAPIA GARZON ANDRES JESUS" },
      { num: 21, name: "VALLEJO HERDOIZA NICOLÁS ANDRES" },
      { num: 22, name: "WENDT LANDIVAR NATHALIE FABIANA" },
      { num: 23, name: "ZAMBRANO MOREIRA MARIA VICTORIA" },
      { num: 24, name: "ZAPATIER PEREZ LEONARDO" }
    ]
  },
      "Historia_1BGU_C": {
    label: "Historia 1BGU C",
    color: "#dc2626",
    students: [
      { num: 1, name: "ALAVA PONCE ISABELLA EDITH" },
      { num: 2, name: "ALVARADO CASTRO RICARDO EDISON" },
      { num: 3, name: "BONILLA CHAVARRIA JUAN DIEGO" },
      { num: 4, name: "CELLERI RAMIREZ FELIPE ALEJANDRO" },
      { num: 5, name: "CHACON REYES BELEN ALEJANDRA" },
      { num: 6, name: "CRUZ PINEDA DOMENICA ALEJANDRA" },
      { num: 7, name: "DE LA CUADRA GARCES EILEEN ALBA" },
      { num: 8, name: "ENCALADA ZAMBRANO SURI POLETTE" },
      { num: 9, name: "GARCIA VELEZ GRACE VALENTINA" },
      { num: 10, name: "GAVILANES MENDEZ WILSON ADRIAN" },
      { num: 11, name: "GILER CAÑARTE LUCCIANA ISABELLE" },
      { num: 12, name: "MARTINEZ VELASQUEZ WLADIMIR ALEJANDRO" },
      { num: 13, name: "MORALES FLORES EMILIO ALEJANDRO" },
      { num: 14, name: "OLIVEIRA YEPEZ ELIANE ANNELIESE" },
      { num: 15, name: "PALACIOS RECALDE EDUARDO ANDRES" },
      { num: 16, name: "QUIMI CEDILLO KRYSTELL LISSET" },
      { num: 17, name: "REINA SANCHEZ NISHMA VALENTINA" },
      { num: 18, name: "RIVADENEIRA LUZARDO AMANDA LUCIA" },
      { num: 19, name: "RIVERA TINOCO ALEXA MARIA" },
      { num: 20, name: "TOLEDO CASTILLO ROBERTO SEBASTIAN" },
      { num: 21, name: "VÉLEZ ZAMBRANO SAMUEL ENRIQUE" },
      { num: 22, name: "VERA GILER DARMIN MATIAS" },
      { num: 23, name: "YCAZA MONTJOY RICARDO XAVIER" }
    ]
  }
};

// Exportar para uso en el navegador
if (typeof window !== 'undefined') {
  window.COURSES = COURSES;
}
