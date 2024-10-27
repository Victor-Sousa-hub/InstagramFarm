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
    service = Service(executable_path='geckodriver')

    # Configura o proxy Tor
    proxy = Proxy()
    proxy.proxy_type = ProxyType.MANUAL
    proxy.http_proxy = "127.0.0.1:9050"
    proxy.ssl_proxy = "127.0.0.1:9050"

  # Configura o navegador com proxy e opções
    options.set_preference("network.proxy.type", 1)
    options.set_preference("network.proxy.http", "127.0.0.1")
    options.set_preference("network.proxy.http_port", 9050)
    options.set_preference("network.proxy.ssl", "127.0.0.1")
    options.set_preference("network.proxy.ssl_port", 9050)

    # Inicializa o navegador Firefox com as opções e serviço
    navegador = webdriver.Firefox(service=service, options=options)

    # Acessa a página de verificação do Tor
    navegador.get('http://check.torproject.org')

    # Aguarda 10 segundos e fecha o navegador
    import time
    time.sleep(10)
    navegador.quit()

# Inicializa o navegador e acessa a página de verificação do Tor
navegador = iniciar_navegador_tor()
navegador.get('http://check.torproject.org')

# Aguarda 10 segundos para observar a página e encerra
time.sleep(10)
navegador.quit()
