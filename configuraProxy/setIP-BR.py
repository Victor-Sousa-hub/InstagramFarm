from seleniumwire import webdriver # Importar do seleniumwire
from selenium.webdriver.common.by import By
import json
import time

# Função para carregar os proxies do arquivo JSON
def carregar_proxies():
    with open("proxies.json", "r") as f:
        return json.load(f)

# Função para configurar o navegador com o proxy e autenticação
def configurar_navegador(proxy):
    # Configurar as opções do Selenium Wire com o proxy e autenticação
    seleniumwire_options = {
        'proxy': {
            'http': f"http://{proxy['user']}:{proxy['password']}@{proxy['proxy']}:{proxy['port']}",
            'https': f"https://{proxy['user']}:{proxy['password']}@{proxy['proxy']}:{proxy['port']}",
            'no_proxy': 'localhost,127.0.0.1'  # Bypass do proxy para localhost
        }
    }

    chrome_options = webdriver.ChromeOptions()
    # chrome_options.add_argument("--headless")  # Opcional: Executa sem interface gráfica
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Inicializa o driver do Selenium Wire com as opções
    driver = webdriver.Chrome(seleniumwire_options=seleniumwire_options, options=chrome_options)
    return driver


# Função para preencher e enviar o formulário
def preencher_formulario(driver):
    # Dicionário com os dados que queremos preencher
    dados = {
        "Nome completo": "João Silva",
        "Número do celular ou email": "joao.silva@example.com",
        "Senha": "(11) 99999-9999",
        "Nome de usuário": "Rua Exemplo, 123"
    }

    # Localiza todas as labels com a classe 'aa48'
    labels = driver.find_elements(By.CLASS_NAME, "aa48")

    # Itera sobre as labels e preenche os campos com base no texto do span
    for label in labels:
        span_texto = label.find_element(By.TAG_NAME, "span").text.strip()

        if span_texto in dados:
            input_campo = label.find_element(By.TAG_NAME, "input")
            input_campo.clear()  # Limpa o campo antes de preencher
            input_campo.send_keys(dados[span_texto])
            print(f"Preenchido: {span_texto} -> {dados[span_texto]}")

# Função principal para alternar entre proxies e realizar automação
def executar_automacao():
    proxies = carregar_proxies()

    for proxy in proxies:
        print(f"Usando proxy: {proxy['user']}@{proxy['proxy']}:{proxy['port']}")
        driver = configurar_navegador(proxy)

        try:
            # Acessa o site desejado para teste
            driver.get("https://www.instagram.com/accounts/emailsignup/")
            time.sleep(10)
            preencher_formulario(driver)
        except Exception as e:
            print(f"Erro: {e}")

        time.sleep(5)  # Aguarda alguns segundos entre mudanças de proxy

# Executa o script
if __name__ == "__main__":
    executar_automacao()
