import axios from 'axios';
import fs from 'fs';
import path from 'path'; // Importe o módulo 'path' para manipulação de caminhos

// Função para recuperar o conteúdo do arquivo JavaScript e, em seguida, extrair e filtrar os dados
async function retrieveAndFilterData(siteUrl: string, targetName: string): Promise<void> {
    try {
        // Recuperando o conteúdo do arquivo JavaScript
        const response = await axios.get(siteUrl);
        
        // Encontrando o nome do arquivo .js usando regex
        const matches = response.data.match(/static\/js\/main\..+\.js/);
        if (!matches) {
            throw new Error("Arquivo .js não encontrado.");
        }
        const jsFileName = matches[0];

        const fileResponse = await axios.get(`${siteUrl}/${jsFileName}`, { responseType: 'text' });

        // Chamando a função para extrair e filtrar os dados
        extractAndFilterData(fileResponse.data, targetName);
    } catch (error) {
        console.error(`Erro ao recuperar e filtrar os dados do arquivo JavaScript:`, error);
    }
}

// Função para extrair e filtrar os dados do arquivo JavaScript e salvar em um arquivo JSON
function extractAndFilterData(jsFileContent: string, targetName: string): void {
    try {
        // Encontrando todas as ocorrências do targetName e "allowlist" no conteúdo do arquivo
        const regexPattern = new RegExp(`{"name":"${targetName}","allowlist":\\[("(sei1[a-zA-Z0-9]+)"(?:,"sei1[a-zA-Z0-9]+")*)`, 'g');
        let matches;
        const filteredMatches: string[] = [];

        // Iterando sobre todas as correspondências encontradas
        while ((matches = regexPattern.exec(jsFileContent)) !== null) {
            // Filtrando todas as ocorrências que começam com "sei1"
            const allowlists = matches[1].split(',"');
            allowlists.forEach(allowlist => {
                filteredMatches.push(allowlist.replace(/"/g, ''));
            });
        }

        // Determinando o caminho completo para o arquivo JSON no diretório /mint do projeto
        const jsonFilePath = path.join(__dirname, '..', 'mint', 'whiteList.json');

        // Escrevendo os dados filtrados em um arquivo JSON
        fs.writeFileSync(jsonFilePath, JSON.stringify(filteredMatches, null, 2));
    } catch (error) {
        console.error(`Erro ao extrair e filtrar os dados para "${targetName}" do arquivo JavaScript e salvar em JSON:`, error);
    }
}

export { retrieveAndFilterData };
