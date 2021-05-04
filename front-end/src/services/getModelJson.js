export async function getModelJson(modelJsonFilename, user) {
    const response = await fetch('http://sqlgui.chrisjenkins.nz:3080/api/model_old/' + modelJsonFilename, {headers: {Authorization: "Token " + user.token}});
    return await response.json();
}