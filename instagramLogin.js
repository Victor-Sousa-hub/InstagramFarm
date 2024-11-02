const puppeteer = require('puppeteer');
const  {db,getUsuarioById,atualizaSessao} = require('./dataBase.js');
const { iniciarMail, mailEmitter } = require('./mailAPI.js');
const axios = require('axios');

(async () => {
  //////////////////////////////////////FUNÇOES AUXILIARES/////////////////////////////////////////////////////

  async function salvaSessao(userId) {
    const cookies = await page.cookies();
  
    // Encontra o objeto com o nome "sessionid"
    const sessionIdCookie = cookies.find(cookie => cookie.name === "sessionid");
  
    // Extrai o valor do sessionid, se encontrado
    const sessionIdValue = sessionIdCookie ? sessionIdCookie.value : null;
    
    // Salva o valor do sessionid no banco de dados
    await atualizaSessao(userId, sessionIdValue);
    console.log('Sessão salva no banco de dados.');
  }
   // Função para buscar e preencher um campo com base no texto do span
   async function encontrarEPreencher({ name, textoParaPreencher }) {
    
    // Encontra o campo de entrada pelo atributo `name`
    const inputSelector = await page.evaluate((name) => {
      const input = document.querySelector(`input[name="${name}"], textarea[name="${name}"]`);
      return input ? `input[name="${name}"], textarea[name="${name}"]` : null;
    }, name);
  
    // Preenche o campo se o seletor for encontrado
    if (inputSelector) {
      await page.type(inputSelector, textoParaPreencher, { delay: 100 });
      console.log(`Campo com name "${name}" preenchido com: "${textoParaPreencher}"`);
    } else {
      console.log(`Campo de entrada com name "${name}" não encontrado.`);
    }
  }
  // Função auxiliar para esperar um intervalo de tempo
  function esperar(intervalo) {
    return new Promise(resolve => setTimeout(resolve, intervalo));
}
   // Função auxiliar para verificar a presença dos cookies de sessão
   async function verificarCookiesSessao(page, tentativas = 10, intervalo = 1000) {
    for (let i = 0; i < tentativas; i++) {
      const cookies = await page.cookies();
      const sessionCookies = cookies.filter(cookie => cookie.name.includes('session'));
  
      if (sessionCookies.length > 0) {
        console.log('Login bem-sucedido! Cookies da sessão:');
        salvaSessao(userid);
        console.table(sessionCookies);
        return sessionCookies;
      }
  
      // Aguarda o intervalo antes de verificar novamente
      await esperar(intervalo);
    }
    
    console.log('Login falhou ou não há cookies de sessão disponíveis após múltiplas tentativas.');
    return null;
  }
   // Função para checar e registrar a URL atual
   async function checarUrlAtual() {
    const currentUrl = String(page.url()); // Converte explicitamente para string
    // Verifica se a URL contém "challenge/action"
    if (currentUrl.includes('challenge/action')) {
      console.log('Página de verificação de segurança detectada.');
    } else {
      console.log('Página normal, sem verificação de segurança.');
    }

    return currentUrl;
  }
  // Função para pegar todas as proxies de ip brasileiro
  async function getBrazilianProxies() {
    const url = 'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=BR&ssl=all&anonymity=all';
  
    try {
      const response = await axios.get(url);
      const proxies = response.data.split('\r\n').filter(proxy => proxy);
      return proxies;
    } catch (error) {
      console.error('Erro ao obter proxies:', error);
      return [];
    }
  }
  
  /////////////////////////////////////////////////DEFININDO VARIAVEIS DE AMBIENTE////////////////////////////////////
  const url = 'https://www.instagram.com/accounts/emailsignup/'; 
   
  const userid = 22;
  const usuario = await getUsuarioById(userid);
  if(!usuario){
    console.log('Usuario não encontrado!!');
    process.exit(1);
  }

  const proxies = await getBrazilianProxies();
  if (proxies.length === 0) {
    console.error('Nenhum proxy disponível.');
    return;
  }

  //////////////////////////////////////////////////EXECUÇÃO/////////////////////////////////////////////////

  // Seleciona um proxy aleatório
  const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
  console.log('Usando o proxy:', randomProxy);
  const [proxyHost, proxyPort] = randomProxy.split(':');

  // Inicia o processo de criação e monitoramento do e-mail
  iniciarMail();

  // Captura o e-mail temporário criado
  const emailTemporario = await new Promise(resolve => {
      mailEmitter.once('emailCriado', (email) => {
      console.log('E-mail recebido do evento:', email); // Log para verificar o e-mail
      resolve(email);
    });
  });

  // Inicia o navegador e abre uma nova página
  const browser = await puppeteer.launch({ headless: false, 
          args: ['--lang==pt-BR',
                `--proxy-server=http://${proxyHost}:${proxyPort}`]
  }); // Headless: false para visualizar
  const page = await browser.newPage();

  const targets = [
    {name: 'emailOrPhone', textoParaPreencher: emailTemporario},
    {name: 'password', textoParaPreencher: usuario.senha },
    {name: 'fullName',textoParaPreencher:usuario.nome_completo},
    {name: 'username',textoParaPreencher:usuario.nome_usuario}
  ];

  const botaoSelector = 'button[type="submit"]'; // Seletor do botão de login

  // Navega até a URL de login
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Itera sobre os alvos e preenche os campos correspondentes
  for (const target of targets) {
    await encontrarEPreencher(target);
  }
  
  // Clica no botão de login e aguarda a navegação
  await page.click(botaoSelector);
  console.log('Botão de login clicado.');
  
  
  //await page.waitForNavigation({ waitUntil: 'networkidle2' });

  //Preenche a data de nascimento
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Seleciona o dia (exemplo: 15)
  console.log('Prechendo o dia')
  await page.select('select._aau-._ap32[title="Dia:"]', '15');
  console.log('Preechendo o mes')
  // Seleciona o mês (exemplo: março - valor "3")
  await page.select('select._aau-._ap32[title="Mês:"]', '3');
  console.log('Preechendo o ano')
  // Seleciona o ano (exemplo: 1995)
  await page.select('select._aau-._ap32[title="Ano:"]', '1995');

  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  // Chama a função de verificação de cookies de sessão
  //await verificarCookiesSessao(page);

})();