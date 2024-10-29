import sqlite3
import random
import string
from faker import Faker

# Inicializando o gerador de nomes aleatórios com a biblioteca Faker
fake = Faker()

# Função para gerar uma senha aleatória de 8 dígitos
def gerar_senha():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=8))

# Função para gerar um nome de usuário baseado no nome completo
def gerar_usuario(nome_completo):
    partes = nome_completo.split()
    usuario = f"{partes[0].lower()}.{partes[-1].lower()}{random.randint(10, 99)}"
    return usuario

# Função para criar a tabela no SQLite
def criar_tabela():
    conn = sqlite3.connect('usuarios.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_completo TEXT NOT NULL,
            nome_usuario TEXT NOT NULL,
            senha TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Função para inserir dados no banco
def inserir_usuario(nome_completo, nome_usuario, senha):
    conn = sqlite3.connect('usuarios.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO usuarios (nome_completo, nome_usuario, senha)
        VALUES (?, ?, ?)
    ''', (nome_completo, nome_usuario, senha))
    conn.commit()
    conn.close()

# Função principal para gerar e salvar dados no banco
def gerar_e_salvar_usuarios(quantidade=5):
    criar_tabela()  # Cria a tabela se não existir

    for _ in range(quantidade):
        nome_completo = fake.name()  # Gera um nome aleatório
        nome_usuario = gerar_usuario(nome_completo)  # Gera nome de usuário
        senha = gerar_senha()  # Gera senha aleatória

        inserir_usuario(nome_completo, nome_usuario, senha)
        print(f"Usuário: {nome_usuario} | Senha: {senha} | Nome Completo: {nome_completo}")

# Executa o script para gerar e salvar 5 usuários (ou qualquer quantidade desejada)
if __name__ == "__main__":
    gerar_e_salvar_usuarios(5)  # Alterar quantidade se necessário
