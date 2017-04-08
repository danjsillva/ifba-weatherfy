var principalCidade = document.getElementById('principal-cidade');
var principalTemp = document.getElementById('principal-temp');
var principalTempDesc = document.getElementById('principal-temp-desc');
var principalDolar = document.getElementById('principal-dolar');
var principalDolarDesc = document.getElementById('principal-dolar-desc');
var detalhesTemp = document.getElementById('detalhes-temp');
var detalhesDolar = document.getElementById('detalhes-dolar');

var item1 = document.getElementById('item-1');
var item2 = document.getElementById('item-2');

var getMensagem = function (param) {
    var url = 'http://191.232.177.109:4000/api?q=' + encodeURI(param);
    var req = new XMLHttpRequest();
    req.open("GET", url, false );
    req.send(null);

    var data = JSON.parse(req.responseText);
    console.log(data);
    principalCidade.innerHTML = data.cidade + ', ' + data.pais;
    principalTemp.innerHTML = data.clima.temperatura.toFixed(1) + 'º C';
    principalTempDesc.innerHTML = data.clima.descricao;
    principalDolar.innerHTML = data.dolar.moeda + ' ' + data.dolar.valor.toFixed(2);
    detalhesTemp.innerHTML = 'máxima: ' + data.clima.maxima.toFixed(1) + '&nbsp;&nbsp;&nbsp; mínima: ' + data.clima.minima.toFixed(1) + '&nbsp;&nbsp;&nbsp; umidade: ' + data.clima.umidade.toFixed(1) + '&nbsp;&nbsp;&nbsp; pressão: ' + data.clima.pressao.toFixed(1);
    detalhesDolar.innerHTML = 'em: ' + new Date();

    for (var i = 1; i <= 4; i++) {
        document.getElementById('data-' + i).innerHTML = data.previsaoList[i - 1].data;
        document.getElementById('icone-' + i).src = 'http://openweathermap.org/img/w/' + data.previsaoList[i - 1].icone + '.png';
        document.getElementById('icone-' + i).title = data.previsaoList[i - 1].descricao;
        document.getElementById('temp-max-' + i).innerHTML = data.previsaoList[i - 1].maxima.toFixed(1) + 'º C';
        document.getElementById('temp-min-' + i).innerHTML = data.previsaoList[i - 1].minima.toFixed(1) + 'º C';
    }

    document.getElementById('param').value = '';
}

var setItem = function (item) {
    if (item === item1) {
        principalTemp.style.cssText = 'display: block;';
        principalTempDesc.style.cssText = 'display: block;';

        detalhesTemp.style.cssText = 'display: block;';

        principalDolar.style.cssText = 'display: none;';
        principalDolarDesc.style.cssText = 'display: none;';

        detalhesDolar.style.cssText = 'display: none;';

        item1.className = 'item item-ativo';
        item2.className = 'item';
    } else {
        principalTemp.style.cssText = 'display: none;';
        principalTempDesc.style.cssText = 'display: none;';

        detalhesTemp.style.cssText = 'display: none;';

        principalDolar.style.cssText = 'display: block;';
        principalDolarDesc.style.cssText = 'display: block;';

        detalhesDolar.style.cssText = 'display: block;';

        item1.className = 'item';
        item2.className = 'item item-ativo';
    }
};

var getIP = function (json) {
    document.getElementById('param').value = json.ip;
    getMensagem(document.getElementById('param').value);
}

document.getElementById('param').onkeyup = function(e){
    if(e.keyCode == 13){
        getMensagem(document.getElementById('param').value);
    }
}
