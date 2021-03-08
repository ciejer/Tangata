export async function getModelJson(modelJsonFilename) {
    const response = await fetch('http://sqlgui.chrisjenkins.nz:3080/api/model_old/' + modelJsonFilename);
    return await response.json();
}