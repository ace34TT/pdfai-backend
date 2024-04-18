# 1 - Project descriptions

A web service that allows you to interact with document without passing through Vector database . 
It provides both Gemini and OpenAI endpoints

# 2 - Installation and project setup

## 2.1 Packages

To install the required packages, run inside the project directory :

```bash
npm install
```

## 2.2 Environment variables

Create a `.env` file , copy the following variables add fill with corresponding informations :

```js
OPENAI_API_KEY=
GOOGLE_API_KEY= // Gemini api key 
MONGODB_CONNECTION_STR= // Mongodb connection string 
```

# 3 - Walk-through

The entry point of the application is `index.ts` , this code start the express app that will listen to requests :

```js
// index.ts
// default port is 3000 on local , on server , this will handle by the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  expressListRoutes(app); // list all available routes on the application
});
```

Next up , the `app.ts` file . This is where we create and configure the express app

```ts
// app.ts
// cors configuration
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(bodyParser.json());
```
```ts
// app.ts
// session configuration with mongodb , this will be used to store user session to keep their data active without storing them in a vector store
app.use(
  session({
    secret: "abilityToFly",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_CONNECTION_STR,
      ttl: 14 * 24 * 60 * 60,
    }),
  })
);
```
```ts
// app.ts
// default endpoint used by servers to check the application
app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Hello world",
  });
});
// defining routes 
app.use("/api/chat/", ChatRoutes);
app.use("/api/gemini/", GeminiRoutes);
```

for the controller , we will take gemini as an example , 
the first step is to setup the file by extracting the pdf's data and store them in the cache with the user session id to identify it 
```ts
// gemini.controllers.ts
export const initChatHandler = async (
  req: RequestWithCustomSession, // we define custom Request Object for each request because we have to keep the document data active 
  res: Response
) => {
  // document is the url of the document uploaded on a hosting server 
  const [document] = [req.body.document];
  // we fetch the file from the hosting server 
  const filename = (await fetchFile("doc", document)) as string;
  try {
    // extract the data from the file 
    const documentData = await init(filename);
    // save the extracted data into the cache with the session id 
    cache[req.session.id] = {
      chain: null,
      dataFrame: documentData.dataFrame,
    };
    // process the summary generation 
    // ask function takes as parameter the data of the document , the query and the whole text of the document 
    const summary = await ask(
      documentData.dataFrame,
      "Summarize this document",
      documentData.fullText
    );
    // request the 3 main questions of the document 
    let questions: any = await ask(
      documentData.dataFrame,
      "Suggest 3 questions about this document",
      documentData.fullText
    );
    // delete the file 
    deleteFile(filename);
    // split the questions in \n to get the 3 main questions 
    questions = questions.replace(/^\s*\n/gm, ""); 
    questions = questions.split(/\r?\n/) as string[];
    if (questions.length === 4) questions.shift();
    // return the response eto the user with the session id , the summary and the questions 
    return res.status(200).json({
      sessionId: req.session.id,
      summary: summary,
      questions: questions,
    });
  } catch (error: any) {
    if (req.file) deleteFile(filename);
    console.trace(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

```
After initializing the document , for each request we have to send the session id (sent to the user on the document init) as request body , or else , the app , won't be able to retrieve the document data that the user want to interact with .
```js
export const makeQueryHandler = async (
  req: RequestWithCustomSession,
  res: Response
) => {
  try {
    // get the session id from client request 
    const documentData = cache[req.body.sessionId];
    if (!documentData)
      return res.status(403).json({ message: "chat not initialized" });
    // get the user questions 
    const [question] = [req.body.question];
    // generate the answer by passing the document data and the user request to ask function 
    const answer = await ask(documentData.dataFrame, question);
    // return the response to user 
    return res.status(200).json({ message: answer });
  } catch (error: any) {
    console.trace(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

```
