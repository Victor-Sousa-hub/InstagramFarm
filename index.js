const puppeteer = require('puppeteer');

(async () => {
  const url = 'https://instagram.com'; // Substitua pela URL da página de login

  const targets = [
    {spanText: 'Phone number, username, or email', textoParaPreencher: 'christopher.roman90' },
    {spanText: 'Password', textoParaPreencher: 'hYjQ8ogU' }
  ];

  const botaoSelector = 'button[type="submit"]'; // Seletor do botão de login

  // Inicia o navegador e abre uma nova página
  const browser = await puppeteer.launch({ headless: false }); // Headless: false para visualizar
  const page = await browser.newPage();

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
  
  // Clica no botão de login e aguarda a navegação
  await page.click(botaoSelector);
  console.log('Botão de login clicado.');
  async function bypassVerification(page, email) {
    const isBypassRequired = await page.evaluate(() => {
      return !!document.querySelector('input[name="verificationCode"]');
    });
  
    if (isBypassRequired) {
      console.log('Verificação de segurança detectada. Buscando código no e-mail...');
      const verificationCode = await getVerificationCode(email);
      if (verificationCode) {
        await page.type('input[name="verificationCode"]', verificationCode, { delay: 100 });
        await page.click(botaoSelector);
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('Verificação de segurança concluída com sucesso.');
      } else {
        console.log('Erro: Código de verificação não encontrado no e-mail.');
      }
    }
  }
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  // Chama a função de verificação de cookies de sessão
  await verificarCookiesSessao(page);

})();