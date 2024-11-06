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

    const IDs = [3, 10, 15, 28, 31, 47, 49];
    const randomId = Math.floor(Math.random() * IDs.length);
    usuario = await getUsuarioById(31);
    console.log(usuario)

    //---------------------------------INICIO DA EXECUÇÃO----------------------------------------------
    const browser = await puppeteer.launch({ headless: false,});
    const page = await browser.newPage();


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
        await page.goto(Url, { waitUntil: 'networkidle2',timeout: 0 });
        
        // Define o cookie de sessão na página
        await page.setCookie(sessionCookie);
        
        // Recarrega a página para aplicar o cookie
        await page.reload({ waitUntil: 'networkidle2', timeout: 0});
        
        
        } catch (error) {
        console.log('Erro ao processar o cookie de sessão:', error);
        console.log('Saindo!!!.');
        process.exit(1);
        }
    }
    
    const newUrl = 'https://www.instagram.com/sejafodastica/';
    await page.goto(newUrl, { waitUntil: 'networkidle2',timeout: 0 });
    console.log(`Navegador iniciado em ${newUrl}`);

    await new Promise(resolve => setTimeout(resolve, 2000));

    //Seleciona pagina de seguidores(!!!!CHEKAR SE ISSO É UM IP BLOCK)
    const selector = ".x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x5n08af.x9n4tj2._a6hd";

    await page.evaluate((selector) => {
        const elemento = document.querySelector(selector);
        if (elemento) {
            elemento.click();
        } else {
            console.log("Elemento não encontrado para clique.");
        }
    }, selector);

    //await page.waitForSelector('span._ap3a _aaco _aacw _aacx _aad7 _aade');
    //await page.type('[placeholder="Pesquisar"]', 'an');
    for (let i = 40; i < 150; i++) {
        const subpageSelector = '.xyi19xy.x1ccrb07.xtf3nb5.x1pc53ja.x1lliihq.x1iyjqo2.xs83m0k.xz65tgg.x1rife3k.x1n2onr6';
        await scrollElemento(page, subpageSelector);
        /*
        const tempoEspera = tempoAleatorio(i);
        console.log(`Iteração ${i}: Esperando ${tempoEspera / 1000} segundos`);
        */
        await new Promise(resolve => setTimeout(resolve, 1000));
        const spanTexts = await page.evaluate(() => {
            const elements = document.querySelectorAll('span._ap3a._aaco._aacw._aacx._aad7._aade');
            return Array.from(elements).map(element => element.innerText);
        });
    
        console.log('Seguidores encontrados:', spanTexts);
    
        spanTexts.forEach((username, index) => {
            const uniqueID = `${i}-${index}`;  // Combina a iteração e o índice
            salvaSeguidor(username, uniqueID);
        });
    }
    


})();