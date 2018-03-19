describe('Paleta de colores', function() {
    it('Visitar la pagina ' + Cypress.env("nombreAplicacion"), function() {
        cy.visit(Cypress.env("urlAplicacion"))
		cy.screenshot(Cypress.env("screen")+"1") 
		cy.screenshot(Cypress.env("screen")+"2")
    })
	
})


