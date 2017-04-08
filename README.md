# weatherfy
WeatherFy, é uma aplicação web que detecta a localização do usuário e exibe informações sobre o clima da cidade, a previsão do tempo dos próximos quatro dias, a umidade e a pressão atmosférica, bem como a cotação do dólar em relação à moeda utilizada no país da cidade em questão. No WeatherFy também é possível inserir o nome de qualquer outra cidade no mundo e obter as mesmas informações.

A aplicação disponibiliza uma caixa de texto onde o usuário pode inserir um número IP no formato (xxx.xxx.xxx.xxx), o nome de qualquer cidade do mundo ou a latitude e longitude no formato (xx.xxxxxxx,xxx.xxxxxxx) e, então, serão retornadas as informações de clima e cotação do dólar referentes à cidade requisitada.

Para acessar a aplicação, deve-se inserir o endereço <http://s3-sa-east-1.amazonaws.com/weatherfy/index.html> no navegador do cliente. Os arquivos referentes ao site estático serão baixados do serviço de armazenamento Amazon Simple Storage Service (AS3) para o computador, e, então, é feita uma requisição a um servidor, apelidado de S1, que é executado na plataforma de computação em nuvem Azure, da Microsoft.

O S1 é responsável por receber a requisição do navegador e inspecionar  o tipo de busca feita pelo usuário com computador cliente. Caso a cadeia de caracteres seja composta apenas por letras, trata-se do nome de uma cidade; caso contenha quatro pontos,  trata-se de um endereço IP; caso contenha uma vírgula, trata-se da latitude e longitude. Após a verificação, S1 faz uma requisição a outro servidor, apelidado de S2, que é executado na plataforma de computação em nuvem Amazon Web Services (AWS).

Quando S2 recebe a requisição de S1, ele irá utilizar diversas APIs (Application Programmning Interface) para obter as informações. A função de S2 é recuperar todas as informações solicitadas ao requisitar os serviços das APIs, reunir esses dados e enviá-los de forma organizada para S1. Na Tabela 2 estão descritas as funções e os endereços de cada API utilizada. Todas as APIs, exceto a de cotação do dólar, recebem parâmetros como o número IP, o nome da cidade, a latitude e longitude. A API OpenWeather recebe um parâmetro adicional, uma chave de identificação de usuário porque, embora seja gratuita, não é pública. Foi preciso fazer um registro para receber uma chave que permite a utilização do serviço.

# apis utilizadas
Consulta a cidade pelo ip
http://ip-api.com/json/<ip>

Consulta o clima pela cidade
http://api.openweathermap.org/data/2.5/weather?q=<cidade>&lang=pt&units=metric&APPID=<apikey>

Consulta o clima pelas coordenadas
http://api.openweathermap.org/data/2.5/weather?lat=<latitude>&lon=<longitude>&lang=pt&units=metric&APPID=<apikey>

Consulta previsão pela cidade
http://api.openweathermap.org/data/2.5/forecast?q=<cidade>&lang=pt&units=metric&APPID=<apikey>

Consulta a previsão pelas coordenadas
http://api.openweathermap.org/data/2.5/forecast?lat=<latitude>&lon=<longitude>&lang=pt&units=metric&APPID=<apikey>

Consulta o país pelo código de país (que tem na cidade)
http://restcountries.eu/rest/v2/alpha/<codigo>

Consulta cotação do dólar
http://api.fixer.io/latest?base=USD

# tecnologias
S2 e S1 foram implementados através do Node.js, uma plataforma assíncrona de desenvolvimento de aplicações escaláveis de rede baseada na linguagem JavaScript. Foi escolhida por ser uma linguagem totalmente compatível com o proto3 e de sintaxe familiar.

Após recebidas as respostas das APIs, S2 precisa organizar todos esse dados em uma única mensagem estruturada. A função do protobuf nessa aplicação é serializar o dados cidade, pais, clima, previsao e dolar, cada um obtido por meio de uma requisição a determinada API, em uma única mensagem para que eles possam ser transferidos a S1.
