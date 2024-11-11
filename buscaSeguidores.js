const puppeteer = require('puppeteer');
const { salvaSeguidor } = require('./dataBase.js'); // Certifique-se de que `salvaSeguidor` está corretamente definido

class BuscaSeguidores {
    constructor(page) {
        this.page = page; // Salva a referência da página
    }
    /////////////////////////////////////////FUNÇÃO AUXILIARES/////////////////////////////////////////
    // Função para realizar scroll em um elemento
    async scrollElemento(selector) {
        console.log(`Iniciando scroll para o seletor: ${selector}`);

        const elementoExiste = await this.page.$(selector);
        if (!elementoExiste) {
            console.log("Elemento não encontrado na página com o seletor fornecido.");
            return;
        }

        await this.page.evaluate(async (selector) => {
            const element = document.querySelector(selector);
            if (!element) {
                console.log("Elemento não encontrado dentro do evaluate.");
                return;
            }

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
        }, selector);

        console.log("Scroll completo.");
        
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
            console.log(`Buscando seguidores do tipo ${nomeProcurado}`)
        } catch (error) {
            console.error('Erro durante a busca:', error.message);
        }
    }
    async limparCampoDeBusca() {
        const selector = 'input[placeholder="Pesquisar"]';
        try {
            await this.page.evaluate((selector) => {
                const input = document.querySelector(selector);
                if (input) {
                    input.value = ''; // Limpa o valor do campo
                    input.dispatchEvent(new Event('input', { bubbles: true })); // Atualiza o DOM
                }
            }, selector);
            console.log("Campo de busca limpo com sucesso.");
        } catch (error) {
            console.error("Erro ao limpar o campo de busca:", error.message);
        }
    }

    ////////////////////////////////// MÉTODO PRINCIPAL///////////////////////////////////////////////////
    async performAction(username) {
        const newUrl = `https://www.instagram.com/${username}/`;
        await this.page.goto(newUrl, { waitUntil: 'networkidle2', timeout: 0 });
        console.log(`Navegador iniciado em ${newUrl}`);

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Clica no botão de seguidores
        const selector = ".x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x5n08af.x9n4tj2._a6hd";

        try {
            await this.page.evaluate((selector) => {
                const elemento = document.querySelector(selector);
                if (elemento) {
                    elemento.click();
                } else {
                    console.log("Elemento não encontrado para clique.");
                }
            }, selector);
        } catch (error) {
            console.error("Erro ao tentar clicar no botão de seguidores:", error.message);
            return;
        }

        
        const subpageSelector = '.xyi19xy.x1ccrb07.xtf3nb5.x1pc53ja.x1lliihq.x1iyjqo2.xs83m0k.xz65tgg.x1rife3k.x1n2onr6';
        

        const buscaTermos = ["Mig", "Art", "Gae", "Thé", "Hei", "Rav", "Dav", "Ber", "Noa", "Gab", "Sam", "Ped", "Ant", "Isa", "Ben", "Ben", "Mat", "Luc", "Joa", "Nic", "Luc", "Lor", "Hen", "Joã", "Raf", "Hen", "Mur", "Lev", "Gui", "Vic", "Fel", "Bry", "Mat", "Ben", "Joã", "Pie", "Leo", "Dan", "Gus", "Ped", "Joã", "Ema", "Cal", "Dav", "Ant", "Edu", "Enr", "Cai", "Jos", "Enz", "Aug", "Mat", "Vit", "Enz", "Cau", "Fra", "Rae", "Joã", "Tho", "Yur", "Yan", "Ant", "Oli", "Otá", "Joã", "Nat", "Dav", "Vin", "The", "Val", "Rya", "Lui", "Art", "Joã", "Léo", "Rav", "Apo", "Thi", "Tom", "Mar", "Jos", "Eri", "Lia", "Jos", "Lua", "Asa", "Rau", "Jos", "Dom", "Kau", "Kal", "Lui", "Dom", "Dav", "Est", "Bre", "Dav", "Tha", "Isr"]; // Termos de busca
        
        for(let termoAtual = 0; termoAtual < buscaTermos.length;termoAtual++){
            await this.limparCampoDeBusca()
            // Obtém os primeiros 4 números do horário atual
            const horaAtual = new Date();
            const iInicial = parseInt(
                horaAtual.getHours().toString().padStart(2, '0') +
                horaAtual.getMinutes().toString().padStart(2, '0')
            );
            const iFinal = iInicial + 5;
            
            await this.buscaComCampo(buscaTermos[termoAtual]);
            
            // Itera pelos seguidores
            for (let i = iInicial; i < iFinal; i++) {
                await this.scrollElemento(subpageSelector);

                await new Promise(resolve => setTimeout(resolve, 1000));

                const spanTexts = await this.page.evaluate(() => {
                    const elements = document.querySelectorAll('span._ap3a._aaco._aacw._aacx._aad7._aade');
                    return Array.from(elements).map(element => element.innerText);
                });

                console.log('Seguidores encontrados:', spanTexts);

                spanTexts.forEach((username, index) => {
                    const uniqueID = `${i}-${index}`; // Combina a iteração e o índice
                    salvaSeguidor(username, uniqueID);
                });
            }
        }
    }
}

module.exports = BuscaSeguidores;
