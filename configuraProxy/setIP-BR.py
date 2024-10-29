from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import time

# Lista de proxies da Bright Data
PROXIES = [
    "brd.superproxy.io:22225:brd-customer-hl_8b06715c-zone-isp_proxy1-ip-185.185.147.145:8fz7adnqj598"
    "brd.superproxy.io:22225:brd-customer-hl_8b06715c-zone-isp_proxy1-ip-178.171.25.170:8fz7adnqj598"
    "brd.superproxy.io:22225:brd-customer-hl_8b06715c-zone-isp_proxy1-ip-178.171.31.226:8fz7adnqj598"
    "brd.superproxy.io:22225:brd-customer-hl_8b06715c-zone-isp_proxy1-ip-178.171.24.61:8fz7adnqj598"
]

# Função para configurar o WebDriver com proxy
def configurar_navegador(proxy):
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Executa sem interface gráfica
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument(f'--proxy-server={proxy}')

    service = Service("/usr/local/bin/chromedriver")  # Caminho do ChromeDriver
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

# Função para criar uma conta no Threads
def criar_conta(driver):
    driver.get("https://www.instagram.com/")
    html = driver.page_source

    # Exibir o conteúdo HTML capturado
    print(html)
    time.sleep(5)

# Função principal para alternar entre os proxies e criar contas
def executar_criacao_contas():
    contas = [
        {"email": "email1@example.com", "username": "usuario1", "senha": "senha123"},
        {"email": "email2@example.com", "username": "usuario2", "senha": "senha123"},
        {"email": "email3@example.com", "username": "usuario3", "senha": "senha123"},
        {"email": "email4@example.com", "username": "usuario4", "senha": "senha123"}
    ]

    for i, proxy in enumerate(PROXIES):
        print(f"Usando proxy: {proxy}")
        driver = configurar_navegador(proxy)

        try:
            conta = contas[i]
            criar_conta(driver)
        except Exception as e:
            print(f"Erro ao criar conta: {e}")
        finally:
            driver.quit()  # Fechar o navegador após cada tentativa

if __name__ == "__main__":
    executar_criacao_contas()

