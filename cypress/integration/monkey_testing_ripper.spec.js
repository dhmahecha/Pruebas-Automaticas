describe('Prueba de monkeys en', function() {
    it('Envío de monkeys en ' + Cypress.env("urlAplicacion"), function() {
		cy.visit(Cypress.env("urlAplicacion"));
        cy.contains('Cerrar').click();
        cy.wait(1000);
		randomEvent(10);
    })
})
function randomClick(monkeysLeft) {
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };

    var monkeysLeft = monkeysLeft;
    if(monkeysLeft > 0) {
        cy.get('a').then($links => {
            var randomLink = $links.get(getRandomInt(0, $links.length));
            if(!Cypress.Dom.isHidden(randomLink)) {
                cy.wrap(randomLink).click({force: true});
                monkeysLeft = monkeysLeft - 1;
				cy.log(monkeysLeft);
            }
            setTimeout(randomClick, 1000, monkeysLeft);
        });
    }   
}

function randomEvent(monkeysLeft) {
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };

	
    var funcion = getRandomInt(0, 3);  
	cy.log("funcion: " + funcion);

    var monkeysLeft = monkeysLeft;
    if(monkeysLeft > 0) {

	cy.screenshot(Cypress.env("screen")+"1");   
	if(funcion == 0){
		cy.get('a').then($links => {
		    var randomLink = $links.get(getRandomInt(0, $links.length));
		    if(!Cypress.Dom.isHidden(randomLink)) {
		        cy.wrap(randomLink).click({force: true});
			monkeysLeft = monkeysLeft - 1;
		    }
		    setTimeout(randomEvent, 1000, monkeysLeft);
		});
	}

	if(funcion == 1){
		cy.get('button').then($buttons => {
		    var randomButton = $buttons.get(getRandomInt(0, $buttons.length));
		    if(!Cypress.Dom.isHidden(randomButton)) {
		        cy.wrap(randomButton).click({force: true});
		    }
		    setTimeout(randomEvent, 1000, monkeysLeft);
		});
	}

	if(funcion == 2){
		var input = cy.get('input');	
		input.then($inputs => {
		    var randomInput = $inputs.get(getRandomInt(0, $inputs.length));
		    if(!Cypress.Dom.isHidden(randomInput)) {
			//if(!cy.wrap(randomInput).get('input[type="checkbox"]')){
				cy.wrap(randomInput).click({ force: true }).type("Prueba taller 4")
				//.not('input[role="combobox"]')
		    	//}
		    }	
		    setTimeout(randomEvent, 1000, monkeysLeft);
		});
	}

	if(funcion == 3){
		cy.get('select').then($selects => {
		    var randomSelect = $selects.get(getRandomInt(0, $selects.length));
		    if(!Cypress.Dom.isHidden(randomSelect)) {
			//if(cy.wrap(randomSelect).children()){
				cy.wrap(randomSelect).children();
			//}
		    }
		    setTimeout(randomEvent, 1000, monkeysLeft);
		});
	}
	monkeysLeft = monkeysLeft - 1;
	cy.log(monkeysLeft);
	cy.screenshot(Cypress.env("screen")+"2");
    }   
}