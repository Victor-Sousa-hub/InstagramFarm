const puppeteer = require('puppeteer');
const  {db,getUsuarioById,atualizaSessao} = require('./dataBase.js');

(async () => {
  const url = 'https://instagram.com'; // Substitua pela URL da página de login
  const userid = 49;

  const usuario = await getUsuarioById(userid);

  if(!usuario){
    console.log('Usuario não encontrado!!');
    process.exit(1);
  }

  // Inicia o navegador e abre uma nova página
  const browser = await puppeteer.launch({ headless: false, 
                                           args: ['--lang==pt-BR'] 
  }); // Headless: false para visualizar
  const page = await browser.newPage();

  if (usuario.sessao) {
    console.log('Tentando fazer login com a sessão existente.');

    try {
      // Decodifica a string do cookie de sessão
      const sessionCookieValue = decodeURIComponent(usuario.sessao);
    
      // Define o cookie de sessão como um objeto para o Puppeteer
      const sessionCookie = {
        name: 'sessionid',           // Nome do cookie (substitua por 'sessionid' ou o nome real do cookie necessário)
        value: sessionCookieValue,    // Valor do cookie decodificado
        domain: '.instagram.com',     // Domínio específico para o cookie
        path: '/',
        httpOnly: true,
        secure: true
      };
      
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'pt-BR,pt;q=0.9'
      });
    
      // Define a localização do navegador para o Brasil
      await page.emulateTimezone('America/Sao_Paulo');
      // Navega para o Instagram
      await page.goto(url, { waitUntil: 'networkidle2' });
    
      // Define o cookie de sessão na página
      await page.setCookie(sessionCookie);
    
      // Recarrega a página para aplicar o cookie
      await page.reload({ waitUntil: 'networkidle2' });
    
      // Verifica se o login foi bem-sucedido
      const isLoggedIn = await page.evaluate(() => {
        return !!document.querySelector('nav svg[aria-label="Página inicial"]');
      });
    
      if (isLoggedIn) {
        console.log('Login via sessão bem-sucedido.');
      } else {
        console.log('Não foi possível fazer login com a sessão existente. Prosseguindo com login por usuário e senha.');
      }
    } catch (error) {
      console.log('Erro ao processar o cookie de sessão:', error);
      console.log('Prosseguindo com login por usuário e senha.');
    }
  }

  const targets = [
    {spanText: 'Telefone, nome de usuário ou email', textoParaPreencher: 'jay.conner15' },
    {spanText: 'Senha', textoParaPreencher: 'bt57qd6f' }
  ];

  const botaoSelector = 'button[type="submit"]'; // Seletor do botão de login


  // Navega até a URL de login
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Função para buscar e preencher um campo com base no texto do span
  async function encontrarEPreencher({ spanText, textoParaPreencher }) {
    const inputSelector = await page.evaluate((spanText) => {
      // Busca o elemento <span> pelo texto e o campo de entrada associado a ele
      const span = Array.from(document.querySelectorAll('span')).find(el => el.innerText.trim() === spanText);
      if (span) {
        const input = span.nextElementSibling; // Assume que o campo de entrada está logo após o <span>
        if (input && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA')) {
          return input.getAttribute('name') ? `input[name="${input.getAttribute('name')}"]` : null;
        }
      }
      return null;
    }, spanText);

    // Preenche o campo usando page.type caso o seletor do input seja encontrado
    if (inputSelector) {
      await page.type(inputSelector, textoParaPreencher, { delay: 100 });
      console.log(`Campo com span "${spanText}" preenchido com: "${textoParaPreencher}"`);
    } else {
      console.log(`Campo de entrada não encontrado para o span "${spanText}".`);
    }
  }

  // Itera sobre os alvos e preenche os campos correspondentes
  for (const target of targets) {
    await encontrarEPreencher(target);
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
  // Clica no botão de login e aguarda a navegação
  await page.click(botaoSelector);
  console.log('Botão de login clicado.');
  
  


  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  checarUrlAtual()
  // Chama a função de verificação de cookies de sessão
  await verificarCookiesSessao(page);

})();