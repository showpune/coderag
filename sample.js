import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import * as fs from "fs";
import { AzureOpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const embeddings = new AzureOpenAIEmbeddings({
  azureOpenAIApiKey: "b05dc2487c724d8885a72e8f4ed1225c", // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
  azureOpenAIApiInstanceName: "zhiyongli-eastus", // In Node.js defaults to process.env.AZURE_OPENAI_API_INSTANCE_NAME
  azureOpenAIApiEmbeddingsDeploymentName: "text-embedding-ada-002", // In Node.js defaults to process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME
  azureOpenAIApiVersion: "2023-05-15", // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
  maxRetries: 1,
});
var vectorStore = await MemoryVectorStore.fromDocuments([], embeddings);

const folder =
  "/home/zhiyong/projects/rabbitmq-servicebus/src/main/java/com/example/messagingrabbitmq";
// loop the folder and read the file
var files = fs.readdirSync(folder);
var jsSplitter = RecursiveCharacterTextSplitter.fromLanguage("java", {
  chunkSize: 100,
  chunkOverlap: 0,
});
const promises = files.map(async (file) => {
  const javaCode = fs.readFileSync(folder + "/" + file, "utf8");
  var jsDocs = await jsSplitter.createDocuments([javaCode]);
  jsDocs.map((doc) => {
    doc.metadata.fileName = file;
  });
  await vectorStore.addDocuments(jsDocs);
});

await Promise.all(promises);
var code = [
  // "@RabbitListener(queues = \"${rabbitmq.firemassrollout.message.queue.name}\", group = \"${rabbitmq.firemassrollout.group}\", containerFactory = \"containerFactoryAckAuto\",exclusive = true)\n"
  "RabbitListener",
];
// var vector = await embeddings.embedDocuments(code)
const similaritySearchResults = await vectorStore.similaritySearchWithScore(
  "RabbitListener",
  10
);

//loop similaritySearchResults
similaritySearchResults.forEach((doc) => {
  console.log(
    `* ${doc[1]} * ${doc[0].pageContent} \n [${JSON.stringify(
      doc[0].metadata,
      null
    )}]`
  );
  console.log(
    `* ****************************************************************************************************`
  );
});
