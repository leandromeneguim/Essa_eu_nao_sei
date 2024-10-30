import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from './config.js';

const API_KEY = config.API_KEY;
if (!API_KEY) {
    throw new Error('API_KEY não encontrada no arquivo config.js');
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
}

const prompt1 = "Indique apenas:\n1. Qual é a alternativa correta.\n2. Uma breve justificativa do porquê esta é a resposta correta\n\nFormatação:\n- Use markdown\n- Seja direto e conciso";

const prompt2 = "1. Liste os tópicos que a questão aborda, com um termo de pesquisa para o Youtube. \n2. Liste um termo de pesquisa específico para um exercício resolvido similar. (Por exemplo, se usuário enviou uma foto e após analisá-la, você identificar que a questão é sobre MRU, retorne termos de pesquisa como \"exercício resolvido movimento retilíneo uniforme\")\n\nFormatação:\n- Use marcadores para listar os tópicos.\n- Para cada termo de pesquisa, crie um link direto para a busca no YouTube no formato: [Termo de Pesquisa](https://www.youtube.com/results?search_query=termo+de+pesquisa+formatado).\n- Utilize markdown para estruturar e formatar o texto, incluindo títulos, subtítulos e ênfases onde apropriado.\n\nExemplo de estrutura:\n\n## Tópicos Abordados\n- Tópico 1: [Termo de Pesquisa](link)\n- ...\n\n## Como encontrar exercícios resolvidos similares\n- Exercício resolvido de ... : [Termo de Pesquisa](link)\n- ...\n";

const prompt3 = "- Você vai ensinar uma aula completa sobre tudo o que precisa saber para resolver esse tipo de questão por conta própria. Toda a teoria por trás da questão, mas ainda sem entrar na explicação da questão. A aula deve ser dada usando o método Feynman, e deve ser o mais completa possível, explorando toda a teoria necessária para resolver a questão.\n- Ao final, adicione uma seção chamada \"CheatSheet: liste todas as Fórmulas e conceitos necessários ter em mente para resolver o exercício da foto.\n\nFormatação:\n- Use markdown extensivamente para estruturar o conteúdo, incluindo títulos, subtítulos, fórmulas, listas numeradas e com marcadores.\n- Destaque conceitos-chave, fórmulas e passos importantes usando negrito, itálico ou blocos de código quando apropriado.\n";

 
export async function processImageWithGemini(imageFile) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const imagePart = await fileToGenerativePart(imageFile);

        const results = await Promise.all([
            model.generateContent([prompt1, imagePart]),
            model.generateContent([prompt2, imagePart]),
            model.generateContent([prompt3, imagePart]),
        ]);

        return {
            solution: await results[0].response.text(),
            links: await results[1].response.text(),
            lesson: await results[2].response.text()
        };
    } catch (error) {
        console.error('Erro ao processar imagem:', error);
        throw error;
    }
}
