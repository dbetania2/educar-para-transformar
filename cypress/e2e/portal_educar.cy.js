describe('Pruebas Dinámicas del Sistema - Centro Educativo "Educar para Transformar"', () => {

  it('1. Debe cargar la página principal institucional y su navegación', () => {
    cy.visit('/');
    cy.title().should('include', 'Educar');
    cy.get('header').should('be.visible');
    cy.contains('Educar Para Transformar').should('be.visible');
  });

  it('2. Debe permitir completar y validar el formulario de contacto (Simulación de Usuario Real)', () => {
    cy.visit('/contacto');

    // Verificar visibilidad de la sección
    cy.contains('Atención personalizada').should('be.visible');

    // Completar campos del formulario
    cy.get('input[placeholder="Ej. Ana Pérez"]').type('Carlos Gómez');
    cy.get('input[placeholder="ana@email.com"]').type('carlos.gomez@test.com');
    cy.get('input[placeholder="+54 9 11 1234 5678"]').type('3516123456');
    cy.get('input[placeholder="Consulta por inscripción"]').type('Consulta de vacante ciclo lectivo');
    cy.get('textarea[placeholder="Contanos en qué podemos ayudarte..."]').type(
      'Buenas tardes, quisiera consultar los requisitos y disponibilidad para el nivel secundario.'
    );

    // Clic en el botón de revisión
    cy.contains('button', 'Revisar antes de enviar').click();

    // Assert: Debe abrir el modal de confirmación con los datos cargados
    cy.contains('Confirmar envío').should('be.visible');
    cy.contains('Carlos Gómez').should('be.visible');
    cy.contains('carlos.gomez@test.com').should('be.visible');

    // Volver a edición y limpiar el formulario
    cy.contains('button', 'Volver a editar').click();
    cy.contains('button', 'Limpiar formulario').click();

    // Assert: El formulario vuelve al estado inicial
    cy.get('input[placeholder="Ej. Ana Pérez"]').should('have.value', '');
  });

  it('3. Debe cargar la sección de pre-inscripción escolar', () => {
    cy.visit('/inscripcion');
    cy.url().should('include', '/inscripcion');
    cy.contains('Pre-inscripción').should('be.visible');
  });

  it('4. Debe mostrar el panel de acceso administrativo con campos de credenciales', () => {
    cy.visit('/admin');
    cy.url().should('include', '/admin');
    cy.get('input[type="password"], input[name="password"]').should('exist');
  });

});

