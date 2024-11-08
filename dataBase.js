// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o banco de dados
const dbPath = path.resolve(__dirname, 'usuarios.db');

// Conecta ao banco de dados SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Função para criar a tabela, se ela não existir
function criarTabela() {
  const query = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_completo TEXT NOT NULL,
      usuario TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      sessao TEXT UNIQUE
    );
  `;
  db.run(query, (err) => {
    if (err) {
      console.error('Erro ao criar a tabela:', err.message);
    } else {
      console.log('Tabela "usuarios" verificada/criada com sucesso.');
    }
  });
}

// Função para obter um usuário pelo ID
function getUsuarioById(id) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM usuarios WHERE id = ?`;
    db.get(query, [id], (err, row) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(row);
      }
    });
  });
}

// Função para atualizar a coluna 'sessao' de um usuário
function atualizaSessao(id, sessao) {
  return new Promise((resolve, reject) => {
    const query = `UPDATE usuarios SET sessao = ? WHERE id = ?`;
    db.run(query, [sessao, id], function (err) {
      if (err) {
        reject(err.message);
      } else {
        resolve();
      }
    });
  });
}

function salvaSeguidor(id,usuario){
  return new Promise((resolve, reject) => {
    const query = `INSERT OR IGNORE INTO seguidores (id,usuario) VALUES (?,?);`;
    db.run(query, [id,usuario], function (err) {
      if (err) {
        reject(err.message);
      } else {
        resolve();
      }
    });
  });
}

function numeroSeguidor(seguidores,id){
  return new Promise((resolve, reject) => {
    const query = `UPDATE seguindo SET (seguidores) = (?) where id == ?;`;
    db.run(query, [seguidores,id], function (err) {
      if (err) {
        reject(err.message);
      } else {
        resolve();
      }
    });
  });
}

function selecionaSeguidor(id) {
  return new Promise((resolve, reject) => {
    const query = `SELECT usuario FROM seguindo WHERE id = ?;`;
    db.get(query, [id], (err, row) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(row ? row.usuario : null);  // Retorna o usuário ou null se não encontrado
      }
    });
  });
}

function segueVolta(id,segue_volta){
  return new Promise((resolve, reject) => {
    const query = `UPDATE seguindo_ord SET (segue_volta) = ? where id = ?;`;
    db.get(query, [segue_volta,id], (err, row) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(row ? row.usuario : null);  // Retorna o usuário ou null se não encontrado
      }
    });
  });    
}


function buscaSeguindo(){
  return new Promise((resolve, reject) => {
      const query = `SELECT id,usuario FROM seguindo_ord WHERE segue_volta is NULL limit 320;`;
      db.all(query,[],(err, row) => {
      if (err) {
        return reject(err.message);
      } else {
          resolve(row); 
      }
    });
  });   
}
// Exporta as funções para uso em outros arquivos
module.exports = {
  db,
  criarTabela,
  getUsuarioById,
  atualizaSessao,
  salvaSeguidor,
  numeroSeguidor,
  selecionaSeguidor,
  segueVolta,
  buscaSeguindo
    
};
