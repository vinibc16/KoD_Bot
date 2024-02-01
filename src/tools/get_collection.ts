import axios from 'axios';

// Função para recuperar o conteúdo do arquivo JavaScript e, em seguida, extrair e filtrar os dados
async function retrieveAndFilterData(siteUrl: string) {
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
        return extractAndFilterData(fileResponse.data);
    } catch (error) {
        console.log('Erro ao recuperar e filtrar os dados do site');
    }
}

// Função para extrair e filtrar os dados do arquivo JavaScript e salvar em um arquivo JSON
function extractAndFilterData(jsFileContent: string) {
    try {
        // Encontrando o valor da variável s_ usando regex
        const regexPattern = /"s_":"(sei1[a-zA-Z0-9]+)"/;
        const matches = jsFileContent.match(regexPattern);
        if (!matches || matches.length < 2) {
            throw new Error("Valor da variável s_ não encontrado.");
        }
        const sValue = matches[1];

        return sValue;
    } catch (error) {
        console.error(`Erro ao extrair e filtrar os dados para recurar o contrato do arquivo JavaScript e salvar em JSON:`, error);
    }
}
async function getMintCollection(url : string) {
    let retorno
    try {
        retorno = await retrieveAndFilterData(url)
    } catch(e) {
        retorno = "Erro ao recuperar a coleção."
    }    
    return retorno
}

export { getMintCollection };
