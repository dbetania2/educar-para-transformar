describe('Prueba Dinámica de Interfaz - Alta de Alumno (REQ-ALU-01.1)', () => {

  beforeEach(() => {
    // 1. Visitar la pantalla de login e iniciar sesión
    cy.visit('/login');
    cy.get('input[name="email"]').type('preceptor@educar.edu.ar');
    cy.get('input[name="password"]').type('Admin1234!');
    cy.get('button[type="submit"]').click();
    
    // Confirmar que ingresó al panel
    cy.url().should('include', '/dashboard');
  });

  it('Debe permitir registrar un nuevo alumno correctamente con datos válidos', () => {
    // 2. Navegar al formulario de Alta de Alumno
    cy.visit('/alumnos/nuevo');

    // 3. Simular la carga de datos por un usuario real
    cy.get('input[name="nombre"]').type('Carlos');
    cy.get('input[name="apellido"]').type('Gómez');
    cy.get('input[name="dni"]').type('45890123');
    cy.get('input[name="fechaNacimiento"]').type('2012-05-14');
    cy.get('input[name="domicilio"]').type('Av. Colón 1234');
    cy.get('input[name="telefono"]').type('3516123456');
    cy.get('input[name="correo"]').type('carlos.gomez@gmail.com');
    cy.get('select[name="nivel"]').select('Secundario');
    cy.get('select[name="curso"]').select('1er Año A');

    // 4. Hacer clic en el botón de guardar
    cy.get('button').contains('Guardar Alumno').click();

    // 5. Verificación (Assert): Validar mensaje de éxito en la interfaz
    cy.contains('Alumno registrado exitosamente').should('be.visible');
  });

});

