const http = require('http');
const req = require('sync-request');
const url = require('url');
const moment = require('moment');

// classe gerada do esquema protobuf
const msg = require('./Mensagem_pb');

// porta para configuracao do server
const port = 3000;

// chave da api
const apikey = '2dff0f9852ff92a8c926999afc7a7673';

// cria, configura e starta o server e as rotas
http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'application/x-protobuf'});

    var path = req.url.match('^[^?]*')[0];
    var query = url.parse(req.url, true).query;

    switch (path) {
        case '/api/ip':
        res.write(getMensagemIp(query.i));
        break;
        case '/api/cidade':
        res.write(getMensagemCidade(query.c));
        break;
        case '/api/geo':
        res.write(getMensagemGeo(query.lat, query.lon));
        break;
        default:
    }

    res.end();
}).listen(port, function() {
    console.log('Server runing at http://localhost:' + port);
});

var getMensagemIp = function(ip) {
    var cidade = getCidade(ip);
    var clima = getClimaCidade(cidade.city);
    var previsao = getPrevisaoCidade(cidade.city);
    var pais = getPais(cidade.countryCode);
    var dolar = getDolar();

    var mensagem = setMensagem(clima, previsao, pais, dolar);

    return mensagem;
}

var getMensagemCidade = function(cidade) {
    var clima = getClimaCidade(cidade);
    var previsao = getPrevisaoCidade(cidade);
    var pais = getPais(clima.sys.country);
    var dolar = getDolar();

    var mensagem = setMensagem(clima, previsao, pais, dolar);

    return mensagem;
}

var getMensagemGeo = function(lat, lon) {
    var clima = getClimaCoordenadas(lat, lon);
    var previsao = getPrevisaoCoordenadas(lat, lon);
    var pais = getPais(clima.sys.country);
    var dolar = getDolar();

    var mensagem = setMensagem(clima, previsao, pais, dolar);

    return mensagem;
}

var getCidade = function (ip) {
    var res = req('GET', 'http://ip-api.com/json/' + encodeURI(ip));

    return JSON.parse(res.getBody().toString());
};

var getClimaCidade = function (cidade) {
    var res = req('GET', 'http://api.openweathermap.org/data/2.5/weather?q=' + encodeURI(cidade) + '&lang=pt&units=metric&APPID=' + encodeURI(apikey));

    return JSON.parse(res.getBody().toString());
};

var getClimaCoordenadas = function (lat, lon) {
    var res = req('GET', 'http://api.openweathermap.org/data/2.5/weather?lat=' + encodeURI(lat) + '&lon=' + encodeURI(lon) + '&lang=pt&units=metric&APPID=' + encodeURI(apikey));

    return JSON.parse(res.getBody().toString());
};

var getPrevisaoCidade = function (cidade) {
    var res = req('GET', 'http://api.openweathermap.org/data/2.5/forecast?q=' + encodeURI(cidade) + '&lang=pt&units=metric&APPID=' + encodeURI(apikey));

    return JSON.parse(res.getBody().toString());
};

var getPrevisaoCoordenadas = function (lat, lon) {
    var res = req('GET', 'http://api.openweathermap.org/data/2.5/forecast?lat=' + encodeURI(lat) + '&lon=' + encodeURI(lon) + '&lang=pt&units=metric&APPID=' + encodeURI(apikey));

    return JSON.parse(res.getBody().toString());
};

var getPais = function (codigo) {
    var res = req('GET', 'http://restcountries.eu/rest/v2/alpha/' + encodeURI(codigo));

    return JSON.parse(res.getBody().toString());
};

var getDolar = function () {
    var res = req('GET', 'http://api.fixer.io/latest?base=USD');

    return JSON.parse(res.getBody().toString());
};

var setMensagem = function (paramClima, paramPrevisao, paramPais, paramDolar) {
    moment.locale('pt-BR');

    var mensagem = new msg.Mensagem();

    var clima = new msg.Mensagem.Clima();

    clima.setDescricao(paramClima.weather[0].description);
    clima.setIcone(paramClima.weather[0].icon);
    clima.setTemperatura(paramClima.main.temp);
    clima.setUmidade(paramClima.main.humidity);
    clima.setPressao(paramClima.main.pressure);
    clima.setMinima(paramClima.main.temp_min);
    clima.setMaxima(paramClima.main.temp_max);

    mensagem.setCidade(paramClima.name);
    mensagem.setPais(paramClima.sys.country);
    mensagem.setClima(clima);

    var dolar = new msg.Mensagem.Dolar();

    dolar.setMoeda(paramPais.currencies[0].symbol);
    dolar.setValor(paramDolar.rates[paramPais.currencies[0].code]);

    mensagem.setDolar(dolar);

    for (var i = 1; i <= 4; i++) {
        var previsao = new msg.Mensagem.Previsao();

        previsao.setData(moment().add(i, 'day').format('ddd'));
        previsao.setDescricao(paramPrevisao.list[0].weather[0].description);
        previsao.setIcone(paramPrevisao.list[0].weather[0].icon);
        previsao.setMinima(getTemp(paramPrevisao, previsao, 'temp_min'));
        previsao.setMaxima(getTemp(paramPrevisao, previsao, 'temp_max'));

        mensagem.addPrevisao(previsao);
    }

    // serializa para UInt8Array com método da classe gerada do esquema protobuf
    var bytes = mensagem.serializeBinary();

    // converte em buffer pra poder enviar na resposta http (só pode ser buffer ou string)
    var buffer = new Buffer(bytes);

    printData(mensagem, bytes, buffer);

    return buffer;
};

var getTemp = function (paramPrevisao, previsao, campo) {
    var temp;

    for (var p of paramPrevisao.list) {
        if (previsao.getData() === moment.unix(p.dt).format('ddd')) {
            if (temp === undefined) {
                temp = p.main[campo];
            }

            if (campo === 'temp_min') {
                temp = p.main[campo] < temp ? p.main[campo] : temp;
            } else {
                temp = p.main[campo] > temp ? p.main[campo] : temp;
            }
        }
    }

    return temp;
};

var printData = function(mensagem, bytes, buffer) {
    console.log('Objeto:');
    console.log(mensagem.toObject());
    console.log('----------------------------------------------------------------------------------------');
    console.log('Message:');
    console.log(mensagem);
    console.log('----------------------------------------------------------------------------------------');
    console.log('UInt8Array:');
    console.log(bytes);
    console.log('----------------------------------------------------------------------------------------');
    console.log('Buffer:');
    console.log(buffer);
    console.log('----------------------------------------------------------------------------------------');
};
