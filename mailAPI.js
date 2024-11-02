const Mailjs = require('@cemalgnlts/mailjs');
const EventEmitter = require('events');

const mailEmitter = new EventEmitter();

async function iniciarMail() {
  const mailjs = new Mailjs();

  try {
    // Cria o e-mail temporário
    const emailInfo = await mailjs.createOneAccount();
    console.log('Resposta de criação de conta:', emailInfo); // Log da resposta completa

    if (emailInfo && emailInfo.data && emailInfo.data.username) {
      const email = emailInfo.data.username;
      console.log('E-mail temporário criado:', email); // Log para verificar o e-mail

      // Emite o e-mail criado
      mailEmitter.emit('emailCriado', email);
    } else {
      console.error('Erro: A resposta de criação de conta não contém o e-mail.');
      return;
    }

    // Verifica o recebimento do código de confirmação
    let codigoConfirmacao = null;
    console.log('Aguardando o código de confirmação...');

    while (!codigoConfirmacao) {
      const inbox = await mailjs.getMessages(id);
      const receivedEmails = inbox.data;

      if (receivedEmails.length > 0) {
        const emailContent = await mailjs.getMessage(receivedEmails[0].id);
        const emailBody = emailContent.data.text;

        // Extrai o código de confirmação
        const match = emailBody.match(/(\d{6})/);
        codigoConfirmacao = match ? match[0] : null;

        if (codigoConfirmacao) {
          console.log('Código de confirmação recebido:', codigoConfirmacao);
          mailEmitter.emit('codigoRecebido', codigoConfirmacao);

          // Apaga o e-mail temporário
          await mailjs.deleteAccount(id);
          console.log('E-mail temporário apagado com sucesso.');
        }
      }

      // Aguarda 5 segundos antes de verificar novamente
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

  } catch (error) {
    console.error('Erro:', error);
  }
}

// Exporta o emissor de eventos para comunicação com instagramLogin.js
module.exports = { iniciarMail, mailEmitter };