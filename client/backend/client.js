const http = require('http');
const req = require('sync-request');
const url = require('url');

// classe gerada do esquema protobuf
const msg = require('./Mensagem_pb');

// porta para configuracao do server
const port = 4000;

// cria, configura e starta o server e as rotas
http.createServer(function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200, {'Content-Type': 'application/json'});

    var query = url.parse(req.url, true).query;
    var path = req.url.match('^[^?]*')[0];

    if (path == '/api') {
        res.write(JSON.stringify(getMensagem(query.q)));
    }

    res.end();
}).listen(port, function() {
    console.log('Server runing at http://localhost:' + port);
});


var getMensagem = function (query) {
    var mensagem;

    if (query.split('.').length == 4) {
        mensagem = getMensagemIp(query);
    } else if (query.split(',').length == 2) {
        query = query.replace(/ /g,'');
        var latlon = query.split(',');
        mensagem = getMensagemGeo(latlon[0], latlon[1]);
    } else {
        mensagem = getMensagemCidade(query);
    }

    return mensagem;
};

var getMensagemIp = function (ip) {
    var res = req('GET', 'http://54.233.109.120:3000/api/ip?i=' + encodeURI(ip));

    var buffer = res.getBody();
    var bytes = new Uint8Array(buffer);
    var mensagem = msg.Mensagem.deserializeBinary(bytes);

    printData(buffer, bytes, mensagem);

    return mensagem.toObject();
};

var getMensagemCidade = function (cidade) {
    var res = req('GET', 'http://54.233.109.120:3000/api/cidade?c=' + encodeURI(cidade));

    var buffer = res.getBody();
    var bytes = new Uint8Array(buffer);
    var mensagem = msg.Mensagem.deserializeBinary(bytes);

    printData(buffer, bytes, mensagem);

    return mensagem.toObject();
};

var getMensagemGeo = function (lat, lon) {
    var res = req('GET', 'http://54.233.109.120:3000/api/geo?lat=' + encodeURI(lat) + '&lon=' + encodeURI(lon));

    var buffer = res.getBody();
    var bytes = new Uint8Array(buffer);
    var mensagem = msg.Mensagem.deserializeBinary(bytes);

    printData(buffer, bytes, mensagem);

    return mensagem.toObject();
};

var printData = function(buffer, bytes, mensagem) {
    console.log('Buffer:');
    console.log(buffer);
    console.log('----------------------------------------------------------------------------------------');
    console.log('UInt8Array:');
    console.log(bytes);
    console.log('----------------------------------------------------------------------------------------');
    console.log('Message:');
    console.log(mensagem);
    console.log('----------------------------------------------------------------------------------------');
    console.log('Objeto:');
    console.log(mensagem.toObject());
};
