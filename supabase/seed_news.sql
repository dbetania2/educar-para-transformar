-- Seed SQL legacy de noticias para EducAR para Transformar.
-- Para produccion, usar npm run seed:news: ese script sube las imagenes a Supabase Storage y guarda URLs publicas del bucket news-assets.
-- Este SQL queda solo como fallback manual y no debe usarse si queres conservar URLs de Storage.

begin;

insert into public.news (
  id,
  title,
  description_html,
  image_url,
  file_url,
  file_name,
  file_type,
  is_published,
  created_by,
  created_at,
  updated_at
)
values
  (
    '8c0cfbd6-3a15-4f19-b8b1-6a2bbefef101',
    'Taller comunitario de aprendizaje',
    '<p><strong>Una jornada de trabajo colaborativo</strong> reunió a estudiantes, docentes y familias alrededor de consignas breves, materiales concretos y acompañamiento personalizado.</p><ul><li>Resolución de actividades en grupos pequeños.</li><li>Intercambio de estrategias para sostener el aprendizaje en casa.</li><li>Guías de seguimiento compartidas con el equipo docente.</li></ul><p>Para ampliar recursos pedagógicos, podés visitar <a href="https://www.educ.ar/">Educ.ar</a>.</p>',
    '/news/noticia-taller-comunitario.png',
    '/news/noticia-taller-comunitario.png',
    'noticia-taller-comunitario.png',
    'image',
    true,
    null,
    now() - interval '11 days',
    now() - interval '11 days'
  ),
  (
    '8c0cfbd6-3a15-4f19-b8b1-6a2bbefef102',
    'Nueva clase de alfabetización digital',
    '<p><strong>La propuesta de alfabetización digital</strong> trabaja con herramientas que sirven para estudiar, organizar información y comunicarse de manera segura.</p><ul><li>Uso básico de procesadores de texto y presentaciones.</li><li>Buenas prácticas para cuidar datos y cuentas.</li><li>Ejercicios guiados con apoyo del docente.</li></ul><p>Si querés revisar materiales de referencia, consultá <a href="https://www.educ.ar/">Educ.ar</a> o escribinos a <a href="mailto:comunidad@educarparatransformar.edu.ar">comunidad@educarparatransformar.edu.ar</a>.</p>',
    '/news/noticia-alfabetizacion-digital.png',
    '/news/noticia-alfabetizacion-digital.png',
    'noticia-alfabetizacion-digital.png',
    'image',
    true,
    null,
    now() - interval '10 days',
    now() - interval '10 days'
  ),
  (
    '8c0cfbd6-3a15-4f19-b8b1-6a2bbefef103',
    'Entrega de útiles escolares',
    '<p><strong>Recibimos y organizamos útiles escolares</strong> para acompañar trayectorias educativas de distintos niveles y sostener la participación cotidiana en clase.</p><ul><li>Cuadernos, carpetas y elementos de escritura.</li><li>Armado de kits según las necesidades de cada curso.</li><li>Seguimiento junto con referentes familiares.</li></ul><p>La iniciativa forma parte del acompañamiento integral que sostiene la institución durante todo el ciclo lectivo.</p>',
    '/news/noticia-utiles-escolares.png',
    '/news/noticia-utiles-escolares.png',
    'noticia-utiles-escolares.png',
    'image',
    true,
    null,
    now() - interval '9 days',
    now() - interval '9 days'
  ),
  (
    '8c0cfbd6-3a15-4f19-b8b1-6a2bbefef104',
    'Formación docente en nuevas estrategias',
    '<p><strong>El equipo docente participó de una instancia de planificación</strong> centrada en seguimiento, evaluación y acompañamiento personalizado.</p><ul><li>Lectura compartida de casos pedagógicos.</li><li>Diseño de secuencias de aprendizaje más claras.</li><li>Acuerdos de trabajo entre áreas y niveles.</li></ul><p>El objetivo es mejorar la experiencia de aprendizaje y fortalecer el trabajo articulado con las familias.</p>',
    '/news/noticia-formacion-docente.png',
    '/news/noticia-formacion-docente.png',
    'noticia-formacion-docente.png',
    'image',
    true,
    null,
    now() - interval '8 days',
    now() - interval '8 days'
  ),
  (
    '8c0cfbd6-3a15-4f19-b8b1-6a2bbefef105',
    'Lectura al aire libre',
    '<p><strong>Compartimos una actividad de lectura en un espacio abierto</strong> pensada para promover el hábito lector desde una experiencia cercana y participativa.</p><ul><li>Selección de textos breves y accesibles.</li><li>Intercambio grupal de ideas y preguntas.</li><li>Producciones escritas cortas para cerrar la jornada.</li></ul><p>Para seguir explorando propuestas de lectura, podés entrar a <a href="https://www.educ.ar/">Educ.ar</a>.</p>',
    '/news/noticia-lectura-aire-libre.png',
    '/news/noticia-lectura-aire-libre.png',
    'noticia-lectura-aire-libre.png',
    'image',
    true,
    null,
    now() - interval '7 days',
    now() - interval '7 days'
  ),
  (
    '8c0cfbd6-3a15-4f19-b8b1-6a2bbefef106',
    'Ciencias en el aula',
    '<p><strong>Desarrollamos una actividad de ciencias</strong> con materiales simples para observar, registrar y conversar sobre fenómenos del entorno cotidiano.</p><ul><li>Experimentos sencillos con hipótesis y resultados.</li><li>Registro de observaciones en hojas de trabajo.</li><li>Conclusiones compartidas en puesta en común.</li></ul><p>La curiosidad científica aparece cuando el aula se organiza para mirar, preguntar y volver a probar.</p>',
    '/news/noticia-ciencias-aula.png',
    '/news/noticia-ciencias-aula.png',
    'noticia-ciencias-aula.png',
    'image',
    true,
    null,
    now() - interval '6 days',
    now() - interval '6 days'
  ),
  (
    '8c0cfbd6-3a15-4f19-b8b1-6a2bbefef107',
    'Encuentro con familias',
    '<p><strong>Realizamos un encuentro con familias</strong> para compartir avances, escuchar necesidades y coordinar nuevas acciones de acompañamiento escolar.</p><ul><li>Espacio de diálogo abierto con el equipo institucional.</li><li>Revisión de trayectorias y acuerdos de seguimiento.</li><li>Canales directos para consultas y comunicación.</li></ul><p>Si necesitás escribirnos, podés usar <a href="mailto:comunidad@educarparatransformar.edu.ar">comunidad@educarparatransformar.edu.ar</a>.</p>',
    '/news/noticia-familias-comunidad.png',
    '/news/noticia-familias-comunidad.png',
    'noticia-familias-comunidad.png',
    'image',
    true,
    null,
    now() - interval '5 days',
    now() - interval '5 days'
  ),
  (
    '8c0cfbd6-3a15-4f19-b8b1-6a2bbefef108',
    'Arte y creatividad en clase',
    '<p><strong>Incorporamos una propuesta creativa con materiales artísticos</strong> para trabajar expresión, motricidad fina y producción colaborativa.</p><ul><li>Exploración de técnicas mixtas y colores.</li><li>Producciones individuales con cierre grupal.</li><li>Exposición de trabajos para compartir procesos.</li></ul><p>La actividad permitió que cada estudiante explore ideas propias y comparta sus producciones con el grupo.</p>',
    '/news/noticia-arte-creatividad.png',
    '/news/noticia-arte-creatividad.png',
    'noticia-arte-creatividad.png',
    'image',
    true,
    null,
    now() - interval '4 days',
    now() - interval '4 days'
  ),
  (
    '8c0cfbd6-3a15-4f19-b8b1-6a2bbefef109',
    'Taller comunitario de aprendizaje',
    '<p><strong>Este taller amplió el trabajo en comunidad</strong> con instancias de lectura, resolución de consignas y acompañamiento personalizado en pequeños grupos.</p><ul><li>Materiales impresos y digitales para distintos ritmos.</li><li>Trabajo conjunto entre familias y docentes.</li><li>Orientaciones para continuar el proceso en casa.</li></ul><p>Para revisar más recursos pedagógicos, visitá <a href="https://www.educ.ar/">Educ.ar</a>.</p>',
    '/news/noticia-taller-comunitario-2.png',
    '/news/noticia-taller-comunitario-2.png',
    'noticia-taller-comunitario-2.png',
    'image',
    true,
    null,
    now() - interval '3 days',
    now() - interval '3 days'
  ),
  (
    '8c0cfbd6-3a15-4f19-b8b1-6a2bbefef110',
    'Laboratorio de alfabetización digital',
    '<p><strong>El laboratorio digital</strong> ofreció una experiencia guiada para usar herramientas de estudio, organizar archivos y producir contenidos simples.</p><ul><li>Edición básica de textos y presentaciones.</li><li>Uso responsable de internet y cuentas.</li><li>Prácticas acompañadas por el equipo docente.</li></ul><p>Si querés recibir novedades, escribinos a <a href="mailto:comunidad@educarparatransformar.edu.ar">comunidad@educarparatransformar.edu.ar</a>.</p>',
    '/news/noticia-alfabetizacion-digital-2.png',
    '/news/noticia-alfabetizacion-digital-2.png',
    'noticia-alfabetizacion-digital-2.png',
    'image',
    true,
    null,
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    '8c0cfbd6-3a15-4f19-b8b1-6a2bbefef111',
    'Lectura compartida al aire libre',
    '<p><strong>La lectura compartida al aire libre</strong> sumó textos, conversación y escritura breve en un entorno distendido, pensado para sostener el interés lector.</p><ul><li>Selección de textos con distintas temáticas.</li><li>Rondas de lectura en voz alta.</li><li>Breves producciones para cerrar el encuentro.</li></ul><p>Podés encontrar más propuestas en <a href="https://www.educ.ar/">Educ.ar</a>.</p>',
    '/news/noticia-lectura-aire-libre-2.png',
    '/news/noticia-lectura-aire-libre-2.png',
    'noticia-lectura-aire-libre-2.png',
    'image',
    true,
    null,
    now() - interval '1 days',
    now() - interval '1 days'
  ),
  (
    '8c0cfbd6-3a15-4f19-b8b1-6a2bbefef112',
    'Mesa de familias y referentes',
    '<p><strong>La mesa de trabajo con familias y referentes</strong> permitió revisar avances, acordar prioridades y abrir nuevos canales de acompañamiento para el año en curso.</p><ul><li>Diálogo con familias y equipo pedagógico.</li><li>Definición de compromisos de seguimiento.</li><li>Espacio de escucha para dudas y sugerencias.</li></ul><p>Para contacto directo, podés escribir a <a href="mailto:comunidad@educarparatransformar.edu.ar">comunidad@educarparatransformar.edu.ar</a>.</p>',
    '/news/noticia-encuentro-familias-2.png',
    '/news/noticia-encuentro-familias-2.png',
    'noticia-encuentro-familias-2.png',
    'image',
    true,
    null,
    now(),
    now()
  )
on conflict (id) do update
set
  title = excluded.title,
  description_html = excluded.description_html,
  image_url = excluded.image_url,
  file_url = excluded.file_url,
  file_name = excluded.file_name,
  file_type = excluded.file_type,
  is_published = excluded.is_published,
  updated_at = now();

commit;
