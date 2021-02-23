export async function getModelJson(modelJsonFilename) {
    console.log(modelJsonFilename);
    const response = await fetch('http://localhost:3080/api/model/' + modelJsonFilename);
    console.log(response);
    return await response.json();
}