const puppeteer = require('puppeteer');
const  {db,getUsuarioById, salvaSeguidor} = require('./dataBase.js');

(async () => {
    //-----------------------FUNÇÕES AUXULIARES---------------------------------------
    
    
     // Função para rolar um elemento específico com scroll, com logs de depuração
    async function scrollElemento(page, selector) {
        console.log(`Iniciando scroll para o seletor: ${selector}`);
        
        const elementoExiste = await page.$(selector);
        if (!elementoExiste) {
        console.log("Elemento não encontrado na página com o seletor fornecido.");
        return;
        }

        await page.evaluate(async (selector) => {
        console.log('Entrando na função evaluate para scroll...');
        
        const element = document.querySelector(selector);
        if (!element) {
            console.log("Elemento não encontrado dentro do evaluate.");
            return;
        }

        console.log("Elemento encontrado, iniciando scroll...");
        
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100; // Quantidade de pixels para rolar por vez
            const timer = setInterval(() => {
            element.scrollBy(0, distance); // Rola o elemento
            totalHeight += distance;

            // Para o scroll quando atingir o final do elemento
            if (totalHeight >= element.scrollHeight - element.clientHeight) {
                clearInterval(timer);
                resolve();
            }
            }, 100);
        });

        console.log("Scroll completo.");
    }, selector);
  }
    // Função para gerar um tempo aleatório de espera
    function tempoAleatorio(iteracao) {
        if (iteracao % 6 === 0) {
            // A cada sexta vez, retorna um tempo entre 10 e 25 segundos
            return Math.floor(Math.random() * (25 - 10 + 1) + 10) * 1000;
        } else {
            // Nas outras vezes, retorna um tempo entre 5 e 7 segundos
            return Math.floor(Math.random() * (7 - 5 + 1) + 5) * 1000;
        }
    }

    //---------------------------------VARIAVES DE AMBIENTE--------------------------------------------------  
    const Url = 'https://instagram.com'; // URL que você deseja navegar após o login

    const proxyHost = 'br.smartproxy.com';
    const proxyPort = '10006';
    const proxyProtocol = 'https';
    const proxyUser = 'spqb6vvqht';
    const proxyPass = '_kDyg76Aa9TmrOsdj5';

    const IDs = [3, 10, 15, 28, 31, 47, 49];
    const randomId = Math.floor(Math.random() * IDs.length);
    usuario = await getUsuarioById(31);
    console.log(usuario)

    //---------------------------------INICIO DA EXECUÇÃO----------------------------------------------
    const browser = await puppeteer.launch({ headless: true,
        args: [
            `--proxy-server=${proxyProtocol}://${proxyHost}:${proxyPort}`
          ]
    });
    const page = await browser.newPage();

    // Autenticação de Proxy
   await page.authenticate({
    username: proxyUser,
    password: proxyPass
  });

    await page.goto(Url, { waitUntil: 'networkidle2',timeout: 60000 });
    
    
    


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
        await page.goto(Url, { waitUntil: 'networkidle2',timeout: 60000 });
        
        // Define o cookie de sessão na página
        await page.setCookie(sessionCookie);
        
        // Recarrega a página para aplicar o cookie
        await page.reload({ waitUntil: 'networkidle2', timeout: 120000});
        
        
        } catch (error) {
        console.log('Erro ao processar o cookie de sessão:', error);
        console.log('Saindo!!!.');
        process.exit(1);
        }
    }
    
    const newUrl = 'https://www.instagram.com/laarimichelin.fitness/followers/';
    await page.goto(newUrl, { waitUntil: 'networkidle2',timeout: 60000 });
    console.log(`Navegador iniciado em ${newUrl}`);
    
    // Extrai o número de seguidores do seguidor
    const followerCountSelector = 'a[href*="/followers"] span';
    await page.waitForSelector(followerCountSelector);
    
    // Extrai o número de seguidores
    const followerCount = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.innerText : null;
    }, followerCountSelector);
    
    console.log(`Número de seguidores do seguidor: ${followerCount}`);

    // Aguarda que os elementos desejados carreguem
    //await page.waitForSelector('span._ap3a _aaco _aacw _aacx _aad7 _aade');
    //await page.type('[placeholder="Pesquisar"]', 'an');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    for(let i = 0;i < 150;i++){
        // Insere o texto no campo de pesquisa
        
        const subpageSelector = '.xyi19xy.x1ccrb07.xtf3nb5.x1pc53ja.x1lliihq.x1iyjqo2.xs83m0k.xz65tgg.x1rife3k.x1n2onr6';
        scrollElemento(page,subpageSelector)

        // Calcula o tempo de espera aleatório
        const tempoEspera = tempoAleatorio(i);
        console.log(`Iteração ${i}: Esperando ${tempoEspera / 1000} segundos`);

        // Aguarda o tempo determinado antes de continuar
        await new Promise(resolve => setTimeout(resolve, tempoEspera));
        // Extrai o texto de todos os elementos <span> com as classes especificadas
    const spanTexts = await page.evaluate(() => {
        // Seleciona todos os elementos <span> com as classes fornecidas
        const elements = document.querySelectorAll('span._ap3a._aaco._aacw._aacx._aad7._aade');
        
        // Mapeia cada elemento para seu texto e retorna como um array
        return Array.from(elements).map(element => element.innerText);
    });

    console.log('Seguidores encontrados:', spanTexts);
    spanTexts.forEach(salvaSeguidor)
    }
    


})();