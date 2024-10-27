from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.proxy import Proxy, ProxyType
from selenium.webdriver.chrome.options import Options
import time

# Configuração das opções do Brave
chrome_options = Options()
chrome_options.binary_location = "/usr/bin/brave-browser"  # Caminho do Brave
chrome_options.add_argument('--headless')  # Executar sem interface gráfica (opcional)

# Inicializando o chromedriver
service = Service("/usr/local/bin/chromedriver")  # Caminho do chromedriver

# Inicializando o navegador com proxy (caso necessário)
navegador = webdriver.Chrome(service=service, options=chrome_options)

# Acessa a página de verificação do Tor
navegador.get('http://check.torproject.org')

if "Congratulations" in navegador.page_source:
    print("Conectado à rede Tor!")
else:
    print("Não está conectado ao Tor.")

# Aguarda e fecha o navegador
time.sleep(10)
navegador.quit()
