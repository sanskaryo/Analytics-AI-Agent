import axios from 'axios';
import dotenv from 'dotenv';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

interface GroqResponse {
  text: string;
  visualizations?: Array<{
    title: string;
    type: string;
    columns: string[];
  }>;
  filters?: { [key: string]: any };
}

export async function queryGroq(query: string, datasetInfo: any): Promise<GroqResponse> {
  try {
    console.log("Sending query to Groq:", query);
    
    // Extract column names for easy reference in the prompt
    const columnNames = datasetInfo.columns.map(col => col.name);
    const numericColumns = datasetInfo.columns.filter(col => col.isNumeric).map(col => col.name);
    const categoricalColumns = datasetInfo.columns.filter(col => !col.isNumeric).map(col => col.name);
    
    // Create a detailed system prompt that explains how to format the response
    const systemPrompt = `You are a data visualization assistant analyzing a dataset with the following information:
- File name: ${datasetInfo.fileName}
- Number of rows: ${datasetInfo.rowCount}
- Number of columns: ${datasetInfo.columns.length}
- Column names: ${columnNames.join(', ')}
- Numeric columns: ${numericColumns.join(', ')}
- Categorical columns: ${categoricalColumns.join(', ')}

When responding to queries, provide insights about the data and suggest appropriate visualizations.
Your response MUST be a valid JSON object with these three properties:
1. "text" - Your analysis and explanation in natural language
2. "visualizations" - An array of visualization objects with these properties:
   - "title": A descriptive title (string)
   - "type": One of "bar", "line", "pie", "scatter", "table" (string)
   - "columns": Array of column names to use in the visualization (array of strings)
3. "filters" - An object specifying how to filter the data based on the user's query, with column names as keys and filter conditions as values.
   For example: {"company": "Amazon", "salary": {"op": ">", "val": 100000}}

Example response format:
{
  "text": "Based on your dataset, I've analyzed...",
  "visualizations": [
    {
      "title": "Distribution of Category",
      "type": "pie",
      "columns": ["category"]
    },
    {
      "title": "Sales by Region",
      "type": "bar",
      "columns": ["region", "sales"]
    }
  ],
  "filters": {
    "region": "North America",
    "year": 2023
  }
}

When a user asks to see specific data (e.g., "Show me students placed at Amazon"):
- Create appropriate filters to narrow down the data
- Return a table visualization showing the filtered results
- Include other relevant visualizations that provide insights about this subset of data

IMPORTANT: Make sure the column names in your response match exactly with the column names in the dataset.
Available column names are: ${columnNames.join(', ')}`;

    // Send request to Groq
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        temperature: 0.5,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("Groq API response received");

    // Parse the response
    const assistantMessage = (response.data as any).choices[0].message.content;
    console.log("Assistant message length:", assistantMessage.length);
    
    // Extract JSON from the response
    let jsonResponse: GroqResponse;
    
    try {
      // Try to parse the entire message as JSON first
      jsonResponse = JSON.parse(assistantMessage);
    } catch (directParseError) {
      console.log("Direct JSON parse failed, trying to extract JSON");
      
      // Look for JSON in code blocks or just generally in the text
      const jsonMatch = assistantMessage.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                         assistantMessage.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch) {
        try {
          jsonResponse = JSON.parse(jsonMatch[1].trim());
        } catch (extractError) {
          console.error("Failed to parse extracted JSON:", extractError);
          throw new Error("Invalid JSON format in response");
        }
      } else {
        throw new Error("Could not extract JSON from response");
      }
    }
    
    console.log("Parsed visualization data:", jsonResponse.visualizations);
    
    // Validate and clean the visualization data
    if (jsonResponse.visualizations && Array.isArray(jsonResponse.visualizations)) {
      jsonResponse.visualizations = jsonResponse.visualizations.map(viz => {
        // Ensure columns is an array of strings
        if (!viz.columns || !Array.isArray(viz.columns)) {
          viz.columns = [];
        }
        
        // Filter to only include valid column names
        viz.columns = viz.columns.filter(col => 
          typeof col === 'string' && columnNames.includes(col)
        );
        
        // Set a default type if not valid
        if (!['bar', 'line', 'pie', 'scatter', 'table'].includes(viz.type)) {
          viz.type = 'table';
        }
        
        return viz;
      });
    } else {
      jsonResponse.visualizations = [];
    }
    
    // Ensure we have a filters object
    if (!jsonResponse.filters || typeof jsonResponse.filters !== 'object') {
      jsonResponse.filters = {};
    }
    
    return {
      text: jsonResponse.text || "I've analyzed your data based on your query.",
      visualizations: jsonResponse.visualizations,
      filters: jsonResponse.filters
    };
  } catch (error) {
    console.error('Error querying Groq:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    return {
      text: "I'm sorry, I encountered an error processing your query. Please try again.",
      visualizations: [],
      filters: {}
    };
  }
}
