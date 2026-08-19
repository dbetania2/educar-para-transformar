#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(path) {
  if (!existsSync(path)) return;

    const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

const NEWS_BUCKET = "news-assets";
const NEWS_ASSET_DIR = "scripts/assets/news";

const CONTENT_TYPES = {
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function getContentType(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return CONTENT_TYPES[extension] ?? "application/octet-stream";
}

async function getNewsAssetPublicUrl(supabase, fileName) {
  const localPath = NEWS_ASSET_DIR + "/" + fileName;

  if (existsSync(localPath)) {
    const upload = await supabase.storage.from(NEWS_BUCKET).upload(fileName, readFileSync(localPath), {
      contentType: getContentType(fileName),
      upsert: true,
    });

    if (upload.error) {
      throw new Error("No se pudo subir " + fileName + " a Supabase Storage: " + upload.error.message);
    }
  }

  const { data } = supabase.storage.from(NEWS_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

async function withStorageAssetUrls(supabase, rows) {
  return Promise.all(rows.map(async (row) => {
    if (!row.file_name) return row;

    const publicUrl = await getNewsAssetPublicUrl(supabase, row.file_name);
    return {
      ...row,
      image_url: publicUrl,
      file_url: publicUrl,
    };
  }));
}

const newsRows = [
  {
    id: "8c0cfbd6-3a15-4f19-b8b1-6a2bbefef101",
    title: "Taller comunitario de aprendizaje",
    description_html: "<p><strong>Una jornada de trabajo colaborativo</strong> reunió a estudiantes, docentes y familias alrededor de consignas breves, materiales concretos y acompañamiento personalizado.</p><ul><li>Resolución de actividades en grupos pequeños.</li><li>Intercambio de estrategias para sostener el aprendizaje en casa.</li><li>Guías de seguimiento compartidas con el equipo docente.</li></ul><p>Para ampliar recursos pedagógicos, podés visitar <a href=\"https://www.educ.ar/\">Educ.ar</a>.</p>",
    image_url: "/news/noticia-taller-comunitario.png",
    file_url: "/news/noticia-taller-comunitario.png",
    file_name: "noticia-taller-comunitario.png",
    file_type: "image",
    is_published: true,
    created_by: null,
    created_at: daysAgo(11),
    updated_at: daysAgo(11),
  },
  {
    id: "8c0cfbd6-3a15-4f19-b8b1-6a2bbefef102",
    title: "Nueva clase de alfabetización digital",
    description_html: "<p><strong>La propuesta de alfabetización digital</strong> trabaja con herramientas que sirven para estudiar, organizar información y comunicarse de manera segura.</p><ul><li>Uso básico de procesadores de texto y presentaciones.</li><li>Buenas prácticas para cuidar datos y cuentas.</li><li>Ejercicios guiados con apoyo del docente.</li></ul><p>Si querés revisar materiales de referencia, consultá <a href=\"https://www.educ.ar/\">Educ.ar</a> o escribinos a <a href=\"mailto:comunidad@educarparatransformar.edu.ar\">comunidad@educarparatransformar.edu.ar</a>.</p>",
    image_url: "/news/noticia-alfabetizacion-digital.png",
    file_url: "/news/noticia-alfabetizacion-digital.png",
    file_name: "noticia-alfabetizacion-digital.png",
    file_type: "image",
    is_published: true,
    created_by: null,
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
  },
  {
    id: "8c0cfbd6-3a15-4f19-b8b1-6a2bbefef103",
    title: "Entrega de útiles escolares",
    description_html: "<p><strong>Recibimos y organizamos útiles escolares</strong> para acompañar trayectorias educativas de distintos niveles y sostener la participación cotidiana en clase.</p><ul><li>Cuadernos, carpetas y elementos de escritura.</li><li>Armado de kits según las necesidades de cada curso.</li><li>Seguimiento junto con referentes familiares.</li></ul><p>La iniciativa forma parte del acompañamiento integral que sostiene la institución durante todo el ciclo lectivo.</p>",
    image_url: "/news/noticia-utiles-escolares.png",
    file_url: "/news/noticia-utiles-escolares.png",
    file_name: "noticia-utiles-escolares.png",
    file_type: "image",
    is_published: true,
    created_by: null,
    created_at: daysAgo(9),
    updated_at: daysAgo(9),
  },
  {
    id: "8c0cfbd6-3a15-4f19-b8b1-6a2bbefef104",
    title: "Formación docente en nuevas estrategias",
    description_html: "<p><strong>El equipo docente participó de una instancia de planificación</strong> centrada en seguimiento, evaluación y acompañamiento personalizado.</p><ul><li>Lectura compartida de casos pedagógicos.</li><li>Diseño de secuencias de aprendizaje más claras.</li><li>Acuerdos de trabajo entre áreas y niveles.</li></ul><p>El objetivo es mejorar la experiencia de aprendizaje y fortalecer el trabajo articulado con las familias.</p>",
    image_url: "/news/noticia-formacion-docente.png",
    file_url: "/news/noticia-formacion-docente.png",
    file_name: "noticia-formacion-docente.png",
    file_type: "image",
    is_published: true,
    created_by: null,
    created_at: daysAgo(8),
    updated_at: daysAgo(8),
  },
  {
    id: "8c0cfbd6-3a15-4f19-b8b1-6a2bbefef105",
    title: "Lectura al aire libre",
    description_html: "<p><strong>Compartimos una actividad de lectura en un espacio abierto</strong> pensada para promover el hábito lector desde una experiencia cercana y participativa.</p><ul><li>Selección de textos breves y accesibles.</li><li>Intercambio grupal de ideas y preguntas.</li><li>Producciones escritas cortas para cerrar la jornada.</li></ul><p>Para seguir explorando propuestas de lectura, podés entrar a <a href=\"https://www.educ.ar/\">Educ.ar</a>.</p>",
    image_url: "/news/noticia-lectura-aire-libre.png",
    file_url: "/news/noticia-lectura-aire-libre.png",
    file_name: "noticia-lectura-aire-libre.png",
    file_type: "image",
    is_published: true,
    created_by: null,
    created_at: daysAgo(7),
    updated_at: daysAgo(7),
  },
  {
    id: "8c0cfbd6-3a15-4f19-b8b1-6a2bbefef106",
    title: "Ciencias en el aula",
    description_html: "<p><strong>Desarrollamos una actividad de ciencias</strong> con materiales simples para observar, registrar y conversar sobre fenómenos del entorno cotidiano.</p><ul><li>Experimentos sencillos con hipótesis y resultados.</li><li>Registro de observaciones en hojas de trabajo.</li><li>Conclusiones compartidas en puesta en común.</li></ul><p>La curiosidad científica aparece cuando el aula se organiza para mirar, preguntar y volver a probar.</p>",
    image_url: "/news/noticia-ciencias-aula.png",
    file_url: "/news/noticia-ciencias-aula.png",
    file_name: "noticia-ciencias-aula.png",
    file_type: "image",
    is_published: true,
    created_by: null,
    created_at: daysAgo(6),
    updated_at: daysAgo(6),
  },
  {
    id: "8c0cfbd6-3a15-4f19-b8b1-6a2bbefef107",
    title: "Encuentro con familias",
    description_html: "<p><strong>Realizamos un encuentro con familias</strong> para compartir avances, escuchar necesidades y coordinar nuevas acciones de acompañamiento escolar.</p><ul><li>Espacio de diálogo abierto con el equipo institucional.</li><li>Revisión de trayectorias y acuerdos de seguimiento.</li><li>Canales directos para consultas y comunicación.</li></ul><p>Si necesitás escribirnos, podés usar <a href=\"mailto:comunidad@educarparatransformar.edu.ar\">comunidad@educarparatransformar.edu.ar</a>.</p>",
    image_url: "/news/noticia-familias-comunidad.png",
    file_url: "/news/noticia-familias-comunidad.png",
    file_name: "noticia-familias-comunidad.png",
    file_type: "image",
    is_published: true,
    created_by: null,
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
  },
  {
    id: "8c0cfbd6-3a15-4f19-b8b1-6a2bbefef108",
    title: "Arte y creatividad en clase",
    description_html: "<p><strong>Incorporamos una propuesta creativa con materiales artísticos</strong> para trabajar expresión, motricidad fina y producción colaborativa.</p><ul><li>Exploración de técnicas mixtas y colores.</li><li>Producciones individuales con cierre grupal.</li><li>Exposición de trabajos para compartir procesos.</li></ul><p>La actividad permitió que cada estudiante explore ideas propias y comparta sus producciones con el grupo.</p>",
    image_url: "/news/noticia-arte-creatividad.png",
    file_url: "/news/noticia-arte-creatividad.png",
    file_name: "noticia-arte-creatividad.png",
    file_type: "image",
    is_published: true,
    created_by: null,
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
  },
  {
    id: "8c0cfbd6-3a15-4f19-b8b1-6a2bbefef109",
    title: "Taller comunitario de aprendizaje",
    description_html: "<p><strong>Este taller amplió el trabajo en comunidad</strong> con instancias de lectura, resolución de consignas y acompañamiento personalizado en pequeños grupos.</p><ul><li>Materiales impresos y digitales para distintos ritmos.</li><li>Trabajo conjunto entre familias y docentes.</li><li>Orientaciones para continuar el proceso en casa.</li></ul><p>Para revisar más recursos pedagógicos, visitá <a href=\"https://www.educ.ar/\">Educ.ar</a>.</p>",
    image_url: "/news/noticia-taller-comunitario-2.png",
    file_url: "/news/noticia-taller-comunitario-2.png",
    file_name: "noticia-taller-comunitario-2.png",
    file_type: "image",
    is_published: true,
    created_by: null,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
  },
  {
    id: "8c0cfbd6-3a15-4f19-b8b1-6a2bbefef110",
    title: "Laboratorio de alfabetización digital",
    description_html: "<p><strong>El laboratorio digital</strong> ofreció una experiencia guiada para usar herramientas de estudio, organizar archivos y producir contenidos simples.</p><ul><li>Edición básica de textos y presentaciones.</li><li>Uso responsable de internet y cuentas.</li><li>Prácticas acompañadas por el equipo docente.</li></ul><p>Si querés recibir novedades, escribinos a <a href=\"mailto:comunidad@educarparatransformar.edu.ar\">comunidad@educarparatransformar.edu.ar</a>.</p>",
    image_url: "/news/noticia-alfabetizacion-digital-2.png",
    file_url: "/news/noticia-alfabetizacion-digital-2.png",
    file_name: "noticia-alfabetizacion-digital-2.png",
    file_type: "image",
    is_published: true,
    created_by: null,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
  },
  {
    id: "8c0cfbd6-3a15-4f19-b8b1-6a2bbefef111",
    title: "Lectura compartida al aire libre",
    description_html: "<p><strong>La lectura compartida al aire libre</strong> sumó textos, conversación y escritura breve en un entorno distendido, pensado para sostener el interés lector.</p><ul><li>Selección de textos con distintas temáticas.</li><li>Rondas de lectura en voz alta.</li><li>Breves producciones para cerrar el encuentro.</li></ul><p>Podés encontrar más propuestas en <a href=\"https://www.educ.ar/\">Educ.ar</a>.</p>",
    image_url: "/news/noticia-lectura-aire-libre-2.png",
    file_url: "/news/noticia-lectura-aire-libre-2.png",
    file_name: "noticia-lectura-aire-libre-2.png",
    file_type: "image",
    is_published: true,
    created_by: null,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
  {
    id: "8c0cfbd6-3a15-4f19-b8b1-6a2bbefef112",
    title: "Mesa de familias y referentes",
    description_html: "<p><strong>La mesa de trabajo con familias y referentes</strong> permitió revisar avances, acordar prioridades y abrir nuevos canales de acompañamiento para el año en curso.</p><ul><li>Diálogo con familias y equipo pedagógico.</li><li>Definición de compromisos de seguimiento.</li><li>Espacio de escucha para dudas y sugerencias.</li></ul><p>Para contacto directo, podés escribir a <a href=\"mailto:comunidad@educarparatransformar.edu.ar\">comunidad@educarparatransformar.edu.ar</a>.</p>",
    image_url: "/news/noticia-encuentro-familias-2.png",
    file_url: "/news/noticia-encuentro-familias-2.png",
    file_name: "noticia-encuentro-familias-2.png",
    file_type: "image",
    is_published: true,
    created_by: null,
    created_at: daysAgo(0),
    updated_at: daysAgo(0),
  }
];

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const newsRowsWithStorageAssets = await withStorageAssetUrls(supabase, newsRows);

const { data, error } = await supabase.from("news").upsert(newsRowsWithStorageAssets, { onConflict: "id" }).select("id, title, image_url");

if (error) {
  throw new Error("No se pudieron crear las noticias seed: " + error.message);
}

console.log("Noticias seed creadas/actualizadas: " + data.length);
for (const row of data) {
  console.log("- " + row.title + " (" + row.id + ")");
}
