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
        return fileResponse
    } catch (error) {
        console.log('Erro ao recuperar e filtrar os dados do site');
    }
}

// Função para extrair e filtrar os dados do arquivo JavaScript e salvar em um arquivo JSON
function extractAndFilterData(jsFileContent: string) {
    try {
        // Encontrando o valor da variável s_ usando regex
        const regexPattern = /"pacific-1","[a-zA-Z0-9]+":"(sei1[a-zA-Z0-9]+)"/;
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

function extractWLData(jsFileContent: string, group : string) : number {
    try {
        const blockStartIndex = jsFileContent.indexOf(`"name":"${group}"`);
        if (blockStartIndex === -1) {
            return 0;
        }
        
        const blockEndIndex = jsFileContent.indexOf('"name":"', blockStartIndex + 1);
        const blockString = jsFileContent.substring(blockStartIndex, blockEndIndex !== -1 ? blockEndIndex : undefined);
        return (blockString.match(new RegExp('sei', 'g')) || []).length;
    } catch (error) {
        console.log("Erro extractWLData!")
    }
}

async function getMintCollection(url : string) {
    let retorno
    try {
        const fileResponse = await retrieveAndFilterData(url)
        retorno = await extractAndFilterData(fileResponse.data);
    } catch(e) {
        retorno = "Erro ao recuperar a coleção."
    }    
    return retorno
}
async function getWlCount(url : string, group : string) {
    let retorno : number
    try {
        const fileResponse = await retrieveAndFilterData(url)
        retorno = await extractWLData(fileResponse.data, group)
    } catch(e) {
        console.log("Erro getMintCollection!")
    }    
    return retorno
}

export { getMintCollection, getWlCount };
