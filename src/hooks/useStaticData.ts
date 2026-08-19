import type { StaticImageData } from "next/image";

import borderBrushAsset from "@/assets/svg-20260422T204039Z-3-001/svg/bordepincelado.svg";
import brandLogoAsset from "@/assets/logo.png";
import imagenHeroUnificada from "@/assets/images/imagenCirculoUnificada.svg";
import nosotrosComunidadAsset from "@/assets/images/nosotros/comunidad-educativa.png";
import nosotrosIdiomasDeportesAsset from "@/assets/images/nosotros/idiomas-deportes.png";
import nosotrosInstalacionesAsset from "@/assets/images/nosotros/instalaciones.png";
import nosotrosOfertaAcademicaAsset from "@/assets/images/nosotros/oferta-academica.png";
import deporteAjedrezAsset from "@/assets/images/nosotros/generated/deporte-ajedrez.png";
import deporteArtesMarcialesAsset from "@/assets/images/nosotros/generated/deporte-artes-marciales.png";
import deporteAtletismoAsset from "@/assets/images/nosotros/generated/deporte-atletismo.png";
import deporteBasquetAsset from "@/assets/images/nosotros/generated/deporte-basquet.png";
import deporteDanzaAsset from "@/assets/images/nosotros/generated/deporte-danza.png";
import deporteFutbolAsset from "@/assets/images/nosotros/generated/deporte-futbol.png";
import deporteNatacionAsset from "@/assets/images/nosotros/generated/deporte-natacion.png";
import deporteVoleibolAsset from "@/assets/images/nosotros/generated/deporte-voleibol.png";
import instalacionCanchasFutbolAsset from "@/assets/images/nosotros/generated/instalacion-canchas-futbol.png";
import instalacionComedorAsset from "@/assets/images/nosotros/generated/instalacion-comedor.png";
import instalacionEnfermeriaAsset from "@/assets/images/nosotros/generated/instalacion-enfermeria.png";
import instalacionGimnasioCubiertoAsset from "@/assets/images/nosotros/generated/instalacion-gimnasio-cubierto.png";
import instalacionLaboratorioComputacionAsset from "@/assets/images/nosotros/generated/instalacion-laboratorio-computacion.png";
import instalacionLaboratorioFisicaAsset from "@/assets/images/nosotros/generated/instalacion-laboratorio-fisica.png";
import instalacionLaboratorioQuimicaAsset from "@/assets/images/nosotros/generated/instalacion-laboratorio-quimica.png";
import instalacionMicrosTrasladoAsset from "@/assets/images/nosotros/generated/instalacion-micros-traslado.png";
import instalacionPiletaNatacionAsset from "@/assets/images/nosotros/generated/instalacion-pileta-natacion.png";
import instalacionPistaAtletismoAsset from "@/assets/images/nosotros/generated/instalacion-pista-atletismo.png";

export {
  nosotrosComunidadAsset,
  nosotrosOfertaAcademicaAsset,
  nosotrosInstalacionesAsset,
  deporteNatacionAsset
};

export type StaticLink = {
  label: string;
  href: string;
};

export type StaticAsset = {
  alt: string;
  height: number;
  src: StaticImageData;
  width: number;
};

export type StaticData = {
  site: {
    faviconHref: string;
    name: string;
    shortName: string;
    description: string;
  };

  layout: {
    header: {
      brand: {
        href: string;
        ariaLabel: string;
        logo: StaticAsset;
      };

      navigation: {
        ariaLabel: string;
        mobileAriaLabel: string;
        menuTitle: string;
        burgerAriaLabel: string;
        items: StaticLink[];
      };

      access: {
        href: string;
        label: string;
        ariaLabel: string;
      };
    };

    footer: {
      brandName: string;
      decoration: StaticAsset;
      navAriaLabel: string;
      links: StaticLink[];
      logo: StaticAsset;
      rightsReservedLabel: string;
    };
  };

  homePage: {
    hero: {
      title: string;
      description: string;
      image: StaticAsset;
    };
  };

  inscripcionPage: {
    hero: {
      title: string;
      description: string;
    };
    form: {
      title: string;
      description: string;
      fields: {
        studentFirstName: {
          label: string;
          placeholder: string;
        };
        studentLastName: {
          label: string;
          placeholder: string;
        };
        studentDni: {
          label: string;
          placeholder: string;
        };
        level: {
          label: string;
          options: string[];
        };
        responsibleType: {
          label: string;
          options: {
            tutor: string;
            parents: string;
          };
        };
        tutorFullName: {
          label: string;
          placeholder: string;
        };
        tutorDni: {
          label: string;
          placeholder: string;
        };
        fatherFullName: {
          label: string;
          placeholder: string;
        };
        fatherDni: {
          label: string;
          placeholder: string;
        };
        motherFullName: {
          label: string;
          placeholder: string;
        };
        motherDni: {
          label: string;
          placeholder: string;
        };
        contactPhone: {
          label: string;
          placeholder: string;
        };
        email: {
          label: string;
          placeholder: string;
        };
      };
      actions: {
        reset: string;
        continue: string;
        review: string;
        confirm: string;
      };
      modal: {
        title: string;
        description: string;
      };
      notifications: {
        successTitle: string;
        successMessage: string;
      };
    };
  };

  nosotrosPage: {
    hero: {
      title: string;
      description: string;
    };
    gallery: {
      title: string;
      description: string;
      items: (StaticAsset & {
        title: string;
        summary: string;
      })[];
    };
    sportsGallery: {
      title: string;
      description: string;
      items: (StaticAsset & {
        title: string;
        summary: string;
      })[];
    };
    facilitiesGallery: {
      title: string;
      description: string;
      items: (StaticAsset & {
        title: string;
        summary: string;
      })[];
    };
    whoWeAre: {
      title: string;
      description: string;
    };
    academicOffer: {
      title: string;
      description: string;
      levels: string[];
    };
    languagesAndSports: {
      title: string;
      description: string;
      languages: string[];
      sports: string[];
    };
    facilities: {
      title: string;
      description: string;
      items: string[];
    };
  };

  bienestarPage: {
    hero: {
      title: string;
      description: string;
    };
    orientation: {
      title: string;
      description: string;
    };

    scholarships: {
      title: string;
      description: string;
    };

    tutoring: {
      title: string;
      description: string;
    };

    activities: {
      title: string;
      description: string;
    };
  }

  noticiasPage: {
    hero: {
      title: string;
      description: string;
    };
    featuredCategories: string[];
    news: {
      title: string;
      description: string;
      items: {
        title: string;
        summary: string;
      }[];
    };
    studentWellbeing: {
      title: string;
      description: string;
      highlights: string[];
    };
  };

  contactoPage: {
    hero: {
      title: string;
      description: string;
    };

    channels: {
      website: {
        label: string;
        href: string;
      };
      whatsapp: {
        label: string;
        value: string;
        href: string;
      };
      socialMedia: {
        label: string;
        description: string;
        instagram: string;
        facebook: string;
      };
    };

    contactInfo: {
      address: {
        label: string;
        value: string;
      };
      phone: {
        label: string;
        value: string;
      };
      email: {
        label: string;
        value: string;
        href: string;
      };
    };

    employment: {
      title: string;
      description: string;
      instruction: string;
      subject: string;
    };

    quickMessageForm: {
      enabled: boolean;
      title: string;
      description: string;
      fields: {
        fullName: {
          label: string;
          placeholder: string;
        };
        email: {
          label: string;
          placeholder: string;
        };
        phone: {
          label: string;
          placeholder: string;
        };
        subject: {
          label: string;
          placeholder: string;
        };
        message: {
          label: string;
          placeholder: string;
        };
      };
      actions: {
        reset: string;
        continue: string;
        review: string;
        confirm: string;
      };
      modal: {
        title: string;
        description: string;
      };
      notifications: {
        successTitle: string;
        successMessage: string;
      };
    };

    map: {
      enabled: boolean;
      title: string;
      query: string;
    };
  };

  //empleo
  empleosPage: {
  hero: {
    title: string;
    description: string;
  };

  benefits: string[];

  profiles: string[];

  application: {
    email: string;
    message: string;
  };
};
};

export const defaultData: StaticData = {
  site: {
    faviconHref: "/favicon.ico",
    name: "Educar Para Transformar",
    shortName: "EPT",
    description: "Un nuevo ecosistema integral para el crecimiento.",
  },

  layout: {
    header: {
      brand: {
        href: "/",
        ariaLabel: "Ir al inicio de Educar Para Transformar",

        logo: {
          alt: "Logo de Educar Para Transformar",
          height: 106,
          src: brandLogoAsset,
          width: 140,
        },
      },

      navigation: {
        ariaLabel: "Navegacion principal",
        mobileAriaLabel: "Navegacion principal mobile",
        menuTitle: "Menú",
        burgerAriaLabel: "Abrir menú de navegación",

        items: [
          { label: "Inicio", href: "/" },
          { label: "Nosotros", href: "/nosotros" },
          { label: 'Bienestar', href: '/bienestar' },
          { label: "Contacto", href: "/contacto" },
          { label: "Noticias", href: "/noticias" },
          { label: "Inscripción", href: "/inscripcion" },
        ],
      },

      access: {
        href: "/inscripcion",
        label: "Acceder",
        ariaLabel: "Acceder al área privada",
      },
    },

    footer: {
      brandName: "Educar Para Transformar",

      decoration: {
        alt: "Trazo pincelado decorativo",
        height: 48,
        src: borderBrushAsset,
        width: 300,
      },

      navAriaLabel: "Enlaces del pie de pagina",

      links: [
        { label: "Inicio", href: "/" },
        { label: "Contacto", href: "/contacto" },
        { label: "Noticias", href: "/noticias" },
        {label: "Empleos",href: "/empleos"},
      ],

      logo: {
        alt: "Logo de Educar Para Transformar",
        height: 106,
        src: brandLogoAsset,
        width: 140,
      },

      rightsReservedLabel: "Todos los derechos reservados.",
    },
  },

  homePage: {
    hero: {
      title: "EDUCAR PARA TRANSFORMAR",

      description:
        "Formamos estudiantes con excelencia académica, innovación y valores humanos para enfrentar los desafíos del futuro.",

      image: {
        alt: "Formación institucional",
        height: 900,
        src: imagenHeroUnificada,
        width: 900,
      },
    },
  },
  inscripcionPage: {
    hero: {
      title: "Inscripción",
      description:
        "Completá el formulario de pre-inscripción para que nuestro equipo de admisiones se ponga en contacto con tu familia y reserve una vacante.",
    },
    form: {
      title: "Solicitud de Pre-Inscripción Ciclo Lectivo 2027",
      description:
        "Necesitamos estos datos para iniciar el proceso de admisión y orientarte según el nivel al que aspira el alumno.",
      fields: {
        studentFirstName: {
          label: "Nombre del alumno",
          placeholder: "Ej. Sofía",
        },
        studentLastName: {
          label: "Apellido del alumno",
          placeholder: "Ej. Pérez",
        },
        studentDni: {
          label: "DNI",
          placeholder: "Ej. 12345678",
        },
        level: {
          label: "Nivel al que aspira",
          options: ["Inicial", "Primario", "Secundario"],
        },
        responsibleType: {
          label: "Responsable de la inscripción",
          options: {
            tutor: "Tutor",
            parents: "Padre y madre",
          },
        },
        tutorFullName: {
          label: "Nombre y apellido del tutor",
          placeholder: "Ej. Ana Gómez",
        },
        tutorDni: {
          label: "DNI del tutor",
          placeholder: "Ej. 30123456",
        },
        fatherFullName: {
          label: "Nombre y apellido del padre",
          placeholder: "Ej. Juan Pérez",
        },
        fatherDni: {
          label: "DNI del padre",
          placeholder: "Ej. 28123456",
        },
        motherFullName: {
          label: "Nombre y apellido de la madre",
          placeholder: "Ej. Laura Gómez",
        },
        motherDni: {
          label: "DNI de la madre",
          placeholder: "Ej. 29123456",
        },
        contactPhone: {
          label: "Teléfono de contacto",
          placeholder: "Ej. 3624123456",
        },
        email: {
          label: "Correo electrónico",
          placeholder: "familia@email.com",
        },
      },
      actions: {
        reset: "Limpiar formulario",
        continue: "Revisar antes de enviar",
        review: "Volver a editar",
        confirm: "Enviar solicitud",
      },
      modal: {
        title: "Confirmar pre-inscripción",
        description:
          "Revisá los datos antes de enviar la solicitud de pre-inscripción.",
      },
      notifications: {
        successTitle: "Solicitud enviada",
        successMessage:
          'Recibimos la pre-inscripción de "{studentFullName}". Nos contactaremos pronto.',
      },
    },
  },
  nosotrosPage: {
    hero: {
      title: "Nosotros",
      description:
        "Conocé nuestra identidad institucional, propuesta educativa e instalaciones diseñadas para una formación integral.",
    },
    gallery: {
      title: "Una comunidad pensada para aprender y crecer",
      description:
        "Recorré los espacios y experiencias que integran nuestra propuesta educativa: aulas, deporte, idiomas e infraestructura para acompañar cada trayectoria.",
      items: [
        {
          title: "Comunidad educativa",
          summary:
            "Un entorno cercano donde estudiantes, familias y docentes construyen vínculos de confianza.",
          alt: "Estudiantes y docentes en un patio escolar con espacios verdes",
          height: nosotrosComunidadAsset.height,
          src: nosotrosComunidadAsset,
          width: nosotrosComunidadAsset.width,
        },
        {
          title: "Oferta académica integral",
          summary:
            "Inicial, Primario y Secundario con jornada extendida y acompañamiento en cada etapa.",
          alt: "Estudiantes de distintos niveles trabajando junto a una docente en un aula moderna",
          height: nosotrosOfertaAcademicaAsset.height,
          src: nosotrosOfertaAcademicaAsset,
          width: nosotrosOfertaAcademicaAsset.width,
        },
        {
          title: "Idiomas y deportes",
          summary:
            "Formación trilingüe y actividades deportivas para fortalecer disciplina, creatividad y bienestar.",
          alt: "Estudiantes practicando deportes y actividades de idioma en un campus escolar",
          height: nosotrosIdiomasDeportesAsset.height,
          src: nosotrosIdiomasDeportesAsset,
          width: nosotrosIdiomasDeportesAsset.width,
        },
        {
          title: "Instalaciones propias",
          summary:
            "Laboratorios, espacios deportivos, comedor, enfermería y servicios para una vida escolar completa.",
          alt: "Pasillo de instalaciones escolares modernas con laboratorios y espacios educativos",
          height: nosotrosInstalacionesAsset.height,
          src: nosotrosInstalacionesAsset,
          width: nosotrosInstalacionesAsset.width,
        },
      ],
    },
    sportsGallery: {
      title: "Deportes",
      description: "Galería de actividades deportivas y expresivas que forman parte de la propuesta integral.",
      items: [
        { title: "Atletismo", summary: "", alt: "Estudiantes practicando atletismo en una pista escolar", height: deporteAtletismoAsset.height, src: deporteAtletismoAsset, width: deporteAtletismoAsset.width },
        { title: "Natación", summary: "", alt: "Estudiantes practicando natación en una pileta escolar", height: deporteNatacionAsset.height, src: deporteNatacionAsset, width: deporteNatacionAsset.width },
        { title: "Fútbol", summary: "", alt: "Estudiantes practicando fútbol en una cancha escolar", height: deporteFutbolAsset.height, src: deporteFutbolAsset, width: deporteFutbolAsset.width },
        { title: "Artes marciales", summary: "", alt: "Estudiantes practicando artes marciales en un gimnasio escolar", height: deporteArtesMarcialesAsset.height, src: deporteArtesMarcialesAsset, width: deporteArtesMarcialesAsset.width },
        { title: "Vóleibol", summary: "", alt: "Estudiantes practicando vóleibol en un gimnasio escolar", height: deporteVoleibolAsset.height, src: deporteVoleibolAsset, width: deporteVoleibolAsset.width },
        { title: "Danza", summary: "", alt: "Estudiantes practicando danza en un espacio escolar", height: deporteDanzaAsset.height, src: deporteDanzaAsset, width: deporteDanzaAsset.width },
        { title: "Básquet", summary: "", alt: "Estudiantes practicando básquet en una cancha escolar", height: deporteBasquetAsset.height, src: deporteBasquetAsset, width: deporteBasquetAsset.width },
        { title: "Ajedrez", summary: "", alt: "Estudiantes jugando ajedrez en una biblioteca escolar", height: deporteAjedrezAsset.height, src: deporteAjedrezAsset, width: deporteAjedrezAsset.width },
      ],
    },
    facilitiesGallery: {
      title: "Instalaciones",
      description: "Galería de espacios e infraestructura para la vida académica, deportiva y cotidiana.",
      items: [
        { title: "Laboratorio de computación", summary: "", alt: "Laboratorio de computación escolar moderno", height: instalacionLaboratorioComputacionAsset.height, src: instalacionLaboratorioComputacionAsset, width: instalacionLaboratorioComputacionAsset.width },
        { title: "Laboratorio de física", summary: "", alt: "Laboratorio de física escolar moderno", height: instalacionLaboratorioFisicaAsset.height, src: instalacionLaboratorioFisicaAsset, width: instalacionLaboratorioFisicaAsset.width },
        { title: "Laboratorio de química", summary: "", alt: "Laboratorio de química escolar moderno", height: instalacionLaboratorioQuimicaAsset.height, src: instalacionLaboratorioQuimicaAsset, width: instalacionLaboratorioQuimicaAsset.width },
        { title: "Pileta de natación", summary: "", alt: "Pileta de natación escolar con carriles", height: instalacionPiletaNatacionAsset.height, src: instalacionPiletaNatacionAsset, width: instalacionPiletaNatacionAsset.width },
        { title: "Canchas de fútbol", summary: "", alt: "Canchas de fútbol escolares al aire libre", height: instalacionCanchasFutbolAsset.height, src: instalacionCanchasFutbolAsset, width: instalacionCanchasFutbolAsset.width },
        { title: "Pista de atletismo", summary: "", alt: "Pista de atletismo escolar al aire libre", height: instalacionPistaAtletismoAsset.height, src: instalacionPistaAtletismoAsset, width: instalacionPistaAtletismoAsset.width },
        { title: "Gimnasio cubierto", summary: "", alt: "Gimnasio cubierto escolar multisport", height: instalacionGimnasioCubiertoAsset.height, src: instalacionGimnasioCubiertoAsset, width: instalacionGimnasioCubiertoAsset.width },
        { title: "Servicio de comedor", summary: "", alt: "Comedor escolar moderno y luminoso", height: instalacionComedorAsset.height, src: instalacionComedorAsset, width: instalacionComedorAsset.width },
        { title: "Enfermería", summary: "", alt: "Enfermería escolar equipada", height: instalacionEnfermeriaAsset.height, src: instalacionEnfermeriaAsset, width: instalacionEnfermeriaAsset.width },
        { title: "Micros de traslado propio", summary: "", alt: "Micros escolares de traslado en ingreso institucional", height: instalacionMicrosTrasladoAsset.height, src: instalacionMicrosTrasladoAsset, width: instalacionMicrosTrasladoAsset.width },
      ],
    },
    whoWeAre: {
      title: "Quiénes somos",
      description:
        "Somos una institución de gestión privada de alta calidad educativa, ubicada en un entorno ideal en las afueras de la ciudad de Resistencia.",
    },
    academicOffer: {
      title: "Nuestra oferta educativa",
      description:
        "Brindamos educación de excelencia en los niveles Inicial, Primario y Secundario con jornada extendida.",
      levels: ["Nivel Inicial", "Nivel Primario", "Nivel Secundario"],
    },
    languagesAndSports: {
      title: "Idiomas y deportes",
      description:
        "Impulsamos una formación integral que combina desarrollo académico, idiomas y actividad física.",
      languages: ["Inglés", "Portugués", "Francés"],
      sports: [
        "Atletismo",
        "Natación",
        "Fútbol",
        "Artes marciales",
        "Vóleibol",
        "Danza",
        "Básquet",
        "Ajedrez",
      ],
    },
    facilities: {
      title: "Nuestras instalaciones",
      description:
        "Contamos con espacios e infraestructura preparados para acompañar cada etapa del aprendizaje y la vida escolar.",
      items: [
        "Laboratorio de computación",
        "Laboratorio de física",
        "Laboratorio de química",
        "Pileta de natación",
        "Canchas de fútbol",
        "Pista de atletismo",
        "Gimnasio cubierto",
        "Servicio de comedor",
        "Enfermería",
        "Micros de traslado propio",
      ],
    },
  },


  bienestarPage: {
    hero: {
      title: "Bienestar Estudiantil",
      description:
        "Nuestro compromiso va más allá de las aulas. Te ofrecemos herramientas y espacios de acompañamiento para tu salud mental, física y social durante toda tu trayectoria educativa.",
    },
    orientation: {
      title: "Orientación Vocacional y Psicológica",
      description:
        "Un espacio confidencial de escucha, contención y orientación para acompañarte en tus desafíos académicos y personales.",
    },

    scholarships: {
      title: "Becas y Apoyos Económicos",
      description:
        "Información, asesoramiento y gestión de beneficios institucionales, convenios y programas de ayuda para asegurar tu continuidad académica.",
    },

    tutoring: {
      title: "Tutorías y Apoyo Académico",
      description:
        "Acompañamiento personalizado con tutores docentes y pares para reforzar materias complejas y mejorar tus técnicas de estudio.",
    },

    activities: {
      title: "Talleres, Cultura y Deportes",
      description:
        "Actividades extracurriculares, recreativas y de integración para promover una vida universitaria saludable, activa y compartida.",
    },
  },


  noticiasPage: {
    hero: {
      title: "Noticias y bienestar estudiantil",
      description:
        "Compartimos novedades institucionales, avances de infraestructura y acciones orientadas al acompañamiento integral de nuestra comunidad educativa.",
    },
    featuredCategories: [
      "Novedades institucionales",
      "Bienestar estudiantil",
      "Infraestructura",
      "Convocatorias",
    ],
    news: {
      title: "Últimas noticias",
      description:
        "Conocé algunas de las novedades que marcan el crecimiento del proyecto Educar para Transformar.",
      items: [
        {
          title: "¡Avanzan las obras de nuestro Polideportivo!",
          summary:
            "Ya comenzamos a llenar la pileta de natación y a demarcar la pista de atletismo para que nuestros futuros alumnos disfruten del mejor deporte.",
        },
        {
          title: "Conocé nuestro Servicio de Apoyo Estudiantil",
          summary:
            'En "Educar para Transformar" el bienestar es prioridad. Contaremos con un equipo de profesionales dedicado a acompañar el desarrollo emocional y académico de los estudiantes.',
        },
        {
          title: "Abierta la Bolsa de Empleo",
          summary:
            "¿Sos docente o administrativo? Estamos conformando nuestro equipo de trabajo para el ciclo lectivo 2027. Dejanos tu CV en nuestra sección de Empleo.",
        },
      ],
    },
    studentWellbeing: {
      title: "Bienestar estudiantil",
      description:
        "Promovemos una experiencia escolar cuidada, cercana y atenta a las necesidades emocionales, sociales y académicas de cada estudiante.",
      highlights: [
        "Acompañamiento emocional y pedagógico",
        "Equipo profesional de apoyo estudiantil",
        "Seguimiento del desarrollo académico",
        "Espacios de escucha y orientación para familias",
      ],
    },
  },
  contactoPage: {
    hero: {
      title: "Comunicate con nosotros",
      description:
        "Nuestro equipo está disponible para responder todas tus consultas sobre matrículas, instalaciones, propuestas pedagógicas o procesos de admisión.",
    },

    channels: {
      website: {
        label: "Página web",
        href: "/contacto",
      },

      whatsapp: {
        label: "WhatsApp",
        value: "+54 9 362 4XX-XXXX",
        href: "https://wa.me/5493624XXXXXXX",
      },

      socialMedia: {
        label: "Redes sociales",
        description:
          "Seguinos en Instagram y Facebook como @EducarParaTransformar.",
        instagram: "@EducarParaTransformar",
        facebook: "@EducarParaTransformar",
      },
    },

    contactInfo: {
      address: {
        label: "Dirección",
        value: "Ruta Nacional 11, Km 1005, Afueras de Resistencia, Chaco.",
      },

      phone: {
        label: "Teléfono / WhatsApp",
        value: "+54 9 362 4XX-XXXX",
      },

      email: {
        label: "Correo electrónico",
        value: "admisiones@educarparatransformar.edu.ar",
        href: "mailto:admisiones@educarparatransformar.edu.ar",
      },
    },

    employment: {
      title: "Bolsa de empleo",
      description:
        "Estamos conformando nuestro equipo para acompañar el crecimiento institucional.",
      instruction:
        `Si querés postularte, envianos tus datos desde el formulario con el asunto "Bolsa de empleo" y contanos tu perfil, disponibilidad y área de interés.`,
      subject: "Bolsa de empleo",
    },

    quickMessageForm: {
      enabled: true,
      title: "Envíanos un mensaje rápido",
      description: "Completá el formulario para enviarnos tu consulta.",
      fields: {
        fullName: {
          label: "Nombre y apellido",
          placeholder: "Ej. Ana Pérez",
        },
        email: {
          label: "Correo electrónico",
          placeholder: "ana@email.com",
        },
        phone: {
          label: "Teléfono",
          placeholder: "+54 9 11 1234 5678",
        },
        subject: {
          label: "Asunto",
          placeholder: "Consulta por inscripción",
        },
        message: {
          label: "Mensaje",
          placeholder: "Contanos en qué podemos ayudarte...",
        },
      },
      actions: {
        reset: "Limpiar formulario",
        continue: "Revisar antes de enviar",
        review: "Volver a editar",
        confirm: "Enviar mensaje",
      },
      modal: {
        title: "Confirmar envío",
        description: "Revisá la información antes de confirmar el envío.",
      },
      notifications: {
        successTitle: "Mensaje enviado",
        successMessage: 'Recibimos tu consulta sobre "{subject}".',
      },
    },

    map: {
      enabled: true,
      title: "Dónde encontrarnos",
      query: "Ruta Nacional 11 Km 1005, Resistencia, Chaco, Argentina",
    },
  },
  empleosPage: {
  hero: {
    title: "Trabajá con nosotros",
    description:
      "Buscamos profesionales comprometidos con la educación y el desarrollo integral de nuestros estudiantes.",
  },

  benefits: [
    "Desarrollo profesional continuo",
    "Capacitación permanente",
    "Comunidad educativa colaborativa",
    "Participación en proyectos institucionales",
  ],

  profiles: [
    "Docentes",
    "Profesores",
    "Personal administrativo",
    "Equipo de apoyo institucional",
  ],

  application: {
    email: "rrhh@educarparatransformar.edu.ar",
    message:
      "Enviá tu CV actualizado indicando el área en la que te gustaría desempeñarte.",
  },
},
};

export function useStaticData() {
  return {
    defaultData,
  };
}
