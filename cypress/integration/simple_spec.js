describe('Paleta de colores', function() {
    it('Visitar la pagina paleta de colores y cambiar tonos', function() {
        cy.visit('https://dhmahecha.github.io/paletacolores/palette.html')
	cy.contains(' Generar nueva paleta').click()
	cy.screenshot(Cypress.env("screen")+"1") 
	cy.contains(' Generar nueva paleta').click()
	cy.screenshot(Cypress.env("screen")+"2")
    })
	
})


