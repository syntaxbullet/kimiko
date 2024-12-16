import { ChatLLM } from "@kimiko/primitives/ChatLLM";

const examplellm = ChatLLM("Give the most concise answer possible", { model: "llama-3.3-70b-versatile", messages: [], max_tokens: 100 });

(async () => {
    const response = await examplellm.appendMessage("NATO member, 'true'/'false', no periods")
        .batchInstruct(["United States", "Canada", "Spain", "France", "Australia"]);

    const responseMessageContents = response
        .map((res) => res.choices[0].message.content);

    console.log(responseMessageContents);
})();
