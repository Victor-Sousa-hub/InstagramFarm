import sqlite3

# Conecte-se ao banco de dados
conexao = sqlite3.connect('usuarios.db')
cursor = conexao.cursor()


# Nome da tabela original e da tabela de backup
tabela_original = 'seguidores'
tabela_backup = 'seguidores_backup'

# Cria uma nova tabela para o backup, copiando a estrutura da tabela original
cursor.execute(f'CREATE TABLE IF NOT EXISTS {tabela_backup} AS SELECT * FROM {tabela_original} WHERE 1=0;')

# Copia todos os dados da tabela original para a tabela de backup
cursor.execute(f'INSERT INTO {tabela_backup} SELECT * FROM {tabela_original};')

# Confirma e fecha a conexão
conexao.commit()
conexao.close()

print(f'Backup da tabela "{tabela_original}" criado com sucesso como "{tabela_backup}".')

