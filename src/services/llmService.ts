import { DatasetInfo, DataRow, filterData } from '@/lib/dataUtils';
import { queryGroq } from './groqService';

type LLMResponse = {
  text: string;
  visualizations?: Array<{
    title: string;
    type: string;
    columns: string[];
  }>;
  filteredData?: DataRow[];
};

/**
 * Process a query using the LLM service
 * 
 * @param query The user's query text
 * @param datasetInfo Information about the current dataset
 * @param data The full dataset
 * @returns A promise that resolves to the LLM's response
 */
export async function processLLMQuery(
  query: string,
  datasetInfo?: DatasetInfo,
  data?: DataRow[]
): Promise<LLMResponse> {
  if (!datasetInfo || !data) {
    return {
      text: "Please upload a dataset first so I can help you analyze it.",
    };
  }

  try {
    const response = await queryGroq(query, datasetInfo);
    
    // Apply filters if any are provided
    let filteredData = data;
    if (response.filters && Object.keys(response.filters).length > 0) {
      filteredData = filterData(data, response.filters);
      console.log(`Data filtered to ${filteredData.length} rows based on filters:`, response.filters);
    }
    
    return {
      text: response.text,
      visualizations: response.visualizations,
      filteredData
    };
  } catch (error) {
    console.error('Error processing query with Groq:', error);
    return {
      text: "I'm sorry, I couldn't process that query. Could you try rephrasing or asking something else?",
    };
  }
}
