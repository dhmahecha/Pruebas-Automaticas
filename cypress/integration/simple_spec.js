describe('Prestashop', function() {
    it('Registro de usuario ' + Cypress.env("nombreAplicacion"), function() {
        cy.visit(Cypress.env("urlAplicacion"))
        //cy.visit("http://ec2-34-228-153-214.compute-1.amazonaws.com")
		cy.screenshot(Cypress.env("screen")+"1") 
        cy.contains('Iniciar sesión').click()
        cy.contains('¿No tiene una cuenta? Cree una aquí').click()
        cy.get('input[name="id_gender"]').first().check()
        cy.get('input[name="firstname"]').click().type("Pedro")
        cy.get('input[name="lastname"]').click().type("Picapiedra")
        cy.get('input[name="password"]').click().type("Admin1234")
        cy.get('input[type="email"]').click({ force: true }).type("ppicapiedra@uniandes.edu.co")
        cy.get('input[name="birthday"]').type("01/01/1980")
        cy.contains('Guardar').click()
		cy.screenshot(Cypress.env("screen")+"2")
    })
})


