export async function getModelJson(modelJsonFilename) {
    const response = await fetch('http://sqlgui.chrisjenkins.nz:3080/api/model/' + modelJsonFilename);
    return await response.json();
}