import sqlite3

# Conecte-se ao banco de dados
conexao = sqlite3.connect('usuarios.db')
cursor = conexao.cursor()

# Nome da tabela original e os nomes das colunas (nova e antiga)
nome_tabela = 'usuarios'
coluna_antiga = 'COLUNM'
coluna_nova = 'sessao'

# Passo 1: Cria uma nova tabela com a coluna renomeada
cursor.execute(f'''
    CREATE TABLE {nome_tabela}_novo_2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_completo TEXT NOT NULL,
        nome_usuario TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        {coluna_nova} TEXT UNIQUE
    );
''')

# Passo 2: Copia os dados da tabela antiga para a nova
cursor.execute(f'''
    INSERT INTO {nome_tabela}_novo_2 (id, nome_completo , nome_usuario, senha, {coluna_nova})
    SELECT id, nome_completo, nome_usuario, senha, {coluna_antiga} FROM {nome_tabela};
''')

# Passo 3: Remove a tabela antiga e renomeia a nova tabela
cursor.execute(f'DROP TABLE {nome_tabela};')
cursor.execute(f'ALTER TABLE {nome_tabela}_novo_2 RENAME TO {nome_tabela};')

# Confirma as alterações e fecha a conexão
conexao.commit()
conexao.close()
