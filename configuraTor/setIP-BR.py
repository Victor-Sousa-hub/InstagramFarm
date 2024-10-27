from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.proxy import Proxy, ProxyType
import time

def iniciar_navegador_tor():
    # Configurações do navegador Firefox
    options = Options()
    options.headless = False  # False para exibir o navegador
    options.add_argument("--ignore-certificate-errors")  # Ignora erros de certificado

    # Caminho para o geckodriver (substitua se necessário)
    service = Service(executable_path='/caminho/para/geckodriver')

    # Configuração do proxy para usar o Tor
    proxy = Proxy()
    proxy.proxy_type = ProxyType.MANUAL
    proxy.http_proxy = "127.0.0.1:9050"
    proxy.ssl_proxy = "127.0.0.1:9050"

    # Aplicar o proxy nas capacidades do navegador
    capabilities = webdriver.DesiredCapabilities.FIREFOX.copy()
    proxy.add_to_capabilities(capabilities)

    # Iniciar o navegador com as opções e capacidades
    navegador = webdriver.Firefox(
        service=service, 
        options=options, 
        desired_capabilities=capabilities
    )
    return navegador

# Inicializa o navegador
navegador = iniciar_navegador_tor()

# Abre a página de teste para verificar a conexão Tor
navegador.get('http://check.torproject.org')

# Aguarda 10 segundos e fecha o navegador
time.sleep(10)
navegador.quit()
