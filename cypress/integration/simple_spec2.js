describe('Prestashop', function() {
    it('Login Fallido ' + Cypress.env("nombreAplicacion"), function() {
        cy.visit(Cypress.env("urlAplicacion"))
        //cy.visit("http://ec2-34-228-153-214.compute-1.amazonaws.com")
		cy.screenshot(Cypress.env("screen")+"1") 
        cy.contains('Iniciar sesión').click()
        cy.get('input[type="email"]').click({ force: true }).type("ppicapiedra@uniandes.edu.co")
        cy.get('input[name="password"]').click().type("Admin12345")
        cy.get('button[id="submit-login"]').click()
        cy.contains('Error de autenticación.')
        
		cy.screenshot(Cypress.env("screen")+"2")
    })
	
})


