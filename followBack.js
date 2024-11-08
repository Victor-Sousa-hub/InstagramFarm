const puppeteer = require('puppeteer');
const  {db,getUsuarioById,selecionaSeguidor,segueVolta,buscaSeguindo} = require('./dataBase.js');

(async () => {
    //-----------------------FUNÇÕES AUXULIARES---------------------------------------
    
    
    async function buscaComCampo(page, nomeProcurado) {
        const searchInputSelector = 'input[placeholder="Pesquisar"]'; // Campo de busca
    
        try {
            // Aguarda o campo de busca carregar
            await page.waitForSelector(searchInputSelector, { timeout: 5000 });
    
            // Digita o nome no campo de busca
            await page.type(searchInputSelector, nomeProcurado);
    
            // Aguarda os resultados carregarem
            await new Promise(resolve => setTimeout(resolve, 8000)); // Pausa de 2 segundos
    
            // Verifica se o perfil é privado
            const isPrivate = await page.evaluate(() => {
                const privateIndicator = document.querySelector('h2');
                return privateIndicator && privateIndicator.innerText.includes('Essa conta é privada');
            });
    
            if (isPrivate) {
                console.log('Perfil privado detectado.');
                return 2; // Retorna 2 se o perfil for privado
            }
    
            // Verifica se há elementos com as classes especificadas
            const encontrado = await page.evaluate(() => {
                const elements = document.querySelectorAll('.x1dm5mii.x16mil14.xiojian.x1yutycm.x1lliihq.x193iq5w.xh8yej3');
                return elements.length > 0; // Retorna true se houver elementos
            });
    
            console.log(encontrado ? 'Elementos encontrados!' : 'Nenhum elemento encontrado.');
            return encontrado ? 1 : 0; // Retorna 1 se encontrado, 0 caso contrário
        } catch (error) {
            console.error('Erro durante a busca:', error.message);
    
            // Retorna 2 se o perfil for privado e os elementos não puderem ser encontrados
            if (error.message.includes('Waiting failed')) {
                console.log('Erro indica que o perfil pode ser privado ou o elemento não foi encontrado.');
                return 2;
            }
    
            // Retorna 0 para outros erros
            return 0;
        }
    }

    //---------------------------------VARIAVES DE AMBIENTE--------------------------------------------------  


    const args = process.argv.slice(2);
    const userIdArg = args.find(arg => arg.startsWith('--id='));

    if (!userIdArg) {
        console.error('Erro: O argumento --id=<USER_ID> é obrigatório.');
        process.exit(1); // Sai do programa com erro
    }

    const userId = parseInt(userIdArg.split('=')[1],10);


    usuario = await getUsuarioById(userId);
    console.log(usuario)

    //---------------------------------INICIO DA EXECUÇÃO----------------------------------------------
    const Url = "https://instagram.com";
    const browser = await puppeteer.launch({ headless: true,});
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
    
    const usuarios = await buscaSeguindo();

    if (usuarios.length === 0){
	console.log('Nenhum usuario encontrado');
	return;
    }
    
    let iteracao = 1;
    for(const {id,usuario} of usuarios){

	 
	console.log(`----------------------------!!!!!Iteracao: ${iteracao}!!!!!!!!!------------------------------------`);

	    const newUrl = `https://www.instagram.com/${usuario}/`;
            await page.goto(newUrl, { waitUntil: 'networkidle2',timeout: 0 });
            console.log(`Navegador iniciado em ${newUrl}`);

            
            const seletor = '.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x5n08af.x9n4tj2._a6hd';

            try {
                // Aguarda os elementos
                await page.waitForSelector(seletor, { timeout: 5000 });

                // Encontra e clica no segundo elemento
                await page.evaluate((selector) => {
                    const elementos = document.querySelectorAll(selector);
                    if (elementos.length >= 2) {
                        elementos[1].click(); // Segundo elemento
                    }
                }, seletor);

                console.log('Clique realizado no segundo elemento.');
            } catch (error) {
                console.error('Erro ao clicar no segundo elemento:', error.message);
            }
            
             // Nome que você deseja buscar
            const nomeProcurado = 'laarimichelin';

            // Execute a busca e verifique se o nome existe
            const encontrado = await buscaComCampo(page, nomeProcurado);

            console.log(`Resultado da busca: ${encontrado}`); // 1 para encontrado, 0 caso contrário
        segueVolta(id,encontrado);
	iteracao += 1;
    
    }
    browser.close();


})();
