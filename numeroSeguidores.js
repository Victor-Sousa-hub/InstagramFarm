const { selecionaSeguidores, numeroSeguidor } = require('./dataBase.js'); // Certifique-se de que selecionaTodosSeguidores retorna uma lista de { id, usuario }

class NumeroSeguidores {
    constructor(page) {
        this.page = page;
    }

    // Função auxiliar para tempo aleatório
    tempoAleatorio(iteracao) {
        if (iteracao % 6 === 0) {
            return Math.floor(Math.random() * (25 - 10 + 1) + 10) * 1000;
        } else {
            return Math.floor(Math.random() * (7 - 5 + 1) + 5) * 1000;
        }
    }

    // Método principal
    async performAction() {
        try {
            // Obtém todos os registros da base de dados
            const usuarios = await selecionaSeguidores(); // Retorna uma lista de objetos { id, usuario }

            
            let i = 1;
            for (const { id, usuario } of usuarios) {
                try {
                    if (!usuario) {
                        console.log(`Usuário não encontrado para ID ${id}.`);
                        continue;
                    }
                    console.log(`---------------------ITERAÇÃO ${i}---------------------------`)
                    const newUrl = `https://www.instagram.com/isabellalima__/`;
                    await this.page.goto(newUrl, { waitUntil: 'networkidle2', timeout: 60000 });
                    console.log(`Navegador iniciado em ${newUrl}`);

                    const followerCountSelector = '.html-span.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1hl2dhg.x16tdsg8.x1vvkbs';

                    // Aguarda o seletor estar disponível e extrai o número de seguidores
                    await this.page.waitForSelector(followerCountSelector, { timeout: 10000 });
                    const followerCount = await this.page.evaluate((selector) => {
                        const elements = document.querySelectorAll(selector);
                        return elements[1] ? elements[1].innerText : null; // Acessa o segundo elemento e retorna o texto
                    }, followerCountSelector);

                    if (followerCount) {
                        console.log(`Número de seguidores do seguidor (${usuario}): ${followerCount}`);
                        await numeroSeguidor(followerCount, id);
                    } else {
                        console.log(`Não foi possível obter o número de seguidores para o usuário ${usuario}.`);
                    }

                    // Aguarda um tempo aleatório antes de continuar
                    const tempoEspera = this.tempoAleatorio(id);
                    console.log(`Esperando ${tempoEspera / 1000} segundos antes da próxima iteração.`);
                    await new Promise((resolve) => setTimeout(resolve, tempoEspera));

                    i += 1;
                } catch (error) {
                    console.error(`Erro durante o processamento para ID ${id}:`, error.message);
                    console.log(`Registrando 0 seguidores para o ID ${id} devido ao erro.`);
                    await numeroSeguidor('0', id); // Salva 0 seguidores em caso de erro
                }
            }
        } catch (error) {
            console.error('Erro ao obter os registros da base de dados:', error.message);
        }
    }
}

module.exports = NumeroSeguidores;
