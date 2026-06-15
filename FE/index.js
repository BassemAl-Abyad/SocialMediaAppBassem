const client = io("http://localhost:3000/");

client.on("connect", () => {
    console.log("Server established connection with client: " + client.id);
});

client.on("disconnect", (error) => {
    console.log("Server disconnected from client: " + client.id + (error ? " with error: " + error : ""));
});

client.on("Hello", (data) => {
    console.log("Received message from server: " + data.message);
});