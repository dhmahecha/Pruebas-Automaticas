import test from 'ava'
import sinon from 'sinon'

import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {render, unmountComponentAtNode} from 'react-dom'

import validar from '../prestashop/js/validate';


test('Prueba de validación de nombre', t => {
    const output = validar.validate_isGenericName("Pedro Picapiedra")
    t.true(output)
})


test('Prueba de validación de contraseña', t => {
    const output = validar.validate_isPasswd("Contrasena2018")
    t.true(output)
})


test('Prueba de validación de contraseña', t => {
    const output = validar.validate_isPhoneNumber("6079999")
    t.true(output)
})
