function obtenerReportes(){
    var reportes;    
    var html = []; 	
    $.ajax({
        type:"GET",
        contentType:"application/json; charset=utf8",
        url:"https://quiet-escarpment-80769.herokuapp.com/api/reportes",
        success: function (response) {
        	reportes=response;
		var reporte = "";
  		for(var i=0;i< reportes.length; i++){
			reporte = reporte + "<tr><td>"+ reportes[i].fecha + "</td>" 
					  + "<td><img style='width:100%;' src='"+ reportes[i].ruta_img_base + "'/></td>"
					  + "<td><img style='width:100%;' src='"+ reportes[i].ruta_img_modificada + "'/></td>"
					  + "<td><img style='width:100%;' src='"+ reportes[i].ruta_img_salida + "'/></td>"
					  + "<td>"+ reportes[i].informacion + "</td>"
					  + "<tr>";	
		}


  		html.push(reporte);
  		$('#info').html(html.join(''));


        },
        async: false,
    });

    return reportes;			
}

function enviarPrueba(){
    var reportes;	
    $.ajax({
        type:"GET",
        contentType:"application/json; charset=utf8",
        url:"https://quiet-escarpment-80769.herokuapp.com/ejecutar",
               success: function (response) {
                   reportes=response;
        },
        async: false,
    });
	
    return reportes;
}

obtenerReportes();
