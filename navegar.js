const puppeteer = require('puppeteer');
const { db, getUsuarioById, salvaSeguidor } = require('./dataBase.js');
const FollowBack = require('./followBack.js');
const BuscaSeguidor = require('./buscaSeguidores.js'); // Certifique-se de que essa classe existe
const { ArgumentParser } = require('argparse');

//---------------------------------VARIÁVEIS DE AMBIENTE--------------------------------------------------
const Url = 'https://instagram.com';

//-----------------------FUNÇÕES AUXILIARES---------------------------------------
async function cokkiesLogin(usuario) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(Url, { waitUntil: 'networkidle2', timeout: 60000 });

    if (usuario.sessao) {
        console.log('Tentando fazer login com a sessão existente.');

        try {
            const sessionCookieValue = decodeURIComponent(usuario.sessao);

            const sessionCookie = {
                name: 'sessionid',
                value: sessionCookieValue,
                domain: '.instagram.com',
                path: '/',
                httpOnly: true,
                secure: true,
            };

            await page.setExtraHTTPHeaders({
                'Accept-Language': 'pt-BR,pt;q=0.9',
            });

            await page.emulateTimezone('America/Sao_Paulo');
            await page.setCookie(sessionCookie);
            await page.reload({ waitUntil: 'networkidle2', timeout: 0 });

            console.log('Login realizado com sucesso usando o cookie de sessão.');
        } catch (error) {
            console.log('Erro ao processar o cookie de sessão:', error);
            await browser.close();
            process.exit(1);
        }
    }

    return { browser, page };
}

//---------------------------------INÍCIO DA EXECUÇÃO----------------------------------------------
async function main() {
    const parser = new ArgumentParser({
        description: 'Instagram Automation',
    });

    parser.add_argument('--id', {
        required: true,
        help: 'User ID to login',
    });

    parser.add_argument('-c', '--class', {
        required: true,
        choices: ['followback', 'buscaSeguidor'],
        help: 'Class to execute: followback or buscaSeguidor',
    });

    parser.add_argument('-u', '--username', {
        required: false, // Torna opcional, mas será validado depois
        help: 'Username for buscaSeguidor class',
    });
    const args = parser.parse_args();
    const userId = parseInt(args.id, 10);

    const usuario = await getUsuarioById(userId);

    if (!usuario) {
        console.error(`Erro: Nenhum usuário encontrado com o ID ${userId}.`);
        process.exit(1);
    }

    console.log('Usuário:', usuario);

    const { browser, page } = await cokkiesLogin(usuario);

    try {
        if (args.class === 'followback') {
            const followBack = new FollowBack(page);
            await followBack.performAction();
        } else if (args.class === 'buscaSeguidor') {
            const buscaSeguidor = new BuscaSeguidor(page);
            await buscaSeguidor.performAction(args.username);
        } else {
            console.error('Classe inválida. Use followback ou buscaSeguidor.');
        }
    } catch (error) {
        console.error('Erro durante a execução da classe:', error);
    } finally {
        await browser.close();
        console.log('Navegador fechado com sucesso.');
    }
}

// Executa a função principal
main().catch((error) => {
    console.error('Erro durante a execução:', error);
    process.exit(1);
});
