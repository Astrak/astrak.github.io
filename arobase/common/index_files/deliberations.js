function repartir(nom_layer){
				
				if(document.getElementById(nom_layer).style.display == 'block'){
					 document.getElementById(nom_layer).style.display = 'none';
				}
				else if(document.getElementById(nom_layer).style.display == "none"){
					document.getElementById(nom_layer).style.display = 'block';
				}
			}

			function showLayer(nom_layer){document.getElementById(nom_layer).style.display = 'block';}
			function hideLayer(nom_layer){document.getElementById(nom_layer).style.display = 'none';}