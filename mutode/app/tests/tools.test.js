import test from 'ava'
import sinon from 'sinon'

import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {render, unmountComponentAtNode} from 'react-dom'

import tools from '../prestashop/js/tools';


test('Verificar si el valor esta en el arreglo', t => {
    var arreglo = new Array(1,2,3,4,5);
    const output = tools.in_array(1,arreglo)
    console.log(output);
    t.true(output)
})

test('Verificar valor precisión techo', t => {
    const output = tools.ceilf(10000.77777,2)
    t.true(output == 10000.78)
})

test('Verificar valor precisión piso', t => {
    const output = tools.floorf(10000.77777,2)
    t.true(output == 10000.77)
})

test('Verificar logaritmo en base 10', t => {
    const output = tools.ps_log10(100)
    t.true(output == 2)
})

test('Truncar decimales', t => {
    const output = tools.truncateDecimals(100,234)
    t.true(output == 100)
})

