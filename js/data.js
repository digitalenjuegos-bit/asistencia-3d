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
      { num: 1, name: "ARIAS SCHULDT ERIK SAMUEL" },
      { num: 2, name: "CEDEÑO MONTOYA MARÍA AUXIIADORA" },
      { num: 3, name: "CONDE VILLACRÉS JHONNY" },
      { num: 4, name: "CONSTANTE LOOR BRIANNA" },
      { num: 5, name: "FERNÁNDEZ GONZABAY AMELIA" },
      { num: 6, name: "MACAS VERA JOSÉ LUIS" },
      { num: 7, name: "MÁRMOL ABAD NATALIA" },
      { num: 8, name: "MEDINA PORRAS NICOLÁS" },
      { num: 9, name: "MÉNDEZ MERIZALDE ARIEL" },
      { num: 10, name: "MORA ROBLES VALENTINA" },
      { num: 11, name: "NEIRA VARGAS ROMINA" },
      { num: 12, name: "PEÑA SARMIENTO JORDY" },
      { num: 13, name: "RUIZ BENITES BIANCA" },
      { num: 14, name: "SÁNCHEZ DELGADO VALERIA" },
      { num: 15, name: "SOLÓRZANO CALVACHE MATÍAS" },
      { num: 16, name: "TOMALÁ DIAZ EMILIANA" },
      { num: 17, name: "VÉLEZ IZURIETA GIA LUCIANA" },
      { num: 18, name: "VINTIMILLA CRESPO NATASHA" },
      { num: 19, name: "ZAMORA YAGUAL JORGE" },
      { num: 20, name: "ZAPATIER ALEJANDRO" }
    ]
  },
  "Economia_IB": {
    label: "Economía IB",
    color: "#ec4899",
    students: [
      { num: 1, name: "EMILIA TORRES" },
      { num: 2, name: "FRANCISCO GARCIA" },
      { num: 3, name: "DOMENICA ZUNIGA" },
      { num: 4, name: "OLENKA BRIONES" },
      { num: 5, name: "ESTEFANO GOMEZ" },
      { num: 6, name: "RENATA GUEDEZ" },
      { num: 7, name: "CESAR PLUA" },
      { num: 8, name: "EMMILY TEJADA" },
      { num: 9, name: "ALLISON VELASCO" },
      { num: 10, name: "AMIR VIZCAINO" },
      { num: 11, name: "VALERIE GAUNA" },
      { num: 12, name: "FIORELLA GARCES" }
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
      { num: 14, name: "GALEFSKI MERINO ALANIS BELEN" },
      { num: 15, name: "GARATE ANDRADE MANUEL ISAIAS" },
      { num: 16, name: "MEDINA MOREJON FABIANNA NICOLE" },
      { num: 17, name: "MEDINA GOMEZ NICOLAS MARTIN" },
      { num: 18, name: "MOHR MOSCOL LUCAS AGUSTIN" },
      { num: 19, name: "MONTIEL CEDEÑO RUTH PAULETTE" },
      { num: 20, name: "NAVIA ALCIVAR MIGUEL IVAN" },
      { num: 21, name: "SALAZAR CAMPUZANO THELMO SAMUEL" },
      { num: 22, name: "VARGAS CARVAJAL MATIAS ADRIAN" },
      { num: 23, name: "FIALLOS BRUNO" },
      { num: 24, name: "LEON JORGE" },
      { num: 25, name: "MONCADA PEDRO" }
    ]
  },
  "Historia_1BGU_B": {
    label: "Historia 1BGU B",
    color: "#d97706",
    students: [
      { num: 1, name: "AGUILAR BANCHON FELIPE SANTIAGO" },
      { num: 2, name: "CARDENAS VASQUEZ VALENTINA RAPHAELA" },
      { num: 3, name: "DARQUEA GUERRERO ISABELLA" },
      { num: 4, name: "HIDALGO DROUET SAMANTHA" },
      { num: 5, name: "DVORQUEZ SAMAN EITAN" },
      { num: 6, name: "ENCALADA ZAMBRANO PATRICK OLIVIER" },
      { num: 7, name: "FLORES SANCHEZ VALENTINA" },
      { num: 8, name: "GARCÉS CABEZAS DOMÉNICA ISABELLA" },
      { num: 9, name: "GONZALEZ LOPEZ ISABELLA ALEJANDRA" },
      { num: 10, name: "GONZALEZ VELASCO ESTEFANÍA" },
      { num: 11, name: "HOYOS ESPIN AMANDA LIA" },
      { num: 12, name: "LABRE GALARZA RAFAELLA" },
      { num: 13, name: "NARANJO OJEDA MAIHA" },
      { num: 14, name: "MOSCOSO MARTINEZ ALICIA MARIA" },
      { num: 15, name: "MUECKAY SALVATIERRA LUCAS XAVIER" },
      { num: 16, name: "NAHT MUÑOZ DOMENICA ANTONELLA" },
      { num: 17, name: "ORTIZ CABRERA DYLAN ANTONIO" },
      { num: 18, name: "RODRIGUEZ RUIZ DANNA VALERIA" },
      { num: 19, name: "SANTA CRUZ CERÓN MATTÍAS NICCOLO" },
      { num: 20, name: "TAPIA GARZON ANDRES JESUS" },
      { num: 21, name: "VALLEJO HERDOIZA NICOLÁS ANDRES" },
      { num: 22, name: "WENDT LANDIVAR NATHALIE FABIANA" },
      { num: 23, name: "ZAMBRANO MOREIRA MARIA VICTORIA" },
      { num: 24, name: "ZAPATIER PEREZ LEONARDO" },
      { num: 25, name: "SOLORZANO SEBASTIAN" }
    ]
  },
  "Historia_1BGU_C": {
    label: "Historia 1BGU C",
    color: "#dc2626",
    students: [
      { num: 1, name: "ALAVA PONCE ISABELLA EDITH" },
      { num: 2, name: "BONILLA CHAVARRIA JUAN DIEGO" },
      { num: 3, name: "CELLERI RAMIREZ FELIPE ALEJANDRO" },
      { num: 4, name: "CHACON REYES BELEN ALEJANDRA" },
      { num: 5, name: "CRUZ PINEDA DOMENICA ALEJANDRA" },
      { num: 6, name: "DE LA CUADRA GARCES EILEEN ALBA" },
      { num: 7, name: "ENCALADA ZAMBRANO SURI POLETTE" },
      { num: 8, name: "GARCIA VELEZ GRACE VALENTINA" },
      { num: 9, name: "GILER CAÑARTE LUCCIANA ISABELLE" },
      { num: 10, name: "MARTINEZ VELASQUEZ WLADIMIR ALEJANDRO" },
      { num: 11, name: "MORALES FLORES EMILIO ALEJANDRO" },
      { num: 12, name: "OLIVEIRA YEPEZ ELIANE ANNELIESE" },
      { num: 13, name: "PALACIOS RECALDE EDUARDO ANDRES" },
      { num: 14, name: "QUIMI CEDILLO KRYSTELL LISSET" },
      { num: 15, name: "REINA SANCHEZ NISHMA VALENTINA" },
      { num: 16, name: "RIVADENEIRA LUZARDO AMANDA LUCIA" },
      { num: 17, name: "RIVERA TINOCO ALEXA MARIA" },
      { num: 18, name: "TOLEDO CASTILLO ROBERTO SEBASTIAN" },
      { num: 19, name: "TRUJILLO HAILLARD PEPO TIMOTHEE" },
      { num: 20, name: "VÉLEZ ZAMBRANO SAMUEL ENRIQUE" },
      { num: 21, name: "YCAZA MONTJOY RICARDO XAVIER" },
      { num: 22, name: "VERA GILER DARMIN MATIAS" },
      { num: 23, name: "VELEZ SAMUEL" },
      { num: 24, name: "ALVARADO RICARDO" },
      { num: 25, name: "GAVILANEZ WILSON" }
    ]
  }
};

// Exportar para uso en el navegador
if (typeof window !== 'undefined') {
  window.COURSES = COURSES;
}
