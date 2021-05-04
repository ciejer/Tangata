export async function getModel(modelNodeId, user) {
    const response = await fetch('http://sqlgui.chrisjenkins.nz:3080/api/v1/models/' + modelNodeId, {headers: {Authorization: "Token " + user.token}});
    return await response.json();
}