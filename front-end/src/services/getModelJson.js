export async function getModelJson(modelJsonFilename) {
    const response = await fetch('http://localhost:3080/api/model/' + modelJsonFilename);
    return await response.json();
}