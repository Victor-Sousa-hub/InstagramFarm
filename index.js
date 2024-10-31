const puppeteer = require('puppeteer');

(async () => {
  const url = 'https://instagram.com'; // Substitua pela URL da página de login

  const targets = [
    {spanText: 'Telefone, nome de usuário ou email', textoParaPreencher: 'João Silva' },
    {spanText: 'Senha', textoParaPreencher: 'minha_senha' }
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

  // Clica no botão de login
  await page.click(botaoSelector);
  console.log('Botão de login clicado.');

  // Aguarda a navegação para a próxima página
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Verifica se o login foi bem-sucedido pela existência de um cookie de sessão
  const cookies = await page.cookies();
  const sessionCookies = cookies.filter(cookie => cookie.name.includes('session'));

  if (sessionCookies.length > 0) {
    console.log('Login bem-sucedido! Cookies da sessão:');
    console.table(sessionCookies);
  } else {
    console.log('Login falhou ou não há cookies de sessão disponíveis.');
  }

  // Fecha o navegador
  await browser.close();
})();