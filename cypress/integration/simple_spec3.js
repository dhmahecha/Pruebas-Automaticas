describe('Prestashop', function() {
    it('Carrito de compras ' + Cypress.env("nombreAplicacion"), function() {
        cy.visit(Cypress.env("urlAplicacion"))
        //cy.visit("http://ec2-34-228-153-214.compute-1.amazonaws.com")
		cy.screenshot(Cypress.env("screen")+"1") 
        cy.contains('Iniciar sesión').click()
        cy.get('input[type="email"]').click({ force: true }).type("ppicapiedra@uniandes.edu.co")
        cy.get('input[name="password"]').click().type("Admin1234")
        cy.get('button[id="submit-login"]').click()
        cy.contains('Cerrar sesión')
        cy.contains('Art').click()
        cy.get('article[data-id-product="3"]').click()
        cy.contains('Añadir al carrito').click()
        cy.get('.cart-content-btn').contains('Pasar por caja').click()
        cy.contains('(1)')
        
		cy.screenshot(Cypress.env("screen")+"2")
    })

	
})


