import axios from 'axios';
import puppeteer from 'puppeteer';

async function openPageWithProxy() {
  const url = 'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=3000&country=BR&ssl=all&an'

  try {
    // Obter proxies brasileiras
    const response = await axios.get(url);
    const proxies = response.data.split('\r\n').filter(proxy => proxy);
    console.log('Proxies brasileiras:', proxies);

    // Selecionar um proxy aleatório
    const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
    console.log('Usando o proxy:', randomProxy);

    const [proxyHost, proxyPort] = randomProxy.split(':');

    // Configurar Puppeteer para usar o proxy
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        `--proxy-server=http://${proxyHost}:${proxyPort}`,
        '--lang=pt-BR'
      ]
    });

    const page = await browser.newPage();
    await page.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'networkidle2' });
    console.log('Página aberta com proxy.');
  } catch (error) {
    console.error('Erro:', error);
  }
}

openPageWithProxy();

