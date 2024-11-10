const { buscaSeguindo, segueVolta } = require('./dataBase.js');

class FollowBack {
    constructor(page) {
        this.page = page; // Salva a página como propriedade da instância
    }

    // Função auxiliar para busca
    async buscaComCampo(nomeProcurado) {
        const searchInputSelector = 'input[placeholder="Pesquisar"]';

        try {
            // Aguarda o campo de busca carregar
            await this.page.waitForSelector(searchInputSelector, { timeout: 5000 });

            // Digita o nome no campo de busca
            await this.page.type(searchInputSelector, nomeProcurado);

            // Aguarda os resultados carregarem
            await new Promise(resolve => setTimeout(resolve, 8000));

            // Verifica se o perfil é privado
            const isPrivate = await this.page.evaluate(() => {
                const privateIndicator = document.querySelector('h2');
                return privateIndicator && privateIndicator.innerText.includes('Essa conta é privada');
            });

            if (isPrivate) {
                console.log('Perfil privado detectado.');
                return 2; // Perfil privado
            }

            // Verifica se há elementos com as classes especificadas
            const encontrado = await this.page.evaluate(() => {
                const elements = document.querySelectorAll('.x1dm5mii.x16mil14.xiojian.x1yutycm.x1lliihq.x193iq5w.xh8yej3');
                return elements.length > 0;
            });

            console.log(encontrado ? 'Elementos encontrados!' : 'Nenhum elemento encontrado.');
            return encontrado ? 1 : 0;
        } catch (error) {
            console.error('Erro durante a busca:', error.message);

            // Retorna 2 para erros indicando que o perfil pode ser privado
            if (error.message.includes('Waiting failed')) {
                return 2;
            }

            return 0;
        }
    }

    // Método principal
    async performAction() {
        if (!this.page) {
            throw new Error('A página não foi definida corretamente.');
        }

        const usuarios = await buscaSeguindo();

        if (usuarios.length === 0) {
            console.log('Nenhum usuário encontrado.');
            return;
        }

        let iteracao = 1;

        for (const { id, usuario } of usuarios) {
            console.log(`---------------- Iteração: ${iteracao} ----------------`);

            const newUrl = `https://www.instagram.com/${usuario}/`;
            await this.page.goto(newUrl, { waitUntil: 'networkidle2', timeout: 0 });
            console.log(`Navegador iniciado em ${newUrl}`);

            const seletor = '.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x5n08af.x9n4tj2._a6hd';

            try {
                await this.page.waitForSelector(seletor, { timeout: 5000 });

                await this.page.evaluate((selector) => {
                    const elementos = document.querySelectorAll(selector);
                    if (elementos.length >= 2) {
                        elementos[1].click();
                    }
                }, seletor);

                console.log('Clique realizado no segundo elemento.');
            } catch (error) {
                console.error('Erro ao clicar no segundo elemento:', error.message);
            }

            const nomeProcurado = 'laarimichelin';
            const encontrado = await this.buscaComCampo(nomeProcurado);

            console.log(`Resultado da busca: ${encontrado}`);
            await segueVolta(id, encontrado);

            iteracao += 1;
        }
    }
}

module.exports = FollowBack;
