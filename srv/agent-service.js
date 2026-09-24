import cds from '@sap/cds';
import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import * as z from "zod";
import 'dotenv/config';

export class AgentService extends cds.ApplicationService {

  init() {

    this.on('askAgent', async (req) => {

      const { question } = req.data;

      try {

        // 
        console.log('Creating tools for agent');
         
        // Get restaurant tools
        const mockRestaurantData = {
          paris: ['Le Comptoir du Relais', "L'As du Fallafel", 'Breizh Café', 'Daal Bati restaurant'],
          reykjavik: ['Dill Restaurant', 'Fish Market', 'Grillmarkaðurinn', 'Daal Bati restaurant'],
        };

        const getRestaurantsTool = tool(
          async ({ city }) => {

            const restaurants = mockRestaurantData[city.toLowerCase()];
            return restaurants
              ? `Popular restaurants in ${city}: ${restaurants.join(', ')}`
              : `No restaurant data available for ${city}.`;
          },
          {
            name: 'get_restaurants',
            description:
              'Returns restaurants available in a city',
            schema: z.object({
              city: z.string()
            })
          }
        );

        const llm = new ChatOllama({
          model: "gpt-oss:20b",
          baseUrl: "https://ollama.com",
          headers: {
            Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`
          }
        });

        //      create agent
        const agent = createAgent({
          model: llm,
          tools: [getRestaurantsTool],
          systemPrompt:
            "You are a helpful assistant. Use get_restaurants whenever the user asks about restaurants in a city. After calling the tool, provide a clear natural-language answer based only on the tool result. If the question is not about restaurants, answer it briefly and clearly."
        });

        // invoke agent

        const response = await agent.invoke({
          messages: [
            {
              role: "user",
              content: question
            }
          ]
        });
        const lastMessage = response.messages[response.messages.length - 1];
        console.log(lastMessage.content);
        return {
          answer: lastMessage.content
        };
      } catch (error) {

        console.error(error);

        return {
          answer: `Error: ${error.message}`
        };
      }

    });

    return super.init();
  }
}