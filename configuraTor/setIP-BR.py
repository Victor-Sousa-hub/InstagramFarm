from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.proxy import Proxy, ProxyType
from selenium.webdriver.firefox.service import Service
import time

def iniciar_navegador_tor():
    # Configurações do Firefox
    options = Options()
    options.headless = False  # False para exibir o navegador

    # Configuração do geckodriver (ajuste o caminho se necessário)
    service = Service(executable_path='/caminho/para/geckodriver')

    # Configura o proxy Tor
    proxy = Proxy()
    proxy.proxy_type = ProxyType.MANUAL
    proxy.http_proxy = "127.0.0.1:9050"
    proxy.ssl_proxy = "127.0.0.1:9050"

    # Aplica o proxy às capacidades do navegador
    capabilities = webdriver.DesiredCapabilities.FIREFOX.copy()
    capabilities.update(proxy.to_capabilities())

    # Inicia o navegador Firefox com as opções e capacidades
    navegador = webdriver.Firefox(
        service=service,
        options=options,
        desired_capabilities=capabilities
    )
    return navegador

# Inicializa o navegador e acessa a página de verificação do Tor
navegador = iniciar_navegador_tor()
navegador.get('http://check.torproject.org')

# Aguarda 10 segundos para observar a página e encerra
time.sleep(10)
navegador.quit()
