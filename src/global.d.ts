
// Make the processLLMQuery function available globally for type checking
declare function processLLMQuery(
  query: string, 
  datasetInfo?: import('./lib/dataUtils').DatasetInfo
): Promise<string>;
